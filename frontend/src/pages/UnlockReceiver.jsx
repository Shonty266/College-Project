import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {  ToastContainer } from 'react-toastify';
import Loading from '../assets/Loading Blue.gif' // Ensure to import toast for notifications

const UnlockReceiver = () => {
  const { id: orderId } = useParams(); // Get the order ID from the URL parameters
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Fetched Order ID: ", orderId); // Debugging line

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://192.168.241.211:8080/auth/ordersforreceiver/${orderId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // More detailed error
        }
        const data = await response.json();
        console.log("Order Details:", data); // Debugging line
        setOrderDetails(data);
      } catch (error) {
        console.error("Error fetching order:", error); // Debugging line
        setError(error.message);
      } finally {
        setLoading(false); // Ensure loading is set to false in both success and error cases
      }
    };

    if (orderId) {
      fetchOrderDetails();
    } else {
      setError('Order ID not found in the URL');
      setLoading(false);
    }
  }, [orderId]); // Dependency array includes orderId to re-run effect if it changes

  const handleUnlockClick = async () => {
    try {
        // Step 1: Call the /searchOrder endpoint with the fetched order ID
        const searchResponse = await fetch('http://192.168.241.211:8080/searchOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }), // Send orderId directly
        });

        if (!searchResponse.ok) {
            const errorData = await searchResponse.json();
            toast.error(`Failed to search for order: ${errorData.message}`);
            return; // Stop execution if search response is not OK
        }

        const searchData = await searchResponse.json();
        console.log('Search response:', searchData);

        // Step 2: Call the /runReceiverScript endpoint to execute the Python script
        const scriptResponse = await fetch('http://192.168.241.211:8080/runReceiverScript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        toast.success('Please show the QR code to the camera.'); // Prompt the user
        if (!scriptResponse.ok) {
            const errorData = await scriptResponse.json();
            toast.error(`Failed to run script: ${errorData.message}`);
            return; // Stop execution if script response is not OK
        }

        const scriptData = await scriptResponse.json();
        console.log('Script response:', scriptData);

        // Step 3: Show a message instructing the user to show the QR code to the camera

        // Use setTimeout to delay the success message
        setTimeout(() => {
            // Step 4: Show success toast message after a delay
            toast.success('Your box has been opened successfully!'); // Display success message

            // Optional: Show a message with data received from the script response
            toast.info(`Script Output: ${scriptData.message || 'No additional message provided'}`); // You can adjust based on your script's response
        }, 3000); // Delay for 3 seconds before showing the success message

    } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred while processing the request');
    }
};



  if (loading) {
    return  <div className="text-lg"><img src={Loading} alt="" className='w-42 h-42' /></div>
    ;
  }

  if (error) {
    return <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: 'red' }}>Error: {error}</div>;
  }

  return (
 <div className='w-full h-screen bg-gray-100 flex justify-center items-center'>
<div className='w-[80%]  bg-white px-10 py-10 rounded'>
  <div className='mb-4'>
    <h1 className='text-3xl font-bold'>
    Order Details</h1>
    <hr  className='bg-gray-100 h-1'/>
  </div>

    <div className='flex items-center justify-between mb-2'>
      <div>
      <p className='font-bold text-xl'>Order ID: #{orderDetails._id}</p>
      </div>
      <div>
      <span className={`px-6 py-2 text-lg rounded font-semibold ${
                orderDetails.status === 'Cancelled' ? 'bg-red-100 text-red-500' :
                orderDetails.status === 'Delivered' ? 'bg-green-100 text-green-500' :
                orderDetails.status === 'Pending' ? 'bg-yellow-100 text-yellow-500' :
                orderDetails.status === 'Shipped' ? 'bg-blue-100 text-blue-500' :
                'bg-gray-200'
              }`}>
                {orderDetails.status}
              </span>
      </div>
    </div>
    <div className='text-gray-600'>
    <p className='font-semibold text-lg'>Product Name: {orderDetails.productName}</p>
        <p className='font-semibold text-lg'>Size: {orderDetails.size}</p>
        <p className='font-semibold text-lg'>Booking Date: {new Date(orderDetails.bookingDate).toLocaleDateString('en-IN')}</p>
        <p className='font-semibold text-lg'>Estimated Delivery Time: {orderDetails.deliveryTime ? new Date(orderDetails.deliveryTime).toLocaleDateString('en-IN') : 'N/A'}</p>
        <p className='font-semibold text-lg'>Sender Email: {orderDetails.senderEmail}</p>
        <p className='font-semibold text-lg'>Receiver Email: {orderDetails.receiverEmail}</p>
        <p className='font-semibold text-lg'>Receiver Name: {orderDetails.receiverName}</p>
        <p className='font-semibold text-lg'>Receiver Contact Number: {orderDetails.receiverContactNumber}</p>
        <p className='font-semibold text-lg'>Sender's Address: {orderDetails.currentAddress}</p>
        <p className='font-semibold text-lg'>Receiver's Address: {orderDetails.deliveryAddress}</p>
        {/* <p className='font-semibold text-lg'>ESP32 ID: {orderDetails.esp32_id || 'N/A'}</p> */}
        <div className="text-lg font-semibold">Sender's Box Status: <span className={`text-lg rounded font-semibold ${
              orderDetails.boxStatus === 'Closed' ? ' text-red-500' :
              orderDetails.boxStatus === 'Opened' ? ' text-green-500' :
              'bg-gray-200'
            }`}>
              {orderDetails.boxStatus}
            </span></div>
        <div className="text-lg font-semibold">Receiver Box Status: <span className={`text-lg rounded font-semibold ${
              orderDetails.receiverBoxStatus === 'Closed' ? 'text-red-500' :
              orderDetails.receiverBoxStatus === 'Opened' ? 'text-green-500' :
              'bg-gray-200'
            }`}>
              {orderDetails.receiverBoxStatus}
            </span></div>

    </div>
    <div className='flex justify-end'>
    <button
        onClick={() => {
            if (orderDetails.status === 'Delivered' && orderDetails.receiverBoxStatus === 'Closed') {
                handleUnlockClick(orderDetails._id);
            }
        }}
        className={`px-16 py-4 rounded font-semibold text-xl ${
            orderDetails.status === 'Delivered' && orderDetails.receiverBoxStatus === 'Closed'
                ? 'bg-blue-500 text-white hover:bg-blue-600 duration-300 cursor-pointer'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
        disabled={!(orderDetails.status === 'Delivered' && orderDetails.receiverBoxStatus === 'Closed')}
    >
        Unlock
    </button>
</div>


</div>




<ToastContainer />
 </div>

  );
};

export default UnlockReceiver;
