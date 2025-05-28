import { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import L from 'leaflet';
import './index.css';

const groups = ['cervecerias', 'universidades', 'farmacias', 'emergencias', 'supermercados'];

// Definir íconos personalizados por color
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const cerveceriasIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const universidadesIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const farmaciasIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const emergenciasIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const supermercadosIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Mapa de íconos por grupo
const groupIcons = {
    cervecerias: cerveceriasIcon,
    universidades: universidadesIcon,
    farmacias: farmaciasIcon,
    emergencias: emergenciasIcon,
    supermercados: supermercadosIcon
};

function LocationMarker({ setCoords }) {
    useMapEvents({
        click(e) {
            setCoords({ latitude: e.latlng.lat.toFixed(6), longitude: e.latlng.lng.toFixed(6) });
        },
    });
    return null;
}

function App() {
    const [form, setForm] = useState({ name: '', latitude: '', longitude: '', group: groups[0] });
    const [location, setLocation] = useState({ latitude: '', longitude: '' });
    const [nearby, setNearby] = useState({});
    const [message, setMessage] = useState(null);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAddPlace = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: form.name,
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                group: form.group
            };
            console.log('Enviando al backend:', payload);
            const response = await axios.post('http://localhost:5000/api/places', payload);
            console.log('Respuesta del backend:', response.data);
            showMessage('Lugar agregado con éxito', 'success');
            setForm({ name: '', latitude: '', longitude: '', group: groups[0] });
        } catch (err) {
            console.error('Error en handleAddPlace:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Error al agregar el lugar';
            showMessage(`Error: ${errorMessage}`, 'error');
        }
    };

    const handleGetNearby = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.get('http://localhost:5000/api/places/nearby', {
                params: location
            });
            console.log('Lugares cercanos recibidos:', res.data);
            setNearby(res.data);
            showMessage('Lugares cercanos cargados', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Error al buscar lugares';
            showMessage(`Error: ${errorMessage}`, 'error');
        }
    };

    const nearbyMarkers = Object.entries(nearby).flatMap(([group, places]) =>
        places.map((place) => ({
            name: place.name,
            group,
            latitude: parseFloat(place.latitude),
            longitude: parseFloat(place.longitude),
        }))
    );

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header className="fixed top-0 left-0 w-full bg-blue-600 text-white shadow-md z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">API Turismo</h1>
                    <nav className="flex space-x-4">
                        <button
                            onClick={() => scrollToSection('add-place')}
                            className="hover:text-blue-200 transition-colors"
                        >
                            Agregar Lugar
                        </button>
                        <button
                            onClick={() => scrollToSection('find-nearby')}
                            className="hover:text-blue-200 transition-colors"
                        >
                            Buscar Cercanos
                        </button>
                    </nav>
                </div>
            </header>

            <main className="flex-1 bg-gray-100 flex flex-col items-center pt-24 pb-8">
                {message && (
                    <div
                        className={`fixed top-16 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <div id="map" className="w-full max-w-4xl mb-8">
                    <MapContainer
                        center={[-32.4825, -58.2372]}
                        zoom={13}
                        style={{ height: '400px', width: '100%' }}
                        className="rounded-lg shadow-md"
                        key="map-container"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <LocationMarker
                            setCoords={(coords) => {
                                setForm({ ...form, ...coords });
                                setLocation(coords);
                            }}
                        />
                        {form.latitude && form.longitude && !isNaN(form.latitude) && !isNaN(form.longitude) && (
                            <Marker
                                position={[parseFloat(form.latitude), parseFloat(form.longitude)]}
                                icon={userIcon}
                            />
                        )}
                        {nearbyMarkers.map((place) => (
                            !isNaN(place.latitude) && !isNaN(place.longitude) && (
                                <Marker
                                    key={`${place.group}-${place.name}`}
                                    position={[place.latitude, place.longitude]}
                                    icon={groupIcons[place.group] || userIcon}
                                />
                            )
                        ))}
                    </MapContainer>
                </div>

                <div id="add-place" className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agregar Lugar</h2>
                    <form onSubmit={handleAddPlace} className="grid grid-cols-1 gap-4">
                        <input
                            type="text"
                            placeholder="Nombre del lugar"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Latitud"
                                value={form.latitude}
                                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                                className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="any"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Longitud"
                                value={form.longitude}
                                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                                className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="any"
                                required
                            />
                        </div>
                        <select
                            value={form.group}
                            onChange={(e) => setForm({ ...form, group: e.target.value })}
                            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {groups.map((g) => (
                                <option key={g} value={g} className="capitalize">
                                    {g}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Agregar Lugar
                        </button>
                    </form>
                </div>

                <div id="find-nearby" className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Buscar Lugares Cercanos (5km)</h2>
                    <form onSubmit={handleGetNearby} className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Latitud"
                                value={location.latitude}
                                onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
                                className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="any"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Longitud"
                                value={location.longitude}
                                onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
                                className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="any"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Buscar Lugares
                        </button>
                    </form>
                </div>

                {Object.keys(nearby).length > 0 && (
                    <div className="w-full max-w-4xl mb-8">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lugares Cercanos</h2>
                        {groups.map((group) => (
                            nearby[group]?.length > 0 && (
                                <div key={group} className="mb-6">
                                    <h3 className="text-xl font-medium text-gray-600 capitalize mb-2">{group}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {nearby[group].map((place) => (
                                            <div
                                                key={place.name}
                                                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                            >
                                                <h4 className="text-lg font-semibold text-gray-800">{place.name}</h4>
                                                <p className="text-gray-600">
                                                    Distancia: {place.distance != null ? place.distance.toFixed(2) : 'N/A'} km
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </main>

            <footer className="bg-blue-600 text-white py-4">
            </footer>
        </div>
    );
}

export default App;