// Models/detallesProducto.js
const db = require('../db');  // Importamos la conexión desde db.js

// Función para obtener las tallas disponibles de un producto
const obtenerTallasPorProducto = (productoId, callback) => {
  const query = `
    SELECT 
      tp.ID,
      t.ID,
      t.Nombre,
      tp.Cantidad
    FROM 
      talla_producto tp
    JOIN 
      talla t ON tp.Talla_ID = t.ID
    WHERE 
      tp.Producto_ID = ?
    ORDER BY 
      t.Nombre
  `;
  
  db.query(query, [productoId], (err, results) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, results);
  });
};


module.exports = { 
  obtenerTallasPorProducto
};