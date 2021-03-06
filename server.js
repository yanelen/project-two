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
    MONGOURI = process.env.MONGOLAB_URI || "mongodb://localhost:27017",
    dbname = "wikidb";

mongoose.connect(MONGOURI + "/" + dbname);

//create a database model
var Article = mongoose.model("article", {
  author: String,
  category: String,
  content: String,
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

//render homepage
server.get('/home', function (req, res) {
  res.locals.user = undefined;
  res.render('home');
});

//save a new user
server.post('/home', function (req, res) {
  req.session.userName = req.body.userName;
  res.redirect(302, '/articles')
});

//save a new user
server.use(function (req, res, next) {
  if (req.session.userName == undefined) {
    res.redirect(302, '/home')
  } else {
    res.locals.user = req.session.userName;
    next();
  }
});

//display all articles
server.get('/articles', function (req, res) {
  Article.find({}, function (err, allArticles) {
    if (err) {
      res.redirect(302, '/home');
    } else {
      res.render('articles/index', {
        articles: allArticles,
      });
    }
  });
});

//create a new article
server.post('/articles', function (req, res) {
  var article = new Article({
    author: req.session.userName,
    content: req.body.article.content,
    category: req.body.article.category
  });
  article.save(function (err, newArticle) {
    if (err) {
      res.redirect(302, '/articles/new');
    } else {
      res.redirect(302, '/articles');
    }
  });
});

//return an HTML form for editing an article
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

//update a specific article
server.patch('/articles/:id', function (req, res) {
  req.body.article.date = Date.now();
  Article.update({ _id: req.params.id }, req.body.article, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.redirect(301, '/articles/');
    }
  })
});

//delete a specific article
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

//return an HTML form for creating a new article
server.get('/articles/new', function (req, res) {
  res.render('articles/new');
});

//display all articles by a specific author
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

//delete a specific article on the author's page
server.delete('/authors/:name/:id', function (req, res) {
  var articleID = req.params.id;
  var authorName = req.params.name;
  Article.remove({
    _id: articleID
  }, function (err) {
    if (err) {
      console.log("ERROR");
    } else {
      res.redirect(302, '/authors/' + authorName);
    }
  });
});

//return an HTML form for editing an article
server.get('/authors/:name/:id/edit', function (req, res) {
  var articleID = req.params.id;
  Article.findOne({
    _id: articleID
  }, function (err, foundArticle) {
    if (err) {
      res.write("ARTICLE ID NOT FOUND");
      res.end();
    } else {
      res.render('authors/edit', {
        article: foundArticle
      });
    }
  });
});

//update a specific article
server.patch('/authors/:name/:id', function (req, res) {
  req.body.article.date = Date.now();
  var authorName = req.params.name;
  Article.update({ _id: req.params.id }, req.body.article, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.redirect(302, '/authors/' + authorName);
    }
  })
});

//display all articles of a specific subject
server.get('/categories/:name', function (req, res) {
  var categoryName = req.params.name;
  Article.find({
    category: categoryName
  }, function (err, categoryArticles) {
    if (err) {
      console.log("ERROR");
    } else {
      res.render('categories/articles', {
        category: categoryName,
        articles: categoryArticles
      });
    }
  });
});

//delete a specific article on the subject's page
server.delete('/categories/:name/:id', function (req, res) {
  var articleID = req.params.id;
  var categoryName = req.params.name;
  Article.remove({
    _id: articleID
  }, function (err) {
    if (err) {
      console.log("ERROR");
    } else {
      res.redirect(302, '/categories/' + categoryName);
    }
  });
});

//return an HTML form for editing an article
server.get('/categories/:name/:id/edit', function (req, res) {
  var articleID = req.params.id;
  Article.findOne({
    _id: articleID
  }, function (err, foundArticle) {
    if (err) {
      res.write("ARTICLE ID NOT FOUND");
      res.end();
    } else {
      res.render('categories/edit', {
        article: foundArticle
      });
    }
  });
});

//update a specific article
server.patch('/categories/:name/:id', function (req, res) {
  req.body.article.date = Date.now();
  var categoryName = req.params.name;
  Article.update({ _id: req.params.id }, req.body.article, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.redirect(302, '/categories/' + categoryName);
    }
  })
});

server.listen(PORT, function () {
  console.log("CONNECTED");
});
