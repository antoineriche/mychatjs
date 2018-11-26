'use strict';
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var serverless = require('serverless-http');
var bodyParser = require('body-parser');
var session = require("express-session")({
    secret: "my-chat-js",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

// var url = require('url');
// var app = express();

console.log('start chat-server');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); 

// Use express-session middleware for express
app.use(session);

//Deal with js
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
// app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

var checkCredentials = function(req, res, next){
  console.log('checkCredentials');
  if(req.session.userId){
    res.sendFile(__dirname + '/views/chat.html');
  } else {
    res.status(301).redirect('/');
  }
}

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
})
.get('/chat', [checkCredentials])

.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
});

//Use shared session middleware for socket.io setting autoSave:true
io.use(sharedsession(session, {autoSave:true}));

io.on('connection', function(socket){
  console.log('new user connected');
  // io.emit('chat_msg', 'new user');

  socket.on('login', function(login){
    socket.handshake.session.login = login;
    socket.handshake.session.save();
    console.log(login + ' logged in.');
    socket.emit('welcome', true);
    io.emit('chat_msg', 'Welcome ' + login);
  });

  // socket.on('logout', function(login){
  //   if (socket.handshake.session.login) {
  //     delete socket.handshake.session.login;
  //     socket.handshake.session.save();
  //     console.log(login + ' logged out.');
  //     io.emit('chat_msg', 'Goodbye ' + login);
  //   }
  // });

  socket.on('chat_msg', function(msg){
    if(socket.handshake.session.login){
      console.log(socket.handshake.session.login + ': ' + msg);
      socket.broadcast.emit('chat_msg', socket.handshake.session.login + ": " + msg);
    }
  });

  socket.on('disconnect', function(socket){
    console.log('user disconnected');
    io.emit('chat_msg', 'Bye ' + socket.login);
  });
});

http.listen(8080, function(){
    console.log('listening on: 8080');
});

module.exports.handler = serverless(app);