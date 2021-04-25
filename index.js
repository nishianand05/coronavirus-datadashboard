var express = require('express');
var app = express();
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + "/public"));
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');


app.get('/', function(req, res){
	res.render('map');
});

app.get('/map', function(req, res){
	res.render('map');
});

app.get('/barchart', function(req, res){
	res.render('rect');
});

app.get('/scatterplot', function(req, res){
	res.render('scat');
});

app.get('/piechart', function(req, res){
	res.render('pie');
});

app.get('/info', function(req, res){
	res.render('info');
});

app.get('*', function(req, res){
	res.render('error');
});

app.listen(port, process.env.IP, function(req,res){
	console.log("Server is running on " + port);
});