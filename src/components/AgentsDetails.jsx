import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// ✅ ADDED new icons used in the updated AgentProfile
import { Mail, Phone, MapPin, ChevronDown, Star } from 'lucide-react';
import { StatusBadge, SubscriptionBadge, ChevronLeft, Download, Edit, FileText, EyeIconLucide } from '../components/shared/AgentUIComponents';
import Header from './Header';

const API_BASE_URL = import.meta.env.VITE_STAGING_URL;

// --- Reusable ConfirmationModal Component ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            <div className="relative w-full max-w-sm transform rounded-lg bg-[#fcfaf7] p-6 text-left shadow-xl transition-all border border-gray-200">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-semibold leading-6 text-gray-800" style={{ fontFamily: 'serif' }}>
                        {title}
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-600">
                            {children}
                        </p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-[#b93838] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto"
                        onClick={onConfirm}
                    >
                        Yes, Update
                    </button>
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={onClose}
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- AgentProfile Component (Edit Functionality Added) ---
const AgentProfile = ({ agent, documents, onStatusChange, onUpdateAgent }) => {
    const [modalState, setModalState] = useState({ isOpen: false, newStatus: null });
    
    // ✅ NEW: State for managing edit mode and form data
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...agent });

    // Keep formData in sync with the agent prop from parent
    useEffect(() => {
        setFormData({ ...agent });
    }, [agent]);

    const getOverallDocumentStatus = () => {
        if (!documents || documents.length === 0) return 'Pending';
        if (documents.every(doc => doc.status === 'verified')) return 'Verified';
        if (documents.some(doc => doc.status === 'REJECTED')) return 'Rejected';
        return 'Pending';
    };

    const documentStatus = getOverallDocumentStatus();

    const handleStatusSelectChange = (e) => {
        const newStatus = e.target.value;
        if (newStatus !== agent.agentStatus) {
            setModalState({ isOpen: true, newStatus });
        }
    };

    const handleConfirmUpdate = () => {
        if (modalState.newStatus) {
            onStatusChange(modalState.newStatus);
        }
        setModalState({ isOpen: false, newStatus: null });
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, newStatus: null });
    };

    // ✅ NEW: Handler for input field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // ✅ NEW: Handler for submitting the form
    const handleFormSubmit = (e) => {
        e.preventDefault();
        onUpdateAgent(formData); // Call parent function to make API call
        console.loh(formData)
        setIsEditing(false); // Exit edit mode
    };

    // ✅ NEW: Handler for canceling edits
    const handleCancelEdit = () => {
        setFormData({ ...agent }); // Revert changes
        setIsEditing(false); // Exit edit mode
    };
    
    const statusOptions = [
        { value: 'under_review', label: 'Under Review' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'suspended', label: 'Suspended' },
    ];

    const StyledSubscriptionBadge = ({ tier }) => {
        return (
             <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-800">
                <Star className="h-4 w-4" />
                {tier || 'N/A'}
            </span>
        );
    };

    return (
        <>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmUpdate}
                title="Are you sure?"
            >
                Are you sure you want to update the agent's status to "{modalState.newStatus?.replace('_', ' ')}"?
            </ConfirmationModal>
