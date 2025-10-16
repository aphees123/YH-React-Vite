import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Mail, Phone, X, CheckCircle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal'; // Assuming these are in separate files
import Header from './Header';
import PaginationControls from './PaginationControls';

// --- Reusable UI Components (No changes needed here) ---

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


// --- Main Page Component ---
const Workinprogress = () => {
    const API_BASE_URL = `${import.meta.env.VITE_STAGING_URL}/emergency`;
    const navigate = useNavigate();

    // --- 1. STATE FOR LANGUAGE SELECTION ---
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
        
        // --- 3. DYNAMICALLY ADD LANGUAGE HEADER TO API CALLS ---
        const headers = {
            'Authorization': `Bearer ${token}`,
            'accept-language': selectedLanguage,
        };

        try {
            const topParams = new URLSearchParams({ country: activeTab, page: topPagination.page, limit: topPagination.limit });
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
            setError(err.message);
            setTopContacts([]);
            setAllContacts([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, topPagination.page, topPagination.limit, allPagination.page, allPagination.limit, selectedLanguage]); // Add selectedLanguage as a dependency

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
            <Header title="work in Progress"/>
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
                <h1>Work in progress</h1>
            </div>
        </div>
    );
};

export default Workinprogress;