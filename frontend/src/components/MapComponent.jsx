import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing in some build environments
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Internal component to handle map clicks
const MapClickHandler = ({ onClick }) => {
    useMapEvents({
        click: (e) => {
            if (onClick) {
                onClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
};

const MapComponent = ({ 
    cars = [], 
    car = null, 
    center, 
    zoom = 13, 
    onMapClick, 
    height = '400px', 
    interactive = true 
}) => {
    // Normalize cars to an array
    const displayCars = car ? [car] : (Array.isArray(cars) ? cars : []);
    
    // Filter cars that have valid lat/long
    const validCars = displayCars.filter(c => 
        c && 
        typeof c.latitude === 'number' && 
        typeof c.longitude === 'number'
    );

    // Determine initial center
    // 1. Provided center prop
    // 2. First valid car location
    // 3. Default (India center)
    const initialCenter = center || (validCars.length > 0 ? [validCars[0].latitude, validCars[0].longitude] : [20.5937, 78.9629]);
    const initialZoom = center ? zoom : (validCars.length > 1 ? 5 : (validCars.length === 1 ? 14 : 5));

    return (
        <div style={{ 
            height, 
            width: '100%', 
            marginBottom: '20px', 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #eee'
        }}>
            <MapContainer 
                center={initialCenter} 
                zoom={initialZoom} 
                scrollWheelZoom={interactive} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {onMapClick && <MapClickHandler onClick={onMapClick} />}

                {validCars.map((c) => (
                    <Marker
                        key={c.id || c._id}
                        position={[c.latitude, c.longitude]}
                    >
                        <Popup>
                            <div style={{ minWidth: '150px', padding: '5px' }}>
                                <strong style={{ fontSize: '1.1rem' }}>{c.brand} {c.model}</strong> <br />
                                <span style={{ color: '#FF385C', fontWeight: 'bold' }}>₹{Math.round(c.pricePerDay)}/day</span> <br />
                                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                                    📍 {c.location}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
