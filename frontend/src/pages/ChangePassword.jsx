import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import Loading from '../assets/Loading Blue.gif'


const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate(); // Initialize the navigate function

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userId = localStorage.getItem('id'); // Get the user ID from local storage
            const response = await fetch('http://localhost:8080/auth/changepassword', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: userId, // Include the user ID in the request body
                    oldPassword,
                    newPassword,
                }),
            });

            const result = await response.json();

            if (result.success) {
                handleSuccess(result.message);
                setOldPassword('');
                setNewPassword('');

                // Delay navigation by 5 seconds
                setTimeout(() => {
                    navigate('/home');
                }, 5000);
            } else {
                handleError(result.message);
            }
        } catch (err) {
            console.error('Error changing password:', err);
            handleError('Failed to change password. Please try again later.');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-gray-100">
                <form 
                    onSubmit={handleSubmit} 
                    className="max-w-lg w-full bg-white rounded-lg shadow-md"
                >
                  <div className='border py-6 px-6'>
                    <h2 className="text-3xl font-bold  text-gray-800">Change Password?</h2>
                  
                    </div>

                    {/* Old Password Input */}
                    <div className="py-3 px-6">
                        <label htmlFor="oldPassword" className="block text-md font-semibold text-gray-500">
                            Old Password
                        </label>
                        <input
                            type="password"
                            id="oldPassword"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            placeholder="Enter your old password"
                            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none sm:text-sm"
                        />
                    </div>

                    {/* New Password Input */}
                    <div className="py-3 px-6">
                        <label htmlFor="newPassword" className="block text-md font-semibold text-gray-500">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Enter your new password"
                            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none sm:text-sm"
                        />
                    </div>

                   <div className='px-6 pt-3'>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out text-lg focus:outline-none"
                    >
                        Change Password
                    </button>
                    <p className="my-4 text-sm text-center text-gray-500">
                        Ensure your new password is strong and secure.
                    </p>
                    </div>

                    {/* Additional Information */}
                    
                </form>
            </div>

            <ToastContainer />
        </div>
    );
};

export default ChangePassword;
