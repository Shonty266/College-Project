import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import login from '../assets/Mobile login-bro.svg'
import Loading from '../assets/Loading Blue.gif'


function AdminSignup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, email, password } = signupInfo;
        if (!name || !email || !password) {
            return handleError('Name, email, and password are required');
        }
        try {
            const url = `http://localhost:8080/auth/adminsignup`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupInfo)
            });
            const result = await response.json();
            const { success, message, error } = result;
            if (success) {
                handleSuccess(message);
                setTimeout(() => {
                    navigate('/adminlogin');
                }, 1000);
            } else if (error) {
                handleError(error);
            } else if (!success) {
                handleError(message);
            }
        } catch (err) {
            handleError('Internal server error');
        }
    };

    return (
        <div className='flex justify-center items-center h-screen bg-gray-100'>
            <div className='w-[80%] h-[80%] bg-white shadow-md flex'>
                {/* Left side with image */}
                <div className='w-[50%] h-full'>
                    <img
                        src={login}  // Replace with your image URL
                        alt='Signup visual'
                        className='w-full h-full object-cover'
                    />
                </div>

                {/* Right side with form */}
                <div className='w-[50%] flex flex-col items-center py-10'>
                    <h1 className='text-3xl text-black font-bold py-4'>Admin Sign Up</h1>
                    <form onSubmit={handleSignup} className='w-[80%]'>
                        <div className='flex flex-col py-4'>
                            <label htmlFor='name'>Name</label>
                            <input
    onChange={handleChange}
    type='text'
    name='name'
    placeholder='Enter your name...'
    value={signupInfo.name}
    className='border-2 pl-4 rounded-lg py-2 border-gray-300 outline-none'
/>

                        </div>
                        <div className='flex flex-col py-4'>
                            <label htmlFor='email'>Email</label>
                            <input
    onChange={handleChange}
    type='text'
    name='name'
    placeholder='Enter your name...'
    value={signupInfo.name}
    className='border-2 pl-4 rounded-lg py-2 border-gray-300 outline-none'
/>

                        </div>
                        <div className='flex flex-col py-4'>
                            <label htmlFor='password'>Password</label>
                            <input
    onChange={handleChange}
    type='password'
    name='password'
    placeholder='Enter your password...'
    value={signupInfo.password}
    className='border-2 pl-4 rounded-lg py-2 border-gray-300 outline-none'
/>

                        </div>
                        <div className='text-center font-bold text-xl bg-blue-500 hover:bg-blue-600 duration-300 text-white py-2 rounded-lg mb-2'>
                            <button type='submit'>Signup</button>
                        </div>
                        <span className='font-semibold flex justify-center mt-4'>Already an Admin?
                            <Link to="/login" className='text-blue-600 hover:underline pl-2'>Login</Link>
                        </span>
                    </form>

                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default AdminSignup;
