import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar/AdminNavbar';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import Loading from '../assets/Loading Blue.gif'


function OrdersDetails() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState({}); 

    useEffect(() => {
        const checkAdmin = () => {
            const userRole = localStorage.getItem('role');
            if (userRole !== 'admin') {
                navigate('/home'); 
            }
        };

        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:8080/auth/allorders', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();
                if (response.ok) {
                    setOrders(result.data);
                } else {
                    setError(result.message || 'Failed to fetch orders');
                    toast.error(result.message || 'Failed to fetch orders'); 
                }
            } catch (err) {
                setError('Internal server error');
                toast.error('Internal server error'); 
            } finally {
                setLoading(false);
            }
        };

        const fetchDeliveryBoys = async () => {
            try {
                const response = await fetch('http://localhost:8080/auth/alldeliveryboys', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();
                if (response.ok) {
                    setDeliveryBoys(result.data); 
                } else {
                    toast.error(result.message || 'Failed to fetch delivery boys');
                }
            } catch (err) {
                toast.error('Internal server error');
            }
        };

        checkAdmin(); 
        fetchOrders();
        fetchDeliveryBoys(); 
    }, [navigate]);

    const handleStatusChange = async (orderId, newStatus) => {
        const userRole = localStorage.getItem('role'); 
    
        try {
            const response = await fetch(`http://localhost:8080/auth/allorders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus, role: userRole })
            });
            const result = await response.json();
            if (response.ok) {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId ? { ...order, status: newStatus } : order
                    )
                );
                toast.success('Order status updated successfully'); 
            } else {
                toast.error(result.message || 'Failed to update order status'); 
            }
        } catch (err) {
            toast.error('Internal server error'); 
        }
    };

    const handleBoxStatusChange = async (orderId, newBoxStatus) => {
        const userRole = localStorage.getItem('role');
    
        try {
            const response = await fetch(`http://localhost:8080/auth/allorders/${orderId}/box-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ boxStatus: newBoxStatus, role: userRole })
            });
            const result = await response.json();
            if (response.ok) {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId ? { ...order, boxStatus: newBoxStatus } : order
                    )
                );
                toast.success('Sender Box status updated successfully');
            } else {
                toast.error(result.message || 'Failed to update sende box status');
            }
        } catch (err) {
            toast.error('Internal server error');
        }
    };
    
    const handleBoxStatusChangeReceiver = async (orderId, newReceiverBoxStatus) => {
        const userRole = localStorage.getItem('role');
    
        try {
            const response = await fetch(`http://localhost:8080/auth/allorders/${orderId}/receiver-box-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ receiverBoxStatus: newReceiverBoxStatus, role: userRole })
            });
            const result = await response.json();
            if (response.ok) {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId ? { ...order, receiverBoxStatus: newReceiverBoxStatus } : order
                    )
                );
                toast.success('Receiver box status updated successfully');
            } else {
                toast.error(result.message || 'Failed to update receiver box status');
            }
        } catch (err) {
            toast.error('Internal server error');
        }
    };
    

    const handleAssignDeliveryBoy = async (orderId) => {
        const deliveryBoyId = selectedDeliveryBoy[orderId];
    
        // Validate if a delivery boy has been selected
        if (!deliveryBoyId) {
            toast.error('Please select a delivery boy before assigning.'); 
            return;
        }
    
        // Check if the selected delivery boy is already assigned to the order
        const order = orders.find(o => o._id === orderId);
        if (order && deliveryBoyId === order.deliveryBoyId) {
            toast.info('This delivery boy is already assigned to this order.');
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:8080/auth/assignorder`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ orderId, deliveryBoyId })
            });
    
            const result = await response.json();
    
            if (response.ok) {
                toast.success('Delivery boy assigned successfully');
                // Update the orders state with the newly assigned delivery boy
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId ? { ...order, deliveryBoyId } : order
                    )
                );
            } else {
                toast.error(result.message || 'Failed to assign delivery boy');
            }
        } catch (err) {
            console.error('Error assigning delivery boy:', err); // Log error for debugging
            toast.error('An error occurred while assigning the delivery boy. Please try again later.');
        }
    };
    
    function getDeliveryBoyName(deliveryBoyId) {
        const deliveryBoy = deliveryBoys.find(boy => boy._id === deliveryBoyId);
        return deliveryBoy ? deliveryBoy.name : 'No delivery boy assigned';
    }

    if (loading) {
        return <div className="text-lg w-full h-screen flex justify-center items-center"><img src={Loading} alt="" className='w-42 h-42' /></div>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <AdminNavbar />
            <div className='p-6'>
    <div className="bg-gray-100 w-[80%] min-h-[calc(100vh-130px)] right-0 absolute top-[120px] px-10 py-10">
        <div className='flex items-center justify-between mb-4'>
            <h1 className='text-3xl font-bold'>Order Details</h1>

            {/* Total Orders Display */}
            <div className="flex justify-between items-center">
                <p className="text-xl font-bold">Total Orders: {orders.length}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
    {orders.length > 0 ? (
        orders.slice().reverse().map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                
                {/* Order Info */}
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
                <div className='mb-4'>
    {/* Product Details Section */}
    <div className='font-semibold text-gray-500 mb-2'>
        <h4 className='text-lg font-bold'>Product Details:</h4>
        <p>Product Name: {order.productName}</p>
        <p>Size: {order.size}</p>
        <p>Booking Date: {new Date(order.bookingDate).toLocaleDateString()}</p>
        {/* <p>Delivery Time: {order.deliveryTime ? new Date(order.deliveryTime).toLocaleString() : 'Not Scheduled'}</p> */}
        <p>ESP32 ID: {order.esp32_id || 'Not assigned'}</p>
    </div>

    {/* Customer Information Section */}
    <div className='font-semibold text-gray-500 mb-2'>
        <h4 className='text-lg font-bold'>Customer Information:</h4>
        <p>Customer ID: #{order.customerId}</p>
        <p>Sender Email: {order.senderEmail}</p>
        <p>Receiver Email: {order.receiverEmail}</p>
        <p>Receiver Name: {order.receiverName}</p>
        <p>Receiver Contact Number: {order.receiverContactNumber}</p>
    </div>

    {/* Delivery Information Section */}
    <div className='font-semibold text-gray-500 mb-2'>
        <h4 className='text-lg font-bold'>Delivery Information:</h4>
        <p>Receiver's Delivery Address: {order.deliveryAddress}</p>
        <p>Sender's Address: {order.currentAddress}</p>
    </div>
</div>

                {/* Price Display */}
              

                {/* Sender's Box Status */}
                <div className="mb-4 flex justify-between items-center">
                    <div className='flex gap-1'>
                        <label className="font-semibold text-gray-500">Sender's Box Status:</label>
                        <p className={`font-semibold ${order.boxStatus === 'Closed' ? 'text-red-500' : 'text-green-500'}`}>
                            {order.boxStatus}
                        </p>
                    </div>
                    <select
                        value={order.boxStatus}
                        onChange={(e) => handleBoxStatusChange(order._id, e.target.value)} // Function to handle status change
                        className="border border-gray-300 rounded p-1 ml-2 outline-none"
                    >
                        <option value="Closed">Change The Status</option>
                        <option value="Closed">Closed</option>
                        <option value="Opened">Opened</option>
                    </select>
                </div>

                {/* Receiver Box Status */}
                <div className="mb-4 flex justify-between items-center">
                    <div className='flex gap-1'>
                        <label className="font-semibold text-gray-500">Receiver Box Status:</label>
                        <p className={`font-semibold ${order.receiverBoxStatus === 'Closed' ? 'text-red-500' : 'text-green-500'}`}>
                            {order.receiverBoxStatus}
                        </p>
                    </div>
                    <select
                        value={order.receiverBoxStatus}
                        onChange={(e) => handleBoxStatusChangeReceiver(order._id, e.target.value)} // Function to handle status change
                        className="border border-gray-300 rounded p-1 ml-2 outline-none"
                    >
                        <option value="Closed">Change The Status</option>
                        <option value="Closed">Closed</option>
                        <option value="Opened">Opened</option>
                    </select>
                </div>

                {/* Order Status Change */}
                <div className="mb-4 flex justify-between items-center">
                    <div className="flex gap-1 items-center">
                        <label className="font-semibold text-gray-500">Order Status:</label>
                    </div>
                    <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="border border-gray-300 rounded p-1 ml-2 outline-none"
                        disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
                    >
                        <option value="" disabled>
                            Change The Status
                        </option>
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Delivery Boy Assignment */}
                <div className="mb-4 flex justify-between items-center">
                    <div className="flex gap-1 items-center">
                        <label className="font-semibold text-gray-500">Delivery Boy:</label>
                        <select
                            value={selectedDeliveryBoy[order._id] || order.deliveryBoyId || ''} 
                            onChange={(e) => setSelectedDeliveryBoy((prev) => ({ ...prev, [order._id]: e.target.value }))} 
                            className="border border-gray-300 rounded p-1 ml-2"
                            disabled={!!order.deliveryBoyId || order.status === 'Delivered' || order.status === 'Cancelled'}
                        >
                            <option value="" disabled>Select Delivery Boy</option>
                            {deliveryBoys.map(boy => (
                                <option key={boy._id} value={boy._id}>
                                    {boy.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => handleAssignDeliveryBoy(order._id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 duration-300 cursor-pointer ml-2"
                        disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                    >
                        Assign
                    </button>
                </div>
                <hr className='h-1 bg-gray-100' />
                <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-gray-800">Price:</span>
                    <span className="text-xl font-bold">₹ {order.price}</span>
                </div>
            </div>
        ))
    ) : (
        <div className="col-span-full text-center p-4">
            <p>No orders found</p>
        </div>
    )}
</div>

    </div>
</div>


            <ToastContainer /> 
        </div>
    );
}

export default OrdersDetails;
