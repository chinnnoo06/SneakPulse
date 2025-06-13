// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middlewares DEBEN ir antes de las rutas
app.use(express.json()); // Para parsear JSON
app.use(cors()); // Habilitar CORS

const productoModel = require('./Models/productoModel');  // Importar el modelo de productos
const detallePedidoModel = require('./Models/detallePedidoModel');  // Importar el modelo de detalles del pedido
const crearCuentaModel = require('./Models/crearcuenta');
const iniciarSesionModel = require('./Models/iniciarsesion');
const obtenerDatosRecuperarModel = require('./Models/obtenerdatosrecuperar');
const cambiarContrasenia = require('./Models/cambiarcontrasenia');
const detalleProducto = require('./Models/detallesProducto');
const cambiarStock = require('./Models/cambiarStock');
const db = require('./db');
const obtenerCarrito = require('./Models/obtenerCarrito');
const obtenerPerfil = require('./Models/obtenerPerfil')

// Endpoint para verificar si el usuario tiene items en el carrito
app.get('/api/verificar-carrito/:usuarioId', (req, res) => {
  const usuarioId = req.params.usuarioId;
  
  if (!usuarioId || isNaN(usuarioId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario inválido'
    });
  }

  const query = `
    SELECT COUNT(dp.ID) AS items_count
    FROM pedido p
    LEFT JOIN detalles_pedido dp ON p.ID = dp.Pedido_ID
    WHERE p.Usuario_ID = ?
    GROUP BY p.ID
  `;
  
  db.query(query, [usuarioId], (err, resultados) => {
    if (err) {
      console.error('Error al verificar carrito:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar el carrito'
      });
    }
    
    // Si hay resultados y items_count > 0, hay productos en el carrito
    const tieneItems = resultados.length > 0 && resultados[0].items_count > 0;
    res.json(tieneItems);
  });
});

// Obtener perfil de usuario
app.get('/api/obtener-perfil/:usuarioId', (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  
  if (isNaN(usuarioId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario inválido'
    });
  }

  obtenerPerfil.obtenerPerfilUsuario(usuarioId, (err, perfil) => {
    if (err) {
      console.error('Error al obtener perfil:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener perfil'
      });
    }
    
    res.json({
      success: true,
      data: perfil
    });
  });
});

// Actualizar perfil de usuario
app.put('/api/obtener-perfil/:usuarioId', (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  
  if (isNaN(usuarioId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario inválido'
    });
  }

  const datosActualizados = req.body;
  
  obtenerPerfil.actualizarPerfilUsuario(usuarioId, datosActualizados, (err, resultado) => {
    if (err) {
      console.error('Error al actualizar perfil:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Error al actualizar perfil'
      });
    }
    
    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: resultado
    });
  });
});

// Actualizar perfil de usuario
app.put('/api/obtener-perfil/:usuarioId', (req, res) => {
  const usuarioId = req.params.usuarioId;
  const datosActualizados = req.body;
  
  obtenerPerfil.actualizarPerfilUsuario(usuarioId, datosActualizados, (err, resultado) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: err.message
      });
    }
    
    res.json({
      success: true,
      message: 'Perfil actualizado correctamente'
    });
  });
});

// Crear un endpoint para obtener los productos
app.get('/api/productos', (req, res) => {
  productoModel.obtenerProductos((err, productos) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener productos', error: err });
      return;
    }
    res.json(productos);  // Enviar los productos como JSON
  });
});

// Obtener o crear pedido activo para un usuario
app.get('/api/pedido-activo/:usuarioId', (req, res) => {
  const usuarioId = req.params.usuarioId;
  
  // Primero buscamos si el usuario tiene un pedido sin finalizar
  const query = `
    SELECT ID 
    FROM pedido 
    WHERE Usuario_ID = ? 
    LIMIT 1
  `;
  
  db.query(query, [usuarioId], (err, resultados) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Error al buscar pedido activo',
        error: err.message
      });
    }
    
    if (resultados.length > 0) {
      // Si existe un pedido activo, lo retornamos
      return res.json(resultados[0]);
    }
    
    // Si no existe, creamos uno nuevo
    const insertQuery = 'INSERT INTO pedido (Usuario_ID, Fecha_Creacion) VALUES (?, NOW())';
    
    db.query(insertQuery, [usuarioId], (err, result) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          message: 'Error al crear nuevo pedido',
          error: err.message
        });
      }
      
      res.json({ ID: result.insertId });
    });
  });
});


