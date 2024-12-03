// DeleteModal.js
import React from 'react';
import { FaTimes } from 'react-icons/fa'; 

const DeleteModal = ({ isOpen, onClose, onDelete, productName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 relative">
            {/* Cross icon to close the modal */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition duration-200"
                aria-label="Close Modal"
            >
                <FaTimes className="h-5 w-5" /> {/* Adjust size if necessary */}
            </button>
    
            <h2 className="text-2xl font-semibold mb-2">Confirm Delete!</h2>
            <p>Are you sure you want to delete the product "{productName}"?</p>
            
            <div className="flex justify-end gap-4 mt-4">
                <button
                    onClick={onDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 duration-300 font-semibold"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
    );
};

export default DeleteModal;
