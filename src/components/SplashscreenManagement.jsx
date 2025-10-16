import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, CheckCircle, Edit, ChevronDown, Search } from 'lucide-react';
// Note: The old <Header /> component is no longer used, as the header is built into this layout.
import ConfirmationModal from './ConfirmationModal';
import Header from './Header';

// --- Constants & Configuration ---
const API_BASE_URL = 'http://backend-staging-alb-928761586.ap-southeast-2.elb.amazonaws.com/splash-screens';
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
        <div className={`fixed top-24 right-5 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg text-white ${bgColor}`}>
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold">{message}</span>
            <button onClick={onClose} className="ml-4"><X className="h-5 w-5" /></button>
        </div>
    );
};

const Card = ({ card, onEdit, onRemove }) => (
    <div
        className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm flex flex-col justify-between p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        style={{ minHeight: '250px' }}
    >
        <div className="flex flex-col items-center text-center">
            {card.cardImageUrl && (
                 <img
                    src={card.cardImageUrl}
                    alt={card.description || 'Card Icon'}
                    className="w-12 h-12 mb-10 mt-5 object-contain"
                />
            )}
            <h3 className=" text-lg text-gray-800 mb-2">{card.description}</h3>
        </div>
        <div className="flex justify-center gap-3 w-full mt-auto">
            <button
                onClick={() => onEdit(card)}
                className="py-2 px-8 text-sm text-teal-800 bg-[#E9F2F2] rounded-full border border-[#0A7777] hover:bg-[#0A7777] hover:text-white transition-colors duration-200"
            >
                Edit
            </button>
            <button
                onClick={() => onRemove(card)}
                className="py-2 px-6 text-sm text-red-700 bg-red-50 border border-red-300 hover:text-white rounded-full hover:bg-red-700"
            >
                Remove
            </button>
        </div>
    </div>
);


const AddNewCard = ({ onClick }) => (
    <button
        onClick={onClick}
        className="group flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm border-2 border-dashed border-gray-300 w-full max-w-sm text-gray-500 hover:border-teal-600 hover:text-teal-600 transition-colors"
        style={{ minHeight: '250px' }}
    >
        <div className="bg-gray-100 group-hover:bg-teal-50 rounded-full p-3 mb-3">
            <Plus className="w-6 h-6" />
        </div>
        <span className="font-semibold">Add new Card</span>
    </button>
);

const LanguageDropdown = ({ selectedLang, onLangChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const selectedLangName = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name || 'Select Language';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (langCode) => {
        onLangChange(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center justify-between w-36"
            >
                <span>{selectedLangName}</span>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl z-10 border border-gray-100 overflow-hidden">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => handleSelect(lang.code)}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- Main Page Component ---
const SplashScreenManagement = () => {
    const navigate = useNavigate();
    const [splashScreens, setSplashScreens] = useState([]);
    const [activeScreenId, setActiveScreenId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [currentLang, setCurrentLang] = useState(DEFAULT_LANG);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);

    const fetchSplashScreens = useCallback(async (lang) => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            const urlWithLang = `${API_BASE_URL}?lang=${lang}`;
            const response = await fetch(urlWithLang, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch splash screens');
            const result = await response.json();
            const screens = result.data || [];
            setSplashScreens(screens);
            const activeScreenStillExists = screens.some(s => s.id === activeScreenId);
            if (screens.length > 0 && !activeScreenStillExists) {
                 setActiveScreenId(screens[0].id);
            } else if (screens.length === 0) {
                 setActiveScreenId(null);
            }
        } catch (err) {
            setError(err.message);
            setSplashScreens([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeScreenId]);

    useEffect(() => {
        fetchSplashScreens(currentLang);
    }, [currentLang, fetchSplashScreens]);

    const handleRemoveClick = (card) => {
        setCardToDelete(card);
        setDeleteModalOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!cardToDelete || !activeScreenId) return;
        try {
            const token = localStorage.getItem('accessToken');
            const apiUrl = `${API_BASE_URL}/${activeScreenId}/cards/${cardToDelete.id}`;
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete card');
            }
            setToast({ show: true, message: 'Card removed successfully!', type: 'success' });
            fetchSplashScreens(currentLang);
        } catch (err) {
            setToast({ show: true, message: err.message, type: 'error' });
        } finally {
            setDeleteModalOpen(false);
            setCardToDelete(null);
        }
    };

    const handleEditClick = (card) => {
        if (!activeScreenId) return;
        navigate(`/splash-screen/${activeScreenId}/edit-card/${card.id}`);
    };

    const handleCreateCardClick = () => {
        if (!activeScreenId) return;
        navigate(`/splash-screen/${activeScreenId}/create-card`);
    };

    const activeScreen = splashScreens.find(screen => screen.id === activeScreenId);

    return (
       
            
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

            {/* ✅ NEW: Header section matching the screenshot */}
            <Header title='Splash Screen Management'/>
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
               

           {/* --- Main Content Area --- */}
           <main className="p-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <ConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={handleConfirmRemove}
                        title="Remove Card"
                    >
                        Are you sure you want to permanently remove this card?
                    </ConfirmationModal>

                    {/* --- Tabs --- */}
                    <div className="border-b border-gray-200">
                        <div className="flex items-center gap-8">
                            {splashScreens.map((screen) => (
                                <button
                                    key={screen.id}
                                    onClick={() => setActiveScreenId(screen.id)}
                                    className={`py-3 px-1 text-sm text-center font-semibold transition-colors duration-200 whitespace-nowrap ${
                                        activeScreenId === screen.id
                                        ? 'text-teal-600 border-b-2 border-teal-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {screen.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ✅ UPDATED: Description and Actions layout */}
                    <div className="flex justify-between items-center gap-4 pt-6 pb-8">
                        {/* Left: Description */}
                        <div className="flex-grow">
                            {activeScreen?.description && (
                                <p className="text-sm text-gray-600">
                                    {activeScreen.description}
                                </p>
                            )}
                        </div>

                        {/* Right: Controls */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <LanguageDropdown selectedLang={currentLang} onLangChange={setCurrentLang} />
                            <button
                                onClick={() => navigate(`/splash-screen/edit/${activeScreenId}`)}
                                disabled={!activeScreenId}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Edit size={16} />
                                Edit Screen
                            </button>
                            {/* <button
                                onClick={() => navigate(`/splash-screen/create`)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700"
                            >
                               <Plus size={16} />
                                Create Screen
                            </button> */}
                        </div>
                    </div>

                    {/* --- Card Grid --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {isLoading && <p className="col-span-full text-center py-10">Loading...</p>}
                        {error && <p className="col-span-full text-center text-red-500 py-10">Error: {error}</p>}

                        {!isLoading && !error && activeScreen && activeScreen.cards.map(card => (
                            <Card
                                key={card.id}
                                card={card}
                                onEdit={handleEditClick}
                                onRemove={handleRemoveClick}
                            />
                        ))}
                         {!isLoading && !error && activeScreen && (
                            <AddNewCard onClick={handleCreateCardClick} />
                        )}
                    </div>
                </div>
           </main>
        </div>
        </div>
    );
};

export default SplashScreenManagement;