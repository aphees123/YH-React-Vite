import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Heart, ChevronDown, X, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../Header';
import ConfirmationModal from '../ConfirmationModal';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg text-white ${bgColor}`}>
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold">{message}</span>
            <button onClick={onClose} className="ml-4"><X className="h-5 w-5" /></button>
        </div>
    );
};

const PhraseCard = ({ item, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
            <h4 className="font-bold text-[#0A7777] text-xl mb-4">{item.phrase}</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-sm font-semibold text-gray-400 mb-1">English Text</p>
                    <p className="text-black-950">{item.phrase}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-400 mb-1">Arabic Text</p>
                    <p className="text-black-950 font-serif text-lg">{item.arabicPhrase}</p>
                </div>
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-400 mb-1">Transliteration</p>
                <p className="text-black-950 text-sm">{item.pronunciation}</p>
            </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => onEdit(item)} className="py-2 px-10 text-sm text-teal-800 bg-[#E9F2F2] rounded-full border border-[#0A7777] hover:bg-[#0A7777] hover:text-white transition-colors">Edit</button>
            <button onClick={() => onDelete(item)} className="py-2 px-6 text-sm text-red-700 bg-red-50 border border-red-300 rounded-full hover:bg-red-700 hover:text-white">Delete</button>
        </div>
    </div>
);


const DuaCard = ({ item, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between">
        <div>
            <h4 className="font-serif font-bold text-[#0A7777] text-xl mb-2">{item.title}</h4>
            {item.usageInstructions && (
                <span className="inline-block bg-teal-100 text-teal-900 text-xs font-semibold px-3 py-2 rounded-full mb-5">
                    {item.usageInstructions}
                </span>
            )}
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-400 mb-1">Arabic Text</p>
                <p className="text-black-950 leading-relaxed">{item.arabicText}</p>
            </div>
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-400 mb-1">Transliteration</p>
                <p className="text-black-950 leading-relaxed">{item.transliteration}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Translation</p>
                <p className="text-black-950 leading-relaxed">{item.translation}</p>
            </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => onEdit(item)} className="py-2 px-10 text-sm text-teal-800 bg-[#E9F2F2] rounded-full border border-[#0A7777] hover:bg-[#0A7777] hover:text-white transition-colors">Edit</button>
            <button onClick={() => onDelete(item)} className="py-2 px-6 text-sm text-red-700 bg-red-50 border border-red-300 rounded-full hover:bg-red-100">Delete</button>
        </div>
    </div>
);

const AddNewCard = ({ type, onClick }) => (
    <button onClick={onClick} className="group flex flex-col items-center justify-center bg-white p-5 rounded-xl shadow-sm border-2 border-dashed border-gray-300 w-full text-gray-500 hover:border-[#0A7777] hover:text-[#0A7777] transition-colors" style={{ minHeight: '220px' }}>
        <div className="bg-gray-100 group-hover:bg-teal-50 rounded-full p-3 mb-3 transition-colors">
            <Plus className="w-6 h-6" />
        </div>
        <span className="font-semibold">Create new {type}</span>
    </button>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Return null if there's only one page or no pages
   
    return (
        <div className="flex justify-center items-center gap-4 mt-8">
            {/* Previous Page Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Go to previous page"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Number Display */}
            <span className="text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
            </span>

            {/* Next Page Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Go to next page"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

const ArabicPhrases = () => {
    const API_BASE_URL = import.meta.env.VITE_STAGING_URL;
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedLanguages, setSelectedLanguages] = useState({ phrases: 'en', duaas: 'en' });
    const [isLangDropdownOpen, setLangDropdownOpen] = useState(false);
    const languages = [{ code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' }, { code: 'kn', name: 'Kannada' }];
    const dropdownRef = useRef(null);

    const [activeTab, setActiveTab] = useState(location.state?.defaultTab === 'duaas' ? 'duaas': 'phrases');
    const [phrasesData, setPhrasesData] = useState([]);
    const [duaasData, setDuaasData] = useState([]);
    
    const [phrasesPage, setPhrasesPage] = useState(1);
    const [duaasPage, setDuaasPage] = useState(1);
    
    const [phrasesTotalPages, setPhrasesTotalPages] = useState(1);
    const [duaasTotalPages, setDuaasTotalPages] = useState(1);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [phrasesCategories, setPhrasesCategories] = useState([]);
    const [duaasCategories, setDuaasCategories] = useState([]);

    const [selectedPhrasesCategory, setSelectedPhrasesCategory] = useState('');
    const [selectedDuaasCategory, setSelectedDuaasCategory] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');
        
        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Accept-Language': selectedLanguages[activeTab]
        };
        
        const isPhrases = activeTab === 'phrases';
        const page = isPhrases ? phrasesPage : duaasPage;
        const endpoint = isPhrases 
            ? `${API_BASE_URL}/arabic-phrases/phrases?page=${page}&limit=5` 
            : `${API_BASE_URL}/duaas?page=${page}&limit=5`;
        
        const categoriesEndpoint = isPhrases
            ? `${API_BASE_URL}/arabic-phrases/categories` 
            : `${API_BASE_URL}/duaas/categories`;
            
        try {
            const response = await fetch(endpoint, { headers });
            const categoriesResponse = await fetch(categoriesEndpoint, { headers });
            if (!response.ok) throw new Error(`Failed to fetch ${activeTab}`);
            
            const result = await response.json();
            const categoriesResult = await categoriesResponse.json();
            const data = result.data;
            const categoriesData = categoriesResult.data;

            if (isPhrases) {
                setPhrasesData(data.phrases || []);
                setPhrasesTotalPages(data.totalPages || 1);
                setPhrasesCategories(categoriesData);
            } else {
                setDuaasData(data.duaas || []);
                setDuaasTotalPages(data.totalPages || 1);
                setDuaasCategories(categoriesData);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, phrasesPage, duaasPage, selectedLanguages]);

    useEffect(() => {
        fetchData();
    }, [fetchData, activeTab]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setLangDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleDelete = async () => {
        if (!itemToDelete) return;
        
        const isPhrases = activeTab === 'phrases';
        const endpoint = isPhrases
            ? `${API_BASE_URL}/arabic-phrases/phrases/${itemToDelete.id}`
            : `${API_BASE_URL}/duaas/${itemToDelete.id}`;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Failed to delete ${isPhrases ? 'phrase' : 'du\'a'}`);

            setToast({ show: true, message: `${isPhrases ? 'Phrase' : 'Du\'a'} deleted successfully!`, type: 'success' });
            fetchData();
        } catch (err) {
            setToast({ show: true, message: err.message, type: 'error' });
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleCreateClick = () => {
        const path = activeTab === 'phrases' 
            ? '/content-management/arabic-phrases/create' 
            : '/content-management/duaas/create';
        navigate(path);
    };

    const handleEditClick = (item) => {
        const path = activeTab === 'phrases' 
            ? `/content-management/arabic-phrases/edit/${item.id}` 
            : `/content-management/duaas/edit/${item.id}`;
        navigate(path, { state: { item } });
    };

    const handleOpenDeleteModal = (item) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };
    
    const handlePageChange = (newPage) => {
        if (activeTab === 'phrases') {
            setPhrasesPage(newPage);
        } else {
            setDuaasPage(newPage);
        }
    };

    const filterDataByCategory = async(categoryName) => {
        const token = localStorage.getItem('accessToken');
        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Accept-Language': selectedLanguages[activeTab]
        };

        const isPhrases = activeTab === 'phrases';
        const page = isPhrases ? phrasesPage : duaasPage;
        const endpoint = isPhrases 
            ? `${API_BASE_URL}/arabic-phrases/phrases?category=${categoryName}&page=${page}&limit=5`
            : `${API_BASE_URL}/duaas?category=${categoryName}&page=${page}&limit=5`;
        
        try {
            const response = await fetch(endpoint, { headers });
            if (!response.ok) throw new Error(`Failed to fetch ${activeTab}`);
            
            const result = await response.json();
            const data = result.data;

            if (isPhrases) {
                setPhrasesData(data.phrases || []);
                setPhrasesTotalPages(data.totalPages || 1);
            } else {
                setDuaasData(data.duaas || []);
                setDuaasTotalPages(data.totalPages || 1);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const HandleCategoryClick = async (categoryName) => {
        if (activeTab === 'phrases') {
            if(categoryName === selectedPhrasesCategory) {
                setSelectedPhrasesCategory("");
                await filterDataByCategory("");
            } else {
                setSelectedPhrasesCategory(categoryName);
                await filterDataByCategory(categoryName);
            }
        } else {
            if(categoryName === selectedDuaasCategory) {
                setSelectedDuaasCategory("");
                await filterDataByCategory("");
            } else {
                setSelectedDuaasCategory(categoryName);
                await filterDataByCategory(categoryName);
            }
        }
    }

    const handleLanguageChange = (langCode) => {
        setSelectedLanguages(prev => ({ ...prev, [activeTab]: langCode }));
        setLangDropdownOpen(false);
    };
    
    const currentData = activeTab === 'phrases' ? phrasesData : duaasData;
    const currentPage = activeTab === 'phrases' ? phrasesPage : duaasPage;
    const totalPages = activeTab === 'phrases' ? phrasesTotalPages : duaasTotalPages;

    return (
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
            <Header title="Content Management" />
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
                
                {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
                
                <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} title={`Delete ${activeTab === 'phrases' ? 'Phrase' : 'Du\'a'}`}>
                    Are you sure you want to delete this item? This action cannot be undone.
                </ConfirmationModal>

                <div className="flex justify-between items-center mb-3 mt-5">
                    <h1 className="text-xl text-[#0A7777] font-semibold font-baskerville">CRUD Management</h1>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setLangDropdownOpen(!isLangDropdownOpen)} className="flex items-center gap-2 py-2 px-4 rounded-full text-sm bg-gray-100 text-[#0A7777] hover:bg-gray-300">
                               <span>{languages.find(l => l.code === selectedLanguages[activeTab])?.name}</span>
                               <ChevronDown size={16} />
                            </button>
                            {isLangDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                    {languages.map(lang => (
                                        <button 
                                            key={lang.code} 
                                            onClick={() => handleLanguageChange(lang.code)} 
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <button onClick={handleCreateClick} className="py-2 px-5 rounded-full bg-[#0A7777] text-white hover:bg-teal-800 transition-colors">
                            Create new {activeTab === 'phrases' ? 'phrase' : 'du\'a'}
                        </button>
                    </div>
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-6">
                        <button onClick={() => { setActiveTab('phrases'); setPhrasesPage(1); }} className={`py-3 px-1 text-md font-semibold transition-colors duration-200 font-baskerville ${activeTab === 'phrases' ? 'text-[#0A7777] border-b-2 border-[#0A7777]' : 'text-gray-500 hover:text-teal-600'}`}>
                            Arabic Phrases
                        </button>
                        <button onClick={() => { setActiveTab('duaas'); setDuaasPage(1); }} className={`py-3 px-1 text-md font-semibold font-baskerville transition-colors duration-200 ${activeTab === 'duaas' ? 'text-[#0A7777] border-b-2 border-[#0A7777]' : 'text-gray-500 hover:text-teal-600'}`}>
                            Du'as
                        </button>
                    </nav>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    {activeTab === 'phrases' && phrasesCategories.map((item, index) => 
                        <button key={index} onClick={()=> HandleCategoryClick(item.category)} className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm ${selectedPhrasesCategory === item.category ? 'bg-[#0A7777] text-white' : 'bg-gray-200 text-[#0A7777] hover:bg-gray-300'}`}>
                            <Heart size={16} fill={selectedPhrasesCategory === item.category ? "currentColor" : "none"} /> {item.displayName}
                        </button>
                    )}

                    {activeTab === 'duaas' && duaasCategories.map((item, index) => 
                        <button key={index} onClick={()=> HandleCategoryClick(item.category)} className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm ${selectedDuaasCategory === item.category ? 'bg-[#0A7777] text-white' : 'bg-gray-200 text-[#0A7777] hover:bg-gray-300'}`}>
                            <Heart size={16} fill={selectedDuaasCategory === item.category ? "currentColor" : "none"} /> {item.displayName}
                        </button>
                    )}
                </div>

                <div>
                    {isLoading && <p className="text-center py-10">Loading...</p>}
                    {error && <p className="text-center py-10 text-red-500">Error: {error}</p>}
                    {!isLoading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeTab === 'phrases' && currentData.map(item => <PhraseCard key={item.id} item={item} onEdit={handleEditClick} onDelete={handleOpenDeleteModal} />)}
                            {activeTab === 'duaas' && currentData.map(item => <DuaCard key={item.id} item={item} onEdit={handleEditClick} onDelete={handleOpenDeleteModal} />)}
                            <AddNewCard type={activeTab === 'phrases' ? 'phrase' : 'du\'a'} onClick={handleCreateClick} />
                        </div>
                    )}
                </div>
                
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
        </div>
    );
};

export default ArabicPhrases;