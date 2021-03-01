const mongoose = require("mongoose");
const bctypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
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
    followers: [],
    following: [],
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
