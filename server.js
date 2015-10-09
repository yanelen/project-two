var express = require('express'),
    PORT = process.env.PORT || 5432,
    server = express(),
    MONGOURI = process.ev.MONGOLAB_URL || "mongodb://localhost:2701",
    dbname = "some_useful _name",
    mongoose = require('mongoose');

server.get('/test', function(req, res) {
  res.write("Welcome to my amazing app");
  res.end();
})

mongoose.connect(MONGOURI + "/" + dbname);

server.listen(PORT, function() {
  console.log("SERVER IS UP ON PORT:", PORT)
});