<div className="bg-white p-6 rounded-lg shadow-lg w-full lg:max-w-sm flex-shrink-0 ">
                <div className="relative w-fit mx-auto mb-4">
                     <img src={agent.profilePictureUrl || 'https://placehold.co/150x150/E9F4F4/008080?text=D'} alt={`${agent.firstName}`} className="h-32 w-32 rounded-full object-cover mx-auto" />

                     {/* ✅ MODIFIED: Edit button now toggles edit mode */}
                     <button onClick={() => setIsEditing(!isEditing)} className="absolute bottom-1 right-1 bg-cyan-100 text-cyan-500 p-2 rounded-lg shadow-sm hover:bg-cyan-200 transition-colors">
                        <Edit className="h-4 w-4" />
                     </button>
                </div>

                <div className="text-center mb-6">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <input name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-md" placeholder="First Name" />
                            <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-md" placeholder="Last Name" />
                        </div>
                    ) : (
                        <h3 className="font-bold text-2xl text-gray-800">{`${agent.firstName} ${agent.lastName}`}</h3>
                    )}
                    
                    {isEditing ? (
                         <input name="agencyBusinessName" value={formData.agencyBusinessName} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-md mt-2" placeholder="Agency Name" />
                    ) : (
                         <p className="text-sm text-[#0A7777] font-semibold">{agent.agencyBusinessName}</p>
                    )}
                </div>

                {/* Status and Documents grid remains unchanged */}
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                    <div>
                        <p className="text-gray-500 text-xs mb-1">Status</p>
                        <div className="relative">
                            <select 
                                value={agent.agentStatus}
                                onChange={handleStatusSelectChange}
                                className="appearance-none w-full bg-yellow-100 text-yellow-800 text-xs font-semibold px-4 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 text-yellow-800 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs mb-1">Documents</p>
                        <StatusBadge status={documentStatus} />
                    </div>
                </div>

                {/* Application and Subscription section remains unchanged */}
                <div className="grid grid-cols-[max-content,1fr] items-center gap-y-3 gap-x-4 text-base mb-6">
                    <span className="text-gray-500">Application No:</span>
                    <span className="font-semibold text-[#0A7777] justify-self-start">{agent.applicationNumber}</span>
                    <span className="text-gray-500">Subscription:</span>
                    <div className="justify-self-start">
                        <StyledSubscriptionBadge tier={agent.subscriptionTier || 'Platinum'} />
                    </div>
                </div>
                
                {/* ID, PIN, Login section remains unchanged */}
                <div className="grid grid-cols-3 gap-y-4 text-center mb-6 py-4 border-t border-b border-gray-100">
                    <div><p className="text-gray-500 text-xs">ID</p><p className="font-semibold text-gray-800">{`#${agent.id.substring(0, 5)}`}</p></div>
                    <div><p className="text-gray-500 text-xs">PIN</p><p className="font-semibold text-gray-800">452016</p></div>
                    <div><p className="text-gray-500 text-xs">Last Login</p><p className="font-semibold text-gray-800">{agent.user?.lastLoginAt ? new Date(agent.user.lastLoginAt).toLocaleDateString('en-GB') : 'N/A'}</p></div>
                    <div><p className="text-gray-500 text-xs">State</p><p className="font-semibold text-gray-800">{agent.state}</p></div>
                    <div><p className="text-gray-500 text-xs">District</p><p className="font-semibold text-gray-800">{agent.city}</p></div>
                    <div><p className="text-gray-500 text-xs">Country</p><p className="font-semibold text-gray-800">{agent.country}</p></div>
                </div>

                <div className="space-y-4 text-sm text-gray-700 mb-8">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400 flex-shrink-0"/>
                        {isEditing ? <input name="registeredEmailAddress" value={formData.registeredEmailAddress} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-md" /> : <span>{agent.registeredEmailAddress}</span>}
                    </div>
                     <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400 flex-shrink-0"/>
                        {isEditing ? <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-md" /> : <span>{agent.phoneNumber}</span>}
                    </div>
                     <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"/>
                        <span>Lorem ipsum dolor sit amet consectetur.</span>
                    </div>
                </div>
                
                {/* ✅ MODIFIED: Buttons change based on edit mode */}
                <div className="mt-6">
                    {isEditing ? (
                        <div className="flex gap-3">
                            <button type="button" onClick={handleCancelEdit} className="w-full py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                                Cancel
                            </button>
                            <button type="submit" onClick={handleFormSubmit} className=" py-3 px-4 text-sm  text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700">
                                Save Changes
                            </button>
                        </div>
                    ) : (
                         <button type="button" className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#0D7A7F] rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                            Submit
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};


// --- DocumentVerification Component (No Changes) ---
// --- DocumentVerification Component (Checkbox Logic Fixed) ---
// --- DocumentVerification Component (Independent "Select All" State) ---
// --- DocumentVerification Component (Icon Colors & Checkbox Size Adjusted) ---
const DocumentVerification = ({ agentId, documents, setDocuments, isLoading, error }) => {
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const selectableStatuses = ['uploaded', 'pending', 'UNDER_REVIEW', 'verified', 'REJECTED'];

    // --- State & Handlers (No changes needed in this section) ---
    const handleCheckboxChange = (docId) => {
        if (isSelectAllChecked) {
            setIsSelectAllChecked(false);
        }

        setSelectedDocs(prevSelected =>
            prevSelected.includes(docId)
                ? prevSelected.filter(id => id !== docId)
                : [...prevSelected, docId]
        );
    };

    const handleSelectAll = (e) => {
        const isChecking = e.target.checked;
        setIsSelectAllChecked(isChecking);

        if (isChecking) {
            const allSelectableIds = documents
                .filter(doc => selectableStatuses.includes(doc.status))
                .map(doc => doc.id);
            setSelectedDocs(allSelectableIds);
        } else {
            setSelectedDocs([]);
        }
    };

    const handleDocumentVerification = async (status, rejectedReason = '') => {
        if (selectedDocs.length === 0) {
            alert('Please select at least one document.');
            return;
        }
        setIsUpdating(true);
        const token = localStorage.getItem('accessToken');
        const updatePromises = selectedDocs.map(docId => {
            const body = { status };
            if (status === 'REJECTED') body.rejectedReason = rejectedReason;
            return fetch(`${API_BASE_URL}/agents/documents/${docId}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify(body),
            }).then(res => res.ok ? res.json() : Promise.reject(res.json()));
        });
        try {
            const results = await Promise.all(updatePromises);
            const updatedDocsMap = new Map(results.map(result => [result.data.id, result.data]));
            const newDocuments = documents.map(doc => updatedDocsMap.get(doc.id) || doc);
            setDocuments(newDocuments);
             setIsUpdating(false);
        } catch (err) {
            console.error("Failed to update documents:", err);
            alert("An error occurred while updating documents.");
        } finally {
            setSelectedDocs([]);
            setIsSelectAllChecked(false);
        }
    };

    const handleVerifyClick = () => handleDocumentVerification('verified');
    const handleRejectClick = () => {
        const reason = prompt('Please enter the reason for rejection:');
        if (reason) handleDocumentVerification('REJECTED', reason);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex-1 flex flex-col min-h-0 border-1">
             <h3 className="text-xl font-semibold text-[#0A7777] mb-4 flex-shrink-0">Documents Verification</h3>
            <div className="overflow-y-auto flex-grow -mx-6">
                <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-200">
                             <th className="py-3 pl-6 font-normal text-gray-500 w-1/4">
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="select-all"
                                        className="form-checkbox h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" 
                                        onChange={handleSelectAll} 
                                        checked={isSelectAllChecked}
                                    />
                                    <label htmlFor="select-all" className="ml-3 cursor-pointer">Select All</label>
                                </div>
                            </th>
                            <th className="py-3 px-4 font-normal text-gray-500">Document Name</th>
                            <th className="py-3 px-4 font-normal text-gray-500 text-center w-1/6">Attachment</th>
                            <th className="py-3 px-4 font-normal text-gray-500 text-center w-1/6">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center p-8">Loading documents...</td></tr>
                        ) : error ? (
                             <tr><td colSpan="4" className="text-center p-8 text-red-500">{error}</td></tr>
                        ) : documents.length > 0 ? (
                            documents.map((doc, index) => (
                                <tr key={doc.id} className="border-b border-gray-100 last:border-b-0">
                                    <td className="py-4 pl-6 align-middle">
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-500 w-5 text-center">{index + 1}</span>
                                            <input 
                                                type="checkbox" 
                                                // ✅ CHANGE 1: Individual checkbox size reduced to h-4 w-4
                                                className="form-checkbox h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" 
                                                checked={selectedDocs.includes(doc.id)} 
                                                onChange={() => handleCheckboxChange(doc.id)} 
                                                disabled={!selectableStatuses.includes(doc.status)}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-gray-800 font-medium align-middle">{doc.documentName || doc.documentType?.name}</td>
                                      <td className="py-4 px-4 text-center align-middle">
                                        {/* ✅ CHANGES for hover effect */}
                                        <div className="inline-flex items-center justify-center h-10 w-10 rounded-full  bg-[#E9F2F2]  hover:bg-[#0A7777] hover:text-white transition-colors duration-200">
                                            <FileText className="h-5 w-5 text-[#0A7777] hover:text-white transition-colors duration-200" />
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 align-middle">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* ✅ CHANGES for hover effect */}
                                            <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" 
                                               className="inline-flex items-center justify-center h-10 w-10 rounded-full  bg-[#E9F2F2]  hover:bg-[#0A7777] hover:text-white transition-colors duration-200">
                                                <Download className="h-5 w-5 text-[#0A7777] hover:text-white transition-colors duration-200" />
                                            </a>
                                            {/* ✅ CHANGES for hover effect */}
                                             <button 
                                                className="inline-flex items-center justify-center h-10 w-10 rounded-full  bg-[#E9F2F2]  hover:bg-[#0A7777] hover:text-white transition-colors duration-200">
                                                <EyeIconLucide className="h-5 w-5 text-[#0A7777] hover:text-white transition-colors duration-200" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center p-8 text-gray-500">No documents found for this agent.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Footer buttons (no changes needed here as they already match your provided design screenshot) */}
            <div className="flex-shrink-0 pt-6">
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button 
                        onClick={handleVerifyClick} 
                        disabled={selectedDocs.length === 0 || isUpdating} 
                        className="px-4 py-1 rounded-full border border-green-600 text-green-700 font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isUpdating ? 'Updating...' : 'Verify'}
                    </button>
                    <button 
                        disabled 
                        className="px-4 py-1 rounded-full border border-orange-400 text-orange-500 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                        Revalidate
                    </button>
                    <button 
                        onClick={handleRejectClick} 
                        disabled={selectedDocs.length === 0 || isUpdating} 
                        className="px-4 py-1 rounded-full border border-red-500 text-red-600 font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                         {isUpdating ? 'Updating...' : 'Reject'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- AgentDetailsPage (Parent Component - API Functionality Added) ---
const AgentDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [agent, setAgent] = useState(location.state?.agent);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!agent?.id) {
            navigate('/agents', { replace: true });
            return;
        }
        const fetchDocuments = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('accessToken');
            try {
                if (!token) throw new Error('Authentication token not found.');
                const response = await fetch(`${API_BASE_URL}/agents/${agent.id}/documents`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch documents.');
                }
                const result = await response.json();
                setDocuments(result.data || []);
            } catch (err) {
                setError(err.message);
                setDocuments([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocuments();
    }, [agent?.id, navigate]);
    
    const handleAgentStatusUpdate = async (newStatus) => {
        if (!agent) return;
        const token = localStorage.getItem('accessToken');
        try {
            const response = await fetch(`${API_BASE_URL}/agents/${agent.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status.');
            }
            const result = await response.json();
            setAgent(result.data);
            alert('Agent status updated successfully!');
        } catch (err) {
            console.error("Error updating agent status:", err);
            alert(`Error: ${err.message}`);
        }
    };

    // ✅ NEW: API call handler for updating agent details
    // ✅ CORRECTED: API call handler for updating agent details
    const handleUpdateAgent = async (updateData) => {
        const token = localStorage.getItem('accessToken');

        // Create a new object with only the fields the API expects.
        // These should match the fields in your UpdateAgentRegistrationDto
        const payload = {
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            agencyBusinessName: updateData.agencyBusinessName,
            registeredEmailAddress: updateData.registeredEmailAddress,
            // Add any other editable fields here, e.g., address, city, state if they are in the form
        };

        try {
            // ✅ CHANGED: Send the clean 'payload' object instead of the full 'updateData'
            const response = await fetch(`${API_BASE_URL}/agents/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload) 
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Log the detailed error message from the backend for easier debugging
                console.error("Backend validation error:", errorData.message);
                throw new Error(errorData.message.join(', ') || 'Failed to update agent details.');
            }

            const result = await response.json();
            setAgent(result.data); // Update state with the returned data
            alert('Agent details updated successfully!');
        } catch (err) {
            console.error("Error updating agent details:", err);
            alert(`Error: ${err.message}`);
        }
    };


    if (!agent) {
        return <div className="p-8 text-center text-lg font-semibold">Loading agent data...</div>;
    }

    return (
        <div className="bg-[#F0F7F7] min-h-screen">
      <Header title='Agent Management'/>
        <div className="py-4 px-4 bg-white min-h-screen rounded-xl mt-6">
            <div className="flex items-center gap-3 text-lg font-semibold text-[#0A7777] mb-6">
                <button onClick={() => navigate('/agents')} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>
                Agent Details
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                <AgentProfile 
                    agent={agent} 
                    documents={documents}
                    onStatusChange={handleAgentStatusUpdate}
                    onUpdateAgent={handleUpdateAgent} // Pass the new handler down
                />
                
                <DocumentVerification 
                    agentId={agent.id} 
                    documents={documents} 
                    setDocuments={setDocuments}
                    isLoading={isLoading}
                    error={error}
                />
            </div>
        </div>
        </div>
    );
};

export default AgentDetailsPage;