// Endpoint modificado para agregar detalles del pedido
app.post('/api/agregar-detalles-pedido', (req, res) => {
  console.log('Datos recibidos para detalles:', req.body);
  
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ 
      success: false,
      message: 'Se esperaba un array de detalles' 
    });
  }

  // Validar estructura de cada detalle
  const detallesValidos = req.body.every(detalle => 
    detalle.cantidad && 
    detalle.pedido_id && 
    detalle.producto_id &&
    detalle.talla_producto_id !== undefined
  );
  
  if (!detallesValidos) {
    return res.status(400).json({
      success: false,
      message: 'Estructura de detalles incorrecta',
      required: ['cantidad', 'pedido_id', 'producto_id', 'talla_producto_id']
    });
  }

  detallePedidoModel.agregarDetallesPedido(req.body, (err, result) => {
    if (err) {
      console.error('Error completo en agregarDetallesPedido:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error al agregar detalles del pedido',
        error: err.sqlMessage || err.message
      });
    }
    
    console.log('Detalles agregados correctamente:', result);
    res.json({ 
      success: true,
      message: 'Producto agregado al carrito exitosamente'
    });
  });
});

app.post('/api/crearcuenta', (req, res) => {
  console.log('Solicitud recibida en /api/crearcuenta', req.body);
  
  const { nombre, apellido, correo, direccion, password, preguntaSeguridad, respuestaSeguridad } = req.body;

  // Validación mejorada
  if (!nombre || !apellido || !correo || !direccion || !password || !preguntaSeguridad || !respuestaSeguridad) {
    return res.status(400).json({ 
      success: false,
      message: 'Todos los campos son obligatorios',
      camposFaltantes: {
        nombre: !nombre,
        apellido: !apellido,
        correo: !correo,
        direccion: !direccion,
        password: !password,
        preguntaSeguridad: !preguntaSeguridad,
        respuestaSeguridad: !respuestaSeguridad
      }
    });
  }

  crearCuentaModel.crearUsuario({ 
    nombre, 
    apellido, 
    correo, 
    direccion, 
    password,
    preguntaSeguridad,
    respuestaSeguridad
  }, (err, usuarioId) => {
    if (err) {
      console.error('Error al crear usuario:', err);
      
      let statusCode = 500;
      if (err.code === 'EMAIL_EXISTS') {
        statusCode = 409; // Conflict
      }
      
      return res.status(statusCode).json({ 
        success: false,
        code: err.code,
        message: err.message,
        error: err.sqlError || err.message
      });
    }
    
    res.json({ 
      success: true,
      message: 'Usuario creado exitosamente',
      usuarioId 
    });
  });
});

// Endpoint para iniciar sesión
app.post('/api/iniciarsesion', (req, res) => {
    console.log('Solicitud de inicio de sesión recibida');
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email y contraseña son requeridos'
        });
    }

    iniciarSesionModel.verificarCredenciales(email, password, (err, resultado) => {
        if (err) {
            console.error('Error al iniciar sesión:', err.message);
            
            let statusCode = 500;
            let message = 'Error al iniciar sesión';
            
            if (err.message === 'Usuario no encontrado') {
                statusCode = 404;
                message = err.message;
            } else if (err.message === 'Contraseña incorrecta') {
                statusCode = 401;
                message = err.message;
            }
            
            return res.status(statusCode).json({
                success: false,
                message
            });
        }

        res.json(resultado);
    });
});

// Agrega esto con los otros endpoints
app.post('/api/obtenerdatosrecuperar', (req, res) => {
    console.log('Solicitud de datos para recuperación recibida');
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'El email es requerido'
        });
    }

    obtenerDatosRecuperarModel.obtenerDatosRecuperacion(email, (err, datos) => {
        if (err) {
            console.error('Error al obtener datos:', err.message);
            
            let statusCode = 500;
            let message = 'Error al obtener datos';
            
            if (err.message === 'Usuario no encontrado') {
                statusCode = 404;
                message = err.message;
            }
            
            return res.status(statusCode).json({
                success: false,
                message
            });
        }

        res.json({
            success: true,
            ...datos
        });
    });
});

// Agrega esto con los otros endpoints en server.js
app.post('/api/cambiarcontrasenia', (req, res) => {
    console.log('Solicitud de cambio de contraseña recibida');
    const { email, nuevaContrasenia } = req.body;

    if (!email || !nuevaContrasenia) {
        return res.status(400).json({
            success: false,
            message: 'Email y nueva contraseña son requeridos'
        });
    }

    cambiarContrasenia.cambiarContrasenia(email, nuevaContrasenia, (err, resultado) => {
        if (err) {
            console.error('Error al cambiar contraseña:', err.message);
            
            let statusCode = 500;
            let message = 'Error al cambiar contraseña';
            
            if (err.message === 'Usuario no encontrado') {
                statusCode = 404;
                message = err.message;
            }
            
            return res.status(statusCode).json({
                success: false,
                message
            });
        }

        res.json({
            success: true,
            message: 'Contraseña cambiada exitosamente'
        });
    });
});

// Endpoint para obtener tallas
app.get('/api/tallas-producto/:productoId', (req, res) => {
  const productoId = req.params.productoId;
  
  detalleProducto.obtenerTallasPorProducto(productoId, (err, tallas) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Error al obtener tallas del producto',
        error: err.message
      });
    }
    
    res.json(tallas);
  });
});

