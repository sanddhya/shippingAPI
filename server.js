var http = require('http');
var app = require('./app');
var port = 3001;
var server = http.createServer(app);
server.listen(port, function () {
    console.log("Server running on port:" + port);
});