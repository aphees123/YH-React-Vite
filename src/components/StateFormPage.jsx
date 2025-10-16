import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, X } from 'lucide-react';
import Header from './Header';

const API_BASE_URL = import.meta.env.VITE_STAGING_URL;

// Reusable Toast Component for feedback
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
    const Icon = isSuccess ? CheckCircle : X;
    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg text-white ${bgColor}`}>
            <Icon className="h-6 w-6" />
            <span className="font-semibold">{message}</span>
            <button onClick={onClose} className="ml-4"><X className="h-5 w-5" /></button>
        </div>
    );
};

const StateFormPage = () => {
    const { stateId } = useParams(); // Get the ID from the URL
    const navigate = useNavigate();

    // ✅ LOGIC: Determine if we are in "Edit" mode.
    const isEditMode = !!stateId;

    const [formData, setFormData] = useState({
        stateName: '',
        stateCode: '',
        country: 'India',
    });
    const [isLoading, setIsLoading] = useState(isEditMode); // Only load data in edit mode
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    // ✅ LOGIC: This effect runs only in "Edit" mode to fetch the state's data.
    useEffect(() => {
        if (isEditMode) {
            const fetchStateData = async () => {
                const token = localStorage.getItem('accessToken');
                try {
                    const response = await fetch(`${API_BASE_URL}/state-list/${stateId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Failed to fetch state details.');
                    const result = await response.json();
                    setFormData(result.data); // Pre-populate the form with fetched data
                } catch (err) {
                    showToast(err.message, 'error');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStateData();
        }
    }, [isEditMode, stateId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('accessToken');

    const url = isEditMode ? `${API_BASE_URL}/state-list/${stateId}` : `${API_BASE_URL}/state-list`;
    const method = isEditMode ? 'PATCH' : 'POST';

    // ✅ FIX: Create a 'payload' object that excludes the read-only properties.
    const { id, createdAt, updatedAt, ...payload } = formData;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            // Use the clean 'payload' object instead of the full 'formData'
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} state.`);
        }
        
        showToast(`State ${isEditMode ? 'updated' : 'created'} successfully!`, 'success');
        setTimeout(() => {
            navigate('/package-management/state-list');
        }, 1500);

    } catch (err) {
        showToast(err.message, 'error');
        setIsSubmitting(false);
    }
};
    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
          <Header title= {"Package Management"}/>
            
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false })} />}

            <main className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
                <div className="max-w-4xl mx-auto mb-6 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Go back">
                        <ChevronLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <h1 className="text-xl font-semibold text-[#0A7777]">
                        {/* ✅ UI: Dynamic title */}
                        {isEditMode ? 'Edit State' : 'Add new State'}
                    </h1>
                </div>

                <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-gray-200">
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-lg font-semibold text-gray-700 mb-6">State Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="stateName" className="block text-sm font-medium text-gray-600 mb-1">State Name</label>
                                <input type="text" id="stateName" name="stateName" value={formData.stateName} onChange={handleChange} placeholder="Ex. 'KARNATAKA'" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div>
                                <label htmlFor="stateCode" className="block text-sm font-medium text-gray-600 mb-1">State Code</label>
                                <input type="text" id="stateCode" name="stateCode" value={formData.stateCode} onChange={handleChange} placeholder="Ex. 'KA'" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="country" className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                                <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} placeholder="Ex. 'INDIA'" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                        </div>
                        <div className="flex justify-end mt-8">
                            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-teal-600 text-white font-semibold rounded-full hover:bg-teal-700 disabled:opacity-50">
                                {/* ✅ UI: Dynamic button text */}
                                {isSubmitting ? 'Submitting...' : (isEditMode ? 'Save Changes' : 'Submit')}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default StateFormPage;