import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, X } from 'lucide-react';
import Header from './Header';

const API_BASE_URL = `${import.meta.env.VITE_STAGING_URL}/emergency`;

// --- Reusable Toast Component ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
    const Icon = isSuccess ? CheckCircle : XCircle;

    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg text-white ${bgColor}`}>
            <Icon className="h-6 w-6" />
            <span className="font-semibold">{message}</span>
            <button onClick={onClose} className="ml-4"><X className="h-5 w-5" /></button>
        </div>
    );
};

// --- Main Edit Contact Page Component ---
const EditContactPage = () => {
    const { contactId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(null); // Start as null until all data is fetched
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toastState, setToastState] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToastState({ show: true, message, type });
    };

    // MODIFICATION 1: Fetch contact data in parallel for each language
    const loadContactData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');

        const fetchContactForLanguage = async (lang) => {
            const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept-language': lang,
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch data for language: ${lang}`);
            }
            const result = await response.json();
            return result.data;
        };

        try {
            // Use Promise.all to make three API calls simultaneously
            const [englishData, hindiData, kannadaData] = await Promise.all([
                fetchContactForLanguage('en'),
                fetchContactForLanguage('hi'),
                fetchContactForLanguage('kn'),
            ]);

            // Combine the results into a single formData object
            const combinedData = {
                // Base details from the English response
                ...englishData,
                // Translations from each specific language response
                translations: {
                    hi: { name: hindiData.name || '' },
                    kn: { name: kannadaData.name || '' },
                }
            };

            setFormData(combinedData);

        } catch (err) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [contactId]);

    useEffect(() => {
        loadContactData();
    }, [loadContactData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // MODIFICATION 2: Add handler for nested translation fields
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
        const token = localStorage.getItem('accessToken');

        const { id, ...updatePayload } = formData;

        // Clean up empty translations before sending to the API
        if (updatePayload.translations) {
            const cleanedTranslations = {};
            for (const lang in updatePayload.translations) {
                if (updatePayload.translations[lang].name) {
                    cleanedTranslations[lang] = updatePayload.translations[lang];
                }
            }
            updatePayload.translations = cleanedTranslations;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update contact.');
            }
            
            showToast('Contact updated successfully!');
            setTimeout(() => navigate('/emergency-and-telemedicine'), 1500);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-lg">Loading contact details...</div>;
    if (error) return <div className="p-8 text-red-500 text-center text-lg">Error: {error}</div>;
    if (!formData) return <div className="p-8 text-center text-lg">No contact data found.</div>;

    return (
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
             {toastState.show && <Toast message={toastState.message} type={toastState.type} onClose={() => setToastState({ ...toastState, show: false })} />}
            <Header title="Emergency and Medicine"/>
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
      
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm mt-6">
                    <div className="mb-6 flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Go back">
                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                        </button>
                        <h1 className="text-xl text-[#0A7777] ">Edit Contact</h1>
                    </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        {/* English Details */}
                        <h2 className="text-xl font-bold text-gray-700 mb-6">Contact Details (English)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                            </div>
                        </div>

                        {/* MODIFICATION 3: UI for editing translations */}
                        <div className="border-t border-gray-200 my-8"></div>
                        <h2 className="text-xl font-bold text-gray-700 mb-6">Translations</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name in Hindi (हिन्दी)</label>
                                <input type="text" name="name" value={formData.translations.hi.name} onChange={(e) => handleTranslationChange('hi', e)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name in Kannada (ಕನ್ನಡ)</label>
                                <input type="text" name="name" value={formData.translations.kn.name} onChange={(e) => handleTranslationChange('kn', e)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-full shadow-sm hover:bg-gray-200">
                                Cancel
                            </button>
                            <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-[#0A7777] border border-transparent rounded-full shadow-sm hover:bg-teal-800">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
                </div>
            </div>
        </div>
    );
};

export default EditContactPage;