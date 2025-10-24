// backend/src/config/redisClient.js

const { createClient } = require("redis");

// --- CAMBIO CLAVE: Añadimos una estrategia de reconexión ---
// Esto evita que Redis intente reconectarse infinitamente si no está disponible al inicio.
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      // Si es el primer intento (retries = 0) y falla, no intentes más.
      if (retries > 0) {
        return new Error("No se pudo conectar a Redis. No se reintentará.");
      }
      // Para el primer intento, espera 1 segundo.
      return 1000;
    },
  },
});

redisClient.on("connect", () => console.log("Conectando a Redis..."));
redisClient.on("ready", () =>
  console.log("Cliente Redis conectado y listo para usar.")
);
redisClient.on("error", (err) =>
  console.error("Error del Cliente Redis:", err)
);
redisClient.on("end", () => console.log("Cliente Redis desconectado."));

// Función para conectar, que será llamada desde server.js
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    console.warn(
      "⚠️ No se pudo conectar a Redis. El servidor funcionará sin caché."
    );
    // No salimos del proceso, permitimos que la app continúe.
  }
};

// Exportamos tanto el cliente como la función de conexión
module.exports = { redisClient, connectRedis };
