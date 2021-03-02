const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    lastname: String,
    username: String,
    imageUrl: String,

    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    facebookId: {
      type: String,
    },
    publicProfile:{
      type: Boolean,
      default: true
    },
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: "users"}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: "users"}],
    likedComments:[{type: mongoose.Schema.Types.ObjectId, ref: "comments"}],



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

module.exports = mongoose.model("users", UserSchema);
