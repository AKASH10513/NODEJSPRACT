import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
const app = express();

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose
  .connect("mongodb://localhost:27017", {
    dbName: "backend",
  })
  .then(() => console.log("Database Connected"))
  .catch((e) => console.log(e));

app.set("view engine", "ejs");
const users = [];

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const message = mongoose.model("Message", messageSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "aaatik");
    req.user = await User.findById(decoded._id);
    next();
  } else {
    res.render("login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "null", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.redirect("/");
});

app.post("/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const user = await User.findOne({ email });




  if (!user) return res.redirect("/register");


  console.log(user);


 
  const isMatch = await bcrypt.compare(password, user.password);


  console.log(isMatch);
  if (!isMatch) {
   return res.render("login", {
      message: "Incorrect Passowrd",
    });
  }

  const token = jwt.sign({ _id: user._id }, "aaatik");
  // console.log(token);
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});



app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  let user1 = await User.findOne({ email });
  if (user1) {
    res.render("login");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: username,
    email: email,
    password: hashedPassword,
  });

  const token = jwt.sign({ _id: user._id }, "aaatik");
  console.log(token);
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.listen(5000, () => {
  console.log("Server is listening on port number 5000");
});

console.log(path.join(path.resolve(), "public"));
