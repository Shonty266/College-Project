import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import { BE_URL } from '../../config';


function AddProduct() {
    const [productName, setProductName] = useState('');
    const [productId, setProductId] = useState('');
    const [productSize, setProductSize] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productName || !productId || !productSize || !productDescription || !productQuantity) {
            setError('All fields are required.');
            return;
        }

        try {
            const response = await fetch(`${BE_URL}/auth/createproduct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    product_name: productName,
                    product_Id: productId,
                    product_Size: productSize,
                    product_Description: productDescription,
                    product_Quantity: parseInt(productQuantity, 10) // Ensure quantity is a number
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
        <div>
            <div>
                <AdminNavbar />
            </div>
            <div className="flex items-center justify-center">
                <div className="w-[50%] p-6 max-w-md bg-white rounded-xl shadow-md space-y-4">
                    <h2 className="text-2xl font-bold mb-4">Create New Product</h2>
                    
                    {error && <p className="text-red-500">{error}</p>}
                    {success && <p className="text-green-500">{success}</p>}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input
                                type="text"
                                id="productName"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="Enter product name"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="productId" className="block text-sm font-medium text-gray-700">Product ID</label>
                            <input
                                type="text"
                                id="productId"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                placeholder="Enter product ID"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="productSize" className="block text-sm font-medium text-gray-700">Product Size</label>
                            <input
                                type="text"
                                id="productSize"
                                value={productSize}
                                onChange={(e) => setProductSize(e.target.value)}
                                placeholder="Enter product size"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">Product Description</label>
                            <textarea
                                id="productDescription"
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                placeholder="Enter product description"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="productQuantity" className="block text-sm font-medium text-gray-700">Product Quantity</label>
                            <input
                                type="number"
                                id="productQuantity"
                                value={productQuantity}
                                onChange={(e) => setProductQuantity(e.target.value)}
                                placeholder="Enter product quantity"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 outline-none"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm"
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
