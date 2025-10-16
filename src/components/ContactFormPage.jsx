import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, X, CheckCircle } from 'lucide-react';
import Header from './Header';
// --- Toast Component (No changes needed) ---
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

// --- ContactFormPage Component ---
const ContactFormPage = () => {
    const { contactId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const isEditMode = !!contactId;

    // --- MODIFICATION 1: Update initial state to include translations ---
    const getInitialFormData = () => {
        const baseData = {
            name: '',
            email: '',
            phoneNumber: '',
            country: location.state?.country || 'india', // Default country
        };

        // For create mode, initialize the translations object
        if (!isEditMode) {
            return {
                ...baseData,
                translations: {
                    hi: { name: '' },
                    kn: { name: '' },
                },
            };
        }

        // For edit mode, use existing contact data
        // Note: You'll need to fetch translations if you want to edit them.
        // For now, this focuses on creation.
        return location.state?.contact || baseData;
    };

    const [formData, setFormData] = useState(getInitialFormData());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (isEditMode && !location.state?.contact) {
            navigate('/emergency-and-telemedicine');
        }
    }, [isEditMode, location.state, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- MODIFICATION 2: Add a handler for the nested translation fields ---
    const handleTranslationChange = (lang, e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            translations: {
                ...prev.translations,
                [lang]: {
                    ...prev.translations[lang],
                    [name]: value,
                },
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const API_BASE_URL = `${import.meta.env.VITE_STAGING_URL}/emergency`;
        const token = localStorage.getItem('accessToken');
        const url = isEditMode ? `${API_BASE_URL}/contacts/${contactId}` : `${API_BASE_URL}/contacts`;
        const method = isEditMode ? 'PUT' : 'POST';

        // --- MODIFICATION 3: Clean up empty translations before sending ---
        const payload = { ...formData };
        if (payload.translations) {
            const cleanedTranslations = {};
            for (const lang in payload.translations) {
                // Only include the translation if a name has been entered
                if (payload.translations[lang].name) {
                    cleanedTranslations[lang] = payload.translations[lang];
                }
            }
            payload.translations = cleanedTranslations;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to submit contact');
            }

            setToast({ show: true, message: `Contact ${isEditMode ? 'updated' : 'created'} successfully!`, type: 'success' });
            setTimeout(() => navigate('/emergency-and-telemedicine'), 1500);

        } catch (error) {
            setToast({ show: true, message: error.message, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (!formData) return <div className="p-8">Loading...</div>;

    return (
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
            <Header title="Emergency and medicine"/>
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
            {toast.show && ( <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} /> )}

            <div className="flex items-center gap-3 text-lg font-semibold text-[#0A7777] mb-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                {isEditMode ? 'Edit Contact' : 'Create New Contact'}
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
                    {/* --- English / Default Contact Details --- */}
                    <h2 className="text-xl font-bold text-gray-700 mb-6">Contact Details (English)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>

                    {/* --- MODIFICATION 4: Add UI for translations (only in create mode) --- */}
                    {!isEditMode && (
                        <>
                            <div className="border-t border-gray-200 my-8"></div>
                            <h2 className="text-xl font-bold text-gray-700 mb-6">Translations (Optional)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name in Hindi (हिन्दी)</label>
                                    <input
                                        type="text"
                                        name="name" // The handler knows this is for a translation
                                        value={formData.translations.hi.name}
                                        onChange={(e) => handleTranslationChange('hi', e)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name in Kannada (ಕನ್ನಡ)</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.translations.kn.name}
                                        onChange={(e) => handleTranslationChange('kn', e)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="bg-[#0A7777] text-white  py-2 px-8 rounded-full hover:bg-cyan-800 disabled:opacity-50 transition-colors duration-200">
                            {isSubmitting ? 'Submitting...' : (isEditMode ? 'Save Changes' : 'Create Contact')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </div>
    );
};

export default ContactFormPage;