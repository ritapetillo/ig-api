const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../../../../Models/User')
const {GOOGLE_CLIENT_ID,GOOGLE_SECRET_ID,BE_URI}
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_SECRET_ID,
      callbackURL: "http://localhost:3001/api/users/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log(profile);
        const { email, given_name, family_name, picture } = profile._json;
        //verify if the user is already registered
        const user = await User.findOne({ email });
        if (!user) {
          //register the user
          const newUser = new User({
            firstName: given_name,
            lastName: family_name,
            // picture:picture,
            email,
            google_id: profile.id,
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
