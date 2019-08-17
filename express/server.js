"use strict";
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const router = express.Router();

const CONNECTION_URL =
  "mongodb+srv://nodejs:mongodbraisan@cluster0-zfitw.mongodb.net/test?retryWrites=true&w=majority";
const DATABASE_NAME = "test";

var database, collection;

router.get("/", (req, res) => {
  res.send("GET request to the homepage!");
});

// Adds the IP of a site to the cloud MongoDB
router.get("/sites/:site/addIp/:ip", (req, res) => {
  MongoClient.connect(
    CONNECTION_URL,
    { useNewUrlParser: true },
    (error, client) => {
      if (error) {
        throw error;
      }
      database = client.db(DATABASE_NAME);
      collection = database.collection("test1");
      let newData = { site: req.params["site"], ip: req.params["ip"] };
      collection.update(newData, newData, { upsert: true }, (error, result) => {
        client.close();
        if (error) {
          res.send("bad");
        } else {
          res.send("good");
        }
      });
    }
  );
});

// Return false if not in database,
// Return true if the IP is IN the database
router.get("/sites/isLogged/:ip", function(req, res) {
  MongoClient.connect(
    CONNECTION_URL,
    { useNewUrlParser: true },
    (error, client) => {
      if (error) {
        throw error;
      }
      database = client.db(DATABASE_NAME);
      collection = database.collection("test1");
      collection.findOne({ ip: req.params["ip"] }, (error, result) => {
        client.close();
        if (result) {
          res.send("true");
        } else {
          res.send("false");
        }
      });
    }
  );
});

//implement this in case Google Bot has the same IPs!
//Check the IPs for specific sites!
router.get("/sites/:site/isLogged/:ip", function(req, res) {});

app.use(bodyParser.json());
app.use("/.netlify/functions/server", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
