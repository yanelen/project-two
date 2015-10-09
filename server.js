var express = require('express'),
    PORT = process.env.PORT || 5432,
    server = express(),
    MONGOURI = process.env.MONGO_URI || "mongodb://localhost:27017",
    dbname = "some_useful_name",
    mongoose = require('mongoose');

server.get('/test', function(req, res) {
  res.write("Welcome to my amazing app");
  res.end();
})

mongoose.connect(MONGOURI + "/" + dbname);


server.listen(PORT, function() {
  console.log("SERVER IS UP ON PORT:", PORT)
});
