import React, { useEffect, useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { handleError, handleSuccess } from '../../../utils';
import { IoChatboxEllipsesSharp } from "react-icons/io5";
import { IoIosNotifications } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import userImage from '../../assets/user.jpg'; // renamed for clarity
import logo from '../../assets/LOGO.svg';
import { CiLogout } from "react-icons/ci";

const DeliveryBoyNavbar = () => {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [deliveryBoyId, setDeliveryBoyId] = useState('');
    const [deliveryBoyRole, setDeliveryBoyRole] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        const storedDeliveryBoyId = localStorage.getItem('id');
        const storedDeliveryBoyRole = localStorage.getItem('role');

        setLoggedInUser(storedUser || 'User');
        setDeliveryBoyId(storedDeliveryBoyId || '');
        setDeliveryBoyRole(storedDeliveryBoyRole || 'Delivery Boy');
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        handleSuccess('User Logged out');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    const linkStyles = "flex items-center text-lg gap-2 px-4 py-2 rounded-md text-gray-600";
    const activeLinkStyles = "bg-blue-500 text-white font-semibold";

    useEffect(() => {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        setCurrentDate(formattedDate);
    }, []);

    return (
        <div className='w-full'>
            <div className='flex py-8 bg-gray-100'>
                <div className='w-[20%]'>
                    <div className='navbar'>
                        <div className='fixed top-0 w-[20%] h-screen bg-white flex flex-col px-10 gap-4 py-10 border-r-2'>
                            <div className='flex justify-center items-center mb-10 '>
                                <Link to='/deliveryboydashboard'>
                                    <img src={logo} alt="Logo"/>
                                </Link>
                            </div>

                            <NavLink
                                to='/deliveryboydashboard'
                                className={({ isActive }) =>
                                    `${linkStyles} ${isActive ? activeLinkStyles : ''}`
                                }
                            >
                                <MdSpaceDashboard />Dashboard
                            </NavLink>

                            <NavLink
                                to={`/assignedorders/${deliveryBoyId}`}
                                className={({ isActive }) =>
                                    `${linkStyles} ${isActive ? activeLinkStyles : ''}`
                                }
                            >
                                <IoChatboxEllipsesSharp /> Assigned Orders
                            </NavLink>

                            <hr className='h-[2px] bg-gray-300 w-[90%]' />

                            <div className='mt-auto flex items-center gap-2'>
                                <NavLink
                                    to='/login'
                                    onClick={handleLogout}
                                    className='text-gray-600 px-4 py-2 rounded-lg hover:text-gray-900 my-2 text-center font-semibold flex items-center gap-2 text-lg'
                                >
                                    <CiLogout className='text-gray-600' />
                                    Logout
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex justify-between items-center w-[80%] fixed h-[120px] px-10 bg-white z-50 border-b-2 border-gray-300 right-0 top-0'>
                    <div>
                        <h1 className='text-blue-500 font-bold text-3xl'>Delivery Boy Dashboard</h1>
                        <h3 className='font-semibold text-gray-600' >{currentDate}</h3>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='flex gap-2 bg-gray-200 items-center py-2 px-4 w-80 rounded-full'>
                            <FaSearch className='text-gray-400' />
                            <input
                                type="text"
                                placeholder='Search'
                                className='bg-transparent w-full outline-none h-full'
                            />
                        </div>

                        <button className='text-2xl bg-gray-200 p-2 rounded-full'>
                            <IoIosNotifications className='text-gray-400' />
                        </button>

                        <div className='flex items-center'>
                            <Link to={`/deliveryboyprofile/${deliveryBoyId}`}>
                                <img src={userImage} alt="User" className="w-10 h-10 rounded-full" />
                            </Link>
                            <h1 className="font-semibold pl-2 flex flex-col">
                                <span className="font-bold text-lg">{loggedInUser}</span>
                                <span className="font-semibold text-sm">{deliveryBoyRole}</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryBoyNavbar;
