import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Plane, Hotel, Ticket, CheckSquare } from 'lucide-react';
import Header from './Header';
import { StatusBadge, TitleBadge } from './PackageComponents';
import PaginationControls from './PaginationControls';
import ConfirmationModal from './ConfirmationModal';

const API_BASE_URL = import.meta.env.VITE_STAGING_URL;

// Helper Components
const CustomDropdown = ({ options, value, onChange, placeholder, buttonClassName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        if (optionValue !== value) onChange(optionValue);
        setIsOpen(false);
    };
    
    const selectedOption = Object.entries(options).find(([key]) => key === value)?.[1] || { label: placeholder };

    return (
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-all duration-150 ${buttonClassName}`}>
                <span>{selectedOption.label}</span>
                <ChevronDown className={`h-5 w-5 transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full min-w-max rounded-md bg-white shadow-lg border border-gray-200">
                    <ul className="py-1">{Object.entries(options).filter(([k]) => k !== value).map(([optionKey, { label }]) => (
                        <li key={optionKey}><button type="button" onClick={() => handleSelect(optionKey)} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center">{label}</button></li>
                    ))}</ul>
                </div>
            )}
        </div>
    );
};

const AccommodationIcons = ({ items = [] }) => {
    const iconMap = { flight: <Plane size={16} />, hotel: <Hotel size={16} />, visa: <Ticket size={16} /> };
    const defaultIcon = <CheckSquare size={16} />;
    const includedItems = items.filter(item => item.isIncluded && item.type);
    if (includedItems.length === 0) return null;
    return (
        <div className="flex flex-wrap items-center gap-2 mt-4">
            {includedItems.map((item, index) => (
                <a key={`${item.type}-${index}`} href={item.url || '#'} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-xs bg-gray-100 px-3 py-1.5 rounded-md text-gray-700 font-medium transition-colors ${item.url ? 'hover:bg-gray-200' : 'cursor-default'}`}>
                    {iconMap[item.type.toLowerCase()] || defaultIcon}
                    <span>{item.label || item.type}{item.cat ? ` (${item.cat})` : ''}</span>
                </a>
            ))}
        </div>
    );
};

// Main Page Component
const PackageManagement = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ id: '', type: '', status: '' });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
    const [activeTab, setActiveTab] = useState('listView');
    const [modalState, setModalState] = useState({ isOpen: false, packageId: null });

    const TYPE_OPTIONS = { '': { label: 'All Types' }, 'Hajj': { label: 'Hajj' }, 'Umrah': { label: 'Umrah' } };
    const STATUS_OPTIONS = { '': { label: 'All Statuses' }, 'active': { label: 'Active' }, 'inactive': { label: 'Inactive' } };

    const fetchPackages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');
        if (!token) { setError('Authentication token not found.'); setIsLoading(false); return; }

        const params = new URLSearchParams({ page: pagination.page, limit: 10 }); // Set limit to 5 for card view
        if (filters.id) params.append('search', filters.id);
        if (filters.type) params.append('packageType', filters.type);
        
        if (activeTab === 'activePackages') {
            params.append('status', 'active');
        } else if (filters.status) {
            params.append('status', filters.status);
            params.set('limit', '10'); // Use limit 10 for table view
        }

        try {
            const response = await fetch(`${API_BASE_URL}/packages/all?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to fetch packages.'); }
            const result = await response.json();
            setPackages(result.data.data || []);
            setPagination(prev => ({ ...prev, total: result.data.total, totalPages: result.data.totalPages }));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, filters, activeTab]);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);
    
    const handleFilterUpdate = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setPagination(prev => ({...prev, page: 1}));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleRemoveClick = (packageId) => setModalState({ isOpen: true, packageId: packageId });

    const handleConfirmRemove = async () => {
        if (!modalState.packageId) return;
        const token = localStorage.getItem('accessToken');
        try {
            await fetch(`${API_BASE_URL}/packages/${modalState.packageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'inactive' }),
            });
            setModalState({ isOpen: false, packageId: null });
            fetchPackages(); 
        } catch (err) { setError(err.message); setModalState({ isOpen: false, packageId: null }); }
    };

    return (
       <div className="bg-[#F0F7F7] min-h-screen px-4">
        <Header title='Package Management'/>
        <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
            <ConfirmationModal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, packageId: null })} onConfirm={handleConfirmRemove} title="Remove Package">
                Are you sure you want to remove this package? Its status will be set to 'inactive'.
            </ConfirmationModal>

            <div className="bg-white p-4 sm:p-6 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center border-b border-gray-200">
                        <button 
                            onClick={() => setActiveTab('listView')}
                            className={`px-3 py-2 text-md transition-colors ${activeTab === 'listView' ? 'text-teal-600 border-b-2 border-teal-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            List View
                        </button>
                        <button 
                             onClick={() => setActiveTab('activePackages')}
                             className={`px-3 py-2 text-md transition-colors ${activeTab === 'activePackages' ? 'text-teal-600 border-b-2 border-teal-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Active Packages
                        </button>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <input type="text" name="id" onChange={(e) => handleFilterUpdate('id', e.target.value)} placeholder="Search ID..." className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        <CustomDropdown options={TYPE_OPTIONS} value={filters.type} onChange={(value) => handleFilterUpdate('type', value)} placeholder="All Types" buttonClassName="border border-gray-300 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        {activeTab === 'listView' && (
                             <CustomDropdown options={STATUS_OPTIONS} value={filters.status} onChange={(value) => handleFilterUpdate('status', value)} placeholder="All Statuses" buttonClassName="border border-gray-300 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        )}
                     </div>
                </div>

                {isLoading ? ( <div className="text-center p-10">Loading packages...</div> ) 
                : error ? ( <div className="text-center p-10 text-red-500">{error}</div> ) 
                : (
                    <>
                    {activeTab === 'listView' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="p-3 font-semibold">ID</th><th className="p-3 font-semibold">Type</th><th className="p-3 font-semibold">Status</th><th className="p-3 font-semibold">Title</th><th className="p-3 font-semibold">Price</th><th className="p-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {packages.map(pkg => (
                                        <tr key={pkg.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium">#{pkg.id.substring(0, 5)}</td>
                                            {/* <td className="p-3"><div className="flex items-center gap-3"><img src={pkg.agent?.profilePictureUrl || 'https://placehold.co/40x40'} alt={pkg.agent?.name} className="h-10 w-10 rounded-full object-cover" /><div><p className="font-semibold">{pkg.agent?.name || 'N/A'}</p><p className="text-gray-500">{pkg.agent?.phoneNumber || 'N/A'}</p></div></div></td> */}
                                            <td className="p-3">{pkg.packageType}</td>
                                            <td className="p-3"><StatusBadge status={pkg.status} /></td>
                                            <td className="p-3"><TitleBadge title={pkg.name} /></td>
                                            <td className="p-3 font-medium">₹{pkg.basePrice.toLocaleString('en-IN')}</td>
                                            <td className="p-3"><button onClick={() => navigate(`/packages/edit/${pkg.id}`)} className="font-medium text-teal-600 hover:text-teal-800">Edit</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'activePackages' && (
                         
                       <div className="space-y-6">
    {packages.map(pkg => (
        <div key={pkg.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
            
            {/* ✅ MODIFIED: Wrapped image and buttons in a new div */}
            <div className="w-full md:w-80 flex-shrink-0">
                <img src={pkg.packageImageUrls?.[0] || 'https://placehold.co/600x400'} alt={pkg.name} className="w-full h-56 rounded-xl object-cover" />
                <div className="mt-2 flex items-center gap-2">
                    <button 
                        onClick={() => navigate(`/packages/edit/${pkg.id}`)} 
                        className="w-full py-2 bg-gray-100 text-[#0A7777] rounded-full hover:bg-[#0A7777] text-sm font-semibold transition-colors hover:text-white "
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => handleRemoveClick(pkg.id)} 
                        className="w-full py-2 bg-red-100 text-red-700 rounded-full  text-sm font-semibold transition-colors hover:text-white hover:bg-red-700 "
                    >
                        Remove
                    </button>
                    
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-2xl font-bold">{pkg.name}</h3>
                <p className="text-xl font-semibold text-teal-600 mb-3">₹{pkg.basePrice.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">per person</span></p>
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 border-b pb-4">
                    <div><strong>Season:</strong> {pkg.season}</div>
                    <div><strong>Duration:</strong> {pkg.durationDays} days</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                        <h4 className="font-semibold mb-1">Inclusions</h4>
                        <p className="text-xs text-gray-500">
                            {Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : pkg.inclusions || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1">Exclusions</h4>
                        <p className="text-xs text-gray-500">
                            {Array.isArray(pkg.exclusions) ? pkg.exclusions.join(', ') : pkg.exclusions || 'N/A'}
                        </p>
                    </div>
                </div>

                <AccommodationIcons items={pkg.accommodationItems} />
            </div>

            {/* ❌ REMOVED: The original button container from the end */}
        </div>
    ))}
</div>
                    )}
                    
                    <PaginationControls currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                    </>
                )}
            </div>
        </div>
        </div>
    );
};

export default PackageManagement;