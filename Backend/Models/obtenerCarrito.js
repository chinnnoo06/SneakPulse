// Models/obtenerCarrito.js
const db = require('../db');

const obtenerCarritoUsuario = (usuarioId, callback) => {
  const query = `
    SELECT 
      detalles_pedido.ID AS id,
      detalles_pedido.Pedido_ID,
      detalles_pedido.Producto_ID AS producto_id,
      productos.Nombre AS nombre,
      productos.Imagen_URL AS imagen_url,
      (detalles_pedido.Precio / detalles_pedido.Cantidad) AS precio_unitario,
      detalles_pedido.Cantidad AS cantidad,
      detalles_pedido.Precio AS precio_total,
      talla.Nombre AS talla_nombre,
      detalles_pedido.Talla_Producto_ID AS talla_producto_id
    FROM 
      detalles_pedido
    JOIN 
      productos ON detalles_pedido.Producto_ID = productos.ID
    JOIN 
      pedido ON detalles_pedido.Pedido_ID = pedido.ID
    JOIN
      talla_producto ON detalles_pedido.Talla_Producto_ID = talla_producto.ID
    JOIN
      talla ON talla_producto.Talla_ID = talla.ID
    WHERE 
      pedido.Usuario_ID = ?
  `;
  
  db.query(query, [usuarioId], (err, productos) => {
    if (err) {
      console.error('Error en la consulta SQL:', err);
      return callback({
        success: false,
        message: 'Error en la consulta de base de datos',
        error: err.message
      }, null);
    }
    
    try {
      // Calcular total del carrito
      const total = productos.reduce((sum, producto) => {
        return sum + parseFloat(producto.precio_total);
      }, 0);
      
      callback(null, {
        success: true,
        productos: productos,
        total: total
      });
    } catch (error) {
      console.error('Error al procesar resultados:', error);
      callback({
        success: false,
        message: 'Error al procesar resultados',
        error: error.message
      }, null);
    }
  });
};

module.exports = {
  obtenerCarritoUsuario
};