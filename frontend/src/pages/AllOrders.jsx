import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { handleSuccess } from '../../utils';
import { toast, ToastContainer } from 'react-toastify';
import Loading from '../assets/Loading White.gif'
import { FaTimes } from 'react-icons/fa';


function CancelModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
  <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96 relative">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-2xl font-bold">Confirm Cancellation</h3>
      <button
        onClick={() => setShowOtpModal(false)}
        className="text-gray-400 hover:text-gray-600 transition duration-200"
        aria-label="Close Modal"
      >
        <FaTimes className="h-5 w-5" /> {/* Adjust the size as needed */}
      </button>
    </div>
    <p className="mb-6 font-semibold text-md">Are you sure you want to cancel this order?</p>
    <div className="flex justify-end">
      <button
        onClick={onConfirm}
        className={`mt-4 py-2 px-6 bg-red-500 text-white font-semibold rounded shadow-md hover:bg-red-600 duration-300 flex items-center justify-center ${loading ? 'bg-red-400' : ''}`}
        disabled={loading}
      >
        {loading ? (
          <>
            <img src={Loading} alt="Loading..." className="h-5 w-5 mr-2" />
            <span>Cancelling...</span>
          </>
        ) : (
          'Yes, Cancel'
        )}
      </button>
    </div>
  </div>
</div>
  );
}

