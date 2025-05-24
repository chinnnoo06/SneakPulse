const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'clave_secreta_para_desarrollo_cambiar_en_produccion';

const verificarCredenciales = (email, password, callback) => {
    // Añadimos TipoUsuario a la consulta SQL
    const sql = 'SELECT id, Nombre, Email, Password, TipoUsuario FROM usuarios WHERE Email = ?';
    
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return callback(err);
        }
        
        if (results.length === 0) {
            return callback(new Error('Usuario no encontrado'));
        }
        
        const usuario = results[0];
        
        bcrypt.compare(password, usuario.Password, (err, coincide) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return callback(err);
            }
            
            if (!coincide) {
                return callback(new Error('Contraseña incorrecta'));
            }
            
            // Incluimos TipoUsuario en el token
            const token = jwt.sign(
                { 
                    id: usuario.id,
                    email: usuario.Email,
                    nombre: usuario.Nombre,
                    tipoUsuario: usuario.TipoUsuario // Añadimos el tipo de usuario
                },
                JWT_SECRET,
                { expiresIn: '1h' }
            );
            
            callback(null, {
                success: true,
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.Nombre,
                    email: usuario.Email,
                    tipoUsuario: usuario.TipoUsuario // Enviamos el tipo de usuario al frontend
                }
            });
        });
    });
};

module.exports = {
    verificarCredenciales
};