import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Star, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import Header from './Header'; // Assuming Header is in a separate file

// --- NEW: Custom hook for debouncing ---
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the specified delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if the value changes before the delay has passed
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};


// --- Reusable Confirmation Modal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            <div className="relative w-full max-w-sm transform rounded-lg bg-[#fcfaf7] p-6 text-left shadow-xl transition-all border border-gray-200">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-semibold leading-6 text-gray-800" style={{ fontFamily: 'serif' }}>{title}</h3>
                    <div className="mt-2"><p className="text-sm text-gray-600">{children}</p></div>
                </div>
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
                    <button type="button" className="inline-flex w-full justify-center rounded-md bg-[#b93838] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto" onClick={onConfirm}>Yes</button>
                    <button type="button" className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto" onClick={onClose}>No</button>
                </div>
            </div>
        </div>
    );
};

// --- Reusable Custom Dropdown ---
const CustomDropdown = ({ options, value, onChange, placeholder, buttonClassName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        if (optionValue !== value) onChange(optionValue);
        setIsOpen(false);
    };
    
    const selectedOptionLabel = options[value]?.label || placeholder;

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between px-4 py-1.5 text-sm transition-all duration-150 ${buttonClassName} ${options[value]?.classes || 'text-gray-700'}`}>
                <span>{selectedOptionLabel}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
                    <ul className="py-1">
                        {Object.entries(options).filter(([optionKey]) => optionKey !== value).map(([optionKey, { label, classes }]) => (
                            <li key={optionKey}>
                                <button onClick={() => handleSelect(optionKey)} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                    {classes && <span className={`h-2 w-2 rounded-full mr-2 ${classes.split(' ')[0]}`}></span>}
                                    {label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- Filter Panel Component ---
const FilterPanel = ({ filters, onFilterChange, onClearFilters, feedbackTypeOptions, ratingOptions }) => {
    return (
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="text-xs font-semibold text-gray-600">Feedback Type</label>
                    <CustomDropdown
                        options={feedbackTypeOptions}
                        value={filters.feedbackType}
                        onChange={(value) => onFilterChange('feedbackType', value)}
                        buttonClassName="w-full mt-1 rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-[#00A79D]"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs font-semibold text-gray-600">Min Rating</label>
                        <CustomDropdown options={ratingOptions} value={filters.minRating} onChange={(value) => onFilterChange('minRating', value)} buttonClassName="w-full mt-1 rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-[#00A79D]" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600">Max Rating</label>
                        <CustomDropdown options={ratingOptions} value={filters.maxRating} onChange={(value) => onFilterChange('maxRating', value)} buttonClassName="w-full mt-1 rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-[#00A79D]" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="createdAfter" className="text-xs font-semibold text-gray-600">From Date</label>
                        <input id="createdAfter" type="date" name="createdAfter" value={filters.createdAfter} onChange={(e) => onFilterChange(e.target.name, e.target.value)} className="mt-1 w-full border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A79D] text-sm text-gray-700" />
                    </div>
                    <div>
                        <label htmlFor="createdBefore" className="text-xs font-semibold text-gray-600">To Date</label>
                        <input id="createdBefore" type="date" name="createdBefore" value={filters.createdBefore} onChange={(e) => onFilterChange(e.target.name, e.target.value)} className="mt-1 w-full border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A79D] text-sm text-gray-700" />
                    </div>
                </div>
                <div className="flex items-end justify-end">
                    <button onClick={onClearFilters} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md">Clear</button>
                </div>
            </div>
        </div>
    );
};

// --- Single Feedback Row Component ---
const FeedbackRow = ({ feedback, onStatusChangeRequest, onDelete, statusOptions }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const getFeedbackTypeDisplay = (fb) => {
        if (fb.rating) return <div className="flex items-center justify-center">{[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < fb.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}</div>;
        if (fb.issuesDescription) return "Yes";
        if (fb.suggestions) return "Text";
        return "General";
    };
    return (
        <div className="border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 items-center justify-items-center p-4 hover:bg-gray-50 text-sm">
                <div className="col-span-1 font-medium text-gray-700">{`#${feedback.userId.substring(0, 6)}`}</div>
                <div className="col-span-3">{getFeedbackTypeDisplay(feedback)}</div>
                <div className="col-span-3 w-32">
                    <CustomDropdown options={statusOptions} value={feedback.status} onChange={(newStatus) => onStatusChangeRequest(feedback.id, newStatus)} buttonClassName="rounded-md font-semibold"/>
                </div>
                <div className="col-span-3 text-gray-600">{new Date(feedback.createdAt).toLocaleDateString()}</div>
                <div className="col-span-2 flex items-center justify-center gap-2">
                    <button onClick={() => onDelete(feedback.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"><Trash2 className="h-5 w-5" /></button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">{isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</button>
                </div>
            </div>
            
            {/* --- MODIFIED SECTION --- */}
            {isExpanded && (
                <div className="bg-gray-50 p-4 border-t border-gray-200 text-sm">
                    {(!feedback.issuesDescription && !feedback.suggestions) ? (
                        <p className="text-gray-500 italic">No additional suggestions were provided.</p>
                    ) : (
                        <>
                            {feedback.issuesDescription && (
                                <p>
                                    <strong>Where there any issues or difficulties you faced:</strong>{' '}
                                    <span className="text-gray-700">{feedback.issuesDescription}</span>
                                </p>
                            )}
                            {feedback.suggestions && (
                                <p className={feedback.issuesDescription ? "mt-2" : ""}>
                                    <strong>Do you have any suggestions for improvement:</strong>{' '}
                                    <span className="text-gray-700">{feedback.suggestions}</span>
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}
            {/* --- END OF MODIFIED SECTION --- */}

        </div>
    );
};

// --- Main Feedback List Page Component ---
const FeedbackListPage = () => {
    const navigate = useNavigate();
    const API_BASE_URL = `${import.meta.env.VITE_STAGING_URL}/feedback`;

    const [feedbacks, setFeedbacks] = useState([]);
    const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
    const [filters, setFilters] = useState({
        status: '',
        feedbackType: '',
        userId: '',
        minRating: '',
        maxRating: '',
        createdAfter: '',
        createdBefore: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, feedbackId: null });
    const [statusUpdateModalState, setStatusUpdateModalState] = useState({ isOpen: false, feedbackId: null, newStatus: null });
    
    const statusFilterOptions = { '': { label: 'All Statuses' }, 'pending': { label: 'Pending' }, 'in_progress': { label: 'In Progress' }, 'resolved': { label: 'Resolved' },'closed': {label: 'Closed'} };
    const feedbackTypeOptions = { '': { label: 'All Types' }, 'app_feedback': { label: 'App Feedback' }, 'bug_report': { label: 'Bug Report' }, 'feature_request': { label: 'Feature Request' } };
    const ratingOptions = { '': { label: 'Any' }, '1': { label: '1 Star' }, '2': { label: '2 Stars' }, '3': { label: '3 Stars' }, '4': { label: '4 Stars' }, '5': { label: '5 Stars' } };
    const rowStatusOptions = { pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' }, in_progress: { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' }, resolved: { label: 'Resolved', classes: 'bg-green-100 text-green-800' }, closed: {label:'Closed', classes:'bg-red-100 text-red-800'} };

    const fetchFeedbacks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams({ page: meta.page, limit: meta.limit });
        for (const key in filters) {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        }

        try {
            const token = localStorage.getItem('accessToken'); 
            const response = await fetch(`${API_BASE_URL}?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Failed to fetch feedback data.');
            const result = await response.json();
            setFeedbacks(result.data.data || []);
            setMeta(result.data.meta || { page: 1, limit: 10, total: 0 });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [meta.page, meta.limit, filters]);

    useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

    useEffect(() => {
        handleFilterChange('userId', debouncedSearchTerm);
    }, [debouncedSearchTerm]);


    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setMeta(prev => ({...prev, page: 1}));
    };
    
    const handleClearAdvancedFilters = () => {
        setFilters(prev => ({ ...prev, feedbackType: '', minRating: '', maxRating: '', createdAfter: '', createdBefore: '' }));
        setMeta(prev => ({...prev, page: 1}));
    };

    // --- 👇 FULLY IMPLEMENTED FUNCTIONS ---
    const handleConfirmStatusUpdate = async () => {
        const { feedbackId, newStatus } = statusUpdateModalState;
        if (!feedbackId || !newStatus) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/${feedbackId}/status`, { // CORRECTED URL
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                // You might want to get more specific error info from the response body
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status.');
            }

            // Update the UI immediately without a full refetch
            setFeedbacks(currentFeedbacks =>
                currentFeedbacks.map(fb =>
                    fb.id === feedbackId ? { ...fb, status: newStatus } : fb
                )
            );

        } catch (err) {
            setError(err.message); // Display error to the user
        } finally {
            // Close the modal regardless of success or failure
            setStatusUpdateModalState({ isOpen: false, feedbackId: null, newStatus: null });
        }
    };

    const handleConfirmDelete = async () => {
        const { feedbackId } = deleteModalState;
        if (!feedbackId) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/${feedbackId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete feedback.');
            }

            // Remove the deleted item from the list in the UI
            setFeedbacks(currentFeedbacks =>
                currentFeedbacks.filter(fb => fb.id !== feedbackId)
            );
            
            // Also update the total count in meta
            setMeta(prev => ({ ...prev, total: prev.total - 1 }));

        } catch (err) {
            setError(err.message);
        } finally {
            // Close the modal
            setDeleteModalState({ isOpen: false, feedbackId: null });
        }
    };
    
    const handleDeleteClick = (feedbackId) => setDeleteModalState({ isOpen: true, feedbackId });
    const handleStatusChangeRequest = (feedbackId, newStatus) => setStatusUpdateModalState({ isOpen: true, feedbackId, newStatus });

    return (
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
            <Header title="Feedback Management"/>
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
                <ConfirmationModal isOpen={deleteModalState.isOpen} onClose={() => setDeleteModalState({isOpen: false, feedbackId: null})} onConfirm={handleConfirmDelete} title="Delete Feedback">Are you sure you want to permanently delete this feedback? This action cannot be undone.</ConfirmationModal>
                <ConfirmationModal isOpen={statusUpdateModalState.isOpen} onClose={() => setStatusUpdateModalState({ isOpen: false, feedbackId: null, newStatus: null })} onConfirm={handleConfirmStatusUpdate} title="Confirm Status Change">{`Are you sure you want to change the status to "${statusUpdateModalState.newStatus?.replace('_', ' ')}"?`}</ConfirmationModal>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                        <h2 className="text-md text-[#0A7777] font-baskerville">Feedback Entries</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search by User ID..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="border rounded-full pl-10 pr-4 py-1.5 w-48 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A79D]" 
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                            <div className="w-40"><CustomDropdown options={statusFilterOptions} value={filters.status} onChange={(value) => handleFilterChange('status', value)} buttonClassName="rounded-full border bg-white focus:outline-none focus:ring-2 focus:ring-[#00A79D]" /></div>
                            <button onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} className="p-2 border rounded-full text-gray-600 hover:bg-gray-100 hover:text-[#00A79D] focus:outline-none focus:ring-2 focus:ring-[#00A79D]"><Filter className="h-5 w-5" /></button>
                        </div>
                    </div>
                    {isFilterPanelOpen && <FilterPanel filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearAdvancedFilters} feedbackTypeOptions={feedbackTypeOptions} ratingOptions={ratingOptions} />}
                    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="col-span-1 text-center">User ID</div>
                        <div className="col-span-3 text-center">Rating</div>
                        <div className="col-span-3 text-center">Status</div>
                        <div className="col-span-3 text-center">Date</div>
                        <div className="col-span-2 text-center">Actions</div>
                    </div>
                    <div>
                        {isLoading && <p className="p-4 text-center text-gray-500">Loading feedback...</p>}
                        {error && <p className="p-4 text-center text-red-500">Error: {error}</p>}
                        {!isLoading && !error && feedbacks.map(fb => <FeedbackRow key={fb.id} feedback={fb} onStatusChangeRequest={handleStatusChangeRequest} onDelete={handleDeleteClick} statusOptions={rowStatusOptions} />)}
                        {!isLoading && feedbacks.length === 0 && <p className="p-4 text-center text-gray-500">No feedback found.</p>}
                    </div>
                   <div className="p-4 border-t border-gray-200 flex justify-center items-center">
                        <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
                            <button onClick={() => setMeta(prev => ({...prev, page: Math.max(1, prev.page - 1)}))} disabled={meta.page <= 1} className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></button>
                            <span>Page {meta.page} of {Math.ceil(meta.total / meta.limit) || 1}</span>
                            <button onClick={() => setMeta(prev => ({...prev, page: prev.page + 1}))} disabled={meta.page >= Math.ceil(meta.total / meta.limit)} className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackListPage;