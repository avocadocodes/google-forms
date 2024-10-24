const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://nikitakar82925:TNjqbX4RU5V3fz8e@cluster0.7rywg.mongodb.net/"
  )
  .then(() => {
    console.log("Connected.");
  });
