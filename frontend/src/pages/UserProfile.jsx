import React, { useEffect, useState, useRef } from 'react';  
import { useNavigate, Link } from 'react-router-dom';  
import { handleError, handleSuccess } from '../../utils'; // Assuming you handle success and error messages here  
import userImg from '../assets/user.jpg';
import Navbar from '../components/Navbar/Navbar';
import Loading from '../assets/Loading Blue.gif'


function Profile() {  
    const [user, setUser] = useState(null);  
    const [error, setError] = useState(null);  
    const [loading, setLoading] = useState(true);  
    const [isMenuOpen, setIsMenuOpen] = useState(false);  
    const menuRef = useRef(null);  
    const navigate = useNavigate();  

    const UserId = localStorage.getItem('id');  

    useEffect(() => {  
        const fetchUserData = async () => {  
            try {  
                const response = await fetch(`http://localhost:8080/auth/userprofile/${UserId}`, {  
                    headers: {  
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,  
                    },  
                });  
                const result = await response.json();  
                if (result.success) {  
                    setUser(result.data);  
                    handleSuccess('User data fetched successfully'); // Assuming this displays a success message
                } else {  
                    setError(result.message);  
                    handleError(result.message); // Assuming this displays an error message
                }  
            } catch (err) {  
                setError('Failed to fetch user data');  
                handleError('Failed to fetch user data'); // Display error message
            } finally {  
                setLoading(false);  
            }  
        };  

        if (UserId) {  
            fetchUserData();  
        } else {  
            setError('No user ID found');  
            handleError('No user ID found'); // Display error message
            setLoading(false);  
        }  
    }, [UserId]);  

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

    if (loading) {  
        return <div className="text-lg w-full h-screen flex justify-center items-center"><img src={Loading} alt="" className='w-42 h-42' /></div>;  
    }  

    if (error) {  
        return <p className="text-center text-red-600">Error: {error}</p>;  
    }  

    return (  
        <div>
            <Navbar />
            <div className='w-full h-[calc(100vh-100px)] bg-gray-100 flex-col flex justify-center items-center py-10'>
               
                <div className='bg-white w-[60%] rounded-lg shadow-md'>
                    <div className='py-6 px-6'><h1 className='text-3xl font-bold'>Profile Page</h1></div>
                    <div className='py-6 px-6 flex justify-between items-center border'>
                        <div className='flex items-center gap-4'>
                            <div className='w-24 h-24 border-2 border-gray-300 rounded-full flex items-center justify-center overflow-hidden'>
                                <img 
                                    src={user.profileImage || userImg} 
                                    alt="Profile" 
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            
                            <div> 
                                <h2 className='font-bold text-2xl '>{user.name}</h2>
                                <h2 className='font-semibold text-lg '>{user.username}</h2>
                            </div>
                        </div>
                        <div>
                            <Link 
                                to={`/edituser/${UserId}`} 
                                className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-600 my-4 duration-300"
                            >
                                Edit Details
                            </Link>
                        </div>
                    </div>
<div className=' pt-6 pb-10 px-10 border'>
<div className='flex flex-col'>
<h2 className='text-md text-gray-800 mb-2'>Name</h2>
<h2 className='border pl-2 py-1 text-gray-600 text-md rounded'>{user.name}</h2>
</div>

<div className='flex flex-col mt-4 '>
<h2 className='text-md text-gray-800 mb-2'>Username</h2>
<h2 className='border pl-2 py-1 text-gray-600 text-lg rounded'>{user.username}</h2>
</div>

<div className='flex flex-col mt-4 '>
<h2 className='text-md text-gray-800 mb-2'>Email</h2>
<h2 className='border pl-2 py-1 text-gray-600 text-md rounded'>{user.email}</h2>
</div>

<div className='flex flex-col mt-4'>
    <h2 className='text-md text-gray-800 mb-2'>Contact Number</h2>
    {user.contact ? (
        <h2 className='border pl-2 py-1 text-gray-600 text-md rounded outline-none cursor-default'>
            {user.contact}
        </h2>
    ) : (
        <h2 className='border pl-2 py-1 text-gray-400 text-md rounded outline-none cursor-default'>Contact Number</h2>
    )}
</div>
</div>



                </div>
            </div>
        </div>
    ); 
}

export default Profile;