// Agrega esto con los otros endpoints en server.js
app.put('/api/actualizar-stock', (req, res) => {
  console.log('Solicitud de actualización de stock recibida');
  const { tallaProductoId, nuevaCantidad } = req.body;

  if (!tallaProductoId || nuevaCantidad === undefined) {
    return res.status(400).json({
      success: false,
      message: 'ID de talla_producto y nueva cantidad son requeridos'
    });
  }

  cambiarStock.actualizarStock(tallaProductoId, nuevaCantidad, (err, resultado) => {
    if (err) {
      console.error('Error al actualizar stock:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar stock'
      });
    }

    res.json({
      success: true,
      message: 'Stock actualizado exitosamente'
    });
  });
});

// Obtener carrito de usuario
app.get('/api/obtener-carrito/:usuarioId', (req, res) => {
  const usuarioId = req.params.usuarioId;
  
  obtenerCarrito.obtenerCarritoUsuario(usuarioId, (err, resultado) => {
    if (err) {
      console.error('Error completo:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error al obtener carrito',
        error: err.message || 'Error desconocido'
      });
    }
    
    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el carrito'
      });
    }
    
    res.json(resultado);
  });
});

// Actualizar cantidad de un producto en el carrito
app.put('/api/actualizar-cantidad/:detalleId', (req, res) => {
  const detalleId = req.params.detalleId;
  const { cantidad } = req.body;
  
  // Validaciones mejoradas
  if (!cantidad || isNaN(cantidad) || cantidad < 1) {
    return res.status(400).json({
      success: false,
      message: 'La cantidad debe ser un número mayor que 0'
    });
  }

  // Consulta optimizada para evitar el error MySQL
  const query = `
    UPDATE detalles_pedido dp
    JOIN productos p ON p.ID = dp.Producto_ID
    SET dp.Cantidad = ?,
        dp.Precio = p.Precio * ?
    WHERE dp.ID = ?
  `;
  
  db.query(query, [cantidad, cantidad, detalleId], (err, result) => {
    if (err) {
      console.error('Error en la consulta SQL:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar cantidad en la base de datos',
        error: err.message,
        sqlError: err.code
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el detalle del pedido con el ID proporcionado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cantidad actualizada correctamente',
      affectedRows: result.affectedRows
    });
  });
});

// Eliminar producto del carrito
app.delete('/api/eliminar-producto/:detalleId', (req, res) => {
  const detalleId = req.params.detalleId;
  
  const query = 'DELETE FROM detalles_pedido WHERE ID = ?';
  
  db.query(query, [detalleId], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar producto',
        error: err.message
      });
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado del carrito'
    });
  });
});

// En server.js, con los otros endpoints
app.delete('/api/limpiar-carrito/:pedidoId', (req, res) => {
  const pedidoId = req.params.pedidoId;
  
  // Primero obtenemos todos los detalles del pedido
  const getDetailsQuery = `
    SELECT Talla_Producto_ID, Cantidad 
    FROM detalles_pedido 
    WHERE Pedido_ID = ?
  `;
  
  db.query(getDetailsQuery, [pedidoId], (err, detalles) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener detalles del pedido',
        error: err.message
      });
    }
    
    // Si no hay productos en el carrito, retornar éxito
    if (detalles.length === 0) {
      return res.json({
        success: true,
        message: 'Carrito ya estaba vacío',
        affectedRows: 0
      });
    }
    
    // Procesar cada detalle para actualizar el stock
    const updatePromises = detalles.map(detalle => {
      return new Promise((resolve, reject) => {
        const updateQuery = `
          UPDATE talla_producto 
          SET Cantidad = Cantidad - ? 
          WHERE ID = ?
        `;
        
        db.query(updateQuery, [detalle.Cantidad, detalle.Talla_Producto_ID], (err, result) => {
          if (err) {
            console.error(`Error al actualizar talla_producto ID ${detalle.Talla_Producto_ID}:`, err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });
    
    // Ejecutar todas las actualizaciones de stock
    Promise.all(updatePromises)
      .then(() => {
        // Una vez actualizados todos los stocks, eliminar los detalles del pedido
        const deleteQuery = 'DELETE FROM detalles_pedido WHERE Pedido_ID = ?';
        
        db.query(deleteQuery, [pedidoId], (err, result) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Error al limpiar el carrito después de actualizar stocks',
              error: err.message
            });
          }
          
          res.json({
            success: true,
            message: 'Carrito limpiado correctamente y stocks actualizados',
            affectedRows: result.affectedRows
          });
        });
      })
      .catch(error => {
        return res.status(500).json({
          success: false,
          message: 'Error al actualizar uno o más stocks de productos',
          error: error.message
        });
      });
  });
});


// Iniciar el servidor Express
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
