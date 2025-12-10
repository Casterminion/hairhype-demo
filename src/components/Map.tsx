import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#C084FC;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#9333EA;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7E22CE;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M18 0C8.059 0 0 8.059 0 18c0 14.5 18 28 18 28s18-13.5 18-28c0-9.941-8.059-18-18-18z" fill="url(#purpleGrad)" filter="url(#glow)"/>
      <circle cx="18" cy="18" r="7" fill="#FAF5FF"/>
      <circle cx="18" cy="18" r="4" fill="url(#purpleGrad)"/>
    </svg>
  `),
  iconSize: [36, 46],
  iconAnchor: [18, 46],
  popupAnchor: [0, -46]
});

function MapClickHandler() {
  useMapEvents({
    click: () => {
      window.open('https://www.google.com/maps?q=Sukilėlių+pr.+72,+Kaunas,+50108', '_blank', 'noopener,noreferrer');
    },
  });
  return null;
}

export default function Map() {
  const position: [number, number] = [54.9123, 23.8778];

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '',
      iconUrl: '',
      shadowUrl: '',
    });
  }, []);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden cursor-pointer">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ background: '#1A0B2E' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        <Marker position={position} icon={customIcon}>
          <Popup>
            <div className="text-center p-2">
              <p className="font-semibold text-base mb-1">Hair Hype Junior</p>
              <p className="text-sm text-gray-600 mb-2">Sukilėlių pr. 72</p>
              <p className="text-sm text-gray-600">Kaunas, 50108</p>
            </div>
          </Popup>
        </Marker>
        <MapClickHandler />
      </MapContainer>
    </div>
  );
}
