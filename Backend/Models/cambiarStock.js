// Models/cambiarStock.js
const db = require('../db');

module.exports = {
  actualizarStock: (tallaProductoId, nuevaCantidad, callback) => {
    const query = 'UPDATE talla_producto SET Cantidad = ? WHERE ID = ?';
    db.query(query, [nuevaCantidad, tallaProductoId], (err, result) => {
      if (err) {
        console.error('Error al actualizar stock:', err);
        return callback(err);
      }
      callback(null, result);
    });
  }
};