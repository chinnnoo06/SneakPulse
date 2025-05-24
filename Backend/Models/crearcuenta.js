const db = require('../db');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const crearUsuario = (usuarioData, callback) => {
  // Primero verificamos si el email ya existe
  const sqlCheck = 'SELECT id FROM usuarios WHERE Email = ?';
  
  db.query(sqlCheck, [usuarioData.correo], (err, results) => {
    if (err) {
      console.error('Error al verificar email:', err);
      return callback({
        code: 'DB_ERROR',
        message: 'Error al verificar el correo electrónico'
      });
    }
    
    if (results.length > 0) {
      return callback({
        code: 'EMAIL_EXISTS',
        message: 'El correo electrónico ya está registrado. Por favor usa otro correo o inicia sesión.'
      });
    }

    // Si el email no existe, procedemos a crear el usuario
    bcrypt.hash(usuarioData.password, saltRounds, (err, hash) => {
      if (err) {
        console.error('Error al hashear contraseña:', err);
        return callback({
          code: 'HASH_ERROR',
          message: 'Error al procesar la contraseña'
        });
      }

      const sqlInsert = `INSERT INTO usuarios 
        (Nombre, Apellido, Email, Direccion, Password, pregunta_seguridad, respuesta_seguridad, TipoUsuario) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)`;

      const params = [
        usuarioData.nombre,
        usuarioData.apellido,
        usuarioData.correo,
        usuarioData.direccion,
        hash,
        usuarioData.preguntaSeguridad,
        usuarioData.respuestaSeguridad
      ];

      db.query(sqlInsert, params, (err, result) => {
        if (err) {
          console.error('Error en la consulta SQL:', err);
          return callback({
            code: 'INSERT_ERROR',
            message: 'Error al crear el usuario en la base de datos',
            sqlError: err.sqlMessage
          });
        }
        
        callback(null, result.insertId);
      });
    });
  });
};

module.exports = {
  crearUsuario
};