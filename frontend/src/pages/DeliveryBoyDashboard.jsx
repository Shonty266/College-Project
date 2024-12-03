import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryBoyNavbar from '../components/DeliveryBoyNavbar/DeliveryBoyNavbar';
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import Loading from '../assets/Loading Blue.gif'





function DeliveryBoyDashboard() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [deliveryBoyId, setDeliveryBoyId] = useState('');
    const [deliveryBoyRole, setDeliveryBoyRole] = useState('');
    const [activeOrders, setActiveOrders] = useState(0);
    const [completedDeliveries, setCompletedDeliveries] = useState([]);
    const [earnings, setEarnings] = useState(0);
    const [canceledOrders, setCanceledOrders] = useState(0);
    const [runningOrders, setRunningOrders] = useState([]);
    const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [selectedOrderCoords, setSelectedOrderCoords] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        const storedDeliveryBoyId = localStorage.getItem('id');
        const storedDeliveryBoyRole = localStorage.getItem('role');

        setLoggedInUser(storedUser || '');
        setDeliveryBoyId(storedDeliveryBoyId || '');
        setDeliveryBoyRole(storedDeliveryBoyRole || '');

        if (storedDeliveryBoyRole !== 'deliveryBoy') {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!deliveryBoyId) return;

            try {
                const response = await fetch(`http://localhost:8080/auth/deliveryboy/allorders`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setActiveOrders(data.activeOrders || 0);
                    setEarnings(data.earnings || 0);
                    setCanceledOrders(data.canceledOrders || 0);
                    setRunningOrders(data.data || []);

                    // Filter completed, upcoming and running orders
                    const completedOrders = data.data.filter(order => order.status === "Delivered");
                    const upcomingOrders = data.data.filter(order => order.status === "Pending");
                    const runningOrders = data.data.filter(order => order.status === "Shipped");

                    // Reverse the completedOrders array and limit to 2
                    setCompletedDeliveries(completedOrders.reverse().slice(0, 2));
                    setUpcomingDeliveries(upcomingOrders.reverse().slice(0, 2));
                    setRunningOrders(runningOrders.reverse().slice(0, 1));
                } else {
                    console.error('Failed to fetch dashboard data');
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }
        };

        fetchDashboardData();
    }, [deliveryBoyId]);

    useEffect(() => {
        const getCurrentLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCurrentPosition([latitude, longitude]);
                    },
                    (error) => {
                        console.error('Error getting current location:', error);
                        setCurrentPosition([40.7128, -74.0060]); // Default to New York
                    }
                );
            } else {
                console.error("Geolocation is not supported by this browser.");
                setCurrentPosition([40.7128, -74.0060]); // Default to New York
            }
        };

        getCurrentLocation();
    }, []);

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (orderId) => {
        const storedDeliveryBoyRole = localStorage.getItem('role');
        
        // Optimistically update the local state
        const updatedOrder = {
            ...selectedOrder,
            status: newStatus // Update status directly
        };
    
        // Update running orders optimistically
        setRunningOrders((prevOrders) => 
            prevOrders.map((order) => (order._id === orderId ? updatedOrder : order))
        );
    
        // Show success notification immediately
        toast.success(`Order status updated to ${newStatus}`);
    
        try {
            const response = await fetch(`http://localhost:8080/auth/allorders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    role: storedDeliveryBoyRole // Send the role as well
                }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to update order status');
            }
    
            // Optionally, you can fetch updated data here if needed
            // await fetchDashboardData(); // Uncomment this if you want to refresh data
    
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Error updating order status');
            
            // Revert the optimistic update in case of error
            setRunningOrders((prevOrders) => 
                prevOrders.map((order) => (order._id === orderId ? selectedOrder : order))
            );
        } finally {
            setIsModalOpen(false); // Close the modal
            setNewStatus(""); // Reset the new status
        }
    };
    

    return (
        <div>
            <DeliveryBoyNavbar />
            <div className="bg-gray-50 w-[80%] h-[calc(100vh-120px)] p-6 absolute right-0 top-[120px] overflow-y-auto">
                {/* Running Orders Section */}
                <div className="bg-white py-6 px-6 rounded-lg shadow-md mt-6">
                    <h2 className="text-lg font-bold">Running Orders</h2>
                    <hr className='mb-4' />

                    {runningOrders.length === 0 ? (
                        <p className="text-center text-gray-500">No running orders</p>
                    ) : (
                        <ul className="space-y-4">
                            {runningOrders.map((order) => (
                                <li key={order._id}>
                                    <div
                                        className="cursor-pointer rounded-lg p-4 shadow flex flex-col bg-blue-100 hover:bg-blue-200"
                                        onClick={() => {
                                            handleOrderClick(order);
                                            setNewStatus(order.status); // Set the current status
                                        }}
                                    >
                                        <div className='flex justify-between mb-2'>
                                            <p className="font-bold">Order ID: #{order._id}</p>
                                            <p className="font-semibold text-blue-600">{order.status}</p>
                                        </div>
                                        <div className='flex justify-between font-semibold text-gray-500 '>
                                    <p className="text-md">Sender's Address: {order.currentAddress}</p>
                                    <p className="text-md">Receiver's Address: {order.deliveryAddress}</p>
                                    </div>
                                    <div className='flex justify-between font-semibold text-gray-500'>
                                    <p className="text-md">Sender's Email: {order.senderEmail}</p>
                                    <p className="text-md">Receiver's Email: {order.receiverEmail}</p>
                                    
                                    </div>
                                    <div className='flex justify-end font-semibold text-gray-500'><p className="text-md">Receiver's Name: {order.receiverName}</p></div>
                                    <div className='flex justify-end font-semibold text-gray-500'><p className="text-md">Receiver's Contact Number: {order.receiverContactNumber}</p></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Upcoming Deliveries Section */}
                <div className="bg-white py-6 px-6 rounded-lg shadow-md mt-6">
                    <h2 className="text-lg font-bold">Upcoming Deliveries</h2>
                    <hr className='mb-4' />

                    {upcomingDeliveries.length === 0 ? (
                        <p className="text-center text-gray-500">No upcoming orders</p>
                    ) : (
                        <ul className="space-y-4">
                            {upcomingDeliveries.map((order) => (
                                <li
                                    key={order._id}
                                    
                                    className="rounded-lg p-4 shadow flex flex-col bg-yellow-100"
                                >
                                    <div className='flex justify-between mb-2'>
                                        <p className="font-bold">Order ID: #{order._id}</p>
                                        <p className="font-semibold text-yellow-600">{order.status}</p>
                                    </div>
                                    <div className='flex justify-between font-semibold text-gray-500'>
                                    <p className="text-md">Sender's Address: {order.currentAddress}</p>
                                    <p className="text-md">Receiver's Address: {order.deliveryAddress}</p>
                                    </div>
                                    
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Completed Deliveries Section */}
                <div className="bg-white py-6 px-6 rounded-lg shadow-md mt-6">
                    <h2 className="text-lg font-bold ">Latest Completed Deliveries</h2>
                    <hr className='mb-4' />
                    {completedDeliveries.length === 0 ? (
                        <p className="text-center text-gray-500">No completed deliveries</p>
                    ) : (
                        <ul className="space-y-4">
                            {completedDeliveries.map((order) => (
                                <li
                                    key={order._id}
                                    className={`rounded-lg p-4 shadow flex flex-col ${order.status === 'Delivered' ? 'bg-green-100' : 'bg-gray-100'}`}
                                >
                                    <div className='flex justify-between mb-2'>
                                        <p className="font-bold">Order ID: #{order._id}</p>
                                        <p className="font-semibold text-green-600">{order.status}</p>
                                    </div>
                                    <div className='flex justify-between font-semibold text-gray-500'>
                                    <p className="text-md">Sender's Address: {order.currentAddress}</p>
                                    <p className="text-md">Receiver's Address: {order.deliveryAddress}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Modal for changing order status */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold mb-4">
                            Change Status for Order #{selectedOrder._id}?</h2>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="border p-2 rounded w-full mb-4 outline-none"
                            >
                                <option value="">Select a new status</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            
                            <div className='flex justify-end gap-4'>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-400 duration-300 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleStatusChange(selectedOrder._id)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 duration-300 font-semibold"
                            >
                                Update Status
                            </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
}

export default DeliveryBoyDashboard;
