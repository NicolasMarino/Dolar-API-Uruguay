var express = require('express');

var app = express();

app.set('view engine', 'hbs');

app.get('/', function (req, res) {
});
var server = app.listen(3000, function () {
});