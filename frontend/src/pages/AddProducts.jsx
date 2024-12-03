import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar/AdminNavbar';

function AddProduct() {
    const [productName, setProductName] = useState('');
    const [productSize, setProductSize] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [esp32Id, setEsp32Id] = useState(''); // State for ESP32 ID
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productName || !productSize || !productDescription || !esp32Id) {
            setError('All fields are required.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/auth/createproduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    product_name: productName,
                    product_Size: productSize,
                    product_Description: productDescription,
                    esp32_id: esp32Id // Include ESP32 ID
                })
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (data.success) {
                setSuccess('Product created successfully');
                setTimeout(() => {
                    navigate('/allproducts');
                }, 1000);
            } else {
                setError(data.message || 'Failed to create product');
            }
        } catch (err) {
            console.error('Error creating product:', err);
            setError('Failed to create product');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
  {/* Navbar */}
  <div className=''>
  <AdminNavbar />
  </div>
  {/* Main Content */}
  <div className="w-[80%] h-[calc(100vh-120px)] bg-gray-100 flex justify-center items-center absolute top-[120px] right-0">
    <div className="w-[60%] p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold">Create New Product</h2>
      <hr  className='h-1 bg-gray-100 mb-4'/>

      {/* Error and Success Messages */}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter product name"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 transition-all outline-none"
          />
        </div>

        {/* Product Size */}
        <div>
          <label htmlFor="productSize" className="block text-sm font-medium text-gray-700">
            Product Size
          </label>
          <input
            type="text"
            id="productSize"
            value={productSize}
            onChange={(e) => setProductSize(e.target.value)}
            placeholder="Enter product size"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 transition-all outline-none"
          />
        </div>

        {/* Product Description */}
        <div>
          <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
            Product Description
          </label>
          <textarea
            id="productDescription"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="Enter product description"
            rows="2"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 transition-all outline-none"
          />
        </div>

        {/* ESP32 ID */}
        <div>
          <label htmlFor="esp32Id" className="block text-sm font-medium text-gray-700">
            ESP32 ID
          </label>
          <input
            type="text"
            id="esp32Id"
            value={esp32Id}
            onChange={(e) => setEsp32Id(e.target.value)}
            placeholder="Enter ESP32 ID"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 transition-all outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold px-4 py-3 rounded-md shadow-md hover:bg-blue-600 transition-all"
          >
            Create Product
          </button>
        </div>
      </form>
    </div>
</div>

</div>

    );
}

export default AddProduct;
