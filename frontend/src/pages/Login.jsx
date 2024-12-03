import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import LoginImage from '../assets/Mobile login-bro.svg'
import Loading from '../assets/Loading White.gif'


function Login() {
    const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;

        if (!email || !password) {
            return handleError('Email and password are required');
        }

        setIsLoading(true);
        try {
            const url = 'http://localhost:8080/auth/login';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginInfo),
            });

            const result = await response.json();
            const { success, message, jwtToken, name, role, redirectUrl, id } = result;

            if (response.ok && success) {
                handleSuccess(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                localStorage.setItem('role', role);
                localStorage.setItem('id', id); 
                localStorage.setItem('email', email); 

                setTimeout(() => navigate(redirectUrl), 1000);
            } else {
                handleError(message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error(err);
            handleError('An unexpected error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex justify-center items-center h-screen bg-gray-100'>

<div>

</div>



            <div className='w-[80%] h-[80%] bg-white shadow-md rounded-lg flex items-center'>
                <div className='w-1/2' >
                <img src={LoginImage} alt="" />

                </div>
                <div className='w-1/2 flex flex-col justify-start px-20'>
                <h1 className='text-3xl text-black font-bold pb-4 text-center'>Login</h1>
                <form onSubmit={handleLogin}>
                    <div className='flex flex-col'>
                        <label htmlFor='email' className='text-gray-900 text-lg'>Email</label>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            placeholder='Enter your email...'
                            value={loginInfo.email}
                            className='border-2 pl-4 rounded-lg py-2 border-gray-300 outline-blue-300 focus:shadow-[0_0_8px_4px_rgba(147,197,253,0.5)]'
                        />
                    </div>
                    <div className='flex flex-col py-4'>
                        <label htmlFor='password' className='text-gray-900 text-lg'>Password</label>
                        <input
                            onChange={handleChange}
                            type='password'
                            name='password'
                            placeholder='Enter your password...'
                            value={loginInfo.password}
                            className='border-2 pl-4 py-2 rounded-lg border-gray-300 outline-blue-300 focus:shadow-[0_0_8px_4px_rgba(147,197,253,0.5)]'
                        />
                    </div>
                    <div >
                    <button
    type='submit'
    disabled={isLoading}
    className='w-full text-center font-semibold text-md bg-blue-500 hover:bg-blue-600 duration-300 text-white py-2 rounded mb-2 flex items-center justify-center'
>
    {isLoading && <img src={Loading} alt="Loading" className="w-5 h-5 mr-2" />} {/* Add GIF here */}
    {isLoading ? 'Logging in...' : 'Login'}
</button>

                    </div>
                    <span className='block text-center mt-4 font-semibold text-gray-600'>Don't have an account? 
                        <Link to='/signup' className='text-blue-600 hover:underline pl-2'>Signup</Link>
                    </span>
                </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Login;