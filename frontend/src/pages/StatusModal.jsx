import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';


const StatusModal = ({ isOpen, onClose, product, onUpdate }) => {
    const [status, setStatus] = useState(product.status || '');

    const handleUpdate = () => {
        onUpdate(product._id, status);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-full">
        <div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-semibold">Edit Product Status?</h2>
  <button
    onClick={onClose} // Update with your logic for closing the modal
    className="text-gray-400 hover:text-gray-600 transition duration-200"
    aria-label="Close"
  >
    <FaTimes className="h-6 w-6" /> {/* Adjust size as needed */}
  </button>
</div>

            <div className="mb-6">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 outline-none">Status</label>
                <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none"
                >
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                </select>
            </div>
            <div className="flex justify-end gap-4">
                <button
                    onClick={handleUpdate}
                    className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 duration-300 font-semibold transition"
                >
                    Update
                </button>
            </div>
        </div>
    </div>
    

    );
};

export default StatusModal;
