// Models/productoModel.js
const db = require('../db');  // Importamos la conexión desde db.js

// Función para obtener todos los productos
const obtenerProductos = (callback) => {
  const query = 'SELECT * FROM productos';  // Consulta para obtener los productos
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, results);
  });
};

module.exports = { obtenerProductos };  // Exportamos la función para usarla en otros archivos
