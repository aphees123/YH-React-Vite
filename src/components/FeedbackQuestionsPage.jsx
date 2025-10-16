import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Star } from 'lucide-react';

const FeedbackQuestionsPage = () => {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState({
        ratingQuestion: '',
        bugQuestion: '',
        suggestionQuestion: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Placeholder for fetching existing questions
    useEffect(() => {
        // In a real app, you would fetch these from an API:
        // fetch('/api/feedback/questions').then(...)
        setQuestions({
            ratingQuestion: 'How would you rate your experience with app?',
            bugQuestion: 'Was there any issues or difficulties you faced?',
            suggestionQuestion: 'Do you have suggestion for improvement?',
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setQuestions(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        console.log("Submitting questions:", questions);

        // Placeholder for submitting to the backend
        try {
            // In a real app, you'd have an endpoint for this:
            // const response = await fetch('/api/feedback/questions', {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(questions)
            // });
            // if (!response.ok) throw new Error('Failed to save questions.');
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Feedback questions updated successfully! (Simulation)');
            navigate(-1); // Go back to the previous page

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 text-2xl font-semibold text-gray-800 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200">
                        <ChevronLeft className="h-7 w-7" />
                    </button>
                    Edit Feedback Questions
                </div>
                
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">Feedback Questions</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="ratingQuestion"
                                    value={questions.ratingQuestion}
                                    onChange={handleChange}
                                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00A79D]"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#00A79D] p-2 rounded-md">
                                    <Star className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="bugQuestion" className="block text-base font-medium text-gray-700 mb-2">Types of bugs</label>
                            <input
                                type="text"
                                id="bugQuestion"
                                name="bugQuestion"
                                value={questions.bugQuestion}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00A79D]"
                            />
                        </div>

                        <div>
                            <label htmlFor="suggestionQuestion" className="block text-base font-medium text-gray-700 mb-2">Suggestion</label>
                            <input
                                type="text"
                                id="suggestionQuestion"
                                name="suggestionQuestion"
                                value={questions.suggestionQuestion}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00A79D]"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">Error: {error}</p>}
                        
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#00A79D] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#008C82] transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default FeedbackQuestionsPage