console.log("May Node be with you")
require("dotenv").config()

const express = require("express")
const bodyParser = require("body-parser")
const { json } = require("body-parser")
const app = express()
const MongoClient = require("mongodb").MongoClient
const connectionStr = `${process.env.MY_KEY}`

MongoClient.connect(connectionStr, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to Database")
    const db = client.db("star-wars-quotes")
    const quotesCollection = db.collection("quotes")
    app.set("view engine", "ejs") //renders HTML
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(express.static("public"))
    app.use(bodyParser.json())
    app.get("/", (req, res) => {
      quotesCollection
        .find()
        .toArray()
        .then((results) => {
          res.render("index.ejs", { quotes: results })
          console.log(results)
        })
        .catch((error) => console.error(error))

      // res.render("index.ejs", {})
    })
    app.post("/quotes", (req, res) => {
      quotesCollection.insertOne(req.body).then((result) => {
        console.log(result)
        res.redirect("/")
      })
    })
    app.put("/quotes", (req, res) => {
      // console.log(req.body)
      quotesCollection
        .findOneAndUpdate(
          { name: "Yoda" },
          {
            $set: {
              name: req.body.name,
              quote: req.body.quote,
            },
          },

          { upsert: true }
        )
        .then((result) => {
          res.json("Success")
        })
        .catch((error) => console.error(error))
    })

    app.delete("/quotes", (req, res) => {
      quotesCollection
        .deleteOne({ name: req.body.name })
        .then((result) => {
          if (result.deletedCount === 0) {
            return res.json("No quote to delete")
          }
          res.json("Deleted Darth Vader Quote")
        })
        .catch((error) => console.error(error))
    })

    app.listen(3000, function () {
      console.log("Listening on port 3000")
    })
  })
  .catch((error) => console.error(error))
