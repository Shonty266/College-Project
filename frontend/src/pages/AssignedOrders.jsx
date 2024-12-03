import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DeliveryBoyNavbar from '../components/DeliveryBoyNavbar/DeliveryBoyNavbar';
import Loading from '../assets/Loading Blue.gif'


const AssignedOrders = () => {
  const { id } = useParams(); // Get the id from the route params

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('No delivery boy ID found in the route params');
      setLoading(false);
      return;
    }

    // Fetch the assigned orders from the backend
    const fetchAssignedOrders = async () => {
      try {
        const response = await fetch(`http://localhost:8080/auth/assignedorders/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('No Orders Assigned.');
        }

        const data = await response.json();

        // Check if there are any orders returned
        if (data.orders.length === 0) {
          setError('No orders assigned yet.');
          setOrders([]); // Set orders to an empty array
        } else {
          // Sort orders by bookingDate, with the latest orders first
          const sortedOrders = data.orders.sort(
            (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
          );
          setOrders(sortedOrders);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAssignedOrders();
  }, [id]);

  if (loading) {
    return <div className="text-lg w-full h-screen flex justify-center items-center"><img src={Loading} alt="" className='w-42 h-42' /></div>;
  }

  return (
    <div>
      <DeliveryBoyNavbar />
      <div className="bg-gray-100 w-[80%] min-h-[calc(100vh-120px)] absolute right-0 px-10 top-[120px] pb-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 pt-10">All Assigned Orders</h1>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <p className="text-center text-xl text-gray-500">Error: {error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <p className="text-center text-xl text-gray-500">No orders have been assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-between">
                  <h3 className="text-lg font-bold">Order ID: #{order._id}</h3>
                  <p className={`px-2 py-1 rounded ${
                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-500 font-bold' : 
                    order.status === 'Delivered' ? 'bg-green-100 text-green-500 font-bold' : 
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-500 font-bold' : 
                    'bg-red-100 text-red-500 font-bold'
                  }`}>
                    {order.status}
                  </p>
                </div>

                {/* Customer and Product Details */}
                <div className="mb-4">
                  {/* Product Details Section */}
                  <div className="font-semibold text-gray-500 mb-2">
                    <h4 className="text-lg font-bold">Product Details:</h4>
                    <p>Product Name: {order.productName}</p>
                    <p>Size: {order.size}</p>
                    <p>Booking Date: {new Date(order.bookingDate).toLocaleDateString()}</p>
                    <p>ESP32 ID: {order.esp32_id || 'Not assigned'}</p>
                  </div>

                  {/* Customer Information Section */}
                  <div className="font-semibold text-gray-500 mb-2">
                    <h4 className="text-lg font-bold">Customer Information:</h4>
                    <p>Customer ID: #{order.customerId}</p>
                    <p>Sender Email: {order.senderEmail}</p>
                    <p>Receiver Email: {order.receiverEmail}</p>
                    <p>Receiver Name: {order.receiverName}</p>
                    <p>Receiver Contact Number: {order.receiverContactNumber}</p>
                  </div>

                  {/* Delivery Information Section */}
                  <div className="font-semibold text-gray-500">
                    <h4 className="text-lg font-bold">Delivery Information:</h4>
                    <p>Receiver's Delivery Address: {order.deliveryAddress}</p>
                    <p>Sender's Address: {order.currentAddress}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedOrders;