function AllOrders() {
    const [orders, setOrders] = useState([]);
    const [canceledOrders, setCanceledOrders] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const [pressCount, setPressCount] = useState(0);
    const [loadingCancel, setLoadingCancel] = useState(false);


    useEffect(() => {
        const storedUserId = localStorage.getItem('id');
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            console.error('No user ID found in local storage');
            setError('No user ID found in local storage');
            setLoading(false);
        }
    }, []);

    const fetchUserOrders = async () => {
        if (!userId) {
            setError('No user ID found');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/auth/orderhistory', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                const result = await response.json();
                console.error('Failed to fetch orders:', result.message);
                setError(result.message || 'Failed to fetch orders');
            } else {
                const result = await response.json();
                const activeOrders = result.orders.filter(order => order.status !== 'Cancelled');
                const canceledOrders = result.orders.filter(order => order.status === 'Cancelled');
                setOrders(activeOrders);
                setCanceledOrders(canceledOrders);
            }
        } catch (err) {
            console.error('Error during fetch:', err);
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserOrders();
        }
    }, [userId]);

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleTrackClick = async (orderId, orderDetails) => {
      try {
          const response = await fetch('http://localhost:8080/receivedlocation', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId }),
          });
  
          if (!response.ok) {
              const errorData = await response.json();
              toast.error(`No Gps Data Not Available`);
              return; // Stop execution if response is not OK
          }
  
          const data = await response.json();
  
          // Check if the response data is valid
          if (data && Object.keys(data).length > 0) {
              console.log('Latest GPS data:', data);
              // Navigate to the tracking page with order details
              navigate(`/orderhistory/trackorder`, { state: { orderDetails } });
          } else {
              // Show toast message if no GPS data is available
              toast.error('No GPS data available for this order');
          }
      } catch (error) {
          // console.error('Error tracking order:', error);
          toast.error('An error occurred while tracking the order');
      }
  };
  
    
    // const handleUnlockClick = async (orderId) => {
    //     try {
    //         const response = await fetch('http://localhost:8080/endpoint', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ orderId }), // Only sending orderId
    //         });
    
    //         if (!response.ok) {
    //             const errorData = await response.json();
    //             toast.error(`Failed to unlock the box: ${errorData.message}`);
    //             return; // Stop execution if response is not OK
    //         }
    
    //         const data = await response.json();
    //         console.log('Unlock response:', data);
    
    //         // Optionally navigate to a confirmation page or show a success message
    //         toast.success('Box unlocked successfully!'); // Show success message
    
    //     } catch (error) {
    //         console.error('Error unlocking box:', error);
    //         toast.error('An error occurred while unlocking the box');
    //     }
    // };
    
    const handleUnlockClick = async (orderId) => {
        try {
            // Step 1: Call the /searchOrder endpoint with the fetched order ID
            const searchResponse = await fetch('http://localhost:8080/searchOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId }), // Send orderId directly
            });
    
            if (!searchResponse.ok) {
                const errorData = await searchResponse.json();
                toast.error(`Failed to search for order: ${errorData.message}`);
                return; // Stop execution if search response is not OK
            }
    
            const searchData = await searchResponse.json();
            console.log('Search response:', searchData);
    
            // Step 2: Call the /runScript endpoint to execute the Python script
            const scriptResponse = await fetch('http://localhost:8080/runScript', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!scriptResponse.ok) {
                const errorData = await scriptResponse.json();
                toast.error(`Failed to run script: ${errorData.message}`);
                return; // Stop execution if script response is not OK
            }
    
            const scriptData = await scriptResponse.json();
            console.log('Script response:', scriptData);
    
            // Step 3: Show success toast message after successful script execution
            toast.success('Your box has been opened successfully!'); // Display success message
    
            // You can add any additional logic here if needed
    
        } catch (error) {
            console.error('Error:', error);
            // toast.error('An error occurred while processing the request');
        }
    };
    
    
 
    
    const handleCancelOrder = (orderId) => {
        setSelectedOrderId(orderId);
        setShowModal(true);
    };

    const confirmCancelOrder = async () => {
      if (!selectedOrderId) {
          setError('No order selected');
          return;
      }

      setLoadingCancel(true); // Start loading

      try {
          if (!userId) {
              setError('No user ID found');
              return;
          }

            const url = `http://localhost:8080/auth/orderhistory/${selectedOrderId}/cancel`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                const result = await response.json();
                setError(result.message || 'Failed to cancel order');
            } else {
                handleSuccess('Order cancelled successfully');
                await fetchUserOrders();
                navigate('/orderhistory');
            }
        } catch (err) {
            console.error('Error during cancel order:', err);
            setError('Failed to cancel order');
        } finally {
            setShowModal(false);
            setSelectedOrderId(null);
        }
    };

    const cancelModalClose = () => {
        setShowModal(false);
        setSelectedOrderId(null);
        setLoadingCancel(false);
    };

    if (loading) {
        return <div className="text-lg w-full h-screen flex justify-center items-center"><img src={Loading} alt="" className='w-42 h-42' /></div>;
    }

    if (error) {
        return <p className="text-red-500">Error: {error}</p>;
    }

    return (
        <div className="orders-container">
            <Navbar />
            <div className="orders-list overflow-x-auto py-10 bg-gray-100 min-h-[calc(100vh-100px)] px-10">
            <div className='flex items-center justify-between mb-4'>
    <h1 className="text-3xl font-bold">All Orders</h1>
    <Link
        to="/home"
        className="bg-blue-500 text-white px-4 py-2 font-semibold rounded hover:bg-blue-600 transition duration-300"
    >
        Rent a Box
    </Link>
</div>


  <div className='bg-white px-10 py-4 mb-4 rounded-lg shadow-md'>
    <h2 className="text-2xl font-bold">My Orders</h2>
    <hr className='w-full bg-gray-100 h-1' />

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 py-4">
      {orders.length > 0 ? (
        orders.slice().reverse().map(order => (
          <div key={order._id} className="border rounded-lg p-4 shadow-md bg-white">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">Order ID: #{order._id}</h3>
              <span className={`px-2 py-1 text-sm rounded font-semibold ${
                order.status === 'Cancelled' ? 'bg-red-100 text-red-500' :
                order.status === 'Delivered' ? 'bg-green-100 text-green-500' :
                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-500' :
                order.status === 'Shipped' ? 'bg-blue-100 text-blue-500' :
                'bg-gray-200'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 font-semibold">Product ID: #{order.esp32_id || 'N/A'}</span>
              <span className="text-sm text-gray-600 font-semibold">Product Name: {order.productName}</span>
              <span className="text-sm text-gray-600 font-semibold">Size: {order.size}</span>
              {/* <span className="text-sm text-gray-600 font-semibold">Price: ₹{order.price}</span> */}
            </div>
            <div className="text-sm text-gray-600 font-semibold">
              <p>Booking Date: {new Date(order.bookingDate).toLocaleDateString()}</p>
              <p>Estimated Delivery Date: {order.deliveryTime ? new Date(order.deliveryTime).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="text-sm text-gray-600 font-semibold">
              <p>Sender's Address: {order.currentAddress}</p>
              <p>Delivery Address: {order.deliveryAddress}</p>
            </div>
            <div className="text-sm text-gray-600 font-semibold">Box Status: <span className={`px-2 text-sm rounded font-semibold ${
              order.boxStatus === 'Closed' ? 'text-red-500' :
              order.boxStatus === 'Opened' ? 'text-green-500' :
              'bg-gray-200'
            }`}>
              {order.boxStatus}
            </span></div>
            <div className="text-sm text-gray-600 font-semibold mb-4">Receiver's Box Status: <span className={`text-sm rounded font-semibold ${
              order.receiverBoxStatus === 'Closed' ? 'text-red-500 font-semibold' :
              order.receiverBoxStatus === 'Opened' ? 'text-green-500 font-semibold' :
              'bg-gray-200'
            }`}>
              {order.receiverBoxStatus}
            </span></div>

            <div className="flex justify-between">
              <button
                onClick={() => handleCancelOrder(order._id)}
                className={`px-4 py-2 rounded font-semibold ${
                  order.status === 'Delivered' || order.status === 'Cancelled'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600 duration-300'
                }`}
                disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
              >
                Cancel
              </button>
              
              <div className='flex gap-10'> 
              <button
    onClick={() => handleTrackClick(order._id, order)}
    className={`px-4 py-2 rounded font-semibold ${
        order.status === 'Delivered' || order.status === 'Cancelled' || order.status === 'Pending'
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-green-600 duration-300'
    }`}
    disabled={order.status === 'Delivered' || order.status === 'Cancelled' || order.status === 'Pending'}
>
    Track
</button>

                <button
    onClick={() => {
        handleUnlockClick(order._id, order);
    }}
    className={`px-4 py-2 rounded font-semibold ${
        order.status === 'Pending' && order.boxStatus === 'Closed'
            ? 'bg-blue-500 text-white hover:bg-blue-600 duration-300'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
    }`}
    disabled={order.status !== 'Pending' || order.boxStatus !== 'Closed'}
>
    Unlock
</button>

              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center text-gray-600 font-semibold">
          No active orders
        </div>
      )}
    </div>
  </div>

  <div className='bg-white px-10 py-4 mt-2 rounded-lg shadow-md'>
    <h2 className="text-2xl font-bold">My Cancelled Orders</h2>
    <hr className='w-full bg-gray-100 h-1' />

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 py-4">
      {canceledOrders.length > 0 ? (
        canceledOrders.slice().reverse().map(order => (
          <div key={order._id} className="border rounded-lg p-4 shadow-md bg-white">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">Order ID: #{order._id}</h3>
              <span className={`px-2 py-1 text-sm rounded font-bold ${
                order.status === 'Cancelled'
                  ? 'bg-red-100 text-red-600'
                  : order.status === 'Delivered'
                  ? 'bg-green-100 text-green-600'
                  : order.status === 'Pending'
                  ? 'bg-yellow-100 text-yellow-600'
                  : order.status === 'Shipped'
                  ? 'bg-blue-100 text-blue-600 font-semibold'
                  : 'bg-gray-200'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="flex flex-col mb-2">
              <span className="text-sm text-gray-600 font-semibold">ESP32 ID: #{order.esp32_id || 'N/A'}</span>
              <span className="text-sm text-gray-600 font-semibold">Product: {order.productName}</span>
              <span className="text-sm text-gray-600 font-semibold">Size: {order.size}</span>
              <span className="text-sm text-gray-600 font-semibold">Price: ₹{order.price}</span>
            </div>
            <div className="text-sm text-gray-600 mb-2 font-semibold">
              <p>Booking Date: {new Date(order.bookingDate).toLocaleDateString()}</p>
              <p>Delivery Date: {new Date(order.deliveryTime).toLocaleDateString()}</p>
            </div>
            <div className="text-sm text-gray-600 mb-2 font-semibold">
              <p>Delivery Address: {order.deliveryAddress}</p>
              <p>Current Address: {order.currentAddress}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full font-semibold text-center text-gray-600">
          No cancelled orders
        </div>
      )}
    </div>
  </div>

  {showModal && (
    <CancelModal
      onConfirm={confirmCancelOrder}
      onCancel={cancelModalClose}
      loading={loadingCancel}
    />
  )}
</div>


            <ToastContainer />
        </div>
    );
}

export default AllOrders;
