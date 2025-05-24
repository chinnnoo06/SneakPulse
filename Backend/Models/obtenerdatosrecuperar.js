const db = require('../db');

const obtenerDatosRecuperacion = (email, callback) => {
    const sql = 'SELECT Pregunta_Seguridad, Respuesta_Seguridad FROM usuarios WHERE Email = ?';
    
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return callback(err);
        }
        
        if (results.length === 0) {
            return callback(new Error('Usuario no encontrado'));
        }
        
        const usuario = results[0];
        
        callback(null, {
            preguntaSeguridad: usuario.Pregunta_Seguridad,
            respuestaSeguridad: usuario.Respuesta_Seguridad
        });
    });
};

module.exports = {
    obtenerDatosRecuperacion
};