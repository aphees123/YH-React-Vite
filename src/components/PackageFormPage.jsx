import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Upload, X, ChevronLeft, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import Header from './Header';

const API_BASE_URL = import.meta.env.VITE_STAGING_URL;

// --- Reusable Components ---
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
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-sm rounded-lg bg-[#fcfaf7] p-6 text-left shadow-xl border border-gray-200">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div>
                    <h3 className="text-2xl font-semibold leading-6 text-gray-800" style={{ fontFamily: 'serif' }}>{title}</h3>
                    <div className="mt-2"><p className="text-sm text-gray-600">{children}</p></div>
                </div>
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
                    <button type="button" onClick={onConfirm} className="inline-flex w-full justify-center rounded-md bg-[#b93838] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto">Yes</button>
                    <button type="button" onClick={onClose} className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto">No</button>
                </div>
            </div>
        </div>
    );
};
const AccommodationEditor = ({ items, onChange }) => {
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        onChange(updatedItems);
    };
    const handleAddItem = () => {
        const newItem = { type: 'hotel', cat: '', url: '', isIncluded: false };
        onChange([...items, newItem]);
    };
    const handleRemoveItem = (indexToRemove) => {
        onChange(items.filter((_, index) => index !== indexToRemove));
    };
    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg bg-gray-50">
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-600">Type</label>
                            <select value={item.type} onChange={(e) => handleItemChange(index, 'type', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-md">
                                <option value="hotel">Hotel</option><option value="flight">Flight</option><option value="visa">Visa</option><option value="meals">Meals</option><option value="transport">Transport</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Category (e.g., "4star")</label>
                            <input type="text" value={item.cat || ''} onChange={(e) => handleItemChange(index, 'cat', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-md" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-gray-600">URL</label>
                            <input type="text" value={item.url || ''} onChange={(e) => handleItemChange(index, 'url', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-md" />
                        </div>
                    </div>
                    <div className="flex flex-col justify-between items-start md:items-end">
                         <div className="flex items-center gap-2">
                            <input type="checkbox" id={`isIncluded-${index}`} checked={item.isIncluded} onChange={(e) => handleItemChange(index, 'isIncluded', e.target.checked)} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"/>
                            <label htmlFor={`isIncluded-${index}`} className="text-sm font-medium text-gray-700">Included</label>
                        </div>
                        <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 className="h-5 w-5" /></button>
                    </div>
                </div>
            ))}
            <button type="button" onClick={handleAddItem} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100">
                <Plus className="h-4 w-4" /> Add Item
            </button>
        </div>
    );
};


// --- Main Form Page (Create & Edit) ---
const PackageFormPage = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEditMode = !!packageId;

    const initialFormData = {
        name: '', description: '', packageType: 'Umrah', packageCategory: 'standard', basePrice: '',
        infantPrice: '', childPrice: '', durationDays: '', inclusions: [], exclusions: [], season: 'Jan-Mar',
        status: 'inactive', sortOrder: 0, accommodationItems: [], stateIds: [],
    };

    const [formData, setFormData] = useState(isEditMode ? null : initialFormData);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [error, setError] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [toastState, setToastState] = useState({ show: false, message: '', type: 'success' });
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, imageKey: null });
    const [allStates, setAllStates] = useState([]);

    const showToast = (message, type = 'success') => setToastState({ show: true, message, type });

    useEffect(() => {
        const fetchStates = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await fetch(`${API_BASE_URL}/states`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Failed to fetch states.');
                const result = await response.json();
                setAllStates(result.data || []);
            } catch (err) { console.error(err.message); }
        };
        fetchStates();
    }, []);

    useEffect(() => {
        if (isEditMode) {
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
                setFormData({
                    ...packageData, inclusions: packageData.inclusions || [], exclusions: packageData.exclusions || [],
                    packageImageUrls: packageData.packageImageUrls || [], packageImages: packageData.packageImages || [],
                    accommodationItems: packageData.accommodationItems || [],
                    stateIds: packageData.availableStates?.map(s => s.id) || []
                });
                setIsLoading(false);
            };
            loadPackageData();
        }
    }, [packageId, location.state, isEditMode]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleArrayChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value.split('\n') }));
    const handleStateChange = (e) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, stateIds: selectedIds }));
    };
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = (formData.packageImages?.length || 0) + newImages.length + files.length;
        if (totalImages > 8) { showToast('Max 8 images allowed.', 'error'); return; }
        setNewImages(prev => [...prev, ...files]);
    };
    const handleRemoveNewImage = (index) => setNewImages(prev => prev.filter((_, i) => i !== index));
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
    const handleDeleteImage = (imageKey) => setDeleteModalState({ isOpen: true, imageKey });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        const url = isEditMode ? `${API_BASE_URL}/packages/${packageId}` : `${API_BASE_URL}/packages`;
        const method = isEditMode ? 'PUT' : 'POST';

        const { id, agent, packageImageUrls, createdAt, updatedAt, createdBy, availableStates, ...payload } = formData;
        
        payload.inclusions = (payload.inclusions || []).map(item => item.trim()).filter(Boolean);
        payload.exclusions = (payload.exclusions || []).map(item => item.trim()).filter(Boolean);
        payload.basePrice = parseFloat(payload.basePrice);
        payload.infantPrice = payload.infantPrice ? parseFloat(payload.infantPrice) : undefined;
        payload.childPrice = payload.childPrice ? parseFloat(payload.childPrice) : undefined;
        payload.durationDays = parseInt(payload.durationDays, 10);
        payload.sortOrder = parseInt(payload.sortOrder, 10);

        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
            if (!response.ok) { const errorData = await response.json(); const msg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message; throw new Error(msg); }
            showToast(`Package ${isEditMode ? 'updated' : 'created'} successfully!`);
            setTimeout(() => navigate('/package-management'), 1500);
        } catch (err) { showToast(err.message, 'error'); }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
    if (!formData) return <div className="p-8">Form data could not be loaded.</div>;

    return (
        <div className="bg-[#F0F7F7] min-h-screen">
            {toastState.show && <Toast message={toastState.message} type={toastState.type} onClose={() => setToastState({ ...toastState, show: false })} />}
            <ConfirmationModal isOpen={deleteModalState.isOpen} onClose={() => setDeleteModalState({ isOpen: false, imageKey: null })} onConfirm={handleConfirmDelete} title="Delete Image">Are you sure?</ConfirmationModal>

            <Header title="Package Management" />
            <div className="p-4 sm:p-8">
                <div className="max-w-4xl mx-auto mb-6 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Go back"><ChevronLeft className="h-6 w-6 text-gray-700" /></button>
                    <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Package' : 'Create New Package'}</h1>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">{isEditMode ? formData.name : "New Package Details"}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                            <input type="number" id="durationDays" name="durationDays" value={formData.durationDays || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="packageType" className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                            <select id="packageType" name="packageType" value={formData.packageType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="Hajj">Hajj</option><option value="Umrah">Umrah</option><option value="Ziyarat">Ziyarat</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="packageCategory" className="block text-sm font-medium text-gray-700 mb-1">Package Category</label>
                            <select id="packageCategory" name="packageCategory" value={formData.packageCategory} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="standard">Standard</option><option value="premium">Premium</option><option value="luxury">Luxury</option><option value="custom">Custom</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                            <input type="number" step="0.01" id="basePrice" name="basePrice" value={formData.basePrice || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="childPrice" className="block text-sm font-medium text-gray-700 mb-1">Child Price (₹)</label>
                            <input type="number" step="0.01" id="childPrice" name="childPrice" value={formData.childPrice || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="infantPrice" className="block text-sm font-medium text-gray-700 mb-1">Infant Price (₹)</label>
                            <input type="number" step="0.01" id="infantPrice" name="infantPrice" value={formData.infantPrice || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                            <select id="season" name="season" value={formData.season} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="Jan-Mar">Jan-Mar</option><option value="Apr-Jun">Apr-Jun</option><option value="Jul-Sep">Jul-Sep</option><option value="Oct-Dec">Oct-Dec</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="active">Active</option><option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                            <input type="number" id="sortOrder" name="sortOrder" value={formData.sortOrder || '0'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="description" name="description" rows="4" value={formData.description || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="inclusions" className="block text-sm font-medium text-gray-700 mb-1">Inclusions (one per line)</label>
                            <textarea id="inclusions" name="inclusions" rows="5" value={formData.inclusions.join('\n')} onChange={handleArrayChange} className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="exclusions" className="block text-sm font-medium text-gray-700 mb-1">Exclusions (one per line)</label>
                            <textarea id="exclusions" name="exclusions" rows="5" value={formData.exclusions.join('\n')} onChange={handleArrayChange} className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="stateIds" className="block text-sm font-medium text-gray-700 mb-1">Available States (Hold Ctrl/Cmd to select multiple)</label>
                             <select id="stateIds" name="stateIds" multiple value={formData.stateIds} onChange={handleStateChange} className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md">
                                {allStates.map(state => (<option key={state.id} value={state.id}>{state.stateName}</option>))}
                             </select>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Accommodation Items</h3>
                        <AccommodationEditor items={formData.accommodationItems} onChange={(items) => setFormData(prev => ({ ...prev, accommodationItems: items }))} />
                    </div>

                    {isEditMode && (
                        <div className="mt-8 pt-6 border-t">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Package Images</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                {formData.packageImageUrls?.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img src={url} alt={`Img ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                                        <button type="button" onClick={() => handleDeleteImage(formData.packageImages[index])} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></button>
                                    </div>
                                ))}
                                {newImages.map((file, index) => (
                                    <div key={index} className="relative">
                                        <img src={URL.createObjectURL(file)} alt={`New ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                                        <button type="button" onClick={() => handleRemoveNewImage(index)} className="absolute top-1 right-1 bg-gray-700 text-white rounded-full p-1"><X className="h-4 w-4" /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-4">
                                <label htmlFor="image-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border rounded-md hover:bg-gray-200"><Upload className="h-4 w-4" /> Choose Images...</label>
                                <input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                                {newImages.length > 0 && <button type="button" onClick={handleUploadImages} disabled={isUploading} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md disabled:bg-gray-400">{isUploading ? 'Uploading...' : `Upload ${newImages.length} Image(s)`}</button>}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Max 8 images.</p>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border rounded-md">Cancel</button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md ml-4">{isEditMode ? 'Save Changes' : 'Create Package'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PackageFormPage;