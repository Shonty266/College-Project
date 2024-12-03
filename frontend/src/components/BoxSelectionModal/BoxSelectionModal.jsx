import React from 'react';
import PropTypes from 'prop-types';

const BoxSelectionModal = ({ boxes, onSelectBox, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <h2 className="text-xl font-semibold mb-4">Select a Box</h2>
        <ul className="space-y-2">
          {boxes.map((box) => (
            <li key={box.id}>
              <button
                className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                onClick={() => onSelectBox(box)}
              >
                {box.name} - {box.price}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

BoxSelectionModal.propTypes = {
  boxes: PropTypes.array.isRequired,
  onSelectBox: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BoxSelectionModal;
