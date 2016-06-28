var express = require('express');
var router = express.Router();

console.log(1111)


module.exports = function(app){
	app.get('/',function(req,res){
		res.render('index',{title: 'Express'});
	});
};
