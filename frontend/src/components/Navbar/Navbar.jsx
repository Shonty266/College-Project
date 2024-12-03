import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { FaBoxes } from 'react-icons/fa';
import { RiArrowDropDownLine } from 'react-icons/ri';
import userImg from '../../assets/user.jpg'; // Adjusted import to avoid conflict
import logo from '../../assets/LOGO.svg';
import { CgProfile } from "react-icons/cg";
import { TbEdit } from "react-icons/tb";
import { isTokenExpired } from '../../../utils'; // Import the utility function

const Navbar = () => {
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserId = localStorage.getItem('id');
                const token = localStorage.getItem('token');

                // Check if token is expired
                if (isTokenExpired(token)) {
                    handleLogout(); // Automatically log out if token is expired
                    return;
                }

                if (storedUserId) {
                    setUserId(storedUserId);
                    const response = await fetch(`http://localhost:8080/auth/userprofile/${storedUserId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const result = await response.json();

                    if (result.success) {
                        setLoggedInUser(result.data);
                        setError(null);
                    } else {
                        setError(result.message || 'Failed to fetch user data');
                    }
                } else {
                    setError('No user ID found in local storage');
                }
            } catch (err) {
                setError('Error fetching user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('token');
            if (isTokenExpired(token)) {
                handleLogout(); // Automatically log out if token expires
            }
        };

        // Check token expiration every 10 seconds
        const intervalId = setInterval(checkToken, 10000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('id');
        localStorage.removeItem('email'); 
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
    };

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className='flex items-center justify-between w-full px-10 bg-white h-[90px] border-b-4 z-50'>
            <div className='w-[25%] flex justify-center'>
                <Link to='/home'>
                <img src={logo} alt="Logo" className='h-16' /></Link>
            </div>
            <div className='w-full flex items-center py-2 justify-between px-10' ref={menuRef}>
                <div>
                    <NavLink
                        to="/home"
                        className={({ isActive }) =>
                            `text-lg ${isActive ? 'underline underline-offset-4 decoration-black font-bold' : ''}`
                        }
                    >
                        Rent
                    </NavLink>
                </div>
                <div className='flex justify-between gap-4 items-center'>
                    <div className='flex items-center gap-1 text-md font-semibold'>
                        <NavLink
                            to={`/orderhistory`}
                            className={({ isActive }) =>
                                `text-lg flex gap-2 items-center ${isActive ? 'underline underline-offset-4 decoration-black font-bold' : ''}`
                            }
                        >
                           <FaBoxes /> My Orders
                        </NavLink>
                    </div>
                    <div className='flex items-center'>
                        <div className='w-10 h-10 border-2 rounded-full'>
                            <img
                                src={loggedInUser?.profileImage || userImg}
                                alt="User Icon"
                                className='w-full h-full object-cover rounded-full'
                            />
                        </div>
                        <RiArrowDropDownLine className='text-3xl cursor-pointer ml-2' onClick={toggleMenu} />
                    </div>
                </div>
                {isMenuOpen && (
                    <div className="menu bg-white rounded-lg border-gray-300 border-2 gap-2 flex flex-col py-2 px-2 absolute right-8 top-20 z-50">
                        <NavLink
                            to='/userprofile'
                            className={({ isActive }) =>
                                `text-lg py-2 hover:bg-blue-500 px-2 rounded-lg hover:text-white duration-200 flex items-center gap-2 ${isActive ? 'bg-blue-100 hover:bg-blue-500 px-2 rounded-lg  hover:text-white duration-200  decoration-black font-bold' : ''}`
                            }
                        >
                         <CgProfile />   Profile
                        </NavLink>
                        <NavLink
                            to='/changepassword'
                            className={({ isActive }) =>
                                `text-lg py-2 hover:bg-blue-500 px-2 rounded-lg hover:text-white duration-200 flex items-center gap-2  ${isActive ? 'bg-blue-100 hover:bg-blue-500 px-2 rounded-lg  hover:text-white duration-200  decoration-black font-bold' : ''}`
                            }
                        >
                        <TbEdit />  Change Password
                        </NavLink>
                        <Link
                            to='/login'
                            onClick={handleLogout}
                            className='bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 my-2 duration-300 text-center font-semibold'
                        >
                            Logout
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
