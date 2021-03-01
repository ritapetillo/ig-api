const { error } = require("console");
const jwt = require("jsonwebtoken");
const User = require("../../../Models/User");
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  EXPIRATION_ACCESS_TOKEN,
  EXPIRATION_REFRESH_TOKEN,
} = process.env;

const encodeJWT = (payload, secret, expiration) =>
  new Promise((res, rej) => {
    jwt.sign(payload, secret, { expiresIn: expiration }, (err, token) => {
      if (err) return rej(err);
      else return res(token);
    });
  });

const decodeJWT = (token, secret) =>
  new Promise((res, rej) => {
    jwt.verify(token, secret, (err, payload) => {
      if (err) return rej(err);
      else return res(payload);
    });
  });

const generateTokens = async (user) => {
  try {
    const { username } = user;
    const accessToken = await encodeJWT(
      { username },
      ACCESS_TOKEN_SECRET,
      EXPIRATION_ACCESS_TOKEN
    );
    const refreshToken = await encodeJWT(
      { username },
      REFRESH_TOKEN_SECRET,
      EXPIRATION_REFRESH_TOKEN
    );
    user.refreshToken = refreshToken;
    user.save();
    return { accessToken, refreshToken };
  } catch (err) {
    console.log(err);
    return error;
  }
};

const verifyAccessToken = async (token) => {
  try {
    const user = await decodeJWT(toekn, ACCESS_TOKEN_SECRET);
    if (!user) return null;
    else return user;
    return user;
  } catch (err) {
    console.log(err);
    return error;
  }
};

const verifyRefreshToken = async (req) => {
  try {
    const { refreshToken } = req.cookies;
    const user = await decodeJWT(refreshToken, REFRESH_TOKEN_SECRET);
    if (!user) return null;
    const { username } = user;
    const savedRefreshToken = await User.findOne({
      username,
      refreshToken: token,
    });
    if (!savedRefreshToken) return null;
    else return user;

    return user;
    return user;
  } catch (err) {
    console.log(err);
    return error;
  }
};

module.exports = { generateTokens, verifyAccessToken, verifyRefreshToken };
