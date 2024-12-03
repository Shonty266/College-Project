import React, { useEffect, useState, useRef } from 'react';  
import { useNavigate, Link } from 'react-router-dom';  
import { handleError, handleSuccess } from '../../utils'; // Assuming you handle success and error messages here  
import user from '../assets/user.jpg';  
import AdminNavbar from '../components/AdminNavbar/AdminNavbar';
import Loading from '../assets/Loading Blue.gif'

function AdminProfile() {  
    const [admin, setAdmin] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const AdminId = localStorage.getItem('id');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAdminData = async () => {
            if (!AdminId || !token) {
                setError('No admin ID or token found');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/auth/adminprofile/${AdminId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    setAdmin(result.data);
                } else {
                    setError(result.message || 'Failed to fetch admin data');
                }
            } catch (err) {
                setError('Failed to fetch admin data');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [AdminId, token]);

  

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
        return <p>Error: {error}</p>;
    }
    return (  
        <div>
              <AdminNavbar />
              <div className='w-[80%] h-[calc(100vh-120px)] bg-gray-100 flex justify-center items-center absolute top-[120px] right-0'>
                <div className='bg-white w-[60%] rounded-lg shadow-md'>
                <div className='py-6 px-6'><h1 className='text-3xl font-bold'>Admin Profile Page</h1></div>
                    <div className='py-6 px-6 flex justify-between items-center border'>
                        <div className='flex items-center gap-4'>
                            <div className='w-24 h-24 border-2 border-gray-300 rounded-full flex items-center justify-center overflow-hidden'>
                                <img 
                                    src={user} 
                                    alt="Profile" 
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            
                            <div> 
                                <h2 className='font-bold text-2xl '>{admin.name}</h2>
                                <h2 className='font-semibold text-lg '>{admin.username}</h2>
                            </div>
                        </div>
                        
                    </div>
<div className=' pt-6 pb-10 px-10'>
<div className='flex flex-col '>
<h2 className='text-md text-gray-800 mb-2'>Name</h2>
<h2 className='border pl-2 py-1 text-gray-600 text-lg  rounded'>{admin.name}</h2>
</div>

{/* <div className='flex flex-col mt-4 '>
<h2 className='text-md text-gray-800 mb-2'>Username</h2>
<h2 className='border pl-2 py-1 text-gray-600 text-lg rounded'>{admin.username}</h2>
</div> */}

<div className='flex flex-col mt-4 '>
<h2 className='text-md text-gray-800 mb-2'>Email</h2>
<h2 className='border pl-2 py-1 text-gray-600 text-lg rounded'>{admin.email}</h2>
</div>


</div>



                </div>
            </div>
        </div>
    );  
}  

export default AdminProfile;