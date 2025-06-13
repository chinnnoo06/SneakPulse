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

      // Iniciamos una transacción para asegurar que ambas operaciones se completen
      db.beginTransaction((err) => {
        if (err) {
          console.error('Error al iniciar transacción:', err);
          return callback({
            code: 'TRANSACTION_ERROR',
            message: 'Error al iniciar la transacción'
          });
        }

        // Primero insertamos el usuario
        const sqlInsertUsuario = `INSERT INTO usuarios 
          (Nombre, Apellido, Email, Direccion, Password, pregunta_seguridad, respuesta_seguridad, TipoUsuario) 
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)`;

        const paramsUsuario = [
          usuarioData.nombre,
          usuarioData.apellido,
          usuarioData.correo,
          usuarioData.direccion,
          hash,
          usuarioData.preguntaSeguridad,
          usuarioData.respuestaSeguridad
        ];

        db.query(sqlInsertUsuario, paramsUsuario, (err, result) => {
          if (err) {
            console.error('Error al insertar usuario:', err);
            return db.rollback(() => {
              callback({
                code: 'INSERT_ERROR',
                message: 'Error al crear el usuario en la base de datos',
                sqlError: err.sqlMessage
              });
            });
          }
          
          const userId = result.insertId;
          
          // Ahora creamos el carrito (pedido) para el usuario
          const sqlInsertPedido = `INSERT INTO pedido (Usuario_ID, Fecha_Creacion) VALUES (?, NOW())`;
          
          db.query(sqlInsertPedido, [userId], (err, result) => {
            if (err) {
              console.error('Error al crear carrito:', err);
              return db.rollback(() => {
                callback({
                  code: 'CART_ERROR',
                  message: 'Error al crear el carrito para el usuario',
                  sqlError: err.sqlMessage
                });
              });
            }
            
            // Si todo salió bien, hacemos commit
            db.commit((err) => {
              if (err) {
                console.error('Error al hacer commit:', err);
                return db.rollback(() => {
                  callback({
                    code: 'COMMIT_ERROR',
                    message: 'Error al confirmar la transacción'
                  });
                });
              }
              
              callback(null, {
                userId: userId,
                cartId: result.insertId
              });
            });
          });
        });
      });
    });
  });
};

module.exports = {
  crearUsuario
};