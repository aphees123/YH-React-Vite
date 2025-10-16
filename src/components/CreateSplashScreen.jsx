import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X, CheckCircle, Plus, Trash2 } from 'lucide-react';
import Header from './Header'; // Adjust path if needed

// --- Configuration ---
const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'kn', name: 'Kannada' },
];
const DEFAULT_LANG = 'en';
const API_BASE_URL = `${import.meta.env.VITE_STAGING_URL}/splash-screens`;

// --- Reusable UI Components ---
const Toast = ({ message, type, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => { onClose(); }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`fixed top-20 right-5 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg text-white ${bgColor}`}>
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold">{message}</span>
            <button onClick={onClose} className="ml-4"><X className="h-5 w-5" /></button>
        </div>
    );
};

const LanguageTabs = ({ currentLang, setCurrentLang }) => (
    <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    type="button" // Prevent form submission
                    className={`${
                        currentLang === lang.code
                            ? 'border-teal-500 text-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                >
                    {lang.name}
                </button>
            ))}
        </nav>
    </div>
);

// --- Main Form Component ---
const CreateSplashScreen = () => {
    const navigate = useNavigate();

    // State for the main screen
    const [screenKey, setScreenKey] = useState('');
    const [screenTranslations, setScreenTranslations] = useState(
        SUPPORTED_LANGUAGES.reduce((acc, lang) => {
            acc[lang.code] = { title: '', description: '' };
            return acc;
        }, {})
    );
    const [currentLang, setCurrentLang] = useState(DEFAULT_LANG);

    // State for dynamically managing cards
    const [cards, setCards] = useState([]);

    // General component state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // --- Handlers for Main Screen ---
    const handleScreenInputChange = (field, value) => {
        setScreenTranslations(prev => ({
            ...prev,
            [currentLang]: { ...prev[currentLang], [field]: value },
        }));
    };

    // --- Handlers for Cards ---
    const addCard = () => {
        const newCard = {
            id: Date.now(), // Unique key for React
            image: null,
            translations: SUPPORTED_LANGUAGES.reduce((acc, lang) => {
                acc[lang.code] = { title: '' };
                return acc;
            }, {})
        };
        setCards(prev => [...prev, newCard]);
    };

    const removeCard = (cardId) => {
        setCards(prev => prev.filter(card => card.id !== cardId));
    };

    const handleCardImageChange = (cardId, file) => {
        if (file && file.size > 5 * 1024 * 1024) {
            setError('Card image file size should not exceed 5MB.');
            return;
        }
        setError('');
        setCards(prev => prev.map(card =>
            card.id === cardId ? { ...card, image: file } : card
        ));
    };

    const handleCardTranslationChange = (cardId, langCode, value) => {
        setCards(prev => prev.map(card => {
            if (card.id === cardId) {
                const updatedTranslations = {
                    ...card.translations,
                    [langCode]: { title: value }
                };
                return { ...card, translations: updatedTranslations };
            }
            return card;
        }));
    };

    // --- Form Submission ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!screenKey.trim() || !screenTranslations[DEFAULT_LANG].title.trim()) {
            setError(`Screen Key and the Title in the default language (${DEFAULT_LANG}) are required.`);
            return;
        }
        setIsLoading(true);
        setError('');

        const formData = new FormData();

        // 1. Append main screen data
        formData.append('screenKey', screenKey);
        formData.append('title', screenTranslations[DEFAULT_LANG].title);
        formData.append('description', screenTranslations[DEFAULT_LANG].description);
        formData.append('translations', JSON.stringify(screenTranslations));

        // 2. Append all card data
        const cardDescriptionsArray = [];
        const formattedCardTranslations = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
            acc[lang.code] = [];
            return acc;
        }, {});

        cards.forEach(card => {
            if (card.image) {
                formData.append('cardImages', card.image);
            }
            cardDescriptionsArray.push(card.translations[DEFAULT_LANG].title || '');
            SUPPORTED_LANGUAGES.forEach(lang => {
                formattedCardTranslations[lang.code].push(card.translations[lang.code]);
            });
        });
        
        if (cardDescriptionsArray.length > 0) {
            formData.append('cardDescriptions', JSON.stringify(cardDescriptionsArray));
        }
        
        if (cards.length > 0) {
            formData.append('cardTranslations', JSON.stringify(formattedCardTranslations));
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to create the splash screen.');
            }

            setToast({ show: true, message: 'Splash screen created successfully!', type: 'success' });
            setTimeout(() => navigate('/splash-screen'), 1500);

        } catch (err) {
            setError(err.message);
            setToast({ show: true, message: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#F0F7F7] min-h-screen p-4 sm:p-6">
            <Header />
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

            <main className="p-4 sm:p-8 bg-white flex-1 rounded-2xl mt-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">Create New Splash Screen</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* --- Main Screen Details --- */}
                        <div className="p-8 border rounded-xl">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Screen Details</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Use the tabs below to add translations for the screen title and description.
                            </p>
                            <div className="mb-6">
                                <label htmlFor="screenKey" className="block text-sm font-medium text-gray-600 mb-1">Screen Key</label>
                                <input
                                    type="text"
                                    id="screenKey"
                                    value={screenKey}
                                    onChange={(e) => setScreenKey(e.target.value)}
                                    placeholder="e.g., onboarding or new_feature"
                                    className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>

                            <LanguageTabs currentLang={currentLang} setCurrentLang={setCurrentLang} />

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={screenTranslations[currentLang].title}
                                    onChange={(e) => handleScreenInputChange('title', e.target.value)}
                                    placeholder={`Enter screen title (${currentLang})`}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required={currentLang === DEFAULT_LANG}
                                />
                                <textarea
                                    value={screenTranslations[currentLang].description}
                                    onChange={(e) => handleScreenInputChange('description', e.target.value)}
                                    placeholder={`Enter screen description (${currentLang}) (Optional)`}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* --- Cards Section --- */}
                        <div className="p-8 border rounded-xl space-y-6">
                             <h2 className="text-lg font-semibold text-gray-800">Cards</h2>
                             {/* ✅ UI CLARIFICATION ADDED HERE */}
                             <p className="text-sm text-gray-500 -mt-4">
                                Card titles are also multilingual. Use the language tabs above to enter the title for each language.
                             </p>
                            {cards.map((card, index) => (
                                <div key={card.id} className="p-4 border rounded-lg bg-gray-50/50 relative">
                                     <button type="button" onClick={() => removeCard(card.id)} className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-100 rounded-full">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <h3 className="font-semibold text-gray-600 mb-4">Card {index + 1}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Card Image</label>
                                            <input
                                                type="file"
                                                onChange={(e) => handleCardImageChange(card.id, e.target.files[0])}
                                                accept="image/*"
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                            />
                                        </div>
                                        <div>
                                            {/* This label correctly shows which language is being edited */}
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Card Title ({currentLang})</label>
                                            <input
                                                type="text"
                                                value={card.translations[currentLang]?.title || ''}
                                                onChange={(e) => handleCardTranslationChange(card.id, currentLang, e.target.value)}
                                                placeholder={`Title for card ${index + 1}`}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                             <button type="button" onClick={addCard} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400">
                                <Plus className="h-5 w-5" />
                                Add Card
                            </button>
                        </div>

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating...' : 'Create Screen'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateSplashScreen;