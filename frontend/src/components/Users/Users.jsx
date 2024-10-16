import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import { BE_URL } from '../../config';


function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0); // New state for total user count
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        console.log('Role from localStorage:', role);

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
            console.log('Redirecting to login because isAdmin is false');
            navigate('/login');
            return;
        }

        const fetchUsers = async () => {
            console.log('Fetching users with token:', localStorage.getItem('token'));
            try {
                const response = await fetch(`${BE_URL}/auth/allusers`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();
                console.log('API response:', result);

                if (result.success) {
                    setUsers(result.data.users);
                    setTotalUsers(result.data.totalUsers); // Set total user count
                } else {
                    setError(result.message || 'Failed to fetch users');
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Internal server error');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isAdmin, navigate]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`${BE_URL}/auth/deleteuser/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();

                if (result.success) {
                    setUsers(users.filter(user => user._id !== id));
                } else {
                    setError(result.message || 'Failed to delete user');
                }
            } catch (err) {
                console.error('Error deleting user:', err);
                setError('Internal server error');
            }
        }
    };

    if (isAdmin === null || loading) {
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
                    <h1 className='text-center text-4xl font-bold'>All Users</h1>
                    <p className='text-center text-lg'>Total Users: {totalUsers}</p> {/* Display total users */}
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200 ">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user._id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(user._id)}
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

export default Users;
