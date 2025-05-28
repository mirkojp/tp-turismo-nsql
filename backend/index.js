const express = require('express');
const redis = require('redis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración del cliente de Redis
const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379
    }
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Connected to Redis'));
client.on('ready', () => console.log('Redis client ready'));

async function connectRedis() {
    try {
        await client.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
}
connectRedis();

app.post('/api/places', async (req, res) => {
    const { name, latitude, longitude, group } = req.body;
    if (!name || !latitude || !longitude || !group) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }
    try {
        if (!client.isOpen) {
            throw new Error('Redis client is not connected');
        }
        await client.geoAdd(group, { longitude: lon, latitude: lat, member: name });
        res.json({ message: 'Place added successfully' });
    } catch (err) {
        console.error('Error adding place:', err);
        res.status(500).json({ error: 'Failed to add place: ' + err.message });
    }
});

app.get('/api/places/nearby', async (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Missing coordinates' });
    }
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }
    try {
        if (!client.isOpen) {
            throw new Error('Redis client is not connected');
        }
        const groups = ['cervecerias', 'universidades', 'farmacias', 'emergencias', 'supermercados'];
        const nearby = {};
        for (const group of groups) {
            const places = await client.geoSearchWith(
                group,
                { latitude: lat, longitude: lon },
                { radius: 5, unit: 'km' },
                ['WITHCOORD', 'WITHDIST']
            );
            nearby[group] = places.map((place) => {
                console.log('Place data:', place);
                return {
                    name: place.member,
                    latitude: parseFloat(place.coordinates?.latitude) || null,
                    longitude: parseFloat(place.coordinates?.longitude) || null,
                    distance: parseFloat(place.distance) || null
                };
            });
        }
        res.json(nearby);
    } catch (err) {
        console.error('Error searching places:', err);
        res.status(500).json({ error: 'Failed to search places: ' + err.message });
    }
});

app.listen(5000, () => {
    console.log('Backend running on port 5000');
});