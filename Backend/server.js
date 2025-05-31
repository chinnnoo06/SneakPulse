// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middlewares DEBEN ir antes de las rutas
app.use(express.json()); // Para parsear JSON
app.use(cors()); // Habilitar CORS

const productoModel = require('./Models/productoModel');  // Importar el modelo de productos
const pedidoModel = require('./Models/pedidoModel');  // Importar el modelo de pedido
const detallePedidoModel = require('./Models/detallePedidoModel');  // Importar el modelo de detalles del pedido
const crearCuentaModel = require('./Models/crearcuenta');
const iniciarSesionModel = require('./Models/iniciarsesion');
const obtenerDatosRecuperarModel = require('./Models/obtenerdatosrecuperar');
const cambiarContrasenia = require('./Models/cambiarcontrasenia');
const detalleProducto = require('./Models/detallesProducto');
const cambiarStock = require('./Models/cambiarStock')

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

// Crear un endpoint para agregar un pedido
app.post('/api/crear-pedido', (req, res) => {
  console.log('Datos recibidos:', req.body);
  const { total, usuario_id } = req.body;

  // Validación básica
  if (!total || !usuario_id) {
    return res.status(400).send({ 
      message: 'Datos incompletos', 
      required: ['total', 'usuario_id'] 
    });
  }

  pedidoModel.crearPedido(total, usuario_id, (err, pedidoId) => {
    if (err) {
      console.error('Error en crearPedido:', err);
      return res.status(500).send({ 
        message: 'Error al crear pedido', 
        error: err.message,
        sqlError: err.sqlMessage 
      });
    }
    console.log('Pedido creado con ID:', pedidoId);
    res.json({ pedidoId });
  });
});

// Agregar después del endpoint /api/crear-pedido
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
    detalle.cantidad && detalle.pedido_id && detalle.producto_id
  );
  
  if (!detallesValidos) {
    return res.status(400).json({
      success: false,
      message: 'Estructura de detalles incorrecta',
      required: ['cantidad', 'pedido_id', 'producto_id']
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
      success: true
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

// Iniciar el servidor Express
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
