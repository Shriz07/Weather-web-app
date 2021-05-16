var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var filestore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var weatherRouter = require('./routes/weatherREST');
var dbRouter = require('./routes/dbfunctions');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
io.on('connection', function(socket) {
  require('./sockethandler')(socket);
  return io;
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1);
app.use(session({
  name: "session-id",
  secret: "GFGEnter",
  saveUninitialized: false,
  resave: false,
  store: new filestore({logFn: function(){}})
}))


app.use('/', indexRouter.router);
app.use('/weatherDebug', weatherRouter);
app.use('/dbDebug', dbRouter.router);

let thisUser = "";

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = {app: app, server: server};