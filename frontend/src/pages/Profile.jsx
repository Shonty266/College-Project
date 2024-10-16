import React, { useEffect, useState, useRef } from 'react';  
import { useNavigate, Link } from 'react-router-dom';  
import { handleError, handleSuccess } from '../../utils'; // Assuming you handle success and error messages here  
import userImg from '../assets/user.jpg';
import Navbar from '../components/Navbar/Navbar';
import { BE_URL } from '../config'; // or any other icon you prefer

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
                const response = await fetch(`${BE_URL}/auth/userprofile/${UserId}`, {  
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
        return <p className="text-center text-gray-600">Loading...</p>;  
    }  

    if (error) {  
        return <p className="text-center text-red-600">Error: {error}</p>;  
    }  

    return (  
        <div className="bg-gray-100 min-h-screen flex flex-col items-center">
            <Navbar />
            <div className='flex w-full pr-10 justify-end'>
            <Link
                to={`/edituser/${UserId}`}
                className="bg-blue-500 text-white font-bold px-4 py-2 rounded-md hover:bg-blue-600 my-4 "
            >
                Edit User
            </Link></div>
    <div className='bg-white shadow-lg rounded-lg p-6 flex flex-col items-center mt-4'>
    <div className='w-28 h-28 mb-6 border-2 border-gray-300 rounded-full flex items-center justify-center overflow-hidden'>
    <img 
        src={user.profileImage || userImg} 
        alt="Profile" 
        className="object-cover w-full h-full"
    />
</div>

        <div className='text-center'>
            <h2 className='text-2xl font-semibold mb-2'>
                <span className='font-normal'>Name: </span> {user.name}
            </h2>
            <hr className='my-2 border-gray-300' />
            <h2 className='text-2xl font-semibold mt-4'>
                <span className='font-normal'>Username: </span> {user.username}
            </h2>
            <hr className='my-2 border-gray-300' />
            <h2 className='text-2xl font-semibold mt-4'>
                <span className='font-normal'>Email: </span> {user.email}
            </h2>
            <hr className='my-2 border-gray-300' />
            <h2 className='text-2xl font-semibold mt-4'>
                <span className='font-normal'>Contact No: </span> {user.contact}
            </h2>
            <hr className='my-2 border-gray-300' />
            
        </div>
    </div>
    <div>
   
        </div>
</div>
    );  
}  

export default Profile;
