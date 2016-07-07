var mongoose = require('mongoose');
var db = require('./db');
var Post = require('./post');

module.exports = Comment;

function Comment(name,day,title,comment){
	this.name = name;
	this.day = day;
	this.title = title;
	this.comment = comment;
}

Comment.prototype.save = function(callback){
	var name = this.name,
		day = this.day,
		title = this.title,
		commemnt = this.comment;

	db.updateData(Post.model,{
		name: name,
		'time.day': day,
		title: title,
	},{
		$push: {comments: comment}
	},function(reply,result){
		if(callback){
			callback(reply,result)
		}
	})
}