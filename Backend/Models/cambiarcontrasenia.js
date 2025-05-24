// Models/cambiarcontrasenia.js
const bcrypt = require('bcryptjs');
const db = require('../db'); // Asegúrate de que esta ruta sea correcta

const cambiarContrasenia = (email, nuevaContrasenia, callback) => {
    // Primero hasheamos la nueva contraseña
    bcrypt.hash(nuevaContrasenia, 10, (err, hash) => {
        if (err) {
            console.error('Error al hashear contraseña:', err);
            return callback(err);
        }

        // Luego actualizamos en la base de datos
        const query = 'UPDATE usuarios SET Password = ? WHERE Email = ?';
        db.query(query, [hash, email], (err, result) => {
            if (err) {
                console.error('Error al actualizar contraseña:', err);
                return callback(err);
            }

            if (result.affectedRows === 0) {
                return callback(new Error('Usuario no encontrado'));
            }

            callback(null, { success: true });
        });
    });
};

module.exports = {
    cambiarContrasenia
};