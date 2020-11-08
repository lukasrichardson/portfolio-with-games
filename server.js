require('dotenv').config();
const usersRouter = require('./server/routes/usersRouter');
let express = require("express");
let app = express();
let http = require("http").Server(app);
let path = require("path");
var PORT = process.env.PORT || 6900;
const io = require('socket.io')(http);
const socketHandler = require('./server/socketHandler')
// const mongoose = require('mongoose');

// mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection;
// db.on('error', error => console.error(error));
// db.once('open', () => console.log('Connected to Database'));

const players = {};
const rooms = {};

const bullets = {};

io.on('connection', socket => {
    socketHandler(socket, io, players, bullets, rooms);
})

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist"))) ;
app.use(express.static(path.join(__dirname, "src/assets")));

app.use('/users', usersRouter);
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});



http.listen(PORT, () => {
  console.log(`listening on ${PORT} lol`);
});
