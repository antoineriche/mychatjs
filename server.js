var express = require('express');
// var http = require('http');
// var url = require('url');

var bodyParser = require('body-parser');


var app = express();
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

app.listen(8080, function(){
    console.log('listening on: 8080');
});

