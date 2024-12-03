import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function RefreshHandler({ setIsAuthenticated, setIsAdminAuthenticated, setIsDeliveryBoyAuthenticated }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (token) {
            if (role === 'admin') {
                setIsAdminAuthenticated(true);
                if (['/', '/login', '/signup'].includes(location.pathname)) {
                    navigate('/admindashboard', { replace: true });
                }
            } else if (role === 'deliveryBoy') {
                setIsDeliveryBoyAuthenticated(true);
                if (['/', '/login', '/signup'].includes(location.pathname)) {
                    navigate('/deliveryboydashboard', { replace: true});
                }
            } else {
                setIsAuthenticated(true);
                if (['/', '/login', '/signup'].includes(location.pathname)) {
                    navigate('/home', { replace: true });
                }
            }
        }
    }, [location, navigate, setIsAuthenticated, setIsAdminAuthenticated, setIsDeliveryBoyAuthenticated]);

    return null;
}

export default RefreshHandler;
