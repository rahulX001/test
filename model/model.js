const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

require("..//mongoconnect/mongo");

const Schema = new mongoose.Schema({
  name: String,
  lastname: String,
  number: {
    type: Number,
    required: true,
    minlength: 10,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email already present"],
  },
  password: String,
  otpp: String,
  tokens: [
    {
      token: String,
    },
  ],
});

Schema.methods.createtoken = async function () {
  try {
    const token = await jwt.sign(
      { _id: this._id },
      "qwtqeueiwuebcsbnhjgdhgueeoquiruoiejskabmad "
    );
    this.tokens = this.tokens.concat({ token });
    await this.save();

    return token;
  } catch (error) {
    console.log(error);
  }
};

const Collection = new mongoose.model("Details", Schema);
module.exports = Collection;
