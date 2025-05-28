const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Connected to Redis'));
client.on('ready', () => console.log('Redis client ready'));

async function seedPlaces() {
  try {
    await client.connect();

    // Verificar si ya se ejecutó (usando una clave de bandera)
    const flagKey = 'seed_places_run';
    const hasRun = await client.get(flagKey);
    if (hasRun) {
      console.log('Script de inicialización ya ejecutado, saltando...');
      return;
    }

    // Lugares de prueba basados en Concepción del Uruguay
    const places = [
      // Cervecerías
      { group: 'cervecerias', name: 'Cervecería 7 Colinas', latitude: -32.4862, longitude: -58.2297 },
      { group: 'cervecerias', name: 'Cervecería Baum', latitude: -32.4837, longitude: -58.2305 },
      { group: 'cervecerias', name: 'Cervecería Growler Bar', latitude: -32.4821, longitude: -58.2312 },
      { group: 'cervecerias', name: 'Antares Concepción', latitude: -32.4859, longitude: -58.2319 },
      { group: 'cervecerias', name: 'Bar Brezza', latitude: -32.4840, longitude: -58.2307 },
      { group: 'cervecerias', name: 'Zíngara Bar', latitude: -32.4829, longitude: -58.2294 },

      // Universidades
      { group: 'universidades', name: 'Universidad Nacional de Entre Ríos (UNER)', latitude: -32.4828, longitude: -58.2370 },
      { group: 'universidades', name: 'Universidad Tecnológica Nacional (UTN)', latitude: -32.4811, longitude: -58.2359 },
      { group: 'universidades', name: 'UCU - Universidad de Concepción del Uruguay', latitude: -32.4824, longitude: -58.2408 },
      { group: 'universidades', name: 'UADER - Facultad de Ciencia y Tecnología', latitude: -32.4798, longitude: -58.2322 },
      { group: 'universidades', name: 'ISFD “Tobas” - Instituto de Formación Docente', latitude: -32.4817, longitude: -58.2291 },
      { group: 'universidades', name: 'IFTS 3 - Instituto Superior Técnico', latitude: -32.4865, longitude: -58.2327 },

      // Farmacias
      { group: 'farmacias', name: 'Farmacia Escolar', latitude: -32.4846, longitude: -58.2315 },
      { group: 'farmacias', name: 'Farmacia Inglesa', latitude: -32.4860, longitude: -58.2342 },
      { group: 'farmacias', name: 'Farmacia San Martín', latitude: -32.4827, longitude: -58.2316 },
      { group: 'farmacias', name: 'Farmacia La Popular', latitude: -32.4853, longitude: -58.2331 },
      { group: 'farmacias', name: 'Farmacia Sanguinetti', latitude: -32.4872, longitude: -58.2290 },
      { group: 'farmacias', name: 'Farmacia Gatica', latitude: -32.4839, longitude: -58.2378 },

      // Emergencias
      { group: 'emergencias', name: 'Hospital Urquiza', latitude: -32.4854, longitude: -58.2302 },
      { group: 'emergencias', name: 'Bomberos Voluntarios CDU', latitude: -32.4858, longitude: -58.2287 },
      { group: 'emergencias', name: 'Comisaría Primera', latitude: -32.4820, longitude: -58.2365 },
      { group: 'emergencias', name: 'Emergencias 107', latitude: -32.4869, longitude: -58.2306 },
      { group: 'emergencias', name: 'Policía Federal Argentina CDU', latitude: -32.4843, longitude: -58.2334 },
      { group: 'emergencias', name: 'Defensa Civil CDU', latitude: -32.4832, longitude: -58.2351 },

      // Supermercados
      { group: 'supermercados', name: 'Supermercado Modelo', latitude: -32.4842, longitude: -58.2300 },
      { group: 'supermercados', name: 'Supermercado Gran Rex', latitude: -32.4870, longitude: -58.2325 },
      { group: 'supermercados', name: 'Supermercado Día', latitude: -32.4838, longitude: -58.2333 },
      { group: 'supermercados', name: 'Supermercado Dar', latitude: -32.4857, longitude: -58.2314 },
      { group: 'supermercados', name: 'Supermercado Los Hermanos', latitude: -32.4863, longitude: -58.2299 },
      { group: 'supermercados', name: 'Supermercado Mariano Max', latitude: -32.4826, longitude: -58.2368 }
    ];
    

    for (const place of places) {
      console.log(`Agregando ${place.name} (${place.group})...`);
      await client.geoAdd(place.group, {
        longitude: place.longitude,
        latitude: place.latitude,
        member: place.name
      });
    }

    console.log('Todos los lugares han sido agregados correctamente.');
    await client.set(flagKey, 'true'); // Marcar como ejecutado
  } catch (err) {
    console.error('Error al agregar lugares:', err);
  } finally {
    await client.quit();
  }
}

seedPlaces();