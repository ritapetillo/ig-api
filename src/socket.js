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
    const currentUser = await User.findById(user._id);
    const followers = currentUser.followers;

    //connect the user to all previous conversations

    socket.on("joinRoom", async () => {
      const userRooms = await findChatsByPartecipants(user._id);

      userRooms.map((room) => {
        socket.join(room._id);
      });

      //add all current user followers to followerusername room

      console.log(io.sockets.adapter.sids[socket.id]);
    });
    socket.on("checkFollowers", async () => {
      console.log("checfollowers");
      console.log(followers);
      followers.map(async (user) => {
        const userToAdd = await User.findById(user._id);
        console.log("userToAdd" + userToAdd);
        if (userToAdd.socketId) {
          io.sockets.connected[userToAdd.socketId].join(
            `followers${user.username}`
          );
        }
      });
    });

    socket.on("newPost", ({ username }) => {
      socket.broadcast
        .to(`followers${username}`)
        .emit("newPostCreated", username);
    });

    // socket.on("leaveRoom", async () => {
    //   const userRooms = await findChatsByPartecipants(user._id);
    //   userRooms.map((room) => {
    //     socket.leave(room._id);
    //   });
    // });

    socket.on("addedChat", async ({ roomId }) => {
      console.log("addedChat" + roomId);
      socket.join(roomId);
      //find the user by id
      console.log("all-connections" + io.sockets.adapter.sids[socket.id]);

      const findRoom = await ChatRoom.findById(roomId);
      const allUserInChat = findRoom.users;
      allUserInChat.users.map(async (user) => {
        const userToAdd = await User.findById(user._id);
        if (userToAdd.socketId) {
          io.sockets.connected[userToAdd.socketId].join(roomId);
        }
      });

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
      socket.broadcast.to(roomId).emit("notificationMsg", user.username);
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
