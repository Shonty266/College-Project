import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { handleError, handleSuccess } from '../../utils';
import Navbar from '../components/Navbar/Navbar';
import { ToastContainer } from 'react-toastify';
import user from '../assets/user.jpg';
import loading from '../assets/loading.svg';
import Loading from '../assets/Loading Blue.gif'


// Convert file to base64
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const EditUser = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userContact, setUserContact] = useState('');
  const [userUsername, setUserUsername] = useState(''); // Fixed this variable name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postImage, setPostImage] = useState({ profileImage: "" });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError('No user ID found in URL parameters.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/auth/userprofile/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          setError('Failed to fetch user profile.');
          return;
        }

        const data = await response.json();
        if (data.success) {
          setUserName(data.data.name);
          setUserUsername(data.data.username); // Fixed this line
          setUserEmail(data.data.email);
          setUserContact(data.data.contact);
          setPostImage({ profileImage: data.data.profileImage || "" });
        } else {
          setError(data.message || 'Failed to fetch user profile.');
        }
      } catch (err) {
        setError('Error fetching user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      setError('No user ID found in URL parameters.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/auth/edituser/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: userName,
          username: userUsername, // Fixed this line
          email: userEmail,
          contact: userContact,
          profileImage: postImage.profileImage
        })
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.message || 'Failed to update user profile.');
        handleError(result.message);
        return;
      }

      const result = await response.json();
      if (result.success) {
        handleSuccess(result.message);

        // Delay navigation by 5 seconds
        setTimeout(() => {
          navigate('/userprofile');
        },2000);
      } else {
        setError(result.message || 'Failed to update user profile.');
        handleError(result.message);
      }
    } catch (err) {
      setError('Error updating user profile.');
      handleError('Error updating user profile.');
    }
  };

  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        const base64 = await convertToBase64(file);
        setPostImage({ profileImage: base64 });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleRemoveImage = () => {
    setPostImage({ profileImage: "" });
  };

  if (loading) {
    return <div className="text-lg w-full h-screen flex justify-center items-center"><img src={Loading} alt="" className='w-42 h-42' /></div>
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="bg-gray-100 h-[calc(100vh-100px)] flex justify-center items-center">
  <form onSubmit={handleSubmit} className="bg-white w-[60%] pt-2 pb-10 shadow-lg rounded-lg border border-gray-200 ">

  <div className='py-4 px-6'><h1 className='text-3xl font-bold'>Edit Profile Page</h1></div>
      <hr className='w-full h-1 py-2' />
    <div className="flex items-center space-x-4 mb-6 px-6">
      <div className="relative w-24 h-24">
        <img 
          src={postImage.profileImage || user} 
          alt="User" 
          className="w-full h-full object-cover rounded-full border-2 border-gray-300" 
        />
      </div>

      <div className="flex gap-4">
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 duration-300 text-white py-2 px-4 rounded-lg text-center font-semibold"
        >
          Upload
        </label>
        <button
          type="button"
          onClick={handleRemoveImage}
          className="text-red-500 bg-white p-2 rounded-lg border-2 border-red-500 hover:bg-red-100 font-semibold duration-300"
        >
          Remove
        </button>
        <input 
          type="file"
          name="profileImage"
          id="file-upload"
          accept=".jpeg, .png, .jpg"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>

    <div className="mb-4 px-6">
      <label htmlFor="userUsername" className="block text-sm font-medium text-gray-700">Username</label>
      <input
        type="text"
        id="userUsername"
        value={userUsername}
        onChange={(e) => setUserUsername(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-2 outline-none "
        placeholder="Username"
        required
      />
    </div>

    <div className="mb-4 px-6">
      <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Name</label>
      <input
        type="text"
        id="userName"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-2 outline-none"
        placeholder="Name"
        required
      />
    </div>

    <div className="mb-4 px-6">
      <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        id="userEmail"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-2 outline-none"
        placeholder="Email"
        required
      />
    </div>

    <div className="mb-4 px-6">
      <label htmlFor="userContact" className="block text-sm font-medium text-gray-700">Contact</label>
      <input
        type="text"
        id="userContact"
        value={userContact}
        onChange={(e) => setUserContact(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-2 outline-none"
        placeholder="Contact"
        required
      />
    </div>
<div className='flex justify-end px-6'>
    <button
      type="submit"
      className="w-[30%] bg-blue-500 text-white font-semibold py-2 rounded-md shadow-md hover:bg-blue-600 duration-300 text-lg "
    >
      Update Profile
    </button>
    </div>
  </form>
</div>

      <ToastContainer />
    </div>
  );
};

export default EditUser;
