var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

// var url = require('url');
// var app = express();

console.log('chat-server.js');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); 

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
})
.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
}); 

io.on('connection', function(socket){
  console.log('new user connected');
  // io.emit('chat_msg', 'new user');

  socket.on('chat_msg', function(msg){
    console.log('chat msg: ' + msg);
    io.emit('chat_msg', socket.login + ": " + msg);
  });

  socket.on('reset_login', function(pLogin){
    socket.login = pLogin;
    console.log('new login: ' + pLogin);
    io.emit('chat_msg', 'Welcome ' + pLogin);
  });

  socket.on('disconnect', function(socket){
    console.log('user disconnected');
    io.emit('chat_msg', 'Bye ' + socket.login);
  });
});

http.listen(8080, function(){
    console.log('listening on: 8080');
});

