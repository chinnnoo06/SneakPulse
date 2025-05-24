// Models/verificaremail.js
const db = require('../db');

const verificarEmailExistente = (email, callback) => {
  const sql = 'SELECT Id FROM usuarios WHERE Email = ?';
  
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error al verificar email:', err);
      return callback(err);
    }
    
    callback(null, { existe: results.length > 0 });
  });
};

module.exports = {
  verificarEmailExistente
};