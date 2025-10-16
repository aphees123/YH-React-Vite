import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, CheckCircle, ChevronLeft, ChevronRight, ChevronDown, Search } from 'lucide-react';
import Header from './Header';
// ✅ NEW: Importing your stylish ConfirmationModal from its own file.
import ConfirmationModal from './ConfirmationModal'; // Adjust path if necessary

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

// ✅ REMOVED: The old ConfirmationModal definition was here.

const StateCard = ({ state, onEdit, onRemove }) => {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 w-full max-w-sm shadow-sm hover:shadow-lg transition-shadow">
            <h4 className="font-bold text-gray-800 text-lg mb-4">{state.stateName}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                    <p className="text-xs text-gray-400">State Code</p>
                    <p className="font-medium">{state.stateCode}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Country</p>
                    <p className="font-medium">{state.country}</p>
                </div>
            </div>
            <div className="flex justify-center gap-2 mt-6">
                <button onClick={() => onEdit(state)} className="py-2 px-8 text-sm text-[#0A7777] bg-[#E9F2F2] rounded-full border border-[#0A7777] hover:bg-[#0A7777] hover:text-white transition-colors duration-200">
                    Edit
                </button>
                <button onClick={() => onRemove(state)} className="py-2 px-6 text-sm text-red-700 bg-red-50 border border-red-300 rounded-full hover:text-white hover:bg-red-500">
                    Delete
                </button>
            </div>
        </div>
    );
};

const AddStateCard = ({ onClick }) => (
    <button
        onClick={onClick}
        className="group flex flex-col items-center justify-center bg-white p-5 rounded-xl shadow-sm border-2 border-dashed border-gray-300 w-full max-w-sm text-gray-500 hover:border-[#0A7777] hover:text-[#0A7777] transition-colors"
        style={{ minHeight: '170px' }}
    >
        <div className="bg-gray-100 group-hover:bg-[#E9F2F2] rounded-full p-3 mb-3">
            <Plus className="w-6 h-6" />
        </div>
        <span className="font-semibold">Add new State</span>
    </button>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null; 
    }
    return (
        <div className="flex justify-center items-center gap-4 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
};


// --- Main Page Component ---
const StateList = () => {
    const API_BASE_URL = `${import.meta.env.VITE_STAGING_URL}/state-list`;
    const navigate = useNavigate();
    
    const [states, setStates] = useState([]);
    const [paginatedStates, setPaginatedStates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [stateToDelete, setStateToDelete] = useState(null);

    const [pagination, setPagination] = useState({ page: 1, limit: 11, totalPages: 1 });

    const fetchStates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}?isActive=true`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch states');
            const result = await response.json();
            setStates(result.data || []);
        } catch (err) {
            setError(err.message);
            setStates([]);
        } finally {
            setIsLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchStates();
    }, [fetchStates]);

    useEffect(() => {
        const totalItems = states.length;
        const totalPages = Math.ceil(totalItems / pagination.limit);
        setPagination(prev => ({ ...prev, totalPages: totalPages > 0 ? totalPages : 1 }));
        
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        setPaginatedStates(states.slice(startIndex, endIndex));
    }, [states, pagination.page, pagination.limit]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleRemoveClick = (state) => {
        setStateToDelete(state);
        setDeleteModalOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!stateToDelete) return;
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/${stateToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 throw new Error('Failed to delete state');
            }
            setToast({ show: true, message: 'State removed successfully!', type: 'success' });
            setDeleteModalOpen(false);
            setStateToDelete(null);
            fetchStates(); 
        } catch (err) {
            setToast({ show: true, message: err.message, type: 'error' });
        }
    };

    return (
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
            {/* Assuming you have a main Header component imported */}
            <Header title="State List"/> 
            
           <main className="px-4 md:px-8 py-6 py-4 px-4 bg-white flex-1 rounded-xl mt-6">
                {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
                
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleConfirmRemove}
                    title="Remove State"
                >
                    Are you sure you want to permanently remove this state?
                </ConfirmationModal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading && <p className="col-span-full text-center">Loading states...</p>}
                    {error && <p className="col-span-full text-center text-red-500">Error: {error}</p>}
                    
                    {!isLoading && !error && paginatedStates.map(state => (
                        <StateCard 
                            key={state.id} 
                            state={state}
                            onEdit={() => navigate(`/state-list/edit/${state.id}`)}
                            onRemove={handleRemoveClick}
                        />
                    ))}

                    {!isLoading && pagination.page === pagination.totalPages && (
                        <AddStateCard onClick={() => navigate('/state-list/create')} />
                    )}
                </div>
                
                <PaginationControls 
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                />
            </main>
        </div>
    );
};

export default StateList;