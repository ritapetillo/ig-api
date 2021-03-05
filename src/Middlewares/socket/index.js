const User = require("../../Models/User");
const { verifyAccessToken } = require("../../Lib/auth/tokens");

const getAuthenticatedUser = async (socket, next) => {
  try {
    const { accessToken } = socket.request.cookies;
    const user = await verifyAccessToken(accessToken);
    const currentUser = await User.findByIdAndUpdate(
      user._id,
      { socketId: socket.id },
      {
        runValidators: true,
        new: true,
      }
    );

    socket.request.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuthenticatedUser };
