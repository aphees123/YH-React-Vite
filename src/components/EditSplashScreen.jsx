import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react'; // Added Search icon for consistency
import Header from './Header';
const EditSplashScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const API_BASE_URL = `${import.meta.env.VITE_STAGING_URL}/splash-screens`;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchScreenData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch splash screen data.');
            }

            const result = await response.json();
            const data = result.data;

            setTitle(data.title || '');
            setDescription(data.description || '');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [id, API_BASE_URL]);

    useEffect(() => {
        fetchScreenData();
    }, [fetchScreenData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        const payload = {
            title,
            description,
        };

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const message = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
                throw new Error(message || 'Failed to update screen.');
            }

            // Instead of alert, you might want to use a toast notification here
            // alert('Splash screen updated successfully!');
            navigate('/splash-screen'); // Navigate back to the management page

        } catch (err) {
            setError(err.message);
        }
    };

    return ( <div className="bg-[#F0F7F7] min-h-screen pl-6 pr-6 pb-6">
             <Header title="Splash Screen Management"/>
              
      
            {/* ✅ UPDATED: Header section matching the design */}
         
               


            {/* --- Main Content Area --- */}
            <main className="p-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm max-w-4xl mx-auto"> {/* Centered form */}
                    {/* ✅ UPDATED: Back Button with better styling */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[#0A7777]  mb-6 transition-colors duration-200"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="font-semibold text-[#0A7777] text-base">Back</span>
                    </button>

                    {isLoading ? (
                        <div className="text-center py-10 text-gray-600">Loading screen details...</div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* --- Screen Details Section --- */}
                            <div className="p-6 border border-gray-200 rounded-xl"> {/* Enhanced border and padding */}
                                <h3 className="text-lg font-semibold mb-6 ">Screen Details</h3> {/* Increased bottom margin */}
                                <div className="space-y-5"> {/* Increased vertical spacing */}
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1"> {/* Added bottom margin */}
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1"> {/* Added bottom margin */}
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows="4"
                                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-900 resize-y"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* --- Action Buttons --- */}
                            {error && <p className="text-sm text-center text-red-600 mt-4">{error}</p>}
                            <div className="flex justify-end gap-3 pt-4"> {/* Adjusted spacing */}
                                <button
                                    type="button"
                                    onClick={() => navigate('/splash-screen')}
                                    className="px-6 py-2.5 text-sm  text-gray-700 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 text-sm  text-white bg-teal-600 rounded-full hover:bg-teal-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>

    );
};

export default EditSplashScreen;