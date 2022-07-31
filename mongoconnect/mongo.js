const mongoose = require("mongoose");
require("dotenv").config();
const url =
  "mongodb://rahul:rahul123@cluster0-shard-00-00.njtjh.mongodb.net:27017,cluster0-shard-00-01.njtjh.mongodb.net:27017,cluster0-shard-00-02.njtjh.mongodb.net:27017/d2?ssl=true&replicaSet=atlas-ar66ee-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to atlas");
  })
  .catch((e) => {
    console.log(e);
  });
