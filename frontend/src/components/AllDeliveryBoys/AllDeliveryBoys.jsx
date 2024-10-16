import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import { BE_URL } from '../../config';


function AllDeliveryBoys() {
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [deliveryBoyCount, setDeliveryBoyCount] = useState(0); // State to store the count of delivery boys
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');

        if (role !== 'admin') {
            navigate('/login');
            return;
        }
    }, [navigate]);

    useEffect(() => {
        const fetchDeliveryBoys = async () => {
            try {
                const response = await fetch(`${BE_URL}/auth/alldeliveryboys`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();

                if (result.success) {
                    setDeliveryBoys(result.data);
                    setDeliveryBoyCount(result.count); // Set the count of delivery boys
                } else {
                    setError(result.message || 'Failed to fetch delivery boys');
                }
            } catch (err) {
                setError('Internal server error');
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveryBoys();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this delivery boy?')) {
            try {
                const response = await fetch(`${BE_URL}/auth/deletedeliveryboy/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();

                if (result.success) {
                    setDeliveryBoys(deliveryBoys.filter(boy => boy._id !== id));
                    setDeliveryBoyCount(deliveryBoyCount - 1); // Decrease the count after deletion
                } else {
                    setError(result.message || 'Failed to delete delivery boy');
                }
            } catch (err) {
                setError('Internal server error');
            }
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <div className='relative z-50'>
                <AdminNavbar />
            </div>
        
            <div className='w-[80%] bg-gray-100 absolute right-0 px-10 py-10'>
                <div className="flex justify-between mb-4 items-center">
                    <h1 className='text-center text-4xl font-bold'>All Delivery Boys</h1>
                    <p className='text-center text-lg font-medium'>Total Delivery Boys: {deliveryBoyCount}</p> {/* Display count */}
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {deliveryBoys.map((boy) => (
                            <tr key={boy._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{boy._id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{boy.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{boy.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{boy.assignedOrders ? boy.assignedOrders : 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{boy.vehicleDetails}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(boy._id)}
                                        className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AllDeliveryBoys;
