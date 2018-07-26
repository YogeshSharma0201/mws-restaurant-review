var express = require('express');
var app = express();
var router = express.Router();
var compression = require('compression');

app.get('/js/*', function(req, res, next) {
  res.set('Content-Type', 'application/javascript');
  res.set('Content-Encoding', 'gzip');
  next();
});

app.get('/css/*.css.gz', function(req, res, next) {
  res.set('Content-Type', 'text/css');
  res.set('Content-Encoding', 'gzip');
  next();
});

app.use(express.static('dist'));

app.use(compression());

app.listen(5000, () => {
  console.log('server started on port 5000');
});