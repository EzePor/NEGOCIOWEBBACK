// Importacion de libreria
require("dotenv").config(); // utiliza las variables de entorno .env
const express = require("express");
const cors = require("cors"); //  para permitir solicitudes desde el frontend.
const fotosUsuario = require("./src/routes/fotosUsuario");
const authRoutes = require("./src/routes/auth");
const pedidosRoutes = require("./src/routes/pedidos");

// Importacion de archivos
const connectDB = require("./src/database/connection"); // conexion mongodb
const RUTAS_PRODUCTOS = require("./src/routes/productos"); // rutas get/ post/put/delete

// Configuracion de express
const app = express();

app.use(cors());

app.use(express.json());

// Declaraciones de servidor(rutas que se usan, middleware,etc)
app.use("/productos", RUTAS_PRODUCTOS);
app.use("/fotosUsuario", fotosUsuario);
app.use("/api/auth", authRoutes);
app.use("/pedidos", pedidosRoutes);

// Inicializacion del servidor
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);

  // Conexion a la base de datos
  connectDB();
});
