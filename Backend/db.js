// db.js
const mysql = require('mysql2');

// Conectar a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '82718640',  // Asegúrate de que esta contraseña sea correcta
  database: 'sneakpulse'
});

// Verificar la conexión a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error de conexión con MySQL:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

module.exports = db; // Exportamos la conexión
