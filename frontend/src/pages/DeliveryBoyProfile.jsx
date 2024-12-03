import React, { useEffect, useState, useRef } from 'react';  
import { useNavigate, Link } from 'react-router-dom';  
import { handleError, handleSuccess } from '../../utils'; // Assuming you handle success and error messages here  
import deliveryBoyImg from '../assets/user.jpg'; // Assuming you're using the same placeholder image
import Navbar from '../components/Navbar/Navbar';
import DeliveryBoyNavbar from '../components/DeliveryBoyNavbar/DeliveryBoyNavbar';
import Loading from '../assets/Loading Blue.gif'


function DeliveryBoyProfile() {  
    const [deliveryBoy, setDeliveryBoy] = useState(null);  
    const [error, setError] = useState(null);  
    const [loading, setLoading] = useState(true);  
    const [isMenuOpen, setIsMenuOpen] = useState(false);  
    const menuRef = useRef(null);  
    const navigate = useNavigate();  

    const deliveryBoyId = localStorage.getItem('id');  

    useEffect(() => {  
        const fetchDeliveryBoyData = async () => {  
            try {  
                const response = await fetch(`http://localhost:8080/auth/deliveryboyprofile/${deliveryBoyId}`, {  
                    headers: {  
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,  
                    },  
                });  
                const result = await response.json();  
                if (result.success) {  
                    setDeliveryBoy(result.data);  
                    handleSuccess('Delivery Boy data fetched successfully'); // Assuming this displays a success message
                } else {  
                    setError(result.message);  
                    handleError(result.message); // Assuming this displays an error message
                }  
            } catch (err) {  
                setError('Failed to fetch Delivery Boy data');  
                handleError('Failed to fetch Delivery Boy data'); // Display error message
            } finally {  
                setLoading(false);  
            }  
        };  

        if (deliveryBoyId) {  
            fetchDeliveryBoyData();  
        } else {  
            setError('No Delivery Boy ID found');  
            handleError('No Delivery Boy ID found'); // Display error message
            setLoading(false);  
        }  
    }, [deliveryBoyId]);  

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
            <DeliveryBoyNavbar />
            <div className='bg-gray-100 w-[80%] min-h-[calc(100vh-120px)] p-6 absolute right-0 top-[120px] flex justify-center'>
               
                <div className='bg-white w-[60%] rounded-lg shadow-md'>
                    <div className='py-6 px-6'><h1 className='text-3xl font-bold'>Delivery Boy Profile</h1></div>
                    <div className='py-6 px-6 flex justify-between items-center border'>
                        <div className='flex items-center gap-4'>
                            <div className='w-24 h-24 border-2 border-gray-300 rounded-full flex items-center justify-center overflow-hidden'>
                                <img 
                                    src={deliveryBoy?.profileImage || deliveryBoyImg} 
                                    alt="Profile" 
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            
                            <div> 
                                <h2 className='font-bold text-2xl '>{deliveryBoy?.name}</h2>
                                <h2 className='font-semibold text-lg '>{deliveryBoy?.username}</h2>
                            </div>
                        </div>
                        {/* <div>
                            <Link 
                                to={`/editdeliveryboy/${deliveryBoyId}`} 
                                className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-600 my-4 duration-300"
                            >
                                Edit Details
                            </Link>
                        </div> */}
                    </div>
                    <div className='pt-6 pb-10 px-10 border'>
                        <div className='flex flex-col'>
                            <h2 className='text-md text-gray-800 mb-2'>Name</h2>
                            <h2 className='border pl-2 py-1 text-gray-600 text-lg rounded'>{deliveryBoy?.name}</h2>
                        </div>

                        <div className='flex flex-col mt-4 '>
                            <h2 className='text-md text-gray-800 mb-2'>Username</h2>
                            <h2 className='border pl-2 py-1 text-gray-600 text-lg rounded'>{deliveryBoy?.username}</h2>
                        </div>

                        <div className='flex flex-col mt-4 '>
                            <h2 className='text-md text-gray-800 mb-2'>Email</h2>
                            <h2 className='border pl-2 py-1 text-gray-600 text-lg rounded'>{deliveryBoy?.email}</h2>
                        </div>

                        <div className='flex flex-col mt-4 '>
                            <h2 className='text-md text-gray-800 mb-2'>Contact Number</h2>
                            <h2 className='border pl-2 py-1 text-gray-600 text-lg rounded'>{deliveryBoy?.contact}</h2>
                        </div>
                        <div className='flex flex-col mt-4 '>
                            <h2 className='text-md text-gray-800 mb-2'>Vehicle Number</h2>
                            <h2 className='border pl-2 py-1 text-gray-600 text-lg rounded'>{deliveryBoy?.vehicleDetails}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ); 
}

export default DeliveryBoyProfile;
