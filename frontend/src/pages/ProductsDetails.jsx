import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar/AdminNavbar';
import StatusModal from './StatusModal'; // Import the StatusModal component
import DeleteModal from './DeleteModal'; // Import the DeleteModal component
import { ToastContainer, toast } from 'react-toastify';
import Loading from '../assets/Loading Blue.gif'


// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

function ProductsDetails() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); // State to check if the user is an admin
    const [modalOpen, setModalOpen] = useState(false); // State to control modal visibility
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // State to control delete modal visibility
    const [currentProduct, setCurrentProduct] = useState(null); // State to hold current product
    const [productToDelete, setProductToDelete] = useState(null); // State to hold product to delete
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is an admin
        const role = localStorage.getItem('role');
        if (role === 'admin') {
            setIsAdmin(true);
            fetchProducts(); // Fetch products if admin
        } else {
            navigate('/login'); // Redirect to login if not admin
        }
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:8080/auth/allproducts', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();

            if (result.success) {
                setProducts(result.data); // `result.data` should contain the products array
            } else {
                setError(result.message || 'Failed to fetch products');
            }
        } catch (err) {
            setError('Internal server error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (product) => {
        setProductToDelete(product);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (productToDelete) {
            try {
                const response = await fetch(`http://localhost:8080/auth/deleteproduct/${productToDelete._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();

                if (result.success) {
                    // Remove the deleted product from the state
                    setProducts(products.filter(product => product._id !== productToDelete._id));
                    toast.success('Product deleted successfully!'); // Show success toast
                } else {
                    setError(result.message || 'Failed to delete product');
                    toast.error(result.message || 'Failed to delete product'); // Show error toast
                }
            } catch (err) {
                setError('Internal server error');
                toast.error('Internal server error'); // Show error toast
            }
            setDeleteModalOpen(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:8080/auth/editproducts/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status
                })
            });
            const result = await response.json();

            if (result.success) {
                // Update the product status in the state
                setProducts(products.map(product =>
                    product._id === id ? { ...product, status } : product
                ));
                toast.success('Product status updated successfully!'); // Show success toast
            } else {
                setError(result.message || 'Failed to update status');
                toast.error(result.message || 'Failed to update status'); // Show error toast
            }
        } catch (err) {
            setError('Internal server error');
            toast.error('Internal server error'); // Show error toast
        }
    };

    const openModal = (product) => {
        setCurrentProduct(product);
        setModalOpen(true);
    };

    const closeModal = () => {
        setCurrentProduct(null);
        setModalOpen(false);
    };

    if (!isAdmin) {
        return <p>Access denied. You do not have permission to view this page.</p>;
    }

    if (loading) {
        return <div className="text-lg w-full h-screen flex justify-center items-center"><img src={Loading} alt="" className='w-42 h-42' /></div>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <div className='relative z-50'>
                <AdminNavbar />
            </div>
            <div className='bg-gray-100 w-[80%] min-h-[calc(100vh-130px)]  right-0 absolute top-[120px] px-10 py-10'>
                <div className="flex justify-between mb-4 items-center">
                    <h1 className='text-center text-3xl font-bold'>All Products</h1>
                    <Link
                        to='/createproduct'
                        className='bg-blue-500 px-4 py-2 rounded text-white font-bold'
                    >
                        Add Product
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white shadow-md rounded-lg p-6">
                            {/* Product Name and Availability Flex Box */}
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-2xl font-bold text-gray-900">Product Name: {product.product_name}</h3>
                                <span
                                    className={`px-3 py-1 rounded text-sm ${
                                        product.status.toLowerCase() === 'available' ? 'bg-green-200 text-green-500 font-bold' : 'bg-red-200 text-red-500 font-bold'
                                    }`}
                                >
                                    {capitalizeFirstLetter(product.status)}
                                </span>
                            </div>

                            <div className="font-semibold">
                                <p className="text-md text-gray-500">
                                    <span className="font-semibold">Product ID:</span> #{product._id}
                                </p>
                                <p className="text-md text-gray-500">
                                    <span className="">Box ID:</span> {product.esp32_id}
                                </p>
                                <p className="text-md text-gray-500">
                                    <span className="font-semibold">Size:</span> {product.product_Size}
                                </p>
                                <p className="text-md text-gray-500">
                                    <span className="font-semibold">Description:</span> {product.product_Description}
                                </p>
                            </div>

                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => handleDelete(product)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold duration-300"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => openModal(product)}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-semibold duration-300"
                                >
                                    Edit Status
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Render the StatusModal component */}
                {currentProduct && (
                    <StatusModal
                        isOpen={modalOpen}
                        onClose={closeModal}
                        product={currentProduct}
                        onUpdate={handleUpdateStatus}
                    />
                )}

                {/* Render the DeleteModal component */}
                {productToDelete && (
                    <DeleteModal
                        isOpen={deleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onDelete={confirmDelete}
                        productName={productToDelete.product_name}
                    />
                )}
            </div>
            <ToastContainer />
        </div>
    );
}

export default ProductsDetails;
