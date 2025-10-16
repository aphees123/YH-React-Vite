import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ChevronLeft, X, CheckCircle } from 'lucide-react';
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

const DuaasEditForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { duaId } = useParams();
    const initialData = location.state?.item;

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        arabicText: '',
        transliteration: '',
        translation: '',
        usageInstructions: '',
        reference: '',
        icon: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                category: initialData.category || '',
                arabicText: initialData.arabicText || '',
                transliteration: initialData.transliteration || '',
                translation: initialData.translation || '',
                usageInstructions: initialData.usageInstructions || '',
                reference: initialData.reference || '',
                icon: initialData.icon || '',
            });
        } else {
            navigate('/content-management/arabic-phrases', { state: { defaultTab: 'duaas' } });
        }
    }, [initialData, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const API_BASE_URL = import.meta.env.VITE_STAGING_URL;
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch(`${API_BASE_URL}/duaas/${duaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json();
                const message = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
                throw new Error(message || 'Failed to update Du\'a');
            }

            setToast({ show: true, message: 'Du\'a updated successfully!', type: 'success' });

            setTimeout(() => {
                navigate('/content-management/arabic-phrases', { state: { defaultTab: 'duaas' } });
            }, 1500);

        } catch (error) {
            setToast({ show: true, message: error.message, type: 'error' });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
            <Header title="Content Management" />
            <div className="bg-white p-6 md:p-8 rounded-xl mt-8 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
                
                <div className="flex items-center gap-3 text-lg font-semibold text-[#0A7777] mb-6">
                    <button onClick={() => navigate('/content-management/arabic-phrases', { state: { defaultTab: 'duaas' } })} className="p-2 rounded-lg hover:bg-gray-200 text-gray-800">
                        <ChevronLeft className="h-6 w-6 text-[#0A7777]" />
                    </button>
                    Edit Du'a Details
                </div>

                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 max-w-5xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        <section>
                            <h2 className="text-xl font-bold text-gray-700 mb-6">Du'a Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Du'a for good health" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (URL or Name)</label>
                                    <input type="text" name="icon" value={formData.icon} onChange={handleChange} required placeholder="e.g., https://example.com/icon.png" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input type="text" name="category" value={formData.category} onChange={handleChange} required placeholder="e.g., Wellness" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Usage Instructions)</label>
                                    <input type="text" name="usageInstructions" value={formData.usageInstructions} onChange={handleChange} required placeholder="e.g., 3 times in morning and evening" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Arabic Text</label>
                                    <textarea name="arabicText" value={formData.arabicText} onChange={handleChange} required placeholder="Enter the Arabic text of the Du'a" rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-right" dir="rtl"></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transliteration</label>
                                    <textarea name="transliteration" value={formData.transliteration} onChange={handleChange} required placeholder="e.g., Allahumma 'Aafinee fee badani..." rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                                    <textarea name="translation" value={formData.translation} onChange={handleChange} required placeholder="e.g., O Allah, make me healthy in my body..." rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                                    <input type="text" name="reference" value={formData.reference} onChange={handleChange} placeholder="e.g., Abu Dawud, Tirmidhi" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                            </div>
                        </section>
                        
                        <div className="flex justify-end mt-8">
                            <button type="submit" disabled={isSubmitting} className="bg-[#0A7777] text-white font-semibold py-2.5 px-8 rounded-full hover:bg-teal-800 disabled:opacity-50 transition-colors">
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DuaasEditForm;
