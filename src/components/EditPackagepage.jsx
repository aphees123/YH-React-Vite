import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Upload, X, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import Header from './Header';

const API_BASE_URL = import.meta.env.VITE_STAGING_URL;

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
            <button onClick={onClose} className="ml-4">
                <X className="h-5 w-5" />
            </button>
        </div>
    );
};

// --- ConfirmationModal Component ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-sm rounded-lg bg-[#fcfaf7] p-6 text-left shadow-xl border border-gray-200">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div>
                    <h3 className="text-2xl font-semibold leading-6 text-gray-800" style={{ fontFamily: 'serif' }}>{title}</h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-600">{children}</p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
                    <button type="button" onClick={onConfirm} className="inline-flex w-full justify-center rounded-md bg-[#b93838] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto">
                        Yes
                    </button>
                    <button type="button" onClick={onClose} className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto">
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Edit Page Component ---
const EditPackagePage = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    
    const [toastState, setToastState] = useState({ show: false, message: '', type: 'success' });
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, imageKey: null });

    const showToast = (message, type = 'success') => {
        setToastState({ show: true, message, type });
    };

    useEffect(() => {
        const loadPackageData = async () => {
            let packageData = location.state?.package;
            if (!packageData) {
                const token = localStorage.getItem('accessToken');
                try {
                    const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (!response.ok) throw new Error('Failed to fetch package details.');
                    const result = await response.json();
                    packageData = result.data;
                } catch (err) { setError(err.message); setIsLoading(false); return; }
            }
            setFormData({ ...packageData, inclusions: packageData.inclusions || [], exclusions: packageData.exclusions || [], packageImageUrls: packageData.packageImageUrls || [], packageImages: packageData.packageImages || [] });
            setIsLoading(false);
        };
        loadPackageData();
    }, [packageId, location.state]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = (formData.packageImages?.length || 0) + newImages.length + files.length;
        if (totalImages > 8) { showToast('You cannot have more than 8 images in total.', 'error'); return; }
        setNewImages(prev => [...prev, ...files]);
    };

    const handleRemoveNewImage = (indexToRemove) => {
        setNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleUploadImages = async () => {
        if (newImages.length === 0) { showToast('Please select images to upload first.', 'error'); return; }
        setIsUploading(true);
        const token = localStorage.getItem('accessToken');
        const uploadFormData = new FormData();
        newImages.forEach(file => uploadFormData.append('images', file));

        try {
            const response = await fetch(`${API_BASE_URL}/packages/${packageId}/images`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: uploadFormData });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to upload images.'); }
            const result = await response.json();
            setFormData(result.data);
            setNewImages([]);
            showToast('Images uploaded successfully!');
        } catch (err) { showToast(err.message, 'error'); } finally { setIsUploading(false); }
    };

    const handleDeleteImage = (imageKey) => {
        setDeleteModalState({ isOpen: true, imageKey: imageKey });
    };

    const handleConfirmDelete = async () => {
        const { imageKey } = deleteModalState;
        if (!imageKey) return;
        
        const token = localStorage.getItem('accessToken');
        try {
            const response = await fetch(`${API_BASE_URL}/packages/${packageId}/images?imagekey=${imageKey}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to delete image.'); }
            const result = await response.json();
            setFormData(result.data);
            showToast('Image deleted successfully!');
        } catch (err) { showToast(err.message, 'error'); } finally { setDeleteModalState({ isOpen: false, imageKey: null }); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.split('\n') }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        const { id, agent, packageImageUrls, createdAt, updatedAt, packageImages, childPolicies, createdBy, availableStates, accommodationItems, ...updatePayload } = formData;
        updatePayload.inclusions = updatePayload.inclusions.map(item => item.trim()).filter(Boolean);
        updatePayload.exclusions = updatePayload.exclusions.map(item => item.trim()).filter(Boolean);

        try {
            const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(updatePayload) });
            if (!response.ok) { const errorData = await response.json(); const message = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message; throw new Error(message || 'Failed to update package.'); }
            showToast('Package details saved successfully!');
            setTimeout(() => navigate('/package-management'), 1500);
        } catch (err) { showToast(err.message, 'error'); }
    };

    if (isLoading) return <div className="p-8">Loading package details...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
    if (!formData) return <div className="p-8">No package data found.</div>;

    return (
       
        <div className="bg-[#F7FAFA] min-h-screen pl-6 pr-6 pb-6 cursor-pointer">
            {toastState.show && <Toast message={toastState.message} type={toastState.type} onClose={() => setToastState({ ...toastState, show: false })} />}
            <ConfirmationModal
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({ isOpen: false, imageKey: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Image"
            >
                Are you sure you want to permanently delete this image?
            </ConfirmationModal>

            <Header title="Package Management" />
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
                <div className="max-w-4xl mx-auto mb-6 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Go back">
                        <ChevronLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <h1 className="text-xl  text-[#0A7777]">Edit Package</h1>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">{formData.name}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Package Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>

                        {/* Duration */}
                        <div>
                            <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                            <input type="number" id="durationDays" name="durationDays" value={formData.durationDays || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>

                        {/* Package Type */}
                        <div>
                            <label htmlFor="packageType" className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                            <select id="packageType" name="packageType" value={formData.packageType || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                                <option value="Hajj">Hajj</option>
                                <option value="Umrah">Umrah</option>
                                <option value="Ziyarat">Ziyarat</option>
                            </select>
                        </div>
                        
                        {/* Package Category */}
                        <div>
                            <label htmlFor="packageCategory" className="block text-sm font-medium text-gray-700 mb-1">Package Category</label>
                            <select id="packageCategory" name="packageCategory" value={formData.packageCategory || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                                <option value="Luxury">Luxury</option>
                            </select>
                        </div>

                        {/* Base Price */}
                        <div>
                            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                            <input type="number" id="basePrice" name="basePrice" value={formData.basePrice || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        
                        {/* Child Price */}
                        <div>
                            <label htmlFor="childPrice" className="block text-sm font-medium text-gray-700 mb-1">Child Price (₹)</label>
                            <input type="number" id="childPrice" name="childPrice" value={formData.childPrice || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        
                         {/* Infant Price */}
                        <div>
                            <label htmlFor="infantPrice" className="block text-sm font-medium text-gray-700 mb-1">Infant Price (₹)</label>
                            <input type="number" id="infantPrice" name="infantPrice" value={formData.infantPrice || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>

                        {/* Season */}
                        <div>
                            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                            <select id="season" name="season" value={formData.season || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                                <option value="Jan-Mar">Jan-Mar</option>
                                <option value="Apr-Jun">Apr-Jun</option>
                                <option value="Jul-Sep">Jul-Sep</option>
                                <option value="Oct-Dec">Oct-Dec</option>
                                <option value="Year-Round">Year-Round</option>
                            </select>
                        </div>
                        
                        {/* Status Field */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select id="status" name="status" value={formData.status || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Sort Order Field */}
                        <div>
                            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                            <input type="number" id="sortOrder" name="sortOrder" value={formData.sortOrder || '0'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="description" name="description" rows="4" value={formData.description || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"></textarea>
                        </div>
                        
                        {/* Inclusions */}
                        <div className="md:col-span-1">
                            <label htmlFor="inclusions" className="block text-sm font-medium text-gray-700 mb-1">Inclusions (one item per line)</label>
                            <textarea id="inclusions" name="inclusions" rows="5" value={formData.inclusions.join('\n')} onChange={handleArrayChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"></textarea>
                        </div>

                        {/* Exclusions */}
                        <div className="md:col-span-1">
                            <label htmlFor="exclusions" className="block text-sm font-medium text-gray-700 mb-1">Exclusions (one item per line)</label>
                            <textarea id="exclusions" name="exclusions" rows="5" value={formData.exclusions.join('\n')} onChange={handleArrayChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"></textarea>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Package Images</h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {formData.packageImageUrls.map((url, index) => (
                                <div key={index} className="relative group">
                                    <img src={url} alt={`Package image ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteImage(formData.packageImages[index])}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Delete image"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {newImages.map((file, index) => (
                                <div key={index} className="relative">
                                    <img src={URL.createObjectURL(file)} alt={`New preview ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                                    <button type="button" onClick={() => handleRemoveNewImage(index)} className="absolute top-1 right-1 bg-gray-700 text-white rounded-full p-1" aria-label="Remove new image">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-4">
                             <label htmlFor="image-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                                <Upload className="h-4 w-4" /> Choose Images...
                            </label>
                            <input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                            {newImages.length > 0 && (
                                <button type="button" onClick={handleUploadImages} disabled={isUploading} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-400">
                                    {isUploading ? 'Uploading...' : `Upload ${newImages.length} Image(s)`}
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">You can have a maximum of 8 images.</p>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 mr-4">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPackagePage;