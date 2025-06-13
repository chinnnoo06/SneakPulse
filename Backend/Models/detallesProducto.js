// Models/detallesProducto.js
const db = require('../db');

const obtenerTallasPorProducto = (productoId, callback) => {
  const query = `
    SELECT 
      tp.ID,
      t.Nombre,
      tp.Cantidad
    FROM 
      talla_producto tp
    JOIN 
      talla t ON tp.Talla_ID = t.ID
    WHERE 
      tp.Producto_ID = ?
    AND
      tp.Cantidad > 0
    ORDER BY 
      t.Nombre
  `;
  
  db.query(query, [productoId], (err, results) => {
    if (err) {
      callback(err, null);
      return;
    }
    
    // Mapear resultados para incluir ID de talla_producto
    const tallas = results.map(row => ({
      ID: row.ID, // Este es el ID de talla_producto
      Nombre: row.Nombre,
      Cantidad: row.Cantidad
    }));
    
    callback(null, tallas);
  });
};

module.exports = { 
  obtenerTallasPorProducto
};