import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadCloud, ArrowLeft,ChevronLeft } from 'lucide-react';
import Header from './Header';
// --- Constants & Configuration ---
const API_BASE_URL = 'http://backend-staging-alb-928761586.ap-southeast-2.elb.amazonaws.com/splash-screens';
const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'kn', name: 'Kannada' },
];

const CreateSplashScreenCard = () => {
    const navigate = useNavigate();
    const { splashId } = useParams(); // Get the splash screen ID from the URL

    // State for form fields
    const [cardImage, setCardImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [description, setDescription] = useState('');
    const [order, setOrder] = useState('');
    const [translations, setTranslations] = useState({
        en: { description: '' },
        hi: { description: '' },
        kn: { description: '' },
    });

    // State for loading and errors
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle image selection and create a preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCardImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Update translations state
    const handleTranslationChange = (langCode, value) => {
        setTranslations(prev => ({
            ...prev,
            [langCode]: { description: value }
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cardImage) {
            setError('A card image is required.');
            return;
        }

        setIsLoading(true);
        setError(null);

        // ✅ Use FormData for multipart/form-data requests
        const formData = new FormData();
        formData.append('cardImage', cardImage);
        formData.append('description', description);
        if (order) formData.append('order', order);
        
        // The backend expects translations as a JSON string
        formData.append('translations', JSON.stringify(translations));

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/${splashId}/cards`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // ❗ DO NOT set 'Content-Type'. The browser will automatically set it
                    // to 'multipart/form-data' with the correct boundary for FormData.
                },
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to create card');
            }
            
            // On success, navigate back to the main management page
            navigate(`/splash-screen`); // Adjust this path if needed

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
       
           
        <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
             <Header title="Splash Screen Management"/>
              <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
            <div className="max-w-4xl mx-auto">
                 <div className="mb-6 flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Go back">
                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                        </button>
                        <h1 className="text-xl text-[#0A7777] ">Back</h1>
                    </div>
                <form onSubmit={handleSubmit} className="p-8 bg-white rounded-2xl shadow-sm space-y-6">
                   

                    {/* --- Image Upload --- */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Image*</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto" />
                                ) : (
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                )}
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif, image/webp" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 5MB</p>
                            </div>
                        </div>
                    </div>

                    {/* --- Order and Description --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="order" className="block text-sm font-medium text-gray-700">Order (Optional)</label>
                            <input type="number" id="order" value={order} onChange={(e) => setOrder(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Default Description (Optional)</label>
                            <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                    </div>

                    {/* --- Translations --- */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-800">Translations</h3>
                        <div className="mt-4 space-y-4">
                            {SUPPORTED_LANGUAGES.map(lang => (
                                <div key={lang.code}>
                                    <label htmlFor={`desc-${lang.code}`} className="block text-sm font-medium text-gray-700">{lang.name} Description</label>
                                    <textarea
                                        id={`desc-${lang.code}`}
                                        rows={2}
                                        value={translations[lang.code].description}
                                        onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    {/* --- Actions --- */}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-wait">
                            {isLoading ? 'Saving...' : 'Save Card'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </div>
    );
};

export default CreateSplashScreenCard;