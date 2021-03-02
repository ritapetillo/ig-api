const socketio = require("socket.io");

const createSocketServer = (server) => {
  const io = socketio(server);
  console.log(io);

  io.on("connect", (socket) => {
    console.log(socket.id);

    // socket.on("joinRoom", (data) => {
    //   console.log(data);
    // });
  });
};

module.exports = createSocketServer;
