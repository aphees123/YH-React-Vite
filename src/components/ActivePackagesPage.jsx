import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Plane, Hotel, Ticket, CheckSquare } from 'lucide-react';
import Header from './Header';
import PaginationControls from './PaginationControls';
import ConfirmationModal from './ConfirmationModal';

const API_BASE_URL = import.meta.env.VITE_STAGING_URL;

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
    const [hoveredItemType, setHoveredItemType] = useState(null);

    const iconMap = {
        flight: { icon: <Plane size={16} /> },
        hotel: { icon: <Hotel size={16} /> },
        visa: { icon: <Ticket size={16} /> },
    };
    const defaultIcon = <CheckSquare size={16} />;

    const includedItems = items.filter(item => item.isIncluded && item.type);

    if (includedItems.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mt-4">
            {includedItems.map((item, index) => {
                const itemTypeKey = item.type.toLowerCase();
                const iconToRender = iconMap[itemTypeKey]?.icon || defaultIcon;
                const label = item.label || item.type;

                return (
                    <div 
                        key={`${item.type}-${index}`}
                        className="relative"
                        onMouseEnter={() => setHoveredItemType(item.type)}
                        onMouseLeave={() => setHoveredItemType(null)}
                    >
                        <a
                            href={item.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-xs bg-gray-100 px-3 py-1.5 rounded-md text-gray-700 font-medium transition-colors ${item.url ? 'hover:bg-gray-200 hover:text-gray-900' : 'cursor-default'}`}
                        >
                            {iconToRender}
                            <span>{label}{item.cat ? ` (${item.cat})` : ''}</span>
                        </a>

                        {/* Custom Tooltip */}
                        {hoveredItemType === item.type && item.url && (
                             <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 whitespace-normal break-words rounded-lg bg-black py-1.5 px-3 font-sans text-sm font-normal text-white focus:outline-none">
                                {item.url}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};


// --- Main Page Component ---
const ActivePackagesPage = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 5, totalPages: 1, total: 0 });
    const [modalState, setModalState] = useState({ isOpen: false, packageId: null });
    const [filters, setFilters] = useState({ id: '', type: '' });
    
    const TYPE_OPTIONS = { '': { label: 'All Types' }, 'Hajj': { label: 'Hajj' }, 'Umrah': { label: 'Umrah' }, 'Ziyarat': { label: 'Ziyarat' } };

    const fetchActivePackages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');
        if (!token) { setError('Authentication token not found.'); setIsLoading(false); return; }

        const params = new URLSearchParams({
            page: pagination.page,
            limit: pagination.limit,
            status: 'active',
        });
        if (filters.id) params.append('search', filters.id);
        if (filters.type) params.append('packageType', filters.type);

        try {
            const response = await fetch(`${API_BASE_URL}/packages/all?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to fetch packages.'); }
            const result = await response.json();
            setPackages(result.data.data || []);
            setPagination(prev => ({ ...prev, total: result.data.total, totalPages: result.data.totalPages }));
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    }, [pagination.page, pagination.limit, filters]);

    useEffect(() => { fetchActivePackages(); }, [fetchActivePackages]);

    const handlePageChange = (newPage) => setPagination(prev => ({ ...prev, page: newPage }));
    const handleRemoveClick = (packageId) => setModalState({ isOpen: true, packageId: packageId });

    const handleFilterUpdate = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setPagination(prev => ({...prev, page: 1}));
    };

    const handleConfirmRemove = async () => {
        if (!modalState.packageId) return;
        const token = localStorage.getItem('accessToken');
        try {
            const response = await fetch(`${API_BASE_URL}/packages/${modalState.packageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'inactive' }),
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to update package status.'); }
            setModalState({ isOpen: false, packageId: null });
            fetchActivePackages(); 
        } catch (err) { setError(err.message); setModalState({ isOpen: false, packageId: null }); }
    };

    return (
       <div className="bg-[#F0F7F7] min-h-screen px-4">
        <Header title='Package Management'/>
        <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
            <ConfirmationModal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, packageId: null })} onConfirm={handleConfirmRemove} title="Remove Package">
                Are you sure you want to remove this package from the active list? Its status will be set to 'inactive'.
            </ConfirmationModal>

            <div className="bg-white p-4 sm:p-6 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-[#0A7777] font-baskerville">Active Packages</h2>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <input type="text" name="id" onChange={(e) => handleFilterUpdate('id', e.target.value)} placeholder="Search ID..." className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        <CustomDropdown options={TYPE_OPTIONS} value={filters.type} onChange={(value) => handleFilterUpdate('type', value)} placeholder="All Types" buttonClassName="border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                </div>
                
                {isLoading ? ( <div className="text-center p-10">Loading active packages...</div> ) 
                : error ? ( <div className="text-center p-10 text-red-500">{error}</div> ) 
                : (
                    <>
                    <div className="space-y-6">
                        {packages.map(pkg => (
                            <div key={pkg.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                <img src={pkg.packageImageUrls?.[0] || 'https://placehold.co/600x400/E9F4F4/008080?text=Package'} alt={pkg.name} className="w-full md:w-80 h-56 rounded-xl object-cover" />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-800">{pkg.name}</h3>
                                    <p className="text-xl font-semibold text-teal-600 mb-3">₹{pkg.basePrice.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">per person</span></p>
                                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 border-b pb-4">
                                        <div><strong>Season:</strong> {pkg.season}</div>
                                        <div><strong>Duration:</strong> {pkg.durationDays} days</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div>
                                            <h4 className="font-semibold mb-1">Inclusions</h4>
                                            <p className="text-xs text-gray-500">{pkg.inclusions.join(', ')}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Exclusions</h4>
                                            <p className="text-xs text-gray-500">{pkg.exclusions.join(', ')}</p>
                                        </div>
                                    </div>
                                    <AccommodationIcons items={pkg.accommodationItems} />
                                </div>
                                <div className="md:border-l md:pl-6 w-full md:w-56 flex-shrink-0">
                                    <h4 className="font-semibold text-center mb-3">Agent Details</h4>
                                    <div className="flex flex-col items-center text-center">
                                        <img src={pkg.agent?.profilePictureUrl || 'https://placehold.co/60x60/E9F4F4/008080?text=A'} alt={pkg.agent?.name} className="h-16 w-16 rounded-full object-cover mb-2" />
                                        <p className="font-bold text-gray-800">{pkg.agent?.name || 'N/A'}</p>
                                        <p className="text-sm text-gray-500">{pkg.agent?.agencyName || 'ABC Travel Agency'}</p>
                                        <p className="text-sm text-gray-500 mb-4">#{pkg.agent?.id?.substring(0, 5) || 'N/A'}</p>
                                        <div className="w-full space-y-2">
                                            <button onClick={() => navigate(`/packages/edit/${pkg.id}`, { state: { package: pkg } })} className="w-full py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 text-sm font-semibold">Edit</button>
                                            <button onClick={() => handleRemoveClick(pkg.id)} className="w-full py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 text-sm font-semibold">Remove</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <PaginationControls currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                    </>
                )}
            </div>
        </div>
        </div>
    );
};

export default ActivePackagesPage;