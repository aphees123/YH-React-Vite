import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const IslamicResourcesForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        guidelineType: 'hajj',
        islamicDate: '',
        gregorianDate: '',
        imageUrl: '',
        sortOrder: 1,
        translations: {
            hi: { title: '', description: '' },
            kn: { title: '', description: '' },
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        if (name.includes('.')) {
            const [lang, key] = name.split('.');
            setFormData(prev => ({
                ...prev,
                translations: { ...prev.translations, [lang]: { ...prev.translations[lang], [key]: value } }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseInt(value, 10) : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const API_BASE_URL = import.meta.env.VITE_STAGING_URL;
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch(`${API_BASE_URL}/guidelines/guidelines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json();
                const message = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
                throw new Error(message || 'Failed to create guideline');
            }

            setToast({ show: true, message: 'Guideline created successfully!', type: 'success' });
            

            setTimeout(() => {
                if(formData.guidelineType === "hajj")
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
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200 text-gray-800">
                        <ChevronLeft className="h-6 w-6 text-[#0A7777]" />
                    </button>
                    Create New Islamic Resource
                </div>

                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 max-w-5xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        {/* Main Guideline Details */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-700 mb-6">Guideline Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Tawaf al-Qudum" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Guideline Type</label>
                                    <select name="guidelineType" value={formData.guidelineType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                                        <option value="hajj">Hajj</option>
                                        <option value="umrah">Umrah</option>
                                    </select>
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
                        
                        <div className="border-t my-8"></div>

                        {/* Hindi Translation */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-700 mb-6">Hindi Translation</h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (Hindi)</label>
                                    <input type="text" name="hi.title" value={formData.translations.hi.title} onChange={handleChange} placeholder="Title in Hindi" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Hindi)</label>
                                    <textarea name="hi.description" value={formData.translations.hi.description} onChange={handleChange} placeholder="Description in Hindi" rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                                </div>
                            </div>
                        </section>
                        
                        <div className="border-t my-8"></div>

                        {/* Kannada Translation */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-700 mb-6">Kannada Translation</h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (Kannada)</label>
                                    <input type="text" name="kn.title" value={formData.translations.kn.title} onChange={handleChange} placeholder="Title in Kannada" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Kannada)</label>
                                    <textarea name="kn.description" value={formData.translations.kn.description} onChange={handleChange} placeholder="Description in Kannada" rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                                </div>
                            </div>
                        </section>
                        
                        <div className="flex justify-end mt-8">
                            <button type="submit" disabled={isSubmitting} className="bg-[#0A7777] text-white font-semibold py-2.5 px-8 rounded-full hover:bg-teal-800 disabled:opacity-50 transition-colors">
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default IslamicResourcesForm;
