import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X, CheckCircle, Heart } from 'lucide-react';
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

const ArabicPhrasesForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        phrase: '',
        arabicText: '',
        pronunciation: '',
        category: '',
        englishText: '',
        categoryIcon: '',
        translations: {
            hi: { phrase: '', category: '', pronunciation: '' },
            kn: { phrase: '', category: '', pronunciation: '' },
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [lang, key] = name.split('.');
            setFormData(prev => ({
                ...prev,
                translations: {
                    ...prev.translations,
                    [lang]: {
                        ...prev.translations[lang],
                        [key]: value
                    }
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const API_BASE_URL = import.meta.env.VITE_STAGING_URL;
        const token = localStorage.getItem('accessToken');

        const payload = {
            phrase: formData.phrase,
            arabicPhrase: formData.arabicText,
            pronunciation: formData.pronunciation,
            category: formData.category,
            categoryIcon: formData.categoryIcon,
            translations: {
                hi: {
                    phrase: formData.translations.hi.phrase,
                    category: formData.translations.hi.category,
                    pronunciation: formData.translations.hi.pronunciation,
                },
                kn: {
                    phrase: formData.translations.kn.phrase,
                    category: formData.translations.kn.category,
                    pronunciation: formData.translations.kn.pronunciation,
                }
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/arabic-phrases/phrases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                const message = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
                throw new Error(message || 'Failed to create Arabic phrase');
            }

            setToast({ show: true, message: 'Arabic phrase created successfully!', type: 'success' });

            setTimeout(() => {
                navigate('/content-management/arabic-phrases');
            }, 1500);

        } catch (error) {
            setToast({ show: true, message: error.message, type: 'error' });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#F0F7F7] min-h-screen">
            <Header title="Content Management" />
            <div className="bg-white p-6 md:p-8 rounded-xl mt-8 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />} 
                <div className="flex items-center gap-3 text-lg font-semibold text-[#0A7777] mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200 text-gray-800">
                        <ChevronLeft className="h-6 w-6 text-[#0A7777]" />
                    </button>
                    Create New Arabic Phrase
                </div>
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 max-w-5xl mx-auto">
                    
                    <form onSubmit={handleSubmit}>
                        {/* Main Phrase Details */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-700 mb-6">Arabic Phrase Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (English Phrase)</label>
                                    <input type="text" name="phrase" value={formData.phrase} onChange={handleChange} required placeholder="e.g., Hello" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (URL or Name)</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Heart className="h-5 w-5 text-gray-400" /></span>
                                        <input type="text" name="categoryIcon" value={formData.categoryIcon} onChange={handleChange} placeholder="e.g., wellness-icon.png or heart" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input type="text" name="category" value={formData.category} onChange={handleChange} required placeholder="e.g., Greetings" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">English Text</label>
                                    <input type="text" name="englishText" value={formData.englishText} onChange={handleChange} required placeholder="e.g., Hello, how are you?" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Arabic Text</label>
                                    <input type="text" name="arabicText" value={formData.arabicText} onChange={handleChange} required placeholder="e.g., مرحبا" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-right" dir="rtl" />
                                </div>
                                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Transliteration</label>
                                    <input type="text" name="pronunciation" value={formData.pronunciation} onChange={handleChange} required placeholder="e.g., Marhaba" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                            </div>
                        </section>
                        
                        <div className="border-t my-8"></div>

                        {/* Hindi Translation */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-700 mb-6">Hindi Translation</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phrase (Hindi)</label>
                                    <input type="text" name="hi.phrase" value={formData.translations.hi.phrase} onChange={handleChange} placeholder="e.g., नमस्ते" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category (Hindi)</label>
                                    <input type="text" name="hi.category" value={formData.translations.hi.category} onChange={handleChange} placeholder="e.g., अभिवादन" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pronunciation (Hindi)</label>
                                    <input type="text" name="hi.pronunciation" value={formData.translations.hi.pronunciation} onChange={handleChange} placeholder="e.g., मरहबा" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                            </div>
                        </section>
                        
                        <div className="border-t my-8"></div>

                        {/* Kannada Translation */}
                        <section>
                             <h2 className="text-xl font-bold text-gray-700 mb-6">Kannada Translation</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phrase (Kannada)</label>
                                    <input type="text" name="kn.phrase" value={formData.translations.kn.phrase} onChange={handleChange} placeholder="e.g., ನಮಸ್ಕಾರ" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category (Kannada)</label>
                                    <input type="text" name="kn.category" value={formData.translations.kn.category} onChange={handleChange} placeholder="e.g., ಶುಭಾಶಯಗಳು" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pronunciation (Kannada)</label>
                                    <input type="text" name="kn.pronunciation" value={formData.translations.kn.pronunciation} onChange={handleChange} placeholder="e.g., ಮರ್ಹಬಾ" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
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

export default ArabicPhrasesForm;