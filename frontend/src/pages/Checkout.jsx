import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../assets/Loading White.gif'
// import Loading from '../assets/Loading Blue.gif'


function Checkout() {
  const location = useLocation();
  const { selectedBox, pickupLocation: initialPickupLocation, dropoffLocation: initialDropoffLocation, price: initialPrice } = location.state || {};
  const navigate = useNavigate();

  const userId = localStorage.getItem('id');
  const senderEmail = localStorage.getItem('email');

  const [pickupLocation, setPickupLocation] = useState(initialPickupLocation || '');
  const [dropLocation, setDropLocation] = useState(initialDropoffLocation || '');
  const [price, setPrice] = useState(initialPrice ? parseFloat(initialPrice).toFixed(2) : '0.00');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [receiverEmail, setReceiverEmail] = useState(senderEmail || '');
  const [receiverName, setReceiverName] = useState(''); // New state for receiver's name
  const [receiverContactNumber, setReceiverContactNumber] = useState('');
  const [loading, setLoading] = useState(false); // New state for receiver's contact number

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDeliveryTime = tomorrow.toISOString().split('T')[0];
    setDeliveryTime(formattedDeliveryTime);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validations
    if (!pickupLocation.trim()) {
      toast.error('Pickup location is required.');
    setLoading(false);

      return;
    }
    if (!dropLocation.trim()) {
      toast.error('Drop location is required.');
    setLoading(false);

      return;
    }
    if (!receiverName.trim()) {
      toast.error('Receiver name is required.');
    setLoading(false);

      return;
    }
    if (!receiverContactNumber.trim()) {
      toast.error('Receiver contact number is required.');
    setLoading(false);

      return;
    }
    if (!receiverEmail.trim()) {
      toast.error('Receiver email is required.');
    setLoading(false);

      return;
    }


    try {
      const serverResponse = await fetch('http://localhost:8080/auth/createorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          customerId: userId,
          productName: selectedBox.product_name,
          size: selectedBox.product_Size,
          price: parseFloat(price),
          deliveryTime: deliveryTime,
          deliveryBoyId: '',
          deliveryAddress: dropLocation,
          currentAddress: pickupLocation,
          senderEmail: senderEmail,
          receiverEmail: receiverEmail,
          receiverName: receiverName, // Include receiver's name
          receiverContactNumber: receiverContactNumber, // Include receiver's contact number
        }),
      });

      const serverData = await serverResponse.json();

      if (serverData.success) {
        toast.success('Order placed successfully');
        setTimeout(() => {
          navigate('/orderconformation');
        }, 2000);
      } else {
        toast.error(serverData.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      toast.error('Failed to place order');
    }
  };

  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value);
    if (!isNaN(newPrice) && newPrice >= 0) {
      setPrice(newPrice.toFixed(2));
    }
  };


  return (
    <div className="bg-gray-100 flex flex-col">
      <Navbar />
      <div className="checkout-container min-h-[calc(100vh-100px)] overflow-y-auto flex justify-center items-center my-10">
        {selectedBox ? (
          <div className="box-details p-8 rounded-lg shadow-lg w-4/5 mx-auto flex flex-col bg-white">
            <h1 className="text-4xl font-bold mb-6 text-black">Checkout Page</h1>
            <hr className="mb-6 h-1" />

            <div className="flex-grow flex">
              {/* Sender and Receiver Information */}
              <div className="flex-1 pr-6">
                <h2 className="font-bold text-2xl mb-6 text-black">Sender and Receiver Information</h2>
                <form className="space-y-8" onSubmit={handleSubmit}>
                  {/* Sender Information */}
                  <div className="bg-gray-50 p-6 rounded-lg shadow mb-6">
                    <h3 className="font-semibold text-lg mb-4">Sender Information</h3>
                    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700">Pickup Location:</label>
                      <input
                        type="text"
                        readOnly
                        value={pickupLocation}
                        className="p-3 border border-gray-300 rounded-lg bg-gray-200 outline-none"
                      />
                    </div>
                    <div className="flex flex-col mt-4">
                      <label className="font-semibold text-gray-700">Sender Email:</label>
                      <input
                        type="email"
                        value={senderEmail}
                        readOnly
                        className="p-3 border border-gray-300 rounded-lg bg-gray-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Receiver Information */}
                  <div className="bg-gray-50 p-6 rounded-lg shadow mb-6">
                    <h3 className="font-semibold text-lg mb-4">Receiver Information</h3>
                    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700">Drop Location:</label>
                      <input
                        type="text"
                        readOnly
                        value={dropLocation}
                        className="p-3 border border-gray-300 rounded-lg bg-gray-200 outline-none"
                      />
                    </div>
                    <div className="flex flex-col mt-4">
                      <label className="font-semibold text-gray-700">Receiver Name:</label>
                      <input
                        type="text"
                        placeholder="Enter receiver name"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg bg-gray-200 outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col mt-4">
                      <label className="font-semibold text-gray-700">Receiver Email:</label>
                      <input
                        type="email"
                        placeholder="Enter receiver email"
                        value={receiverEmail}
                        onChange={(e) => setReceiverEmail(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg bg-gray-200 outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col mt-4">
                      <label className="font-semibold text-gray-700">Receiver Contact Number:</label>
                      <input
                        type="tel"
                        placeholder="Enter receiver contact number"
                        value={receiverContactNumber}
                        onChange={(e) => setReceiverContactNumber(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg bg-gray-200 outline-none"
                        required
                      />
                    </div>
                  </div>

                  
                </form>
              </div>

              {/* Product Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-bold text-2xl mb-6 text-black">Product Details</h2>
                  <div className="bg-gray-50 p-6 rounded-lg shadow mb-4">
                    <h3 className="font-semibold text-lg mb-4">Product Details</h3>
                    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700">Product ID</label>
                      <input
                        type="text"
                        value={selectedBox._id}
                        readOnly
                        className="p-3 border border-gray-300 rounded-lg bg-gray-200 outline-none"
                      />
                    </div>

                    <div className="flex flex-col mt-4">
                      <label className="font-semibold text-gray-700">Name:</label>
                      <input
                        type="text"
                        value={selectedBox.product_name}
                        readOnly
                        className="p-3 border border-gray-300 rounded-lg bg-gray-200 outline-none"
                      />
                    </div>
                    <div className="flex flex-col mt-4">
                      <label className="font-semibold text-gray-700">Size:</label>
                      <input
                        type="text"
                        value={selectedBox.product_Size}
                        readOnly
                        className="p-3 border border-gray-300 rounded-lg bg-gray-200 outline-none"
                      />
                    </div>
                    <div className="flex flex-col mt-4">
                      <label className="font-semibold text-gray-700">Box Description:</label>
                      <input
                        type="text"
                        value={selectedBox.product_Description}
                        readOnly
                        className="p-3 border border-gray-300 rounded-lg bg-gray-200 outline-none"
                      />
                    </div>
                    
                   
                  </div>
                </div>
                <div>
                <hr className="mb-2 h-1" />

                <div className="flex items-center justify-between">
                  
                    <span className="text-2xl font-bold text-gray-500">Total Price: ₹{price}</span>
                    <button
  type="submit"
  onClick={handleSubmit}
  className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg py-3 rounded transition-colors duration-300 flex items-center justify-center h-12 w-[300px] ${loading ? 'opacity-70 transform scale-95' : ''}`} // Added height and width classes
  disabled={loading} // Disable button while loading
>
  {loading ? (
    <div className="flex items-center w-full justify-center"> {/* Use w-full to maintain button size */}
      <img
        src={Loading} // Replace with the actual path to your GIF
        alt="Loading"
        className="h-8 w-8 mr-3 transition-transform duration-300 ease-in-out" // Add smooth transition
      />
      <span className="transition-opacity duration-300">Placing Order...</span>
    </div>
  ) : (
    'Place Order'
  )}
</button>














                  </div>
                  </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold">No Box Selected</h1>
            <button
              className="bg-blue-600 hover:bg-blue-700 transition-colors text-white p-4 rounded-lg text-lg font-semibold mt-4"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default Checkout;
