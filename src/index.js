const express = require("express");
const hbs = require("hbs");
require("../mongoconnect/mongo");
const Collection = require("..//model/model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const autho = require("../middle/autho");

const multer = require("multer");
const reader = require("xlsx");
const nodemailer = require("nodemailer");
const fs = require("fs");
const validator = require("validator");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "hbs");

app.use(express.static("images"));

if (fs.statSync("./uploads").isDirectory()) {
  console.log("already exist");
} else {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb("Please enter csv file only", false);
    console.log("Please enter csv file only");
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: "rahul.kumar.eee21@gmail.com",
    pass: "eubtschmmhifnihn",
  },
});

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/logup", (req, res) => {
  res.render("logup");
});

app.post("/register", async (req, res) => {
  try {
    const doc1 = new Collection({
      name: req.body.name,
      lastname: req.body.lastname,
      number: req.body.number,
      email: req.body.email,
      password: req.body.password,
      otpp: "",
    });

    const saltr = 10;
    const salt = await bcrypt.genSalt(saltr);
    const hp = await bcrypt.hash(req.body.password, salt);
    doc1.password = hp;

    const token = await doc1.createtoken();
    res.cookie("jwt", token);

    await doc1.save();
    res.render("secure");
  } catch (e) {
    res.render("invalidemail");
  }
});
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const detail = await Collection.findOne({ email });
    const match = await bcrypt.compare(req.body.password, detail.password);
    if (match) {
      const token = await detail.createtoken();
      res.cookie("jwt", token);
      res.render("secure");
    } else {
      res.render("invalid");
    }
  } catch (e) {
    res.render("invalid");
  }
});

app.get("/logout", autho, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((current) => {
      return current.token != req.token;
    });
    res.clearCookie("jwt");
    await req.user.save();
    res.render("login");
  } catch (error) {
    res.send(error);
  }
});
app.get("/secure", autho, (req, res) => {
  res.render("secure");
});

app.post("/uploading", upload.single("fname"), (req, res) => {
  const fileinfo = req.file;
  const filename = fileinfo.filename;
  let data = [];

  const file = reader.readFile(`./uploads/${filename}`);
  const sheet = file.SheetNames;
  for (let i = 0; i < sheet.length; i++) {
    const tmp = reader.utils.sheet_to_json(file.Sheets[sheet[i]]);
    tmp.forEach((dt) => {
      data.push(dt);
    });
  }
  let valid_email = "";
  let invalid_email = "";
  for (let i = 0; i < data.length; i++) {
    let pro = Object.keys(data[i]);
    let proContain = pro[0];
    if (validator.isEmail(data[i][proContain])) {
      valid_email = valid_email + data[i][proContain] + ",\n";
    } else {
      invalid_email = invalid_email + data[i][proContain] + ",\n";
    }
  }
  const mailoptions = {
    from: req.body.from,
    to: valid_email,
    subject: req.body.subject,
    text: req.body.textarea,
  };
  transporter.sendMail(mailoptions, (e, info) => {
    if (e) {
      console.log(e);
    } else {
      console.log("sent");
    }
  });

  fs.rmSync(path.join(__dirname, "../uploads"), { recursive: true });

  res.render("sent");
});

app.get("/forgotpass", (req, res) => {
  res.render("forgotpass");
});
app.get("/check", (req, res) => {
  res.render("check");
});

app.post("/otp", async (req, res) => {
  const user = Collection.findOne({ email: req.body.email });

  const otpp = Math.floor(100000 + Math.random() * 900000).toString();
  const update = await Collection.updateOne(
    { number: req.body.number },
    { $set: { otpp: otpp } },
    { new: true }
  );

  const mailoptions = {
    from: "rahul.kumar.eee21@gmail.com",
    to: req.body.email,
    subject: "Reset password",
    text: otpp,
  };
  transporter.sendMail(mailoptions, (e, info) => {
    if (e) {
      console.log(e);
    } else {
      console.log("sent");
    }
  });
  res.render("check");
});
app.get("/createpassword", (req, res) => {
  res.render("createpassword");
});

app.post("/otpcheck", async (req, res) => {
  const user = Collection.findOne({ otpp: req.body.text });
  if (user) {
    res.render("createpassword");
  } else {
    res.render("invalid");
  }
});
app.post("/updatepass", async (req, res) => {
  try {
    const saltr = 10;
    const salt = await bcrypt.genSalt(saltr);
    const hp = await bcrypt.hash(req.body.password, salt);

    const update = await Collection.updateOne(
      { email: req.body.email },
      { $set: { password: hp } },
      { new: true }
    );

    res.render("home");
  } catch (e) {
    res.send(e);
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(8000, () => {
  console.log("conneted");
});
