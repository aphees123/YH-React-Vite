import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Bell, Trash2, ChevronDown } from 'lucide-react';
import Header from './Header'; 
import { apiClient } from '../../src/utils/apiClient'; 
import ConfirmationModal from './ConfirmationModal'; 

//=================================================================
//  PAGINATION CONTROLS
//=================================================================
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-4 py-4 mt-6">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="flex items-center justify-center h-9 w-9 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                aria-label="Go to previous page"
            >
                <ChevronDown className="h-4 w-4 transform rotate-90" />
            </button>
            <span className="text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="flex items-center justify-center h-9 w-9 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                aria-label="Go to next page"
            >
                <ChevronDown className="h-4 w-4 transform -rotate-90" />
            </button>
        </div>
    );
};

//=================================================================
//  CUSTOM DROPDOWN
//=================================================================
const CustomDropdown = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center justify-between w-40 bg-white border-2 border-gray-300 rounded-full py-1 px-4 text-gray-700 font-medium focus:outline-none hover:border-[#0A7777] transition-colors duration-200"
            >
                <span>{value || placeholder}</span>
                <ChevronDown className={`h-5 w-5 text-gray-400 group-hover:text-[#0A7777] transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl">
                    <ul className="py-1">
                        {options.map((option) => (
                            <li 
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className="px-4 py-2 text-gray-700 hover:bg-teal-50 cursor-pointer"
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

//=================================================================
//  STATUS BADGE
//=================================================================
const StatusBadge = ({ status }) => {
    const formattedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
    const statusClasses = {
        Active: 'bg-[#E6F8F0] text-[#0A7777]',
        Suspended: 'bg-[#FFF8E6] text-[#B8860B]',
        Blocked: 'bg-[#FDEDED] text-[#D32F2F]',
        Pending: 'bg-gray-100 text-gray-600',
    };
    return (
        <span className={`py-1.5 px-4 rounded-full text-sm font-semibold ${statusClasses[formattedStatus] || 'bg-gray-100 text-gray-800'}`}>
            {formattedStatus || 'Unknown'}
        </span>
    );
};

//=================================================================
//  MAIN COMPONENT
//=================================================================
const PilgrimManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({ id: '', role: '', status: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let responseData;

            // 👇 If ID is entered, fetch single user using GET /users/:id
            if (filters.id.trim()) {
                responseData = await apiClient(`/users/${filters.id.trim()}`);
                const singleUser = responseData.data?.data;
                if (singleUser) {
                    setUsers([{
                        ...singleUser,
                        name: singleUser.email?.split('@')[0] ?? 'Unnamed User',
                        phone: singleUser.phoneNumber,
                    }]);
                    setPagination({ currentPage: 1, totalPages: 1, total: 1 });
                } else {
                    setUsers([]);
                    setPagination({ currentPage: 1, totalPages: 1, total: 0 });
                }
            } else {
                // 👇 Otherwise fetch paginated list
                const params = new URLSearchParams({ 
                    page: pagination.currentPage, 
                    limit: 10,
                    ...(filters.role && filters.role !== 'all' && { role: filters.role }),
                    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
                });

                responseData = await apiClient(`/users?${params.toString()}`);
                const { users: apiUsers, total, page, totalPages } = responseData.data;

                const formattedUsers = apiUsers.map(user => ({
                    ...user,
                    name: user.email?.split('@')[0] ?? 'Unnamed User',
                    phone: user.phoneNumber,
                }));
                
                setUsers(formattedUsers);
                setPagination({ currentPage: page, totalPages, total });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await apiClient(`/users/${userToDelete.id}`, { method: 'DELETE' });
            fetchUsers(); 
        } catch (err) {
            setError(err.message);
        } finally {
            setIsModalOpen(false);
            setUserToDelete(null);
        }
    };

    //=================================================================
    //  RENDER
    //=================================================================
    return (
        <div className="bg-[#F7FAFA] min-h-screen pl-6 pr-6 pb-6 cursor-pointer">
            <Header title="Pilgrim Management" />
            
            <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
                <div className="p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-[#0A7777]">List View</h2>
                        <div className="flex items-center gap-4">
                            {/* Search by ID */}
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search by ID" 
                                    value={filters.id}
                                    onChange={(e) => handleFilterChange('id', e.target.value)}
                                    className="border border-gray-300 rounded-full py-2 pl-4 pr-8 w-40 focus:outline-none focus:ring-2 focus:ring-[#0A7777]"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            </div>

                            {/* Role Filter */}
                            <CustomDropdown 
                                placeholder="All Roles"
                                options={[
                                    { label: 'All Roles', value: 'all' },
                                    { label: 'Agent', value: 'agent' },
                                    { label: 'User', value: 'user' },
                                ]}
                                value={filters.role}
                                onChange={(value) => handleFilterChange('role', value)}
                            />

                            {/* Status Filter */}
                            <CustomDropdown 
                                placeholder="All Statuses"
                                options={[
                                    { label: 'All Statuses', value: 'all' },
                                    { label: 'Active', value: 'active' },
                                    { label: 'Suspended', value: 'suspended' },
                                    { label: 'Blocked', value: 'blocked' },
                                    { label: 'Pending', value: 'pending' },
                                ]}
                                value={filters.status}
                                onChange={(value) => handleFilterChange('status', value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="p-4 text-sm font-semibold text-gray-500">ID</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Profile</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Email</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Role</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500 text-center">Status</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan="6" className="text-center p-8 text-gray-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                )}
                                {error && (
                                    <tr>
                                        <td colSpan="6" className="text-center p-8 text-red-600 font-medium">
                                            {error}
                                        </td>
                                    </tr>
                                )}
                                {!loading && !error && users.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center p-8 text-gray-500 font-medium">
                                            No users found for the selected filters.
                                        </td>
                                    </tr>
                                )}
                                {!loading && !error && users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 text-sm text-gray-700 font-medium">{`#${user.id.substring(0, 5)}`}</td>
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium text-gray-800 capitalize">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.phone}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-700">{user.email}</td>
                                        <td className="p-4 text-sm text-gray-700 capitalize">{user.role}</td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => openDeleteModal(user)} 
                                                className="p-2 rounded-full text-[#0A7777] hover:bg-teal-50 transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <PaginationControls 
                        currentPage={pagination.currentPage} 
                        totalPages={pagination.totalPages} 
                        onPageChange={handlePageChange} 
                    />
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDeleteUser}
                title="Delete User"
            >
                Are you sure you want to permanently delete this user? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default PilgrimManagement;
