// db.js
const mongoose = require("mongoose");

<<<<<<< HEAD
mongoose.connect(process.env.DB_URI);
=======
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
>>>>>>> 50bc8428eba644b356898945a2134b8590826159

const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to the database!'));

module.exports = db; // Export the database connection
