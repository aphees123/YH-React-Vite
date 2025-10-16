import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, X, CheckCircle, Trash2 } from 'lucide-react';
import Header from './Header'; // Assuming Header component exists

// --- Constants ---
const API_BASE_URL = 'http://backend-staging-alb-928761586.ap-southeast-2.elb.amazonaws.com';

const allLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'kn', name: 'Kannada' },
    // Add other supported languages here
];

// --- Helper Components ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => { onClose(); }, 3000);
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


// --- Main Form Component ---
const FaqFormPage = () => {
    const { faqId } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!faqId;

    // ✅ State updated: 'category' and 'categoryName' removed
    const [formData, setFormData] = useState({
        isActive: true,
        sortOrder: '0',
        translations: [{ language: 'en', question: '', answer: '' }]
    });

    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // ✅ useEffect updated: No longer sets category/categoryName
    useEffect(() => {
    if (isEditMode) {
        const fetchFaq = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('accessToken');
            try {
                const response = await fetch(`${API_BASE_URL}/faq/${faqId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Could not fetch FAQ data');
                const result = await response.json();
                const faqData = result.data;
                
                const hasTranslations = faqData.translations && faqData.translations.length > 0;
                
                setFormData({
                    isActive: faqData.isActive,
                    sortOrder: String(faqData.sortOrder ?? '0'),
                    // ✅ FIX APPLIED HERE:
                    // When translations are missing, it now uses the top-level question/answer.
                    translations: hasTranslations 
                        ? faqData.translations 
                        : [{ 
                            language: 'en', 
                            question: faqData.question || '', // Use top-level data
                            answer: faqData.answer || ''       // Use top-level data
                          }]
                });
            } catch (error) {
                setToast({ show: true, message: error.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchFaq();
    }
}, [faqId, isEditMode]);

    // --- Handlers for Form State ---

    const handleMainChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleTranslationChange = (index, e) => {
        const { name, value } = e.target;
        const newTranslations = [...formData.translations];
        newTranslations[index] = { ...newTranslations[index], [name]: value };
        setFormData(prev => ({ ...prev, translations: newTranslations }));
    };

    const handleAddTranslation = (langCode) => {
        if (!langCode || formData.translations.some(t => t.language === langCode)) {
            setToast({ show: true, message: 'This language has already been added.', type: 'error' });
            return;
        }
        setFormData(prev => ({
            ...prev,
            translations: [...prev.translations, { language: langCode, question: '', answer: '' }]
        }));
    };

    const handleRemoveTranslation = (indexToRemove) => {
        if (formData.translations.length <= 1) {
            setToast({ show: true, message: 'You must have at least one translation.', type: 'error' });
            return;
        }
        setFormData(prev => ({
            ...prev,
            translations: prev.translations.filter((_, index) => index !== indexToRemove)
        }));
    };
    
    // ✅ handleSubmit updated: Payload no longer includes category/categoryName
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('accessToken');
        
        const url = isEditMode ? `${API_BASE_URL}/faq/${faqId}` : `${API_BASE_URL}/faq`;
        const method = isEditMode ? 'PATCH' : 'POST';
        
        const payload = {
            isActive: formData.isActive,
            sortOrder: parseInt(formData.sortOrder, 10),
            translations: formData.translations.map(({ id, categoryName, ...rest }) => rest) // Strip id and categoryName
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errData = await response.json();
                const errorMessage = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
                throw new Error(errorMessage || `Failed to ${isEditMode ? 'update' : 'create'} FAQ`);
            }
            const successMessage = `FAQ ${isEditMode ? 'updated' : 'created'} successfully!`;
            setToast({ show: true, message: successMessage, type: 'success' });
            setTimeout(() => navigate('/faqs-and-policy/management'), 1500);
        } catch (error) {
            setToast({ show: true, message: error.message, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const availableLanguages = allLanguages.filter(
        lang => !formData.translations.some(t => t.language === lang.code)
    );

    if (isLoading) {
        return <div className="p-8 text-center">Loading form...</div>;
    }

    return (
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
            <Header title="FAQs management"/>
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
            <div className="flex items-center gap-3 text-xl  text-[#0A7777] mb-6">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                {isEditMode ? 'Edit FAQ' : 'Create New FAQ'}
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* --- Main Fields --- */}
                    <div>
                        <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Sort Order</label>
                        <input
                            type="number" id="sortOrder" name="sortOrder"
                            value={formData.sortOrder} onChange={handleMainChange} required min="0"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    
                    {/* --- Translations Section --- */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Translations</h3>
                        {formData.translations.map((trans, index) => (
                            <div key={index} className="border border-gray-200 p-4 rounded-lg space-y-4 relative">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                        {allLanguages.find(l => l.code === trans.language)?.name || trans.language}
                                    </span>
                                    {formData.translations.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveTranslation(index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full">
                                            <Trash2 className="h-5 w-5"/>
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Question</label>
                                    <input
                                        type="text" name="question" placeholder='Enter question'
                                        value={trans.question} onChange={(e) => handleTranslationChange(index, e)} required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Answer</label>
                                    <textarea
                                        name="answer" rows="4" placeholder='Enter answer'
                                        value={trans.answer} onChange={(e) => handleTranslationChange(index, e)} required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                {/* ✅ "Category Name" input removed */}
                            </div>
                        ))}
                    </div>

                    {/* --- Add Translation Control --- */}
                    {availableLanguages.length > 0 && (
                        <div className="flex items-center gap-2">
                             <select
                                onChange={(e) => handleAddTranslation(e.target.value)}
                                value=""
                                className="block w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="" disabled>-- Add another language --</option>
                                {availableLanguages.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* --- Final Controls --- */}
                    <div className="flex items-center pt-4 border-t">
                        <input
                            id="isActive" name="isActive" type="checkbox"
                            checked={formData.isActive} onChange={handleMainChange}
                            className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Is Active</label>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit" disabled={isSubmitting}
                            className="bg-[#0A7777] text-white py-2 px-8 rounded-full disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Submitting...' : (isEditMode ? 'Save Changes' : 'Create FAQ')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </div>
    );
};

export default FaqFormPage;