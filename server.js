require('dotenv').config();
const usersRouter = require('./server/routes/usersRouter');
const handleRealtimeMessages = require('./server/handleRealtimeMessages');
let express = require("express");
let app = express();
let http = require("http").Server(app);
let path = require("path");
var PORT = process.env.PORT || 6900;
const io = require('socket.io')(http);
const socketHandler = require('./server/socketHandler');


// const Ably = require('ably');
// const client = new Ably.Realtime('ApN8IQ.be-89A:Upr3FcgI9KDzbxxQ');

// let totalPlayers = 0;

// let test = 0;
// client.connection.once('connected', () => {
// handleRealtimeMessages(client, totalPlayers, test);
// })


// const mongoose = require('mongoose');

// mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection;
// db.on('error', error => console.error(error));
// db.once('open', () => console.log('Connected to Database'));

const game1Players = {};
const rooms = {};

const bullets = {};


handleRealtimeMessages(io);


app.use(express.json());
app.use(express.static(path.join(__dirname, "dist"))) ;
app.use(express.static(path.join(__dirname, "src/assets")));

app.use('/users', usersRouter);

//create a uniqueId to assign to clients on auth
const uniqueId = function () {
  // return "id-" + totalPlayers + Math.random().toString(36).substr(2, 16);
  return "id-" + Math.random().toString(36).substr(2, 16);
};
app.get("/auth", (request, response) => {
  const tokenParams = { clientId: uniqueId() };
  client.auth.createTokenRequest(tokenParams, function (err, tokenRequest) {
    if (err) {
      response
        .status(500)
        .send("Error requesting token: " + JSON.stringify(err));
    } else {
      response.setHeader("Content-Type", "application/json");
      response.send(JSON.stringify(tokenRequest));
    }
  });
});
app.get('/custom', (req, res) => {
  res.sendFile(path.join(__dirname + '/dist/solarSystem.html'));
})
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});



http.listen(PORT, () => {
  console.log(`listening on ${PORT} lol`);
});
