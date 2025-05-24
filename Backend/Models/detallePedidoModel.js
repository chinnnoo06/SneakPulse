// Models/detallePedidoModel.js
const db = require('../db');  // Importamos la conexión desde db.js

// Función para agregar detalles del pedido
const agregarDetallesPedido = (detalles, callback) => {
  // Insertar múltiples registros en la tabla detalles_pedido
  const query = 'INSERT INTO detalles_pedido (Cantidad, Pedido_ID, Producto_ID) VALUES ?';
  const valores = detalles.map(detalle => [detalle.cantidad, detalle.pedido_id, detalle.producto_id]);

  db.query(query, [valores], (err, results) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null);  // Si todo sale bien, ejecutamos el callback sin errores
  });
};

module.exports = { agregarDetallesPedido };  // Exportamos la función para usarla en otros archivos
