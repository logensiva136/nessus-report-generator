require("events").EventEmitter.defaultMaxListeners = 5;
require("dotenv").config();
const app = require("express")();
const axios = require("axios");
const fs = require("fs");
const ejs = require("ejs");
const o = require("open");
const https = require("https");
const bodyParser = require("body-parser");
const csv = require("csv");

let theUrl = "";

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
const api = require("./api/API.js");

app.get("/", async function (req, res) {
  const datada = await api.getFolders();

  //   console.log(datada);

  res.render("index", {
    scans: [],
    folder: datada.folders,
    home: true,
    fId: 0,
  });
});

app.get("/selected/:folder", async (req, res) => {
  theUrl = req.originalUrl;
  const theFolder = +req.params.folder.trim();
  const datada = await api.getFolders();
  // const folderId = parseInt(req.param.folder);
  const datas = await api.getScansResults(theFolder);
  res.render("index", {
    scans: datas,
    folder: datada.folders,
    home: false,
    fId: theFolder,
  });
});

app.post("/download", async (req, res) => {
  const download = await api.download(req.body.id, req.body.fn);

  fs.writeFileSync(download.name, download.data, () => {});
  res.download(download.name);
  setTimeout(() => {
    fs.unlinkSync(download.name);
  }, 100);

  // res.redirect(theUrl);
  // .then((data) => {
  //   try {
  //     fs.unlinkSync(download.name);
  //     //file removed
  //   } catch (err) {
  //     console.error(err);
  //   }
  // })
  // .catch((err) => {
  //   console.log(err);
  // });
});

app.listen(
  8080
  //     , function () {
  //   o("http://localhost:8080");
  // }
);
