import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar/AdminNavbar';
import Loading from '../assets/Loading Blue.gif'
import { FaTimes } from 'react-icons/fa';


function AllDeliveryBoys() {
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [deliveryBoyCount, setDeliveryBoyCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // State for delete modal visibility
    const [boyToDelete, setBoyToDelete] = useState(null); // State for the delivery boy to delete
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
                const response = await fetch('http://localhost:8080/auth/alldeliveryboys', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();

                if (result.success) {
                    setDeliveryBoys(result.data);
                    setDeliveryBoyCount(result.count);
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

    const handleDelete = (boy) => {
        setBoyToDelete(boy);
        setDeleteModalOpen(true); // Open delete modal
    };

    const confirmDelete = async () => {
        if (boyToDelete) {
            try {
                const response = await fetch(`http://localhost:8080/auth/deletedeliveryboy/${boyToDelete._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();

                if (result.success) {
                    setDeliveryBoys(deliveryBoys.filter(boy => boy._id !== boyToDelete._id));
                    setDeliveryBoyCount(deliveryBoyCount - 1);
                    setBoyToDelete(null); // Reset the delivery boy to delete
                } else {
                    setError(result.message || 'Failed to delete delivery boy');
                }
            } catch (err) {
                setError('Internal server error');
            }
            setDeleteModalOpen(false); // Close modal
        }
    };

    if (loading) {
        return <div className="text-lg w-full h-screen flex justify-center items-center"><img src={Loading} alt="" className='w-42 h-42' /></div>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <div className='relative z-50'>
                <AdminNavbar />
            </div>

            <div className='bg-gray-100 w-[80%] min-h-[calc(100vh-130px)] right-0 absolute top-[120px] px-10 py-10'>
                <div className="flex justify-between mb-4 items-center">
                    <h1 className='text-center text-3xl font-bold'>All Delivery Boys</h1>
                    <p className='text-center text-xl font-bold'>Total Delivery Boys: {deliveryBoyCount}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {deliveryBoys.map((boy) => (
                        <div key={boy._id} className="bg-white shadow-lg rounded-lg p-6">
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900">Delivery Boy Name: {boy.name}</h3>
                                    <button
                                        onClick={() => handleDelete(boy)}
                                        className="bg-red-500 text-white px-4 py-2 font-semibold rounded hover:bg-red-600 transition duration-300"
                                    >
                                        Delete
                                    </button>
                                </div>

                                <p className="text-md text-gray-500 font-semibold">Username: {boy.username}</p>
                                <p className="text-md text-gray-500 font-semibold">Email: {boy.email}</p>
                                <p className="text-md text-gray-500 font-semibold">Contact Number: {boy.contact}</p>
                                <p className="text-md text-gray-500 font-semibold">Assigned Orders: {Array.isArray(boy.assignedOrders) ? boy.assignedOrders.length : 0}</p>
                                <p className="text-md text-gray-500 font-semibold">Vehicle Details: {boy.vehicleDetails}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delete Modal */}
            {boyToDelete && deleteModalOpen && (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 relative">
            {/* Cross icon to close the modal */}
            <button
                onClick={() => setDeleteModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition duration-200"
                aria-label="Close Modal"
            >
                <FaTimes className="h-5 w-5" /> {/* Adjust size if necessary */}
            </button>

            <h2 className="text-2xl font-semibold mb-2">Confirm Delete</h2>
            <p>Are you sure you want to delete the delivery boy "{boyToDelete.name}"?</p>
            
            <div className="flex justify-end gap-4 mt-4">
                <button
                    onClick={confirmDelete}
                    className="bg-red-500 text-white px-4 py-2 font-semibold rounded-md hover:bg-red-600 transition duration-300"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    );
}

export default AllDeliveryBoys;
