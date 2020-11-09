const socketHandler = async (socket, io, players, bullets, rooms) => {
    console.log('a user connected to the server');
    socket.on('getRooms', () => {
        socket.emit('sendRooms', players);
    });
    socket.on('askToJoin', request => {
        let { username, roomNumber } = request;
        if (!players[roomNumber]) {
            socket.emit('allowJoin', { username, roomNumber });
        } else {
            if (!players[roomNumber][username]) {
                socket.emit('allowJoin', { username, roomNumber });
            } else {
                socket.emit('denyJoin', { username, roomNumber });
            }
        }
    });
    socket.on('joinRoom', ({ username, roomNumber}) => {
        if (!roomNumber) roomNumber = 0;
        // add socketId to room
        socket.join(roomNumber);
        socket.roomNumber = roomNumber;
        // initialize room if it doesnt exist
        if (!players[roomNumber]) players[roomNumber] = {};
        // add new player to players object
        players[roomNumber][socket.id] = {
            rotation: 0,
            x: Math.floor(Math.random() * 400) + 50,
            y: Math.floor(Math.random() * 400) + 50,
            playerId: socket.id,
            roomNumber,
            username: username
        };
        // send players object to the new player
        socket.emit('currentPlayers', players[roomNumber]);
        // update all other players of new player
        socket.broadcast.to(roomNumber).emit('newPlayer', players[roomNumber][socket.id]);
    })

    socket.on('playerMovement', movementData => {
        const oldPlayerMovement = { ...players[socket.roomNumber][socket.id] };
        if (players[socket.roomNumber][socket.id]) {
            players[socket.roomNumber][socket.id].x = movementData.x;
            players[socket.roomNumber][socket.id].y = movementData.y;
            players[socket.roomNumber][socket.id].rotation = movementData.rotation;
            players[socket.roomNumber][socket.id].xVel = movementData.xVel;
            players[socket.roomNumber][socket.id].yVel = movementData.yVel;
            io.to(socket.roomNumber).emit('playerMoved', { new:players[socket.roomNumber][socket.id], old: oldPlayerMovement});
        }
    });

    socket.on('shootBullet', shotInfo => {
        if (!bullets[socket.roomNumber]) bullets[socket.roomNumber] = {};
        bullets[socket.roomNumber][socket.id] = {
            ...shotInfo,
            playerId: socket.id
        };
        io.to(socket.roomNumber).emit('bulletShot', bullets[socket.roomNumber][socket.id]);
    });

    socket.on('hitPlayer', ({ bullet, id: playerId}) => {
        delete bullets[socket.roomNumber][socket.id];
        io.to(socket.roomNumber).emit('playerHit', { player: players[socket.roomNumber][socket.id], bullet: {...bullet, playerId}})
    });

    socket.on('deadPlayer', () => {
        // remove player from players object
        if (players[socket.roomNumber]) {
            delete players[socket.roomNumber][socket.id];
            // update all other players of deleted player
            io.to(socket.roomNumber).emit('disconnect', socket.id);
        }
    })

    socket.on('disconnect', () => {
        // remove socket ID from room
        console.log('a user disconnected')
        // remove players from players object
        if (players[socket.roomNumber]) {
            delete players[socket.roomNumber][socket.id];
            // update all other players of deleted player
            io.emit('disconnect', socket.id);
        }
    });
}

module.exports = socketHandler;