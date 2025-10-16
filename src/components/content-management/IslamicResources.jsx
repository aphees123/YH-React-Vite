import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, X, CheckCircle, Calendar, Globe, ChevronDown } from 'lucide-react';
import Header from '../Header';
import ConfirmationModal from '../ConfirmationModal';

const Toast = ({ message, type, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => onClose(), 3000);
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

const GuidelineCard = ({ item, onEdit, onDelete }) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden w-full max-w-sm mx-auto">
        <div className="p-5">
            <h3 className="font-serif font-bold text-[#0A7777] text-xl mb-1">{item.title}</h3>
        </div>
        
        <div className="aspect-video w-full h-48 p-2">
            <img 
                src={item.imageUrl || 'https://placehold.co/600x400/E9F2F2/0A7777?text=Image'} 
                alt={item.title} 
                className="w-full h-full object-cover"
            />
        </div>
        <div className="p-5 flex-grow flex flex-col justify-between">
            <p className="text-sm text-gray-900 mb-4">{item.description}</p>
            <div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{item.islamicDate}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
                    <Globe size={14} className="text-gray-400" />
                    <span>{item.gregorianDate}</span>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => onEdit(item)} className="py-2 px-10 text-sm text-teal-800 bg-[#E9F2F2] rounded-full border border-[#0A7777] hover:bg-[#0A7777] hover:text-white transition-colors">Edit</button>
                <button onClick={() => onDelete(item)} className="py-2 px-6 text-sm text-red-700 bg-red-50 border border-red-300 rounded-full hover:bg-red-700 hover:text-white">Delete</button>
            </div>
        </div>
    </div>
);

const AddNewCard = ({ onClick }) => (
    <button onClick={onClick} className="group flex flex-col items-center justify-center bg-white p-5 rounded-2xl shadow-sm border-2 border-dashed border-gray-300 w-full text-gray-500 hover:border-[#0A7777] hover:text-[#0A7777] transition-colors" style={{ minHeight: '300px' }}>
        <div className="bg-gray-100 group-hover:bg-teal-50 rounded-full p-4 mb-3 transition-colors">
            <Plus className="w-8 h-8" />
        </div>
        <span className="font-semibold text-lg">Create new resource</span>
    </button>
);


const IslamicResources = () => {
    const API_BASE_URL = import.meta.env.VITE_STAGING_URL;
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.defaultTab === 'umrah' ? 'umrah': 'hajj');

    const [selectedLanguages, setSelectedLanguages] = useState({ hajj: 'en', umrah: 'en' });
    const [isLangDropdownOpen, setLangDropdownOpen] = useState(false);
    const languages = [{ code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' }, { code: 'kn', name: 'Kannada' }];
    const dropdownRef = useRef(null);

    const [guidelines, setGuidelines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');
        
        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Accept-Language': selectedLanguages[activeTab]
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/guidelines/types/${activeTab}`, { headers });
            if (!response.ok) throw new Error(`Failed to fetch ${activeTab} guidelines`);
            
            const result = await response.json();
            setGuidelines(result.data || []);
        } catch (err) {
            setError(err.message);
            setGuidelines([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, selectedLanguages]);

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
        
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/guidelines/guidelines/${itemToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete guideline');

            setToast({ show: true, message: 'Guideline deleted successfully!', type: 'success' });
            fetchData();
        } catch (err) {
            setToast({ show: true, message: err.message, type: 'error' });
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };
    
    const handleLanguageChange = (langCode) => {
        setSelectedLanguages(prev => ({ ...prev, [activeTab]: langCode }));
        setLangDropdownOpen(false);
    };

    const handleCreateClick = () => navigate('/content-management/islamic-resources/create');
    const handleEditClick = (item) => navigate(`/content-management/islamic-resources/edit/${item.id}`, { state: { item } });
    const handleOpenDeleteModal = (item) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    return (
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
            <Header title="Content Management" />
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
                
                {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
                
                <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} title="Delete Guideline">
                    Are you sure you want to delete this guideline? This action cannot be undone.
                </ConfirmationModal>

                <div className="flex justify-between items-center mb-3 mt-5">
                    <h1 className="text-xl text-[#0A7777] font-semibold font-baskerville">CRUD Management Islamic Resources</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setLangDropdownOpen(!isLangDropdownOpen)} className="flex items-center gap-2 py-2 px-4 rounded-full text-sm bg-gray-200 text-[#0A7777] hover:bg-gray-300">
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
                            Create new resource
                        </button>
                    </div>
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-6">
                        <button onClick={() => setActiveTab('hajj')} className={`py-3 px-1 text-md font-semibold transition-colors font-baskerville duration-200 ${activeTab === 'hajj' ? 'text-[#0A7777] border-b-2 border-[#0A7777]' : 'text-gray-500 hover:text-teal-600'}`}>
                            Hajj Guidelines
                        </button>
                        <button onClick={() => setActiveTab('umrah')} className={`py-3 px-1 text-md font-semibold transition-colors font-baskerville duration-200 ${activeTab === 'umrah' ? 'text-[#0A7777] border-b-2 border-[#0A7777]' : 'text-gray-500 hover:text-teal-600'}`}>
                            Umrah Guidelines
                        </button>
                    </nav>
                </div>

                <div>
                    {isLoading && <p className="text-center py-10">Loading...</p>}
                    {error && <p className="text-center py-10 text-red-500">Error: {error}</p>}
                    {!isLoading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {guidelines.map(item => (
                                <GuidelineCard key={item.id} item={item} onEdit={handleEditClick} onDelete={handleOpenDeleteModal} />
                            ))}
                            <AddNewCard onClick={handleCreateClick} />
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
};

export default IslamicResources;