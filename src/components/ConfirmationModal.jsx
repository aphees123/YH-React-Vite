// --- ConfirmationModal Component (NEW) ---
// A reusable modal for confirming actions.

import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            {/* Modal Panel */}
            <div className="relative w-full max-w-sm transform rounded-lg bg-[#fcfaf7] p-6 text-left shadow-xl transition-all border border-gray-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
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

                {/* Action Buttons */}
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-[#b93838] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto"
                        onClick={onConfirm}
                    >
                        Yes
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

export default ConfirmationModal;