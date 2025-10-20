// backend/src/config/redisClient.js

const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('connect', () => console.log('Conectando a Redis...'));
redisClient.on('ready', () => console.log('Cliente Redis conectado y listo para usar.'));
redisClient.on('error', (err) => console.error('Error del Cliente Redis:', err));
redisClient.on('end', () => console.log('Cliente Redis desconectado.'));

// Función para conectar, que será llamada desde server.js
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    console.error('⚠️ No se pudo conectar a Redis. La aplicación se cerrará.', err);
    process.exit(1);
  }
};

// Exportamos tanto el cliente como la función de conexión
module.exports = { redisClient, connectRedis };