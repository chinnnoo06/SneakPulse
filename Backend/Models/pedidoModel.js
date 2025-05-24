const db = require('../db');

const crearPedido = (total, usuario_id, callback) => {
  console.log('Ejecutando consulta con:', { total, usuario_id });
  
  const query = 'INSERT INTO pedido (Total, Usuario_ID) VALUES (?, ?)';
  
  db.query(query, [total, usuario_id], (err, results) => {
    if (err) {
      console.error('Error SQL detallado:', {
        code: err.code,
        errno: err.errno,
        sqlMessage: err.sqlMessage,
        sqlState: err.sqlState,
        sql: err.sql
      });
      return callback(err, null);
    }
    
    console.log('Resultados de inserción:', results);
    const pedidoId = results.insertId;
    callback(null, pedidoId);
  });
};

module.exports = { crearPedido };