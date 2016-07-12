var mongoose = require('mongoose');
var db = require('./db');
var markdown = require('markdown').markdown;



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
	comments:[{
		name:{type: String},
		email: {type: String},
		website: {type: String},
		time: {type: Date},
		content: {type: String},
		head: {type: String},
	}],
	pv: {type: Number},
	tags:{type: Object},
})

function Post(name,title,post,tags,head){
	this.name = name;
	this.title = title;
	this.post = post;
	this.tags = tags;
	this.head = head;
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
		tags: this.tags,
		comments: [],
		pv: 0,
		head: this.head,
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
			limit: limit,
			sort: {'time.day':-1},
		})

	})
	
}

Post.getOne = function(name,day,title,callback){
	data = {
		'name': name,
		'time.day': day,
		'title': title,
	} || null;


	db.findData(Posts,data,function(reply,doc){
		if(!reply.status){
			callback(reply,doc);
			return;
		}
		db.updateData(Posts,data,{$inc:{'pv':1}},function(reply,result){
			if(!reply.status){
				callback(reply,doc);
				return;
			}
			callback(reply,doc);
		})

	});
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

Post.getArchive = function(callback){
	db.findData(Posts,{},callback,{
		sort: {'time.day': -1}
	},{
		name: 1,
		time: 1,
		title: 1,
	})
}

Post.getTags = function(callback){
	Posts.find().distinct('tags',function(err,data){
		callback(err,data)
	})
}

Post.getTag = function(tag,callback){
	db.findData(Posts,{
		tags: tag,
	},callback,{
		sort: {'time.day': -1}
	},{
		name: 1,
		time: 1,
		title: 1
	})
}

Post.search = function(keyword,callback){
	var pattern = new RegExp(keyword,'i');
	console.log('pattern: ',pattern);
	db.findData(
		Posts,
		{title: pattern},
		callback,
		{sort: {time: -1}},
		{name: 1,time: 1, title: 1}
		)
}


Post.model = Posts;


