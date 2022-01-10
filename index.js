const express = require("express");
const cors = require("cors");
const app = express();
const path = require('path')
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require("./routes/routes"));
app.use(express.static(path.resolve(__dirname, "src")));
app.get("*", (req,res)=> {
  res.sendFile(path.resolve(__dirname, "index.js"))
})

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Server has been PORT ${PORT}`);
});
