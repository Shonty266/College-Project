import React from 'react';
import { useNavigate } from 'react-router-dom';
import OrderConformation from '../assets/Order Conformation.svg';
import Loading from '../assets/Loading Blue.gif'
 // Ensure the path is correct

const OrderConfirmation = () => {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate('/home'); // Change to your dashboard route
  };

  const handleOrdersClick = () => {
    navigate('/orderhistory'); // Change to your orders route
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Image section */}
      <img
        src={OrderConformation} // Ensure this points to your SVG file correctly
        alt="Order Confirmation"
        className="mb-6 w-[30%]" // Adjust width and height as necessary
      />

<h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
<p className="text-lg text-gray-600 mb-6">
  Thank you for your order! A QR code will be sent to your email soon.
</p>


<div className="flex space-x-4">
<button
    onClick={handleOrdersClick}
    className="px-8 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300 font-semibold"
  >
    View Order
  </button>
  <button
    onClick={handleDashboardClick}
    className="px-8 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 font-semibold "
  >
    Go to Dashboard
  </button>
  
</div>

    </div>
  );
};

export default OrderConfirmation;
