// components/Modal.js
import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ 
  isOpen, 
  onClose, 
  boxes, 
  onSelectBox, 
  selectedBox, 
  pickupLocation, 
  dropoffLocation, 
  userCoordinates, 
  distance, 
  price 
}) => {
  if (!isOpen) return null;

  // You might want to calculate the price based on the selected box
  const calculateBoxPrice = (box) => {
    // Implement your price calculation logic based on the box
    // For example, you can set a price property on the box or calculate based on size
    return box.price || 0; // Example: return box's price or a default value
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-5 rounded-lg shadow-lg w-full max-w-lg">
        <div className='flex  justify-between items-center mb-4'>
        <h2 className="text-2xl font-semibold">Select a Box</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-2"
          aria-label="Close modal"
        >
          <FaTimes size={24} />
        </button>
        </div>
        <div className="box-list mb-4">
          {boxes.length > 0 ? (
            boxes.map((box) => (
              <div
                key={box._id}
                className={`box-item border p-4 rounded mb-2 cursor-pointer ${selectedBox?._id === box._id ? 'bg-blue-100' : ''}`}
                onClick={() => {
                  onSelectBox(box);
                  const boxPrice = calculateBoxPrice(box);
                  // Assuming price is derived from box selected
                  price = boxPrice; // Update price based on selected box
                }}
              >
                <h3 className='text-lg font-semibold'>{box.product_name}</h3>
                <p className='font-semibold'>Size: {box.product_Size}</p>
                <p className='font-semibold'>Description: {box.product_Description}</p>
              </div>
            ))
          ) : (
            <p className='font-semibold'>No boxes available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
