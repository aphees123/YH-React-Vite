import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Mail, Phone, X, CheckCircle, ChevronDown } from 'lucide-react';

// NOTE: The following components are assumed to be in separate files.
// For this example to be self-contained, they would need to be defined here.
// const ConfirmationModal = ({...}) => { ... };
// const Header = ({...}) => { ... };

// Importing the new PaginationControls component
import PaginationControls from './PaginationControls'; // Assuming it's in the same folder


// --- Reusable UI Components ---

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-full shadow-lg text-white ${bgColor}`}>
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold">{message}</span>
            <button onClick={onClose} className="ml-4">
                <X className="h-5 w-5" />
            </button>
        </div>
    );
};

const ContactCard = ({ contact, onEdit, onDelete }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 w-full max-w-sm shadow-lg hover:shadow-xl transition-shadow">
        <h4 className="font-bold text-gray-800 text-lg mb-3">{contact.name}</h4>
        <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3 min-w-0">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="break-all">{contact.email}</span>
            </div>
            <div className="flex items-start gap-3 min-w-0">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="break-all">{contact.phoneNumber}</span>
            </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
            <button
                onClick={() => onEdit(contact)}
                className="py-2 px-8 text-sm text-teal-800 bg-[#E9F2F2] rounded-full border border-[#0A7777] hover:bg-[#0A7777] hover:text-white transition-colors duration-200"
            >
                Edit
            </button>
            <button
                onClick={() => onDelete(contact)}
                className="py-2 px-6 text-sm text-red-700 bg-red-50 border border-red-300 hover:text-white rounded-full hover:bg-red-700"
            >
                Delete
            </button>
        </div>
    </div>
);

const AddContactCard = ({ onClick }) => (
    <button
        onClick={onClick}
        className="group flex flex-col items-center justify-center bg-white p-5 rounded-xl shadow-sm border-2 border-dashed border-gray-300 w-full max-w-sm text-gray-500 hover:border-[#0A7777]"
        style={{ minHeight: '170px' }}
    >
       <div className="bg-gray-100 group-hover:bg-[#E9F2F2] rounded-full p-3 mb-3">
           <Plus className="w-6 h-6" />
       </div>
        <span className="font-semibold">Add new contact</span>
    </button>
);

// --- Mock Components for Demonstration ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="mb-4">{children}</p>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 rounded-full">Cancel</button>
                    <button onClick={onConfirm} className="py-2 px-4 bg-red-600 text-white rounded-full">Confirm</button>
                </div>
            </div>
        </div>
    );
};
const Header = ({ title }) => <header className="py-4"><h1 className="text-3xl font-bold text-gray-800">{title}</h1></header>;

// --- Custom Language Dropdown Component ---
const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
];

const LanguageDropdown = ({ selectedLanguage, onLanguageChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const selectedLangName = languages.find(l => l.code === selectedLanguage)?.name || 'Select Language';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
const EmergencyMedicinePage = () => {
    const API_BASE_URL = `${import.meta.env.VITE_STAGING_URL}/emergency`;
    const navigate = useNavigate();

    const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default to English
    const [activeTab, setActiveTab] = useState('india');
    const [topContacts, setTopContacts] = useState([]);
    const [allContacts, setAllContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [topPagination, setTopPagination] = useState({ page: 1, limit: 2, total: 0, totalPages: 1 });
    const [allPagination, setAllPagination] = useState({ page: 1, limit: 2, total: 0, totalPages: 1 });

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'accept-language': selectedLanguage,
        };

        try {
            const topParams = new URLSearchParams({ country: activeTab, page: topPagination.page, limit: topPagination.limit,isImportant: true });
            const topContactsPromise = fetch(`${API_BASE_URL}/contacts?${topParams.toString()}`, { headers });
            
            const allParams = new URLSearchParams({ country: activeTab, page: allPagination.page, limit: allPagination.limit });
            const allContactsPromise = fetch(`${API_BASE_URL}/contacts?${allParams.toString()}`, { headers });
            
            const [topContactsResponse, allContactsResponse] = await Promise.all([
                topContactsPromise,
                allContactsPromise,
            ]);

            if (!topContactsResponse.ok || !allContactsResponse.ok) {
                throw new Error('Failed to fetch contacts');
            }

            const topResult = await topContactsResponse.json();
            const allResult = await allContactsResponse.json();

            setTopContacts(topResult.data.contacts || []);
            setTopPagination(prev => ({ ...prev, total: topResult.data.total, totalPages: topResult.data.totalPages }));
            setAllContacts(allResult.data.contacts || []);
            setAllPagination(prev => ({ ...prev, total: allResult.data.total, totalPages: allResult.data.totalPages }));

        } catch (err) {
            setError('Simulated fetch error. Displaying mock data.');
            // Mock data for demonstration since the API call will fail
            setTopContacts([{id: 1, name: 'Mock Top Contact', email: 'mock@top.com', phoneNumber: '123'}]);
            setAllContacts([{id: 2, name: 'Mock All Contact', email: 'mock@all.com', phoneNumber: '456'}]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, topPagination.page, topPagination.limit, allPagination.page, allPagination.limit, selectedLanguage]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);
    
    const handleTopPageChange = (newPage) => setTopPagination(prev => ({ ...prev, page: newPage }));
    const handleAllPageChange = (newPage) => setAllPagination(prev => ({ ...prev, page: newPage }));

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setTopPagination(prev => ({ ...prev, page: 1 }));
        setAllPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDeleteContact = async () => {
        if (!contactToDelete) return;
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/contacts/${contactToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete contact');
            setToast({ show: true, message: 'Contact deleted successfully!', type: 'success' });
            setDeleteModalOpen(false);
            setContactToDelete(null);
            fetchAllData();
        } catch (err) {
            setToast({ show: true, message: err.message, type: 'error' });
        }
    };

    const handleCreateClick = () => navigate('/emergency-and-telemedicine/create', { state: { country: activeTab } });
    const handleEditClick = (contact) => navigate(`/emergency-and-telemedicine/edit/${contact.id}`, { state: { contact } });
    const handleOpenDeleteModal = (contact) => {
        setContactToDelete(contact);
        setDeleteModalOpen(true);
    };

    return (
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
            <Header title="Emergency and Medicine"/>
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                )}
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDeleteContact}
                    title="Delete Contact"
                >
                    Are you sure you want to delete this contact? This action cannot be undone.
                </ConfirmationModal>

                <div className="flex justify-between items-center mb-3 mt-5">
                    <h1 className="text-2xl font-semibold text-gray-800"></h1>
                    
                    <div className="flex items-center gap-4">
                        <LanguageDropdown
                            selectedLanguage={selectedLanguage}
                            onLanguageChange={setSelectedLanguage}
                        />
                        
                        <button
                            onClick={handleCreateClick}
                            className="py-2 px-5 rounded-full bg-[#0A7777] text-white"
                        >
                            Create new contact
                        </button>
                    </div>
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-6">
                        <button
                            onClick={() => handleTabChange('india')}
                            className={`py-3 px-1 text-md font-semibold transition-colors duration-200 ${
                                activeTab === 'india'
                                    ? 'text-[#0A7777] border-b-2 border-[#0A7777]'
                                    : 'text-gray-500 hover:text-teal-600'
                                }`}
                        >
                            India
                        </button>
                        <button
                            onClick={() => handleTabChange('saudi_arabia')}
                            className={`py-3 px-1 text-md font-semibold transition-colors duration-200 ${
                                activeTab === 'saudi_arabia'
                                    ? 'text-[#0A7777] border-b-2 border-[#0A7777]'
                                    : 'text-gray-500 hover:text-teal-600'
                                }`}
                        >
                            Saudi Arabia
                        </button>
                    </nav>
                </div>
                
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-[#0A7777] mb-4">Top Contacts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {isLoading && topContacts.length === 0 ? <p>Loading...</p> : topContacts.map(contact => (
                            <ContactCard key={contact.id} contact={contact} onEdit={handleEditClick} onDelete={handleOpenDeleteModal} />
                        ))}
                        <AddContactCard onClick={handleCreateClick} />
                    </div>
                    {!isLoading && (
                        <PaginationControls currentPage={topPagination.page} totalPages={topPagination.totalPages} onPageChange={handleTopPageChange} />
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4 text-[#0A7777]">All Contacts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {isLoading && allContacts.length === 0 && <p>Loading contacts...</p>}
                        {error && !isLoading && <p className="text-red-500 col-span-full">{error}</p>}
                        {!isLoading && !error && allContacts.map(contact => (
                            <ContactCard key={contact.id} contact={contact} onEdit={handleEditClick} onDelete={handleOpenDeleteModal} />
                        ))}
                         <AddContactCard onClick={handleCreateClick} />
                    </div>
                    {!isLoading && (
                        <PaginationControls currentPage={allPagination.page} totalPages={allPagination.totalPages} onPageChange={handleAllPageChange} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmergencyMedicinePage;