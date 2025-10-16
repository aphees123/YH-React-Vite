import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, StatusBadge, SubscriptionBadge, Search, FileIcon, EyeIconLucide } from '../components/shared/AgentUIComponents'; // Assuming path
import Header from './Header'
const API_BASE_URL = import.meta.env.VITE_STAGING_URL;

const AgentListPage = () => {
    const navigate = useNavigate();
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    useEffect(() => {
        const fetchAgents = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('accessToken');
            try {
                if (!token) throw new Error('Authentication token not found.');
                const response = await fetch(`${API_BASE_URL}/agents/all?page=${page}&limit=${limit}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch agents.');
                }
                const result = await response.json();
                setAgents(result.data);
                setTotalPages(Math.ceil(result.total / limit));
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAgents();
    }, [page]);

    const handleViewDetails = (agent) => {
        // Pass the entire agent object in the navigation state
        navigate(`/agents/${agent.id}`, { state: { agent: agent } });
    };

    return (
       <div className="bg-[#F0F7F7] min-h-screen">
<Header title='Agent Management'/>
        <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
            <div className="bg-white px-4 sm:p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex flex-col p-4 md:flex-row  justify-between items-start md:items-center gap-4 mb-6">
                     <h2 className="text-xl font-semibold text-gray-800"></h2>
                     <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-auto"><Input type="text" placeholder="ID" className="pl-10" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /></div>
                        <select className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"><option>Documents</option></select>
                        <select className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"><option>Status</option></select>
                     </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm hidden md:table">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-3 font-semibold">ID</th>
                                <th className="p-3 font-semibold">Agents</th>
                                <th className="p-3 font-semibold">Location</th>
                                <th className="p-3 font-semibold">Subscription</th>
                                <th className="p-3 font-semibold">Status</th>
                                <th className="p-3 font-semibold">Documents</th>
                                <th className="p-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="7" className="text-center p-6">Loading agents...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="7" className="text-center p-6 text-red-500">{error}</td></tr>
                            ) : (
                                agents.map(agent => (
                                    <tr key={agent.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium">{agent.applicationNumber || `#${agent.id.substring(0, 5)}`}</td>
                                        <td className="p-3">
                                            <button onClick={() => handleViewDetails(agent)} className="flex items-center gap-3 text-left">
                                                <img src={agent.profilePictureUrl || 'https://placehold.co/40x40/E9F4F4/008080?text=A'} alt={`${agent.firstName}`} className="h-10 w-10 rounded-full object-cover" />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{`${agent.firstName} ${agent.lastName}`}</p>
                                                    <p className="text-gray-500">{agent.phoneNumber}</p>
                                                </div>
                                            </button>
                                        </td>
                                        <td className="p-3 text-gray-600">{agent.city}, {agent.state}</td>
                                        <td className="p-3"><SubscriptionBadge tier={agent.subscriptionTier} /></td>
                                        <td className="p-3"><StatusBadge status={agent.agentStatus} /></td>
                                        <td className="p-3"><StatusBadge status={agent.documents?.length > 0 ? 'Verified' : 'Pending'} /></td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <button className="text-red-500 hover:text-red-700 p-1 text-xs font-semibold">Revalidate</button>
                                                <button className="p-1 hover:bg-gray-100 rounded-lg"><FileIcon className="h-4 w-4 text-gray-600"/></button>
                                                <button onClick={() => handleViewDetails(agent)} className="p-1 hover:bg-gray-100 rounded-lg"><EyeIconLucide className="h-4 w-4 text-gray-600"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    
                    <div className="md:hidden space-y-4">
                        {isLoading ? (
                            <div className="text-center p-6">Loading agents...</div>
                        ) : error ? (
                             <div className="text-center p-6 text-red-500">{error}</div>
                        ) : (
                            agents.map(agent => (
                                <div key={agent.id} className="border rounded-lg p-4 bg-white">
                                    <div className="flex justify-between items-start mb-4">
                                        <button onClick={() => handleViewDetails(agent)} className="flex items-center gap-3 text-left">
                                            <img src={agent.profilePictureUrl || 'https://placehold.co/40x40'} alt={`${agent.firstName}`} className="h-12 w-12 rounded-lg object-cover" />
                                            <div>
                                                <p className="font-semibold text-gray-800">{`${agent.firstName} ${agent.lastName}`}</p>
                                                <p className="text-gray-500 text-sm">{agent.applicationNumber || `#${agent.id.substring(0, 5)}`}</p>
                                            </div>
                                        </button>
                                        <div className="flex flex-col items-end gap-2">
                                           <StatusBadge status={agent.agentStatus} />
                                           <SubscriptionBadge tier={agent.subscriptionTier} />
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-4">
                                        <p>{agent.city}, {agent.state}</p>
                                        <p>{agent.phoneNumber}</p>
                                    </div>
                                    <div className="flex justify-between items-center border-t pt-3">
                                         <p className="text-sm">Documents: <StatusBadge status={agent.documents?.length > 0 ? 'Verified' : 'Pending'} /></p>
                                         <div className="flex items-center gap-2">
                                            <button className="text-red-500 text-xs font-semibold hover:text-red-700">Revalidate</button>
                                            <button className="p-1 hover:bg-gray-100 rounded-lg"><FileIcon className="h-4 w-4 text-gray-600"/></button>
                                            <button onClick={() => handleViewDetails(agent)} className="p-1 hover:bg-gray-100 rounded-lg"><EyeIconLucide className="h-4 w-4 text-gray-600"/></button>
                                         </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50">
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50">
                        Next
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
};

export default AgentListPage;