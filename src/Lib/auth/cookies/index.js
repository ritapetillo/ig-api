const { EXPIRATION_ACCESS_COOKIE, EXPIRATION_REFRESH_COOKIE } = process.env;

const generateCookies = async (tokens, res) => {
  try {
    const { accessToken, refreshToken } = tokens;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, //set to true when deploy
      maxAge: EXPIRATION_ACCESS_COOKIE,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //set to true when deploy
      maxAge: EXPIRATION_REFRESH_COOKIE,
    });
  } catch (err) {
    return err;
  }
};

const deleteCookies = async (res) => {
  try {
    res.cookie("accessToken", "", { expires: new Date(0) });
    res.cookie("refreshToken", "", { expires: new Date(0) });
  } catch (err) {
    return err;
  }
};

module.exports = { generateCookies, deleteCookies };