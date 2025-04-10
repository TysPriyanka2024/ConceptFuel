//jshint esversion:6
require("dotenv").config();
const express = require("express");
const jwt = require('jsonwebtoken');
const app = express();
const bodyParser = require("body-parser");
const path = require("path"); 
const morgan = require("morgan")
const db = require('./managers/models/db')
const cookieParser = require('cookie-parser');
const Mailer = require('./mailer/mailer.js')
const routesWeb = require('./web');
const routesApi = require('./api');
const fs = require('fs');

const { AuthMiddleware } = require('./web/admin/middlewares');
const { AuthController } = require('./web/admin/controllers');


app.use(cookieParser());
app.set('view engine', 'ejs'); // Set EJS as the default template engine
app.set('views', path.join(__dirname, './src/views')); // Set views directory
// Parse JSON-encoded request bodies
app.use(bodyParser.json({ extended: true }));

// Parse URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public',express.static("./src/public"));
app.use('/invoice',express.static("./mailer/invoices"));

app.use(morgan(':remote-addr - :remote-user [:date[web]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

app.use('/images', express.static(path.join(__dirname, './src/uploads')));



app.use('/api', routesApi);
app.use(routesWeb);

app.get('/', AuthMiddleware.authenticateToken("Admin"), AuthController.redirecter);
app.get('*', AuthMiddleware.authenticateToken("Admin"), AuthController.pageNotFound);


ports = [process.env.PORT, process.env.PORT1, process.env.PORT2]
// Loop through the ports and start the server on each port
ports.forEach((port) => {
    app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    });
});