import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Leaflet for marker icons
import Navbar from '../components/Navbar/Navbar';
import Loading from '../assets/Loading Blue.gif'
import { BE_URL } from '../config'; // or any other icon you prefer


// Import marker images
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const GPSDisplay = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocation = async () => {
    try {
      const response = await fetch(`${BE_URL}/receivedlocation/gps`); // Fetch from your API
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      const data = await response.json();
      // Check if valid latitude and longitude are returned
      if (data.latitude && data.longitude) {
        setLocation(data);
      } else {
        throw new Error('Invalid location data');
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    // Refresh data every 10 seconds
    const intervalId = setInterval(fetchLocation, 10000);
    return () => clearInterval(intervalId); // Clear interval on unmount
  }, []);

  if (loading) return <div className="text-lg w-full h-screen flex justify-center items-center"><img src={Loading} alt="" className='w-42 h-42' /></div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full h-screen">
     
     <div className='z-50'> <Navbar /></div>
      {location ? (
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={15}
          className="w-full h-full z-10"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>
              Latitude: {location.latitude} <br />
              Longitude: {location.longitude}
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <div>No location data available</div>
      )}
    </div>
  );
};

export default GPSDisplay;
