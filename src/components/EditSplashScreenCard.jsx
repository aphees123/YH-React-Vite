import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, X, CheckCircle } from 'lucide-react';
import Header from './Header'; // Adjust path if needed

// --- Configuration ---
const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'kn', name: 'Kannada' },
];
const DEFAULT_LANG = 'en';

// --- Reusable UI Components ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
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
                    type="button"
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

// --- Main Edit Card Component ---
const EditSplashScreenCard = () => {
    const navigate = useNavigate();
    const { splashId, cardId } = useParams();

    const [card, setCard] = useState(null);
    const [translations, setTranslations] = useState({});
    const [currentLang, setCurrentLang] = useState(DEFAULT_LANG);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        const fetchCardData = async () => {
            setIsFetching(true);
            setError('');
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${import.meta.env.VITE_STAGING_URL}/splash-screens/${splashId}/cards/${cardId}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Accept-Language': DEFAULT_LANG
                    }
                });

                if (!response.ok) throw new Error('Could not fetch card data.');
                
                const result = await response.json();
                const foundCard = result.data;

                if (!foundCard) throw new Error('Card not found.');

                setCard(foundCard);

                // ✅ FINAL FIX: Handles both numeric ("0") and string ("en") language codes
                const translationsObject = foundCard.translations.reduce((acc, trans) => {
                    const code = trans.languageCode;
                    // Check if the code is a string like "en", "hi", etc.
                    if (isNaN(parseInt(code, 10))) {
                        acc[code] = { description: trans.description };
                    } else {
                        // Otherwise, it's a number "0", "1", etc. Map it.
                        const langConfig = SUPPORTED_LANGUAGES[parseInt(code, 10)];
                        if (langConfig) {
                            acc[langConfig.code] = { description: trans.description };
                        }
                    }
                    return acc;
                }, {});

                setTranslations(translationsObject);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsFetching(false);
            }
        };

        fetchCardData();
    }, [splashId, cardId]);

    const handleDescriptionChange = (langCode, value) => {
        setTranslations(prev => ({
            ...prev,
            [langCode]: { ...prev[langCode], description: value }
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        const translationsPayload = Object.entries(translations).map(([langCode, trans]) => ({
            languageCode: langCode,
            description: trans.description || ''
        }));

        const payload = {
            description: translations[DEFAULT_LANG]?.description || '',
            translations: translationsPayload
        };

        try {
            const token = localStorage.getItem('accessToken');
            const API_URL = `${import.meta.env.VITE_STAGING_URL}/splash-screens/${splashId}/cards/${cardId}`;
            
            const response = await fetch(API_URL, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) {
                const errorMessage = Array.isArray(result.message) 
                    ? result.message.join(', ') 
                    : result.message || 'Failed to update the card.';
                throw new Error(errorMessage);
            }
            
            setToast({ show: true, message: 'Card updated successfully!', type: 'success' });
            setTimeout(() => navigate(-1), 1500);

        } catch (err) {
            setError(err.message);
            setToast({ show: true, message: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div className="p-8 text-center">Loading card details...</div>;
    }

    if (error && !card) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="bg-[#F0F7F7] min-h-screen p-4 sm:p-6">
            <Header title='Splash Screen Management'/>
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
            
            <main className="p-4 sm:p-8 bg-white flex-1 rounded-2xl mt-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                        </button>
                        <h1 className="text-xl text-[#0A7777]">Edit Card</h1>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="p-8 border rounded-xl">
                            <h2 className="text-lg text-[#0A7777] mb-6">Card Details</h2>

                            <div className="mb-8 text-center">
                               {card?.cardImageUrl && (
                                    <img
                                        src={card.cardImageUrl}
                                        alt="Card"
                                        className="w-32 h-32 object-contain mx-auto rounded-lg shadow-md mb-2"
                                    />
                               )}
                                <p className="text-xs text-gray-500">Card image cannot be changed.</p>
                            </div>

                            <LanguageTabs currentLang={currentLang} setCurrentLang={setCurrentLang} />
                            
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-600">
                                    Card Description ({SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.name})
                                </label>
                                <input
                                    type="text"
                                    value={translations[currentLang]?.description || ''}
                                    onChange={(e) => handleDescriptionChange(currentLang, e.target.value)}
                                    placeholder={`Enter card description (${SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.name})`}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>
                        
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-2.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditSplashScreenCard;