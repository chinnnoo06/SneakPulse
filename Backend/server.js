const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Usar CORS para permitir solicitudes desde el frontend
app.use(cors());

// Conectar a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',      // Cambia si tu servidor MySQL está en otro lugar
  user: 'root',           // Usuario de MySQL
  password: '82718640',           // Contraseña de MySQL
  database: 'practica'    // Nombre de la base de datos
});

// Verificar la conexión a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error de conexión con MySQL:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Crear un endpoint para obtener los productos
app.get('/api/productos', (req, res) => {
  const query = 'SELECT * FROM producto';  // Query para obtener los productos
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener productos', error: err });
      return;
    }
    res.json(results);  // Enviar los productos como JSON
  });
});

// Iniciar el servidor Express
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
