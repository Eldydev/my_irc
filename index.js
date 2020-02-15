const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const users = [];
const rooms = [];
io.on("connection", socket => {
  const { id } = socket.client;

  io.clients((error, clients) => {
    if (error) throw error;
    var socketInfo = {};
    socketInfo[socket.id] = [];
    socketInfo[socket.id].socket = socket;
    socketInfo[socket.id].data = {};

    console.log(socketInfo[socket.id].data);
  });
  var room = "loby";
  rooms.push(room);
  socket.join(room);
  io.emit("roomlist", rooms);
  console.log(`User Connected: ${id}`);


  socket.on("chat message", ({ room, nickname, msg, servermsg, sep }) => {
    io.in(room).emit("chat message", { room, nickname, msg, servermsg, sep });
  });

  socket.on('createroom', function (newroom, room) {
    if(newroom != ""){
        socket.leave(room);
        socket.join(newroom);
        var room = newroom;
        rooms.push(room);
        io.in(room).emit("chat message", { room });
        io.emit("roomlist", rooms);

    }

  });

  socket.on('deleteroom', function (room) {
    if(room != ""){
      var n = rooms.indexOf(room);
      if (n > -1)
      {
        delete rooms[n];
        socket.leave(room);
        io.emit("roomlist", rooms);

      }

    }

  });

  socket.on('partroom', function (room) {
        socket.leave(room);
        socket.join('loby');
        var room = 'loby'
        io.in(room).emit("chat message", { room });

  });

  socket.on("userlist", (nickname) => {
    users.push(nickname)
    console.log(users);
    io.emit("userlist", users);
  });


});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listen on *: ${PORT}`));



/*io.on('connection', function (socket) {
  socket.on('newuser', function (nick) {
      var newUser = nick;
      console.log(newUser + ' connected');
      io.emit('connection2', newUser + ' connected.');

      socket.on('disconnect', function () {
          console.log('user disconnected');
          io.emit('disconnection', newUser + ' disconnected.');
      });
      socket.on('chat message', function (msg) {
          io.emit('chat message', msg);
      });
  });
});*/
