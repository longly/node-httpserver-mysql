var http = require('http'); //引入核心HTTP模块
var colors = require("colors");
var url = require("url");
var crypto = require('crypto');
var querystring = require('querystring');


var users = {};

function jiami(text) {
	var cipher = crypto.createCipher("des-cbc", "InmbuvP6Z8");
	var crypted = cipher.update(text, 'utf8', 'hex')
	crypted += cipher.final('hex');
	return crypted;
}
˜
colors.setTheme({
	silly: 'rainbow',
	input: 'grey',
	verbose: 'cyan',
	prompt: 'grey',
	info: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});

var mysql = require("mysql");
var pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '123456',
	database: 'nodejs',
	port: 3306
});


var query = function(sql, parm, callback) {
	pool.getConnection(function(err, conn) {
		if (err) {
			callback(err, null, null);
		} else {
			conn.query(sql, parm, function(qerr, vals, fields) {
				//释放连接  
				conn.release();
				//事件驱动回调  
				callback(qerr, vals, fields);
			});
		}
	});
};

var server = http.createServer(function(req, res) {

	var pathname = url.parse(req.url).pathname;

	var arg = url.parse(req.url).query; //arg => name=a&id=5  
	var str = querystring.parse(arg); //str=> {name:'a',id:'5'}  

	switch (pathname) {
		case "/hello":
			res.end('hello');
			return;
		case "/get":
			var u = str.username,
				p = str.password;
			if (users[u] === jiami("p" + p))
				res.end("true");
			else
				res.end("false");
			return;
		case "/post":
			var rm = Math.random();
			var u = "u" + rm,
				p = jiami("p" + rm);
			users[u] = p;
			query("insert into user(username,password,created) values(?,?,?)", [u, p, new Date()], function(q, v, f) {
				// console.error(v)
				if (v.affectedRows > 0)
					res.end("true");
				else
					res.end("false");
			})
			return;

	}
});

server.listen(8082, '', function() {
	console.warn('node on 8082'.warn);
});
