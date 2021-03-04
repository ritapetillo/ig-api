const { disconnect } = require("mongoose");
const socketio = require("socket.io");
const cookieParser = require("socket.io-cookie-parser");
const { verifyAccessToken } = require("./Lib/auth/tokens");
const {
  saveMessage,
  disconnectUser,
  findChatsByPartecipants,
} = require("./Lib/socket");
const { getAuthenticatedUser } = require("./Middlewares/socket");
const ChatRoom = require("./Models/ChatRoom");
const User = require("./Models/User");

const createSocketServer = (server) => {
  const io = socketio(server);
  //auth middlewares
  io.use(cookieParser());
  io.use(getAuthenticatedUser);

  io.on("connection", async (socket) => {
    const user = socket.request.user;

    //connect the user to all previous conversations

    socket.on("joinRoom", async () => {
      const userRooms = await findChatsByPartecipants(user._id);

      userRooms.map((room) => {
        socket.join(room._id);
      });

      console.log(io.sockets.adapter.sids[socket.id]);
    });

    // socket.on("leaveRoom", async () => {
    //   const userRooms = await findChatsByPartecipants(user._id);
    //   userRooms.map((room) => {
    //     socket.leave(room._id);
    //   });
    // });

    socket.on("addedToChat", async (id, roomId) => {
      //find the user by id
      const userToAdd = await User.findById(id);
      if (userToAdd.socketId) {
        io.sockets.connected[userToAdd.socketId].join(roomId);
      }
      //check if the user has the socketId, if yes connect the user to roomId
    });
    socket.on("sendMessage", async (message) => {
      message.sender = user._id;
      //save the message
      const newMessage = await saveMessage(message);
      //emit the message to the room
      const { roomId } = message;
      console.log(newMessage);
      io.to(roomId).emit("message", newMessage);
    });

    socket.on("typing", ({ roomId, status }) => {
      io.to(roomId).emit("isTyping", status);
    });

    socket.on("disconnect", async () => {
      //remove the user from all the rooms
      // const rooms = io.sockets.adapter.sids[socket.id];
      // rooms.map((room) => {
      //   socket.leave(room);
      // });
      console.log("disconnected");
      //remove socketId
      const disconect = await disconnectUser(user);
    });
  });
};

module.exports = createSocketServer;
