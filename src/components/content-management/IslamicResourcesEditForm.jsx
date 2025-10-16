import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ChevronLeft, X, CheckCircle } from 'lucide-react';
import Header from '../Header';
import ConfirmationModal from '../ConfirmationModal';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
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


const IslamicResourcesEditForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { guidelineId } = useParams();
    const initialData = location.state?.item;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        islamicDate: '',
        gregorianDate: '',
        imageUrl: '',
        sortOrder: 1,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                islamicDate: initialData.islamicDate || '',
                gregorianDate: initialData.gregorianDate || '',
                imageUrl: initialData.imageUrl || '',
                sortOrder: initialData.sortOrder || 1,
            });
        } else {
            if(initialData.guidelineType === "hajj")
            {
                navigate('/content-management/islamic-resources');
            } else {
                navigate('/content-management/islamic-resources', { state: { defaultTab: 'umrah' } });
            }
        }
    }, [initialData, navigate]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseInt(value, 10) : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const API_BASE_URL = import.meta.env.VITE_STAGING_URL;
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch(`${API_BASE_URL}/guidelines/guidelines/${guidelineId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json();
                const message = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
                throw new Error(message || 'Failed to update guideline');
            }

            setToast({ show: true, message: 'Guideline updated successfully!', type: 'success' });

            setTimeout(() => {
                if(initialData.guidelineType === "hajj")
                {
                    navigate('/content-management/islamic-resources');
                } else {
                    navigate('/content-management/islamic-resources', { state: { defaultTab: 'umrah' } });
                }
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
                    <button 
                    onClick={() => {
                        if(initialData.guidelineType === "hajj")
                        {
                            navigate('/content-management/islamic-resources');
                        } else {
                            navigate('/content-management/islamic-resources', { state: { defaultTab: 'umrah' } });
                        }
                    }} 
                    className="p-2 rounded-lg hover:bg-gray-200 text-gray-800"
                    >
                        <ChevronLeft className="h-6 w-6 text-[#0A7777]" />
                    </button>
                    Edit Islamic Resource
                </div>

                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 max-w-5xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        <section>
                            <h2 className="text-xl font-bold text-gray-700 mb-6">Guideline Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Tawaf al-Qudum" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} required placeholder="e.g., The arrival circumambulation of the Kaaba..." rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Islamic Date</label>
                                    <input type="text" name="islamicDate" value={formData.islamicDate} onChange={handleChange} placeholder="e.g., 8th Zilhijja" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gregorian Date</label>
                                    <input type="text" name="gregorianDate" value={formData.gregorianDate} onChange={handleChange} placeholder="e.g., 12th March" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required placeholder="https://example.com/image.jpg" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                    <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} required placeholder="e.g., 1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
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

export default IslamicResourcesEditForm;
