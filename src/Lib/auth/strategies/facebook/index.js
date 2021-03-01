const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../../../../Models/User");
const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, BE_URI, FE_URI } = process.env;
const { generateTokens } = require("../../tokens");

passport.use(
  "facebook",
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: `${BE_URI}/api/auth/facebook/callback`,
      profileFields: ["id", "displayName", "email", "picture", "name"],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log(profile);

        const { email, first_name, last_name } = profile._json;
        //verify if the user is already registered
        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
          //register the user
          const newUser = new User({
            name: first_name,
            lastname: last_name,
            imageUrl: profile.photos[0].value,
            email,
            facebookId: profile.id,
            username: email,
          });
          const savedUser = await newUser.save();
          const tokens = await generateTokens(savedUser);
          done(undefined, { user: savedUser, tokens });
        } else {
          //generate token
          const tokens = await generateTokens(user);
          console.log(tokens);
          done(undefined, { user, tokens });
        }
      } catch (err) {
        console.log(err);
        done(err, undefined);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});
