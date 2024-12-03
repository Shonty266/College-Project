import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Leaflet for marker icons
import Navbar from '../components/Navbar/Navbar';
import Loading from '../assets/Loading Blue.gif';

// Import marker images
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import apiMarkerIcon from '../assets/boxicon2.png'; // Custom API marker icon
import userMarkerIcon from '../assets/personicon.png'; // Import custom user marker icon

// Fix for marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Create a custom icon for the user's location
const userIcon = new L.Icon({
  iconUrl: userMarkerIcon,
  iconSize: [50, 50], // Size of the icon (square)
  iconAnchor: [25, 50], // Anchor point of the icon (centered horizontally, bottom)
  popupAnchor: [1, -34], // Popup anchor point
  shadowUrl: markerShadow,
  shadowSize: [41, 41], // Size of the shadow (square)
  shadowAnchor: [20.5, 41], // Adjust this based on your shadow size
});


// Create a custom icon for the API location
const apiIcon = new L.Icon({
  iconUrl: apiMarkerIcon,
  iconSize: [30, 30], // Size of the icon (square)
  iconAnchor: [20.5, 41], // Anchor point of the icon (centered horizontally)
  popupAnchor: [1, -34], // Popup anchor point
  shadowUrl: markerShadow,
  shadowSize: [41, 41], // Size of the shadow (square)
  shadowAnchor: [20, 46], // Size of the shadow (square)
});

const GPSDisplay = () => {
  const [location, setLocation] = useState(null);
  const [browserLocation, setBrowserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch location from API
  const fetchLocation = async () => {
    try {
      const response = await fetch('http://localhost:8080/receivedlocation/gps'); // Fetch from your API
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

  // Function to get the browser's current location
  const getBrowserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setBrowserLocation({ latitude, longitude });
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    fetchLocation();
    getBrowserLocation(); // Get the browser location when the component mounts
    // Refresh data every 10 seconds
    const intervalId = setInterval(fetchLocation, 10000);
    return () => clearInterval(intervalId); // Clear interval on unmount
  }, []);

  if (loading) return <div className="text-lg w-full h-screen flex justify-center items-center"><img src={Loading} alt="" className='w-42 h-42' /></div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full h-screen">
      <div className='z-50'><Navbar /></div>
      {location || browserLocation ? (
        <MapContainer
          center={location ? [location.latitude, location.longitude] : [browserLocation.latitude, browserLocation.longitude]}
          zoom={15}
          className="w-full h-full z-10"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Marker for the browser's location with custom icon (higher zIndex) */}
          {browserLocation && (
            <Marker position={[browserLocation.latitude, browserLocation.longitude]} icon={userIcon} zIndex={100}>
              <Popup>
                My Location:<br />
              </Popup>
            </Marker>
          )}
          {/* Marker for the user's API location with custom icon (lower zIndex) */}
          {location && (
            <Marker position={[location.latitude, location.longitude]} icon={apiIcon} zIndex={50}>
              <Popup>
                Box's Location:<br />
              </Popup>
            </Marker>
          )}
        </MapContainer>
      ) : (
        <div>No location data available</div>
      )}
    </div>
  );
};

export default GPSDisplay;
