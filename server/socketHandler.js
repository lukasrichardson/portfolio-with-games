const User = require('./user');

const socketHandler = async (socket, io, players, bullets, rooms) => {
    console.log('a user connected to the server');
    socket.on('joinRoom', (roomId) => {
        if (!roomId) roomId = 0;
        // add socketId to room
        socket.join(roomId);
        socket.roomId = roomId;
        // initialize room if it doesnt exist
        if (!players[roomId]) players[roomId] = {};
        // add new player to players object
        players[roomId][socket.id] = {
            rotation: 0,
            x: Math.floor(Math.random() * 400) + 50,
            y: Math.floor(Math.random() * 400) + 50,
            playerId: socket.id,
            roomId
        };
        // send players object to the new player
        socket.emit('currentPlayers', players[roomId]);
        // update all other players of new player
        socket.broadcast.to(roomId).emit('newPlayer', players[roomId][socket.id]);
    })

    socket.on('playerMovement', movementData => {
        if (players[socket.roomId][socket.id]) {
            players[socket.roomId][socket.id].x = movementData.x;
            players[socket.roomId][socket.id].y = movementData.y;
            players[socket.roomId][socket.id].rotation = movementData.rotation;
            socket.broadcast.to(socket.roomId).emit('playerMoved', players[socket.roomId][socket.id]);
        }
    });

    socket.on('shootBullet', shotInfo => {
        if (!bullets[socket.roomId]) bullets[socket.roomId] = {};
        bullets[socket.roomId][socket.id] = {
            ...shotInfo,
            playerId: socket.id
        };
        io.to(socket.roomId).emit('bulletShot', bullets[socket.roomId][socket.id]);
    });

    socket.on('hitPlayer', ({ bullet, id: playerId}) => {
        delete bullets[socket.roomId][socket.id];
        io.to(socket.roomId).emit('playerHit', { player: players[socket.roomId][socket.id], bullet: {...bullet, playerId}})
    });

    socket.on('deadPlayer', () => {
        // remove player from players object
        if (players[socket.roomId]) {
            delete players[socket.roomId][socket.id];
            // update all other players of deleted player
            io.to(socket.roomId).emit('disconnect', socket.id);
        }
    })

    socket.on('disconnect', () => {
        // remove socket ID from room
        console.log('a user disconnected')
        // remove players from players object
        if (players[socket.roomId]) {
            delete players[socket.roomId][socket.id];
            // update all other players of deleted player
            io.emit('disconnect', socket.id);
        }
    });
}

module.exports = socketHandler;