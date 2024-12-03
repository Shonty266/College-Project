import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import { useState } from 'react';
import RefreshHandler from '../RefreshHandler';  
import AdminSignup from './pages/AdminSignup';
import AdminProfile from './pages/AdminProfile';
import AllOrders from './pages/AllOrders';
import AllUsers from './pages/UsersDetails';
import ProductsDetails from './pages/ProductsDetails';
import AddProduct from './pages/AddProducts';
import Profile from './pages/UserProfile';
import Checkout from './pages/Checkout';
import EditProducts from './pages/EditProducts';
import EditUser from './pages/EditUser';
import ChangePassword from './pages/ChangePassword';
import DeliveryBoySignUp from './pages/DeliveryBoySignUp';
import DeliveryBoyDashboard from './pages/DeliveryBoyDashboard';
import AllDeliveryBoys from './pages/AllDeliveryBoys';
import OrdersDetails from './pages/OrdersDetails';
// import TrackOrder from './pages/TrackOrder';
// import RealTimeData from './pages/RealTimeData';
import GpsDisplay from './pages/GPSDisplay';
import AssignedOrders from './pages/AssignedOrders';
import DeliveryBoyProfile from './pages/DeliveryBoyProfile';
// import OtpVerification from './pages/OTPVerification';
import OrderConformation from './pages/OrderConformation';
import UnlockPhone from './pages/UnlockReceiver';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isDeliveryBoyAuthenticated, setIsDeliveryBoyAuthenticated] = useState(false);  

  const UserPrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const AdminPrivateRoute = ({ children }) => {
    return isAdminAuthenticated ? children : <Navigate to="/login" />;
  };

  const DeliveryBoyPrivateRoute = ({ children }) => {
    return isDeliveryBoyAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <RefreshHandler 
        setIsAuthenticated={setIsAuthenticated}
        setIsAdminAuthenticated={setIsAdminAuthenticated}
        setIsDeliveryBoyAuthenticated={setIsDeliveryBoyAuthenticated} 
      />
      <Routes>
        <Route path='/' element={<Navigate to="/login" />} />
        {/* <Route path='/realdata' element={<Navigate to="/RealTimeData" />} /> */}
        <Route path='/login' element={<Login />} />
        {/* <Route path='/otpverification' element={<OtpVerification />} /> */}
        <Route path='/adminsignup' element={<AdminSignup />} />
        <Route path='/deliveryboysignup' element={<DeliveryBoySignUp />} />
        <Route path='/unlockreceiver/:id' element={<UnlockPhone />} />
       
        <Route path='/signup' element={<Signup />} />
        <Route path='/home' element={
          <UserPrivateRoute>
            <Home />
          </UserPrivateRoute>
        } />
        <Route path='/orderhistory/trackorder' element={
          <UserPrivateRoute>
            <GpsDisplay />
          </UserPrivateRoute>
        } />
        <Route path='/orderhistory' element={
          <UserPrivateRoute>
            <AllOrders />
          </UserPrivateRoute>
        } />
        <Route path='/userprofile' element={
          <UserPrivateRoute>
            <Profile />
          </UserPrivateRoute>
        } />
        <Route path='/edituser/:id' element={
          <UserPrivateRoute>
            <EditUser />
          </UserPrivateRoute>
        } />
        <Route path='/changepassword' element={
          <UserPrivateRoute>
            <ChangePassword />
          </UserPrivateRoute>
        } />
        <Route path='/checkout' element={
          <UserPrivateRoute>
            <Checkout />
          </UserPrivateRoute>
        } />
         <Route path='/orderconformation' element={
          <UserPrivateRoute>
            <OrderConformation />
          </UserPrivateRoute>
        } />
        {/* <Route path='/orderhistory/trackorder/:id' element={
          <UserPrivateRoute>
            <TrackOrder />
          </UserPrivateRoute>
        } /> */}
        <Route path='/admindashboard' element={
          <AdminPrivateRoute>
            <AdminDashboard />
          </AdminPrivateRoute>
        } />
        <Route path='/adminprofile/:id' element={
          <AdminPrivateRoute>
            <AdminProfile />
          </AdminPrivateRoute>
        } />
        <Route path='/allusers' element={
          <AdminPrivateRoute>
            <AllUsers />
          </AdminPrivateRoute>
        } />
        <Route path='/allproducts' element={
          <AdminPrivateRoute>
            <ProductsDetails />
          </AdminPrivateRoute>
        } />
         <Route path='/allorders' element={
          <AdminPrivateRoute>
            <OrdersDetails />
          </AdminPrivateRoute>
        } />
        <Route path='/alldeliveryboys' element={
          <AdminPrivateRoute>
            <AllDeliveryBoys />
          </AdminPrivateRoute>
        } />
        <Route path='/editproducts/:id' element={
          <AdminPrivateRoute>
            <EditProducts />
          </AdminPrivateRoute>
        } />
        <Route path='/createproduct' element={
          <AdminPrivateRoute>
            <AddProduct />
          </AdminPrivateRoute>
        } />
        <Route path='/deliveryboydashboard' element={
          <DeliveryBoyPrivateRoute>
            <DeliveryBoyDashboard />
          </DeliveryBoyPrivateRoute>
        } />
        <Route path='/assignedorders/:id' element={
          <DeliveryBoyPrivateRoute>
            <AssignedOrders />
          </DeliveryBoyPrivateRoute>
        } />

<Route path='/deliveryboyprofile/:id' element={
          <DeliveryBoyPrivateRoute>
            <DeliveryBoyProfile />
          </DeliveryBoyPrivateRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
