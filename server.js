var express = require('express'),
    server = express(),
    morgan = require('morgan'),
    ejs = require('ejs'),
    expressEjsLayouts = require('express-ejs-layouts'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose')
    session = require('express-session'),
    PORT = process.env.PORT || 4321,
    MONGOURI = process.env.MONGO_URI || "mongodb://localhost:27017",
    dbname = "wikidb";

mongoose.connect(MONGOURI + "/" + dbname);

var Article = mongoose.model("article", {
  author: String,
  category: String,
  content: { type: String, maxlength: 500 },
  date: { type: Date, default: Date.now }
});

server.set('view engine', 'ejs');
server.set('views', './views');

server.use(session({
  secret: "BLUE FOREST",
  resave: true,
  saveUninitialized: true
}));

server.use(morgan('dev'));
server.use(express.static('./public'));
server.use(expressEjsLayouts);
server.use(methodOverride('_method'));
server.use(bodyParser.urlencoded({ extended: true }));

server.get('/home', function (req, res) {
  res.locals.author = undefined;
  res.render('home');
});

server.post('/home', function (req, res) {
  req.session.authorName = req.body.authorName;
  res.redirect(302, '/articles')
});

server.use(function (req, res, next) {
  if (req.session.authorName == undefined) {
    res.redirect(302, '/home')
  } else {
    res.locals.author = req.session.authorName;
    next();
  }
})

server.get('/articles', function (req, res) {
  Article.find({}, function (err, allArticles) {
    if (err) {
      res.redirect(302, '/home');
    } else {
      res.render('articles/index', {
        articles: allArticles
      });
    }
  });
});

server.post('/articles', function (req, res) {
  var article = new Article({
    author: req.session.authorName,
    content: req.body.article.content,
    category: req.body.article.category,
    date: req.body.article.date
  });
  article.save(function (err, newArticle) {
    if (err) {
      res.redirect(302, '/articles/new');
    } else {
      res.redirect(302, '/articles');
    }
  });
});

server.get('/articles/:id/edit', function (req, res) {
  var articleID = req.params.id;
  Article.findOne({
    _id: articleID
  }, function (err, foundArticle) {
    if (err) {
      res.write("ARTICLE ID NOT FOUND");
      res.end();
    } else {
      res.render('articles/edit', {
        article: foundArticle
      });
    }
  });
});

server.patch('/articles/:id', function (req, res) {
  var articleID = req.params.id;
  var articleParams = req.body.article;

  Article.findOne({
    _id: articleID
  }, function (err, foundArticle) {
    if (err) {
      console.log("ERROR");
    } else {
      foundArticle.update(articleParams, function (err, article) {
        if (err) {
          console.log("ERROR");
        } else {
          res.redirect(302, "/articles");
        }
      });
    }
  });
});

server.delete('/articles/:id', function (req, res) {
  var articleID = req.params.id;
  Article.remove({
    _id: articleID
  }, function (err) {
    if (err) {
      console.log("ERROR");
    } else {
      res.redirect(302, '/articles');
    }
  });
});

server.get('/articles/new', function (req, res) {
  res.render('articles/new');
});

server.get('/authors/:name', function (req, res) {
  var authorName = req.params.name;
  Article.find({
    author: authorName
  }, function (err, authorArticles) {
    if (err) {
      console.log("ERROR");
    } else {
      res.render('authors/articles', {
        author: authorName,
        articles: authorArticles
      });
    }
  });
});

server.listen(4321, function () {
  console.log("CONNECTED");
});
