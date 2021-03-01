const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    lastname: String,
    username: String,
    imageUrl: String,
    bio: String,
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
    },
    IGId: {
      type: String,
    },

    followers: [{ type: String, field: "username", ref: "users" }],
    following: [{ type: String, field: "username", ref: "users" }],
    followingTag: [
      { type: mongoose.Schema.Types.ObjectId, ref: "followingTag" },
    ],
    refreshToken: String,
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.id;
        delete ret.password;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.googleId;
        delete ret.IGId;
        return ret;
      },
    },

    timestamps: true,
  }
);

UserSchema.methods.comparePass = async function (pass) {
  try {
    const isValid = await bcrypt.compare(pass, this.password);
    return isValid;
  } catch (err) {
    console.log(err);
    return false;
  }
};

UserSchema.pre("save", async function (next) {
  const user = this;

  const plainPW = user.password;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

module.exports = mongoose.model("users", UserSchema);
