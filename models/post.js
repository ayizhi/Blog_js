var db = require('./db');


module.exports = Post;

var Posts = db.buildModel('post',{
	name: {type: String},
	title: {type: String},
	post: {type: String},
})

function Post(name,title,post){
	this.name = name;
	this.title = title;
	this.post = post;
}

Post.prototype.save = function(callback){
	var date = new Date();
	var time = {
		date: date;
		year: date.getFullYear(),
		month: date.getFullYear() + '-' + (date.getMonth() + 1),
		day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
		minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
	}
	var post = {
		name: this.name,
		time: time,
		title: this.title,
		post: this.post
	}

	db.addData(Posts,post,callback)



}

