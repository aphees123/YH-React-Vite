import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, Plus, Search,Bell } from 'lucide-react';

// --- Reusable UI Components ---
const Header = () => {
    return (
        <header className="bg-[#F0F7F7]  flex items-center justify-between pt-6 font-baskerville">
            {/* Left Side: Title */}
            <h1 className="text-xl  text-[#0A7777]">
                Child Policy
            </h1>

            {/* Right Side: Search, Bell, Avatar */}
            <div className="flex items-center gap-5">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search anything here..."
                        className="bg-white rounded-full py-2 pl-5 pr-10 w-80 focus:outline-none focus:ring-2 focus:ring-[#0A7777]"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>

                {/* Bell Icon */}
                <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                    <Bell className="h-6 w-6 text-gray-600" />
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden">
                    {/* You can replace this with your actual user image */}
                    <img 
                        src="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
                        alt="User Avatar" 
                        className="w-full h-full object-cover"
                    />
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

// --- UPDATED ConfirmationModal Component ---
// This is the new modal component you provided.
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            {/* Modal Panel */}
            <div className="relative w-full max-w-sm transform rounded-lg bg-[#fcfaf7] p-6 text-left shadow-xl transition-all border border-gray-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-semibold leading-6 text-gray-800" style={{ fontFamily: 'serif' }}>
                        {title}
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-600">
                            {children}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-[#b93838] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto"
                        onClick={onConfirm}
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={onClose}
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- END UPDATED ConfirmationModal ---


const PolicyDisplayCard = ({ policy, onEdit, onRemove }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between">
            <div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-sm">
                    <div>
                        <p className="text-gray-500">Effective date</p>
                        <p className="font-semibold text-gray-800">{formatDate(policy.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Last updated</p>
                        <p className="font-semibold text-gray-800">{formatDate(policy.updatedAt)}</p>
                    </div>
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-2 break-words">{policy.title}</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap ">{policy.description}</p>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                <button
                    onClick={() => onEdit(policy)}
                    className="py-2 px-10 text-sm text-teal-900 bg-[#E9F2F2] border border-[#0A7777] rounded-full hover:bg-[#0A7777] hover:text-white transition-colors duration-200"
                >
                    Edit
                </button>
                <button
                    onClick={onRemove}
                    className="py-2 px-6 text-sm text-red-700 bg-red-100 border border-red-300 rounded-full hover:text-white hover:bg-red-700 transition-colors duration-200"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

const AddPolicyCard = ({ onClick }) => (
     <button
        onClick={onClick}
        className="flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#0A7777] hover:text-[#0A7777] transition-colors"
        style={{ minHeight: '200px' }}
    >
        <div className="bg-gray-100 rounded-full p-3 mb-3">
            <Plus className="w-6 h-6" />
        </div>
        <span className="font-semibold">Add new policy</span>
    </button>
);


// --- Main Page Component ---
const ChildPolicyManagementPage = () => {
    const API_BASE_URL = `${import.meta.env.VITE_STAGING_URL}/child-policy`;
    const navigate = useNavigate();

    const [policy, setPolicy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const fetchPolicy = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            console.log(token,"from clid")
            const response = await fetch(API_BASE_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 404) {
                setPolicy(null);
                return;
            }
            console.log(response,"from child")
            if (!response.ok) throw new Error('Failed to fetch child policy');

            const result = await response.json();
            setPolicy(result.data);

        } catch (err) {
            setError(err.message);
            setPolicy(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPolicy();
    }, [fetchPolicy]);

    const handleTopButtonAction = () => {
        if (policy) {
            navigate('/faqs-and-policy/child-policy/form', { state: { policy: policy } });
        } else {
            navigate('/faqs-and-policy/child-policy/form');
        }
    };

    const handleNavigateToCreate = () => {
        navigate('/faqs-and-policy/child-policy/form');
    };

    const handleNavigateToEdit = (policyToEdit) => {
        navigate('/faqs-and-policy/child-policy/form', { state: { policy: policyToEdit } });
    };

    const handleRemoveClick = () => {
        setDeleteModalOpen(true);
    };



    const handleConfirmRemove = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status !== 204 && response.status !== 200) {
                 throw new Error('Failed to delete policy');
            }

            setToast({ show: true, message: 'Policy removed successfully!', type: 'success' });
            setPolicy(null);
        } catch (err) {
            setToast({ show: true, message: err.message, type: 'error' });
        } finally {
             setDeleteModalOpen(false);
        }
    };

    return (
         <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
            <Header/>
        <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmRemove}
                title="Remove Policy"
            >
                Are you sure you want to permanently remove the Child Policy? This action cannot be undone.
            </ConfirmationModal>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-[#0A7777]"></h1>
                <button
                    onClick={handleTopButtonAction}
                    className="bg-[#0A7777] text-white py-2 px-5 rounded-full hover:bg-[#085f5f] transition-colors"
                >
                   {policy ? 'Update Policy' : 'Create New Policy'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                 {isLoading && <p className="text-center col-span-full">Loading Policy...</p>}
                 {error && <p className="text-red-500 text-center col-span-full">Error: {error}</p>}

                 {!isLoading && !error && (
                    <>
                        {policy && (
                            <PolicyDisplayCard
                                policy={policy}
                                onEdit={handleNavigateToEdit}
                                onRemove={handleRemoveClick}
                            />
                        )}
                        <AddPolicyCard onClick={handleNavigateToCreate} />
                    </>
                 )}
            </div>
        </div>
        </div>
    );
};

export default ChildPolicyManagementPage;