import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import { handleError, handleSuccess } from '../../utils';
import LoginImage from '../assets/Mobile login-bro.svg';
import Loading from '../assets/Loading White.gif' 
import { FaTimes } from 'react-icons/fa'; // or any other icon you prefer

// import Loading from '../assets/Loading Blue.gif'


function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
        username: '',
        role: 'user'
    });
    const [otp, setOtp] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state
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
        const { name, email, password, username } = signupInfo;

        if (!name || !email || !password || !username) {
            return handleError('Name, email, password, and username are required');
        }

        setLoading(true); // Start loading

        try {
            const url = 'http://localhost:8080/auth/signup'; // Updated API endpoint
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, username, role: signupInfo.role })
            });

            const result = await response.json();

            if (response.ok) {
                handleSuccess(result.message);
                setShowOtpModal(true); // Show OTP modal after successful signup
            } else {
                handleError(result.message); // Display the error message returned by the server
            }

        } catch (err) {
            handleError(err.message); // Display any unexpected errors (like network issues)
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const verifyOtp = async () => {
        setLoading(true); // Start loading

        try {
            const url = 'http://localhost:8080/auth/verifysignup'; // API endpoint for OTP verification
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: signupInfo.email, otp }) // Send email and OTP to backend
            });

            const result = await response.json();
            console.log("Verification Result:", result); // Debug log

            if (response.ok && result.success) {
                toast.success(result.message); // Show success message from the server
                setShowOtpModal(false); // Close the OTP modal

                // Delay navigation by 5 seconds
                setTimeout(() => {
                    navigate('/login'); // Redirect to the login page
                }, 5000); // 5-second delay (5000 milliseconds)
            } else {
                toast.error('An error occurred during OTP verification'); // Show error message from the server
            }
        } catch (err) {
            console.error('Error during OTP verification:', err); // Debug log
            toast.error('An error occurred during OTP verification'); // Show a generic error message
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        // Cleanup the interval when the component unmounts
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            setShowOtpModal(false); // Close the modal when OTP expires
        }
    }, [timeLeft]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-[80%] h-[80%] bg-white shadow-lg rounded-lg flex items-center">
                <div className='w-1/2'>
                    <img src={LoginImage} alt="Login" />
                </div>
                <div className='w-1/2 px-20'>
                    <h1 className="text-3xl font-bold text-center text-gray-800 pb-4">Sign Up</h1>
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
                                className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 focus:outline-none"
                            />
                        </div>
                        <button
    type="submit"
    className={`w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded shadow-md hover:bg-blue-600 duration-300 ${loading ? 'bg-blue-400' : ''}`} // Duller color only on loading
    disabled={loading} // Disable button while loading
>
    {loading ? (
        <div className="flex items-center justify-center">
            <img
                src={Loading} // Replace with the actual path to your loading GIF
                alt="Loading"
                className="h-6 w-6 mr-3" // Adjust the size as needed
            />
            Signing Up...
        </div>
    ) : (
        'Sign Up'
    )}
</button>

                    </form>

                    <p className="mt-4 text-center text-gray-600 font-semibold">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                    </p>
                    <p className="mt-4 text-center text-gray-600 font-semibold">
                        Become a Delivery Boy?{' '}
                        <Link to="/deliveryboysignup" className="text-blue-600 hover:underline">SignUp Here</Link>
                    </p>
                </div>
                <ToastContainer />
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative bg-white rounded-lg p-8 shadow-xl max-w-md w-full">
                        {/* Cross (close) button */}
                        

<div className='flex justify-between items-center'>
<div><h2 className="text-2xl font-semibold text-center mb-4">Enter OTP</h2></div>
    <div><button
    onClick={() => setShowOtpModal(false)}
    className="text-gray-400 hover:text-gray-600 transition duration-200"
    aria-label="Close Modal"
>
    <FaTimes className="h-5 w-5" /> {/* You can adjust the size as needed */}
</button></div>
                        
                        </div>
                        <p className="mb-4">We have sent an OTP to your email. Please enter it below:</p>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="block w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 outline-none"
                            placeholder="Enter OTP"
                        />
                        <div className='flex justify-end'>
                        <button
    onClick={verifyOtp}
    className={`mt-4 py-2 px-4 bg-blue-500 text-white font-semibold rounded shadow-md hover:bg-blue-600 duration-300 ${loading ? 'bg-blue-400' : ''}`} // Duller color only on loading
    disabled={loading} // Disable button while loading
>
    {loading ? (
        <div className="flex items-center justify-center opacity-70"> {/* Adjust opacity for loading */}
            <img
                src={Loading} // Replace with the actual path to your loading GIF
                alt="Loading"
                className="h-6 w-6 mr-3" // Adjust size as needed
            />
            Verifying...
        </div>
    ) : (
        'Verify OTP'
    )}
</button>


                        </div>
                        
                    </div>
                </div>
            )}
        </div>
    );
}

export default Signup;
