let express = require("express");
let app = express();
let http = require("http").Server(app);
let path = require("path");
var PORT = process.env.PORT || 6900;
const io = require('socket.io')(http);

const players = {};

const bullets = {};

io.on('connection', socket => {
    console.log('a user connected');
    // add new player to players object
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 400) + 50,
        y: Math.floor(Math.random() * 400) + 50,
        // y: Math.floor(Math.random()),
        playerId: socket.id,
        team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
    };
    // send players object to the new player
    socket.emit('currentPlayers', players);
    // update all other players of new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('playerMovement', movementData => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].rotation = movementData.rotation;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('shootBullet', shotInfo => {
        bullets[socket.id] = {
            ...shotInfo,
            playerId: socket.id
        };
        io.emit('bulletShot', bullets[socket.id]);
    });

    socket.on('hitPlayer', ({ bullet, id: playerId}) => {
        delete bullets[socket.id];
        io.emit('playerHit', { player: players[socket.id], bullet: {...bullet, playerId}})
    });

    socket.on('deadPlayer', () => {
        // remove player from players object
        delete players[socket.id];
        // update all other players of deleted player
        io.emit('disconnect', socket.id);
    })

    socket.on('disconnect', () => {
        console.log('a user disconnected')
        // remove players from players object
        delete players[socket.id];
        // update all other players of deleted player
        io.emit('disconnect', socket.id);
    });
})

app.use(express.static(path.join(__dirname, "dist"))) ;
app.use(express.static(path.join(__dirname, "src/assets")));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
})

http.listen(PORT, () => {
  console.log(`listening on ${PORT} lol`);
});
