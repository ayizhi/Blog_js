var mongoose = require('mongoose');
var db = require('./db');


module.exports = Post;

var Posts = db.buildModel('post',{
	name: {type: String,ref:'user'},
	title: {type: String},
	post: {type: String},
	time: {
		date: {type:Date},
		year: {type:Date},
		month: {type:Date},
		day: {type:Date},
		minute:{type:Date},
	},
})

function Post(name,title,post){
	this.name = name;
	this.title = title;
	this.post = post;
}

Post.prototype.save = function(callback){
	var date = new Date();
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + '-' + (date.getMonth() + 1),
		day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
		minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
	};
	var post = {
		name: this.name,
		time: time,
		title: this.title,
		post: this.post
	};

	db.addData(Posts,post,callback);
}

Post.getAll = function(name,callback){
	var data;
	data = name ? {'name':name}:null;
	db.findData(Posts,data,callback);
}

Post.getOne = function(name,day,title,callback){
	data = {
		'name': name,
		'time.day': day,
		'title': title,
	} || null;
	db.findData(Posts,data,callback)
}

Post.model = Posts;


