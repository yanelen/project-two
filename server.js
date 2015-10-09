var express = require('express'),
    PORT = process.env.PORT || 5432,
    server = express(),
    MONGOURI = process.env.MONGO_URI || "mongodb://localhost:27017",
    dbname = "wikidb",
    mongoose = require('mongoose');

server.get('/wiki', function(req, res) {
  res.write("Welcome to WIKI");
  res.end();
})

mongoose.connect(MONGOURI + "/" + dbname);


server.listen(PORT, function() {
  console.log("SERVER IS UP ON PORT:", PORT)
});
