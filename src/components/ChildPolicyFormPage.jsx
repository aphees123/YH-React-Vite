import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, X, CheckCircle } from 'lucide-react';
import Header from './Header';
// --- Reusable UI Components ---

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

// --- Main Form Page Component ---
const ChildPolicyFormPage = () => {
    const API_BASE_URL = `${import.meta.env.VITE_STAGING_URL}/child-policy`;
    const navigate = useNavigate();
    const { state } = useLocation();

    // The policy to edit, if passed from the previous page.
    const policyToEdit = state?.policy; 

    // isEditMode is now based on whether policyToEdit exists.
    const isEditMode = !!policyToEdit;

    const [formData, setFormData] = useState({ title: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // This effect pre-fills the form if we are in edit mode. It DOES NOT fetch data.
    useEffect(() => {
        if (isEditMode && policyToEdit) {
            setFormData({
                title: policyToEdit.title || '',
                description: policyToEdit.description || ''
            });
        }
    }, [isEditMode, policyToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('accessToken');
        
        const method = isEditMode ? 'PUT' : 'POST';
        // If editing, append the policy ID to the URL. If creating, use the base URL.
        const url = API_BASE_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                 const errData = await response.json();
                 throw new Error(errData.message || `Failed to save policy`);
            }
            
            setToast({ show: true, message: 'Child Policy saved successfully!', type: 'success' });
            setTimeout(() => navigate('/faqs-and-policy/child-policy'), 1500);
        } catch(err) {
            setToast({ show: true, message: err.message, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
         <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
            <Header title="Child Policy"/>
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
            <div className="flex items-center gap-3 text-xl  text-[#0A7777] mb-6 max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                {isEditMode ? 'Edit Child Policy' : 'Create Child Policy'}
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text" id="title" name="title" placeholder='Enter the policy title'
                            value={formData.title} onChange={handleChange} required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A7777]"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            id="description" name="description" rows="5" placeholder='Enter the policy description'
                            value={formData.description} onChange={handleChange} required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A7777]"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                         <button
                            type="button" onClick={() => navigate(-1)}
                            className="bg-gray-200 text-gray-800 py-2 px-8 rounded-full hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={isSubmitting}
                            className="bg-[#0A7777] text-white py-2 px-8 rounded-full disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Policy'}
                        </button>
                    </div>
                </form>
            </div>
            </div>
        </div>
    );
};

export default ChildPolicyFormPage;