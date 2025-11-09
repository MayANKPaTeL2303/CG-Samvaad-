import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useLanguage } from '../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import './ComplaintForm.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from "axios";
import { toast } from "react-toastify";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const ComplaintForm = ({ onSubmit, loading }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'water',
    address: '',
    image: null,
  });
  const [position, setPosition] = useState({ lat: 21.1938, lng: 81.3509 }); // Chhattisgarh center
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const categories = [
    'water', 'sanitation', 'roads', 'electricity',
    'streetlight', 'drainage', 'garbage', 'other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const getCurrentLocation = () => {
    setUseCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location');
          setUseCurrentLocation(false);
        }
      );
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  
  // Create FormData for multipart upload
  const formDataToSend = new FormData();
  formDataToSend.append('title', formData.title);
  formDataToSend.append('description', formData.description);
  formDataToSend.append('category', formData.category);
  formDataToSend.append('address', formData.address || ''); // Optional, default empty
  formDataToSend.append('latitude', position.lat.toString()); // Convert to string for FormData
  formDataToSend.append('longitude', position.lng.toString()); // Convert to string for FormData
  
  // Append image if selected
  if (formData.image) {
    formDataToSend.append('image', formData.image);
  }
  
  // Pass FormData to parent onSubmit
  onSubmit(formDataToSend);
};

  return (
    <form onSubmit={handleSubmit} className="complaint-form">
      <div className="form-group">
        <label>{t('title')} *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder={t('title')}
        />
      </div>

      <div className="form-group">
        <label>{t('description')} *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          placeholder={t('description')}
        />
      </div>

      <div className="form-group">
        <label>{t('category')} *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {t(cat)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Optional address description"
        />
      </div>

      <div className="form-group">
        <label>Image (Optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <div className="form-group">
        <label>{t('location')} *</label>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={useCurrentLocation}
          className="btn-location"
        >
          {useCurrentLocation ? 'Getting location...' : 'Use Current Location'}
        </button>
        
        <div className="map-container">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
        <p className="location-info">
          Selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </p>
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Submitting...' : t('submit')}
      </button>
    </form>
  );
};

export default ComplaintForm;