import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, CheckCircle, ChevronLeft, ChevronRight, Search, Bell, ChevronDown } from 'lucide-react';
import { apiClient } from '../../src/utils/apiClient';

// --- Reusable UI Components ---
// (Header, Toast, ConfirmationModal, ViewFaqModal, FaqCard, AddFaqCard, PaginationControls, LanguageDropdown)
// ... all your other components remain the same ...

const Header = () => {
    return (
        <header className="bg-[#F0F7F7] p-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#0A7777] font-baskerville">FAQ's Management</h1>
            <div className="flex items-center gap-5">
                <div className="relative">
                    <input type="text" placeholder="Search anything here..." className="bg-white rounded-full py-2 pl-5 pr-10 w-80 focus:outline-none focus:ring-2 focus:ring-[#0A7777]" />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                    <Bell className="h-6 w-6 text-gray-600" />
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User Avatar" className="w-full h-full object-cover" />
                </div>
            </div>
        </header>
    );
};

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => { onClose(); }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-full shadow-lg text-white ${bgColor}`}>
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold">{message}</span>
            <button onClick={onClose} className="ml-4"><X className="h-5 w-5" /></button>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">{children}</p>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50" onClick={onClose}>Cancel</button>
                    <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
};

const ViewFaqModal = ({ isOpen, onClose, faq }) => {
    if (!isOpen || !faq) return null;

    // ✅ This line is the only change. It handles both data structures.
    const preview = faq.translations?.[0] || faq || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl m-4">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                </button>
                <h3 className="text-xl font-bold leading-6 text-gray-900 mb-4">
                    {preview.question}
                </h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap overflow-y-auto max-h-[70vh]">
                    <p>{preview.answer}</p>
                </div>
            </div>
        </div>
    );
};

const FaqCard = ({ faq, onEdit, onRemove, onView }) => {
    // ✅ This line is the only change. It handles both data structures.
    const preview = faq.translations?.[0] || faq;

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between">
            <div>
                <h4 className="font-bold text-gray-800 text-lg mb-2 break-words">
                    {preview.question || 'No question found'}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-3">
                    {preview.answer}
                </p>
            </div>
            <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => onView(faq)} className="py-1 px-6 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-700 transition-colors hover:text-white">
                    View
                </button>
                <button onClick={() => onEdit(faq)} className="py-1 px-6 text-sm text-[#0A7777] bg-[#E9F2F2] border border-[#0A7777] rounded-full hover:bg-[#0A7777] hover:text-white transition-colors">
                    Edit
                </button>
                <button onClick={() => onRemove(faq)} className="py-1 px-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-full hover:bg-red-700 transition-colors hover:text-white">
                    Remove
                </button>
            </div>
        </div>
    );
};

const AddFaqCard = ({ onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#0A7777] hover:text-[#0A7777] transition-colors"
        style={{ minHeight: '200px' }}
    >
        <div className="bg-gray-100 group-hover:bg-[#E9F2F2] rounded-full p-3 mb-3">
                   <Plus className="w-6 h-6" />
               </div>
        <span className="font-semibold">Add new FAQ</span>
    </button>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-4 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-full bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
};

const languages = [
    { code: '', name: 'All Languages' }, 
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
];

const LanguageDropdown = ({ selectedLanguage, onLanguageChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const selectedLangName = languages.find(l => l.code === selectedLanguage)?.name || 'Select Language';

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
        onLanguageChange(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0A7777] flex items-center justify-between w-44"
            >
                <span>{selectedLangName}</span>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl z-10 border border-gray-100 overflow-hidden">
                    {languages.map((lang) => (
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
const FaqManagementPage = () => {
    const navigate = useNavigate();
    
    const [faqs, setFaqs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [faqToView, setFaqToView] = useState(null);
    
    // ✅ 1. Initialize state with an empty string for the default view
    const [selectedLanguage, setSelectedLanguage] = useState(''); 

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 5,
        totalPages: 1,
    });

    // ✅ 2. Updated fetchFaqs function with conditional logic
    const fetchFaqs = useCallback(async (page, limit, language) => {
        setIsLoading(true);
        setError(null);

        const isLanguageSelected = !!language;
        const endpoint = isLanguageSelected ? '/faq' : `/faq/admin?page=${page}&limit=${limit}`;
        const options = isLanguageSelected ? { headers: { 'accept-language': language } } : {};

        try {
            const result = await apiClient(endpoint, options);

            if (isLanguageSelected) {
                // Handle response from '/faq' endpoint
                // Assumes it returns a flat array of FAQs
                setFaqs(result.data || []);
                // Reset pagination as this view is not paginated
                setPagination(prev => ({ ...prev, page: 1, totalPages: 1 }));
            } else {
                // Handle the default paginated response from '/faq/admin'
                setFaqs(result.data.data || []);
                const totalFaqs = result.data.total;
                const totalSlots = totalFaqs + 1; 
                const newTotalPages = Math.ceil(totalSlots / limit);
                setPagination(prev => ({
                    ...prev,
                    totalPages: newTotalPages > 0 ? newTotalPages : 1,
                    page: result.data.page
                }));
            }
        } catch (err) {
            setError(err.message);
            setFaqs([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // This useEffect hook now works with the updated fetchFaqs logic
    useEffect(() => {
        fetchFaqs(pagination.page, pagination.limit, selectedLanguage);
    }, [pagination.page, pagination.limit, selectedLanguage, fetchFaqs]);

    // This handler correctly sets the language and resets the page
    const handleLanguageChange = (langCode) => {
        setSelectedLanguage(langCode);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleRemoveClick = (faq) => {
        setFaqToDelete(faq);
        setDeleteModalOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!faqToDelete) return;
        try {
            await apiClient(`/faq/${faqToDelete.id}`, {
                method: 'DELETE',
            });
            
            setToast({ show: true, message: 'FAQ removed successfully!', type: 'success' });
            setDeleteModalOpen(false);
            setFaqToDelete(null);
            // Re-fetch data respecting the current view (default or language-specific)
            fetchFaqs(pagination.page, pagination.limit, selectedLanguage); 
        } catch (err) {
            setToast({ show: true, message: err.message || 'Failed to delete FAQ', type: 'error' });
        }
    };

    const handleViewClick = (faqForView) => {
        setFaqToView(faqForView);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setFaqToView(null);
    };

    return (
        <div className="bg-[#F0F7F7] min-h-screen">
            <Header/>
            <main className="px-8 py-6">
                <div className="py-4 px-4 bg-white rounded-xl">
                    {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
                    
                    <ConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={handleConfirmRemove}
                        title="Remove FAQ"
                    >
                        Are you sure you want to permanently remove this FAQ? This action cannot be undone.
                    </ConfirmationModal>

                    <ViewFaqModal
                        isOpen={isViewModalOpen}
                        onClose={handleCloseViewModal}
                        faq={faqToView}
                    />

                    <div className="flex justify-between items-center mb-6">
                        <LanguageDropdown
                            selectedLanguage={selectedLanguage}
                            onLanguageChange={handleLanguageChange}
                        />
                        <button 
                            onClick={() => navigate('/faqs-and-policy/create')}
                            className="bg-[#0A7777] text-white py-2 px-5 rounded-full"
                        >
                            Create new FAQ
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading && <p className="col-span-full text-center">Loading FAQs...</p>}
                        {error && <p className="col-span-full text-center text-red-500">Error: {error}</p>}
                        
                        {!isLoading && !error && faqs.map(faq => (
                            <FaqCard 
                                key={faq.id} 
                                faq={faq}
                                onEdit={() => navigate(`/faqs-and-policy/edit/${faq.id}`)}
                                onRemove={handleRemoveClick}
                                onView={handleViewClick}
                            />
                        ))}

                        <AddFaqCard onClick={() => navigate('/faqs-and-policy/create')} />
                    </div>
                    
                    <PaginationControls 
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </main>
        </div>
    );
};

export default FaqManagementPage;