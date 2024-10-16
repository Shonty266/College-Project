const { signup, login, adminsignup, fetchAdminById, fetchAllUsers, createProduct, fetchAllProducts,  deleteProduct, deleteUser, fetchAllOrdersById, fetchUserById, editProduct, fetchProductById, editUser, changePassword, fetchAllProductsForUsers, deliveryBoySignup, fetchDeliveryBoyById, fetchAllDeliveryBoys, deleteDeliveryBoy, fetchUserCount,fetchDeliveryBoyCount, createOrder,cancelOrder, fetchAllOrders, updateOrderStatus, fetchOrderCountsByStatus, assignOrderToDeliveryBoy, getAssignedOrders, fetchDeliveryBoyOrders, verifySignup, orderForReceiver, fetchProductCount, updateBoxStatus, updateBoxStatusReceiver} = require('../controllers/authController');
const { signupValidation, loginValidation, deliveryBoySignupValidation } = require('../middlewares/authValidation');

const router = require('express').Router();

router.post('/login', loginValidation, login)

router.post('/signup', signupValidation, signup)
router.post('/verifysignup', verifySignup);
router.post('/adminsignup', signupValidation, adminsignup)
router.post('/deliveryboysignup', deliveryBoySignupValidation, deliveryBoySignup)


router.get('/adminprofile/:id', fetchAdminById);
router.get('/userprofile/:id', fetchUserById);
router.get('/deliveryboyprofile/:id', fetchDeliveryBoyById);

router.post('/orderhistory', fetchAllOrdersById);


router.put('/orderhistory/:orderId/cancel', cancelOrder);  


router.get('/allusers', fetchAllUsers);
router.get('/alldeliveryboys', fetchAllDeliveryBoys);
router.get('/allproducts', fetchAllProducts);
router.get('/allorders', fetchAllOrders);
router.get('/allproductsforuser', fetchAllProductsForUsers);
router.patch('/editproducts/:id', editProduct);
router.patch('/edituser/:id', editUser );
router.patch('/changepassword', changePassword);
router.post('/createorder', createOrder);

router.patch('/allorders/:orderId/status', updateOrderStatus);
router.patch('/allorders/:orderId/box-status', updateBoxStatus);
router.patch('/allorders/:orderId/receiver-box-status', updateBoxStatusReceiver);

router.get('/assignedorders/:deliveryBoyId', getAssignedOrders);
router.get('/deliveryboy/allorders', fetchDeliveryBoyOrders);

router.get('/ordersforreceiver/:orderId', orderForReceiver);


// router.get('/fetchproductquantities', fetchProductQuantities);
router.get('/fetchusercount', fetchUserCount);
router.get('/fetchdeliveryboycount', fetchDeliveryBoyCount);
router.get('/fetchordercount',fetchOrderCountsByStatus);
router.get('/fetchproductscount',fetchProductCount);
// router.post("/uploads", uploadImage);


router.get('/getproduct/:id', fetchProductById);

// router.get('/receivedlocation/gps', getGpsData);
router.patch('/assignorder', assignOrderToDeliveryBoy);
// router.get('/receivedlocation', getGpsData);


router.post('/createproduct', createProduct);
router.delete('/deleteproduct/:id', deleteProduct);
router.delete('/deleteuser/:id', deleteUser);
router.delete('/deletedeliveryboy/:id', deleteDeliveryBoy);


module.exports = router;