import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import LoginImage from '../assets/Mobile login-bro.svg'
import Loading from '../assets/Loading Blue.gif'


const DeliveryBoySignUp = () => {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
        username: '',
        contact: '',
        vehicleDetails: '',
        role: 'deliveryBoy',
        earnings: 0 // Set default role to deliveryBoy
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, email, password, username, contact, vehicleDetails, role } = signupInfo;

        // Basic validation
        if (!name || !email || !password || !username || !contact || !vehicleDetails || !role) {
            return handleError('All fields are required');
        }
        if (contact.length > 10) {
            return handleError('Contact number must be less than or equal to 10 digits');
        }

        try {
            const url = 'http://localhost:8080/auth/deliveryboysignup';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, username, contact, vehicleDetails, role })
            });

            const result = await response.json();
            const { success, message, error } = result;

            if (success) {
                handleSuccess(message);
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else if (error) {
                const details = error?.details[0]?.message;
                handleError(details || message);
            } else {
                handleError(message);
            }
        } catch (err) {
            handleError(err.message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-[80%] h-[80%] bg-white shadow-lg rounded-lg flex items-center">
                <div className='w-1/2'>
                <img src={LoginImage} alt="" /></div>
                <div className='py-10 w-1/2 px-20'>
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Delivery Boy Sign Up</h1>
                <form onSubmit={handleSignup}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            onChange={handleChange}
                            type="text"
                            name="name"
                            autoFocus
                            placeholder="Enter your name..."
                            value={signupInfo.name}
                            className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 outline-blue-300 focus:shadow-[0_0_8px_4px_rgba(147,197,253,0.5)]"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            onChange={handleChange}
                            type="text"
                            name="username"
                            placeholder="Enter your username..."
                            value={signupInfo.username}
                            className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 outline-blue-300 focus:shadow-[0_0_8px_4px_rgba(147,197,253,0.5)]"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            onChange={handleChange}
                            type="email"
                            name="email"
                            placeholder="Enter your email..."
                            value={signupInfo.email}
                            className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 outline-blue-300 focus:shadow-[0_0_8px_4px_rgba(147,197,253,0.5)]"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            onChange={handleChange}
                            type="password"
                            name="password"
                            placeholder="Enter your password..."
                            value={signupInfo.password}
                            className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 outline-blue-300 focus:shadow-[0_0_8px_4px_rgba(147,197,253,0.5)]"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input
                            onChange={handleChange}
                            type="text" // Changed to text to handle various formats
                            name="contact"
                            placeholder="Enter your contact number..."
                            value={signupInfo.contact}
                            className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 outline-blue-300 focus:shadow-[0_0_8px_4px_rgba(147,197,253,0.5)]"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="vehicleDetails" className="block text-sm font-medium text-gray-700">Vehicle Details</label>
                        <input
                            onChange={handleChange}
                            type="text"
                            name="vehicleDetails"
                            placeholder="Enter your vehicle details..."
                            value={signupInfo.vehicleDetails}
                            className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 outline-blue-300 focus:shadow-[0_0_8px_4px_rgba(147,197,253,0.5)]"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded shadow-md hover:bg-blue-600 duration-300"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600 font-semibold">
                    Already a Delivery Boy?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
};

export default DeliveryBoySignUp;
