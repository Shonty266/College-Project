import React, { useEffect, useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { handleError, handleSuccess } from '../../../utils';
import { IoIosNotifications } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import { PiUsersThree } from "react-icons/pi";
import { AiOutlineProduct } from "react-icons/ai";
import user from '../../assets/user.jpg';
import logo from '../../assets/LOGO.svg';
import { CiLogout } from "react-icons/ci";
import { TbTruckDelivery } from "react-icons/tb";
import { BsBoxes } from "react-icons/bs";

const AdminNavbar = () => {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [adminId, setAdminId] = useState('');
    const [adminRole, setAdminRole] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser') || '');
        setAdminId(localStorage.getItem('id') || '');
        setAdminRole(localStorage.getItem('role') || '');
    }, []);

    useEffect(() => {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        setCurrentDate(formattedDate);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        handleSuccess('User Logged out');
        setTimeout(() => navigate('/login'), 1000);
    };

    const linkStyles = "flex items-center text-lg gap-2 px-4 py-2 rounded-md text-gray-600";
    const activeLinkStyles = "bg-blue-500 text-white font-semibold";

    return (
        <div className='w-full relative '>
            
                <div className='w-[20%] fixed  '>
                    <div className='fixed top-0 w-[20%] h-screen bg-white border-r-2 border-gray-300 flex flex-col px-10 gap-4 py-10'>
                        <div className='flex justify-center items-center mb-10'>
                            <Link to='/admindashboard'>
                                <img src={logo} alt="Logo" />
                            </Link>
                        </div>

                        <NavLink
                            to='/admindashboard'
                            className={({ isActive }) =>
                                `${linkStyles} ${isActive ? activeLinkStyles : ''}`
                            }
                        >
                            <LuLayoutDashboard />
                            Dashboard
                        </NavLink>

                        <NavLink
                            to='/allusers'
                            className={({ isActive }) =>
                                `${linkStyles} ${isActive ? activeLinkStyles : ''}`
                            }
                        >
                            <PiUsersThree /> Users Details
                        </NavLink>

                        <NavLink
                            to='/allproducts'
                            className={({ isActive }) =>
                                `${linkStyles} ${isActive ? activeLinkStyles : ''}`
                            }
                        >
                            <AiOutlineProduct /> Products Details
                        </NavLink>

                        <NavLink
                            to='/alldeliveryboys'
                            className={({ isActive }) =>
                                `${linkStyles} ${isActive ? activeLinkStyles : ''}`
                            }
                        >
                            <TbTruckDelivery /> Delivery Boys
                        </NavLink>

                        <NavLink
                            to='/allorders'
                            className={({ isActive }) =>
                                `${linkStyles} ${isActive ? activeLinkStyles : ''}`
                            }
                        >
                            <BsBoxes /> Orders Details
                        </NavLink>

                        <hr className='h-[2px] bg-gray-300 w-full' />

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

                <div className='flex justify-between items-center w-[80%] right-0 fixed h-[120px] px-10 bg-white z-50 border-b-2 border-gray-300 '>
                    <div>
                        <h1 className='text-blue-500 font-bold text-3xl'>Admin Dashboard</h1>
                        <h3 className='font-semibold text-gray-600'>{currentDate}</h3>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='flex gap-2 bg-gray-200 items-center py-2 px-4 w-80 rounded-full'>
                            <FaSearch className='text-gray-400' />
                            <input type="text" placeholder='Search' className='bg-transparent w-full outline-none h-full' />
                        </div>

                        <a href="#" className='text-2xl bg-gray-200 p-2 text-white rounded-full'>
                            <IoIosNotifications className='text-md text-gray-400' />
                        </a>

                        <div className='flex items-center'>
                            <div>
                                <Link to={`/adminprofile/${adminId}`}>
                                    <img src={user} alt="user" className="w-10 h-10 bg-black rounded-full" />
                                </Link>
                            </div>
                            <h1 className="font-semibold pl-2 flex flex-col">
                                <span className="font-bold text-lg">{loggedInUser}</span> 
                                <span className="font-semibold text-sm">{adminRole}</span> 
                            </h1>
                        </div>
                    </div>
                </div>
                </div>
           
    );
};

export default AdminNavbar;
