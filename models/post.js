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
	comments:{
		name:{type: String},
		email: {type: String},
		website: {type: String},
		time: {type: Date},
		content: {type: String}
	}
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
		name: this.name.trim(),
		time: time,
		title: this.title.trim(),
		post: this.post,
		comments: []
	};

	db.addData(Posts,post,callback);
}

Post.getAll = function(name,callback){
	var data;
	data = name ? {'name':name}:null;
	db.findData(Posts,data,callback);
}

Post.getTen =  function(name,page,callback){
	var limit = 10;
	var skip = (page - 1) * limit ;
	var data = name? {name: name} : {};




	Posts.count({},function(err,count){
		var total = count;
		db.findData(Posts,data,function(reply,result){
			callback(reply,result,total)
		},{
			skip: skip,
			limit: limit
		})

	})
	
}

Post.getOne = function(name,day,title,callback){
	data = {
		'name': name,
		// 'time.day': day,
		'title': title,
	} || null;


	db.findData(Posts,data,callback)
}


Post.edit = function(name,day,title,callback){
	data = {
		'name': name,
		'time.day': day,
		'title': title,
	} || null

	db.findData(Posts,data,callback);
}

Post.update = function(name,day,title,post,callback){
	db.updateData(Posts,{
		'name': name,
		'time.day': day,
		'title': title,
	},{
		post:post,
	},callback)
}

Post.updateComment = function(name,day,title,comment,callback){
	db.updateData(Posts,{
		'name': name,
		'time.day': day,
		'title': title,
	},{
		$push:{comments:comment},
	},callback)

	console.log({
		'name': name,
		'time.day': day,
		'title': title,
	})
}


Post.remove = function(name,day,title,callback){
	db.removeData(Posts,{
		'name': name,
		'time.day': day,
		'title': title, 
	},callback)
}



Post.model = Posts;


