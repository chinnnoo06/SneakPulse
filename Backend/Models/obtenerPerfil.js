const db = require('../db');

function obtenerPerfilUsuario(usuarioId, callback) {
  // Validar que el usuarioId sea un número
  if (isNaN(usuarioId)) {
    return callback(new Error('ID de usuario inválido'));
  }

  const query = `
    SELECT 
      ID,
      Nombre, 
      Apellido, 
      Email, 
      Direccion, 
      Pregunta_Seguridad, 
      Respuesta_Seguridad
    FROM usuarios 
    WHERE ID = ?
    LIMIT 1
  `;
  
  db.query(query, [usuarioId], (err, resultados) => {
    if (err) {
      console.error('Error en la consulta SQL:', err);
      return callback(err);
    }
    
    if (resultados.length === 0) {
      return callback(new Error('Usuario no encontrado'));
    }
    
    callback(null, resultados[0]);
  });
}

function actualizarPerfilUsuario(usuarioId, datos, callback) {
  // Validar que el usuarioId sea un número
  if (isNaN(usuarioId)) {
    return callback(new Error('ID de usuario inválido'));
  }

  const { 
    Nombre, 
    Apellido, 
    Direccion, 
    Pregunta_Seguridad, 
    Respuesta_Seguridad 
  } = datos;
  
  // Validar campos requeridos
  if (!Nombre || !Apellido || !Direccion || !Pregunta_Seguridad || !Respuesta_Seguridad) {
    return callback(new Error('Todos los campos son requeridos'));
  }

  const query = `
    UPDATE usuarios
    SET 
      Nombre = ?,
      Apellido = ?,
      Direccion = ?,
      Pregunta_Seguridad = ?,
      Respuesta_Seguridad = ?
    WHERE ID = ?
  `;
  
  db.query(query, [
    Nombre,
    Apellido,
    Direccion,
    Pregunta_Seguridad,
    Respuesta_Seguridad,
    usuarioId
  ], (err, result) => {
    if (err) {
      console.error('Error en la consulta SQL:', err);
      return callback(err);
    }
    
    if (result.affectedRows === 0) {
      return callback(new Error('No se encontró el usuario para actualizar'));
    }
    
    callback(null, true);
  });
}

module.exports = {
  obtenerPerfilUsuario,
  actualizarPerfilUsuario
};