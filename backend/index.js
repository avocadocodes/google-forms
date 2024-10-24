const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 11;
const Form = require("./schemas/Form");
const User = require("./schemas/User");

const app = express();
const port = 5000;

const conuri = process.env.DATABASE_URL;

mongoose.connect(conuri);

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Use express.urlencoded directly

app.post("/createuser", async (req, res) => {
  try {
    if (!req.body.name) {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({ error: "Mail not found" });
      } else {
        if (await bcrypt.compare(req.body.password, user.password)) {
          return res.status(200).json({ msg: "Success", user: user });
        } else {
          return res.status(401).json({ error: "Password mismatch" });
        }
      }
    } else {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedpassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedpassword;
      const user = new User(req.body);
      await user.save(); // Make sure to await this operation
      return res.status(200).json({ msg: "Success", user: user });
    }
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/submitform", (req, res) => {
  const form = new Form(req.body);
  form.save();
  res.json(form._id);
});

app.post("/viewformsubmit", async (req, res) => {
  const form = await Form.findById(req.body.id);
  if (form.responses === undefined) form.responses = [req.body.answers];
  else form.responses.push(req.body.answers);
  console.log(form);
  form.save();
});

app.get("/download/:id", async (req, res) => {
  const id = req.params.id;
  const form = await Form.findById(id);
  const title = [];
  for (i of form.questions) {
    title.push(i.name);
  }

  const response = {
    title: form.title,
    data: [title, ...form.responses],
  };

  res.json(response);
});

app.get("/view/:id", async (req, res) => {
  const id = req.params.id;
  const form = await Form.findById(id);

  res.json(form);
});

app.listen(port, () => {
  console.log("App is running on port 5000.");
});
