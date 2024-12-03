import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from '../components/Navbar/Navbar';
import Modal from './Modal';
import 'react-toastify/dist/ReactToastify.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Loading from '../assets/Loading Blue.gif'

const gujaratCities = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Junagadh', 'Bhavnagar', 'Amreli',
  'Anand', 'Navsari', 'Valsad', 'Bharuch', 'Jamnagar', 'Porbandar', 'Mehsana', 'Nadiad',
  'Palanpur', 'Morbi', 'Patan', 'Bhuj', 'Gandhidham', 'Surendranagar'
];

const defaultLocation = [23.0225, 72.5714]; 
import userMarkerIcon from '../assets/personicon.png'; // Import custom user marker icon

const userIcon = new L.Icon({
  iconUrl: userMarkerIcon,
  iconSize: [50, 50], // Size of the icon (square)
  iconAnchor: [25, 50], // Anchor point of the icon (centered horizontally, bottom)
  popupAnchor: [1, -34], // Popup anchor point
  shadowSize: [41, 41], // Size of the shadow (square)
  shadowAnchor: [20.5, 41], // Adjust this based on your shadow size
});

function Home() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [userId, setUserId] = useState('');
  const [selectedBox, setSelectedBox] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState(defaultLocation);
  const [dropoffCoordinates, setDropoffCoordinates] = useState(null);
  const [price, setPrice] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coordinatesLoaded, setCoordinatesLoaded] = useState(false); // New state for coordinates loading

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    const storedUserId = localStorage.getItem('id');

    setLoggedInUser(storedUser || '');
    setUserId(storedUserId || '');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoordinates([latitude, longitude]);
        setPickupLocation(`${latitude}, ${longitude}`);
        setCoordinatesLoaded(true); // Set coordinates loaded to true
      },
      (error) => {
        console.error('Error fetching location:', error);
        toast.error('Unable to fetch your location');
        setCoordinatesLoaded(true); // Set coordinates loaded to true even if there's an error
      }
    );
  }, []);

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const response = await fetch('http://localhost:8080/auth/allproductsforuser', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const result = await response.json();

        if (result.success) {
          if (result.data.length === 0) {
            // toast.error('No products available');
          } else {
            setBoxes(result.data);
          }
        } else {
          setError(result.message || 'Failed to fetch Products');
        }
      } catch (err) {
        setError('Internal server error');
      } finally {
        setLoading(false);
      }
    };

    fetchBoxes();
  }, []);

  const handleBoxSelect = (box) => {
    setSelectedBox(box);
    navigate('/checkout', {
      state: {
        selectedBox: box,
        pickupLocation,
        dropoffLocation,
        distance: calculateDistance(userCoordinates, dropoffCoordinates),
        price
      }
    });
  };

  const handleSearch = () => {
    if (!dropoffCoordinates) {
      toast.error('Please select a drop-off location');
      return;
    }

    const distance = calculateDistance(userCoordinates, dropoffCoordinates);

    if (distance >= 0) {
      const calculatedPrice = calculatePrice(distance);
      setPrice(calculatedPrice);
      setIsVisible(true);
      setIsModalOpen(true);
    } else {
      toast.error('Error calculating distance. Please check your locations.');
    }
  };

  const handleDropoffChange = (event) => {
    const city = event.target.value;
    setDropoffLocation(city);

    const cityCoordinates = {
      Ahmedabad: [23.0225, 72.5714],
      Surat: [21.1702, 72.8311],
      Vadodara: [22.3074, 73.1812],
      Rajkot: [22.3039, 70.8022],
      Gandhinagar: [23.2156, 72.6369],
      Junagadh: [21.5216, 70.4573],
      Bhavnagar: [21.7545, 72.3718],
      Amreli: [21.5914, 71.2167],
      Anand: [22.5668, 72.9281],
      Navsari: [20.9581, 73.0169],
      Valsad: [20.5992, 72.9342],
      Bharuch: [21.7051, 72.9959],
      Jamnagar: [22.4707, 70.0577],
      Porbandar: [21.6417, 69.6293],
      Mehsana: [23.6000, 72.4000],
      Nadiad: [22.6921, 72.8614],
      Palanpur: [24.1713, 72.4397],
      Morbi: [22.8173, 70.8370],
      Patan: [23.8500, 72.1200],
      Bhuj: [23.2419, 69.6669],
      Gandhidham: [23.0753, 70.1337],
      Surendranagar: [22.7277, 71.6486]
    };

    const coordinates = cityCoordinates[city] || null;
    setDropoffCoordinates(coordinates);

    if (userCoordinates && coordinates) {
      const distance = calculateDistance(userCoordinates, coordinates);
      const calculatedPrice = calculatePrice(distance);
      setPrice(calculatedPrice);
    }
  };

  const calculateDistance = (coords1, coords2) => {
    if (!coords1 || !coords2) return 0;

    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // Distance in kilometers
  };

  const calculatePrice = (distance) => {
    return distance * 5; // Price rate of 5 INR per kilometer
  };

  return (
    <div>
      <Navbar />
      <div className='flex gap-8 bg-gray-100 p-4'>
        <div className='w-[20%] bg-white py-10 px-4 border-2 border-gray-200 ml-4 my-4 rounded'>
          <div className='mb-6'>
            <label htmlFor="pickup" className="block mb-2 text-sm font-medium text-gray-600">
              Pickup Location
            </label>
            <input
              id="pickup"
              type="text"
              value={pickupLocation}
              readOnly
              className="border p-2 rounded-lg w-full outline-none"
            />
          </div>
          <div className='mb-6'> 
  <label htmlFor="dropoff" className="block mb-2 text-sm font-medium text-gray-600">
    Dropoff Location
  </label>
  <select
    id="dropoff"
    value={dropoffLocation}
    onChange={handleDropoffChange}
    className="border p-2 rounded-lg w-full outline-none"
  >
    <option value="" disabled>Select Delivery Location</option> {/* Placeholder option */}
    {gujaratCities.map((city, index) => (
      <option key={index} value={city}>
        {city}
      </option>
    ))}
  </select>
</div>

          <div className='w-full'>
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 duration-300 font-semibold text-white p-2 rounded-lg w-full text-xl"
            >
              Search
            </button>
          </div>
          <div>
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              boxes={boxes}
              onSelectBox={handleBoxSelect}
              selectedBox={selectedBox}
              price={price}
            />
          </div>
        </div>
        <div className='w-[80%] h-[90%] z-10 my-4 mr-4 rounded overflow-hidden'>
          {coordinatesLoaded ? (
            <MapContainer center={userCoordinates} zoom={15} className='w-full h-[625px]'>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={userCoordinates} icon={userIcon} zIndex={100}>
              <Popup>
                My Location:<br />
              </Popup>
            </Marker>
              {dropoffCoordinates && <Marker position={dropoffCoordinates}><Popup>Drop-off location</Popup></Marker>}
              {userCoordinates && dropoffCoordinates && (
                <Polyline positions={[userCoordinates, dropoffCoordinates]} color="blue" />
              )}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center w-full h-[630px]">
              <div className="text-lg"><img src={Loading} alt="" className='w-42 h-42' /></div>
              {/* You can replace the text with a spinner if you want */}
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Home;
