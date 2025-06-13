const db = require('../db');

const agregarDetallesPedido = (detalles, callback) => {
  // Primero obtenemos los precios de los productos
  const productoIds = detalles.map(d => d.producto_id);
  const querySelect = 'SELECT ID, Precio FROM productos WHERE ID IN (?)';
  
  db.query(querySelect, [productoIds], (err, productos) => {
    if (err) return callback(err);
    
    // Mapeamos los precios
    const productosMap = {};
    productos.forEach(p => productosMap[p.ID] = p.Precio);
    
    // Preparamos los valores para la inserción
    const valores = detalles.map(detalle => [
      detalle.cantidad,
      detalle.pedido_id,
      detalle.producto_id,
      detalle.talla_producto_id,  // Nuevo campo para la talla
      productosMap[detalle.producto_id] * detalle.cantidad // Calculamos el precio total
    ]);

    const queryInsert = `
      INSERT INTO detalles_pedido 
      (Cantidad, Pedido_ID, Producto_ID, Talla_Producto_ID, Precio) 
      VALUES ?
    `;
    
    db.query(queryInsert, [valores], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  });
};

module.exports = { agregarDetallesPedido };