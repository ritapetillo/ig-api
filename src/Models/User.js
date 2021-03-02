const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    imageUrl: String,
    bio: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },

    private: {
      type: Boolean,
      default: false,
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
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Posts" }],
    saved: [{ type: mongoose.Schema.Types.ObjectId, ref: "Posts" }],
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

UserSchema.statics.findByCredentials = async function (email, plainPW) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
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
