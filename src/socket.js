const { disconnect } = require("mongoose");
const socketio = require("socket.io");
const cookieParser = require("socket.io-cookie-parser");
const { verifyAccessToken } = require("./Lib/auth/tokens");
const { saveMessage, disconnectUser } = require("./Lib/socket");
const { getAuthenticatedUser } = require("./Middlewares/socket");
const User = require("./Models/User");

const createSocketServer = (server) => {
  const io = socketio(server);
  //auth middlewares
  io.use(cookieParser());
  io.use(getAuthenticatedUser);

  io.on("connection", async (socket) => {
    const user = socket.request.user;
    socket.on("joinRoom", (data) => {
      const { room } = data;
      socket.join(room);

      socket.on("sendMessage", async (message) => {
        //save the message
        const newMessage = await saveMessage(message);
        //emit the message to the room
        const { roomId } = message;
        io.to(roomId).emit("message", message);
      });
    });

    socket.on("typing", (roomId) => {
      io.to(roomId).emit("isTyping", user);
    });

    socket.on("disconnect", async () => {
      //remove socketId
      const disconect = await disconnectUser();
      console.log(disconnect);
    });
  });
};

module.exports = createSocketServer;
