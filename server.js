let express = require("express");
let app = express();
let http = require("http").Server(app);
let path = require("path");
var PORT = process.env.PORT || 6900;
const io = require('socket.io')(http);

io.on('connection', socket => {
    socket.on('join', (gameId) => {
        socket.join(gameId);
        socket.emit('joined', gameId);
        socket.activeRoom
    });
    socket.on('message', message => {
        io.to(socket.activeRoom).emit('message', message);
    })
})

app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "src")));

http.listen(PORT, () => {
  console.log(`listening on ${PORT} lol`);
});
