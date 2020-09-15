var http = require("http");
var connect = require('connect');
var bodyParser = require('body-parser');
var server;
var istanbul=require('istanbul');
var collector = new istanbul.Collector();
function start(options) {
	options = options || {};
	port = options.port || process.env['COLLECTOR_PORT'] || 3001;
	var app = connect();
	app.use(bodyParser.json({
		limit: '50mb' 
	}));
	app.use(function serveCoverageHandle(req, res, next) {
		if (req.url.substr(1) === 'data' && req.method.toLowerCase() === 'get') {
			res.setHeader("Content-Type", "application/javascript");
			res.statusCode = 200;
			res.end(JSON.stringify(collector.getFinalCoverage()));
		} else {
			next();
		}
	});
	app.use(function receive(req, res, next) {
		if (req.url.substr(1) === 'data' && req.method.toLowerCase() === 'post') {
			collector.add(req.body);
			//global._data.push(req.body);
			res.statusCode = 204;
			res.end();
		} else {
			next();
		}
	});
	app.use(function(req, res, next) {
		if (req.url.substr(1) === 'done' && req.method.toLowerCase() === 'get') {
			console.log("Shutdown requested");
			res.statusCode = 204;
			res.end();
			if (server) {
				server.close();
				server = null;
			}
			collector.dispose();
		} else {
			next();
		}
	});
	app.use(function(req, res) {
		res.end();
	});
	server = http.createServer(app).listen(port);
	console.log("Collector started on port %d", port);
}
module.exports = start;
