import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar/AdminNavbar';
import DefaultImage from '../assets/user.jpg';
import Loading from '../assets/Loading Blue.gif'
import { FaTimes } from 'react-icons/fa';


function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // State to control delete modal visibility
    const [userToDelete, setUserToDelete] = useState(null); // State to hold the user to delete
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'admin') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin === null) {
            return;
        }

        if (isAdmin === false) {
            navigate('/login');
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:8080/auth/allusers', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();

                if (result.success) {
                    setUsers(result.data.users);
                    setTotalUsers(result.data.totalUsers);
                } else {
                    setError(result.message || 'Failed to fetch users');
                }
            } catch (err) {
                setError('Internal server error');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isAdmin, navigate]);

    const handleDelete = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true); // Open the delete modal
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                const response = await fetch(`http://localhost:8080/auth/deleteuser/${userToDelete._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();

                if (result.success) {
                    setUsers(users.filter(user => user._id !== userToDelete._id));
                    setUserToDelete(null); // Reset user to delete
                } else {
                    setError(result.message || 'Failed to delete user');
                }
            } catch (err) {
                setError('Internal server error');
            }
            setDeleteModalOpen(false); // Close the modal
        }
    };

    if (isAdmin === null || loading) {
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
            <div className='bg-gray-100 w-[80%] min-h-[calc(100vh-130px)]  right-0 absolute top-[120px] px-10 py-10'>
                <div className="flex justify-between mb-4 items-center">
                    <h1 className='text-center text-3xl font-bold'>All Users</h1>
                    <p className='text-center text-xl font-bold'>Total Users: {totalUsers}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {users.slice().reverse().map((user) => (
                        <div key={user._id} className="bg-white shadow-md rounded-lg p-6 flex justify-between">
                            <div className="flex items-center space-x-4">
                                <img 
                                    src={user.profileImage || DefaultImage} 
                                    alt={`${user.name}'s profile`} 
                                    className="w-16 h-16 rounded-full object-cover border-2"
                                />
                                <div className="flex-1 font-semibold">
                                    <h3 className="text-2xl font-bold text-gray-900">Name: {user.name}</h3>
                                    <p className="text-gray-500 text-sm">Username: {user.username}</p>
                                    <p className="text-gray-500 text-sm">Email: {user.email}</p>
                                    <p className="text-gray-500 text-sm">Contact Number: {user.contact}</p>
                                </div>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleDelete(user)}
                                    className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 duration-300 rounded font-semibold"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delete Modal */}
            {userToDelete && deleteModalOpen && (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 relative">
            {/* Cross icon to close the modal */}
            <button
                onClick={() => setDeleteModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition duration-200"
                aria-label="Close Modal"
            >
                <FaTimes className="h-5 w-5" /> {/* Adjust size as necessary */}
            </button>

            <h2 className="text-2xl font-semibold mb-2">Confirm Delete</h2>
            <p>Are you sure you want to delete the user "{userToDelete.name}"?</p>

            <div className="flex justify-end gap-4 mt-4">
                <button
                    onClick={confirmDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 duration-300 font-semibold"
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

export default Users;
