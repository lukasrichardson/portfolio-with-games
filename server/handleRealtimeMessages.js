const p2 = require("p2");

// const CANVAS_HEIGHT = 750;
// const CANVAS_WIDTH = 1400;
// const SHIP_PLATFORM = 718;
// const PLAYER_VERTICAL_INCREMENT = 20;
// const PLAYER_VERTICAL_MOVEMENT_UPDATE_INTERVAL = 1000;
// const PLAYER_SCORE_INCREMENT = 5;
const P2_WORLD_TIME_STEP = 1 / 16;
// const P2_WORLD_TIME_STEP = 10;
const MIN_PLAYERS = 1;
const GAME_TICKER_MS = 30;

const handleRealtimeMessages = (io) => {
    let players = {};
    let playerBodies = {};
    let world;
    let gameOn = false;

    io.on('connection', socket => {
        // let gameOn = false;
        let alivePlayers = 0;
        let gameRoom;
        let gameTickerOn = false;
        let playerBody;
        socket.on('askToJoin', ({ username, roomNumber}) => {
            if (!roomNumber) roomNumber = 0;
            if (!players[roomNumber]) {
                console.log('test1', username, roomNumber);
                socket.emit('allowJoin', { username, roomNumber });
            } else {
                console.log('test2', username, roomNumber);
                if (!players[roomNumber][username]) {
                    console.log('test3', username, roomNumber);
                    socket.emit('allowJoin', { username, roomNumber });
                } else {
                    console.log('test4', username, roomNumber);
                    socket.emit('denyJoin');
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
                username: username,
                yVel: 0,
                xVel: 0
            };
            // send players object to the new player
            // socket.emit('currentPlayers', players[roomNumber]);
            // update all other players of new player
            // socket.broadcast.to(roomNumber).emit('newPlayer', players[roomNumber][socket.id]);
            if (!gameOn) {
                startGame();
                gameTickerOn = true;
                startGameDataTicker();
            }
            createPlayer(roomNumber);
            socket.emit('joined', roomNumber);
            // if (totalPlayers === MIN_PLAYERS);
        });
        socket.on('pos', ({xVel, yVel}) => {
            if (playerBodies[socket.roomNumber] && playerBodies[socket.roomNumber][socket.id]) {
                if (playerBodies[socket.roomNumber][socket.id].velocity[0] !== xVel || playerBodies[socket.roomNumber][socket.id].velocity[1] !== yVel) {
                    playerBodies[socket.roomNumber][socket.id].velocity = [xVel, yVel];
                }
            }
        });
        socket.on('pointerdown', () => {
            console.log('pointerdown', players[socket.roomNumber][socket.id] || null);
        })

        function startGameDataTicker() {
            console.log('start ticker!');
            let tickInterval = setInterval(() => {
                if (!gameTickerOn) {
                clearInterval(tickInterval);
                } else {
                    io.to(socket.roomNumber).emit('game-state', JSON.stringify({
                        players: players[socket.roomNumber],
                        gameOn: gameOn
                    }))
                }
            }, GAME_TICKER_MS);
        };
        function resetServerState() {
            // peopleAccessingTheWebsite = 0;
            gameOn = false;
            gameTickerOn = false;
            // totalPlayers = 0;
            alivePlayers = 0;
            for (let item in playerChannels) {
                playerChannels[item].unsubscribe();
            }
        };
        function startGame() {
            gameOn = true;

            world = new p2.World({
                gravity: [0, 0],
            });
            startMovingPhysicsWorld();
        };
        function createPlayer () {
            if (!gameOn) return;
            let player = players[socket.roomNumber][socket.id]
            let { x, y } = player;
            let newBody = new p2.Body({
                position: [x, y],
                velocity: [0, 0]
            });
            if (playerBodies[socket.roomNumber]) {
                playerBodies[socket.roomNumber][socket.id] = newBody;
            } else playerBodies[socket.roomNumber] = {
                [socket.id]: newBody
            }
            console.log('mewplayer', socket.id);
            world.addBody(newBody);
        }
        function startMovingPhysicsWorld() {
            let p2WorldInterval = setInterval(function () {
                if (!gameOn) {
                clearInterval(p2WorldInterval);
                } else {
                // updates velocity every 5 seconds
                //   if (++shipVelocityTimer >= 80) {
                //     shipVelocityTimer = 0;
                //     shipBody.velocity[0] = calcRandomVelocity();
                //   }
                for (let id of Object.keys(players[socket.roomNumber])) {
                    players[socket.roomNumber][id] = {
                        ...players[socket.roomNumber][id],
                        x: playerBodies[socket.roomNumber][id].position[0],
                        y: playerBodies[socket.roomNumber][id].position[1],
                        xVel: playerBodies[socket.roomNumber][id].velocity[0],
                        yVel: playerBodies[socket.roomNumber][id].velocity[1]
                    }
                }
                world.step(P2_WORLD_TIME_STEP);
                //   if (shipBody.position[0] > 1400 && shipBody.velocity[0] > 0) {
                //     shipBody.position[0] = 0;
                //   } else if (shipBody.position[0] < 0 && shipBody.velocity[0] < 0) {
                //     shipBody.position[0] = 1400;
                //   }
                }
            }, 1000 * P2_WORLD_TIME_STEP);
        };
        function calcRandomVelocity() {
            let randomShipXVelocity = Math.floor(Math.random() * 200) + 20;
            randomShipXVelocity *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
            return randomShipXVelocity;
        };
    });
};

module.exports = handleRealtimeMessages;