import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar/AdminNavbar';
import { LuPackageCheck, LuPackageOpen } from "react-icons/lu";
import { PiPackageFill } from "react-icons/pi";
import { FaUsers } from "react-icons/fa";
import { CiDeliveryTruck } from "react-icons/ci";
import { BsBoxSeam } from "react-icons/bs";
import { RiBox3Line } from "react-icons/ri";
import { PiUsersThreeLight } from "react-icons/pi";
import { BsBox } from "react-icons/bs";
import Calendar from './Calender';
import Loading from '../assets/Loading Blue.gif'
import '../components/stylesheet/style.css';

function AdminDashboard() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [adminId, setAdminId] = useState('');
    const [adminRole, setAdminRole] = useState('');
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalDeliveryBoys, setTotalDeliveryBoys] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [completedOrders, setCompletedOrders] = useState(0);
    const [runningOrders, setRunningOrders] = useState(0);
    const [cancelledOrders, setCancelledOrders] = useState(0);
    const [orders, setOrders] = useState([]); // State for orders
    const [loading, setLoading] = useState(true); // State for loading
    const [error, setError] = useState(null); // State for error
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        const storedAdminId = localStorage.getItem('id');
        const storedAdminRole = localStorage.getItem('role');

        setLoggedInUser(storedUser || '');
        setAdminId(storedAdminId || '');
        setAdminRole(storedAdminRole || '');

        if (storedAdminRole !== 'admin') {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Fetch user count
                const userResponse = await fetch('http://localhost:8080/auth/fetchusercount', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const userResult = await userResponse.json();

                if (userResult.success) {
                    setTotalUsers(userResult.data.totalUsers);
                } else {
                    console.error(userResult.message || 'Failed to fetch user count');
                }

                // Fetch delivery boy count
                const deliveryBoyResponse = await fetch('http://localhost:8080/auth/fetchdeliveryboycount', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const deliveryBoyResult = await deliveryBoyResponse.json();

                if (deliveryBoyResult.success) {
                    setTotalDeliveryBoys(deliveryBoyResult.data.totalDeliveryBoys);
                } else {
                    console.error(deliveryBoyResult.message || 'Failed to fetch delivery boy count');
                }

                // Fetch order counts
                const orderResponse = await fetch('http://localhost:8080/auth/fetchordercount', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const orderResult = await orderResponse.json();

                if (orderResult.success) {
                    setTotalOrders(orderResult.data.totalOrders);
                    setCompletedOrders(orderResult.data.deliveredOrders);
                    setRunningOrders(orderResult.data.shippedOrders);
                    setCancelledOrders(orderResult.data.cancelledOrders);
                } else {
                    console.error(orderResult.message || 'Failed to fetch order count');
                }

                // Fetch product count
                const productResponse = await fetch('http://localhost:8080/auth/fetchproductscount', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const productResult = await productResponse.json();

                if (productResult.success) {
                    setTotalProducts(productResult.data.totalProducts);
                } else {
                    console.error(productResult.message || 'Failed to fetch product count');
                }

            } catch (err) {
                console.error('Error fetching counts:', err);
            }
        };

        fetchCounts();
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true); // Set loading state
            try {
                const response = await fetch('http://localhost:8080/auth/allorders', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
    
                const result = await response.json();
    
                if (result.success) {
                    // Directly set orders without sorting
                    setOrders(result.data);
                } else {
                    setError(result.message || 'Failed to fetch orders');
                }
            } catch (err) {
                setError('Internal server error. Please try again later.');
            } finally {
                setLoading(false); // Reset loading state
            }
        };
    
        fetchOrders();
    }, []); // Fetch orders only once on component mount
    
    
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    
    // Get the first day of the month and total days in the month
    const firstDay = new Date(year, new Date().getMonth(), 1).getDay();
    const totalDays = new Date(year, new Date().getMonth() + 1, 0).getDate();
    
    // Create an array to fill the calendar
    const calendarDays = Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} className="w-12 h-12"></div>);
    for (let day = 1; day <= totalDays; day++) {
        calendarDays.push(
            <div key={day} className="w-12 h-12 flex items-center justify-center border border-gray-300">
                {day}
            </div>
        );
    }
   

    if (loading) {
        return <div className="text-lg w-full h-screen flex justify-center items-center"><img src={Loading} alt="" className='w-42 h-42' /></div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <AdminNavbar />
            <div className='bg-gray-100 w-[80%] min-h-[calc(100vh-120px)] right-0 absolute top-[120px]'>
                <div className='flex justify-evenly mt-10'>
                    <div className='bg-blue-500 py-4 px-4 rounded-lg flex gap-4 shadow-md'>
                        <PiPackageFill className='text-4xl p-1 bg-blue-100 rounded-lg' />
                        <div>
                            <h1 className='text-lg font-semibold text-white'>Total Orders</h1>
                            <h3 className='text-4xl font-bold text-white mt-2'>{totalOrders}</h3>
                            <h3 className='font-medium text-white'>All Running and Completed Orders</h3>
                        </div>
                    </div>
                    <div className='bg-white py-4 px-4 rounded-lg flex gap-4 shadow-md'>
                        <LuPackageCheck className='text-4xl p-1 bg-green-100 rounded-lg' />
                        <div>
                            <h1 className='text-lg font-semibold'>Completed Orders</h1>
                            <h3 className='text-4xl font-bold mt-2'>{completedOrders}</h3>
                            <h3 className='font-medium'>All Completed Orders</h3>
                        </div>
                    </div>
                    <div className='bg-white py-4 px-4 rounded-lg flex gap-4 shadow-md'>
                        <LuPackageOpen className='text-4xl p-1 bg-yellow-100 rounded-lg' />
                        <div>
                            <h1 className='text-lg font-semibold'>Running Orders</h1>
                            <h3 className='text-4xl font-bold mt-2'>{runningOrders}</h3>
                            <h3 className='font-medium'>All Running Orders</h3>
                        </div>
                    </div>
                    <div className='bg-white py-4 px-4 rounded-lg flex gap-4 shadow-md'>
                        <RiBox3Line className='text-4xl p-1 bg-red-100 rounded-lg' />
                        <div>
                            <h1 className='text-lg font-semibold'>Cancelled Orders</h1>
                            <h3 className='text-4xl font-bold mt-2'>{cancelledOrders}</h3>
                            <h3 className='font-medium'>All Cancelled Orders</h3>
                        </div>
                    </div>
                </div>
                <div className='flex justify-between mt-10 items-start'>
                   <div>
                    <div>
                    <div className='flex pl-10 gap-6 '>
                    <div className='px-10 bg-white py-4 flex items-center gap-4 rounded-lg shadow-md'>
                        <div><PiUsersThreeLight className='text-4xl' /></div>
                        <div className='text-center'>
                            <h2 className='text-lg font-semibold'>Total Users</h2>
                            <h3 className='text-4xl font-bold'>{totalUsers}</h3>
                        </div>
                    </div>
                    <div className='px-10 bg-white py-4 flex items-center gap-4 rounded-lg shadow-md'>
                        <div><CiDeliveryTruck className='text-4xl' /></div>
                        <div className='text-center'>
                            <h2 className='text-lg font-semibold'>Total Delivery Boys</h2>
                            <h3 className='text-4xl font-bold'>{totalDeliveryBoys}</h3>
                        </div>
                    </div>
                    <div className='px-10 bg-white py-4 flex items-center gap-4 rounded-lg shadow-md'>
                        <div><BsBoxSeam className='text-4xl' /></div>
                        <div className='text-center'>
                            <h2 className='text-lg font-semibold'>Total Products</h2>
                            <h3 className='text-4xl font-bold'>{totalProducts}</h3>
                        </div>
                    </div>
                </div>
                    </div>
                    
                    <div>
                    <div className='mt-10 px-4 bg-white ml-10 py-4 mb-4 rounded shadow-md'>
    <h1 className='text-3xl font-bold'>Latest Orders</h1>
    <hr className='h-1 bg-gray-200' />

    {/* Scrollable container for orders with hidden scrollbar */}
    <div className='mt-4 max-h-40 overflow-y-auto scrollbar-hidden'> 
        <div className='grid grid-cols-1 gap-4'>
            {orders && orders.length > 0 ? (
                [...orders].slice(-3).reverse().map(order => (
                    <div key={order._id} className='bg-white text-sm rounded p-4 border'>
                        <div className='flex justify-between'>
                            <h2 className='font-bold text-lg'>Order ID: #{order._id}</h2>
                            <div>
                                <span className={`ml-2 px-2 py-1 rounded font-semibold
                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-500' : 
                                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-500' : 
                                  order.status === 'Cancelled' ? 'bg-red-100 text-red-500' : 
                                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-500' : 
                                  'bg-gray-500'}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                        <div className='font-semibold text-gray-600 flex justify-between'>
                            <div>
                                <p className='mt-2'>User ID: #{order.customerId}</p>
                                <p>Product Name: {order.productName}</p>
                            </div>
                            <div className='text-right'>
                                <p>Created At: {new Date(order.bookingDate).toLocaleString()}</p>
                                <p>Order Price ₹ {order.price}</p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className=' rounded-lg flex justify-center items-center'>
                    <h2 className='font-bold text-lg'>No orders yet!</h2>
                </div>
            )}
        </div>
    </div>
</div>




                        
                    </div>
                    </div>
                    
                    
                    <div className='flex flex-col justify-center mr-10'>
                        
                    <Calendar />
                        
                    </div>

                </div>
                
                



            </div>
        </div>
    );
}

export default AdminDashboard;
