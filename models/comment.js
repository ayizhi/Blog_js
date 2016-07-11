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
		comment = this.comment;

	Post.updateComment(name.trim(),day,title,comment,callback)

}