var mongoose = require('mongoose');
var db = require('./db');

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

db.findData(Posts,{},function(reply,result){

	result.forEach(function(post,index){
		var comments = post.comments;

		comments.forEach(function(comment){
			if(comment.head){
				if(comment.head != 'http://pics.sc.chinaz.com/files/pic/pic9/201508/apic14052.jpg'){

					var name = comment.name;
					var website = comment.website;
					var time = comment.time;
					var url = 'http://pics.sc.chinaz.com/files/pic/pic9/201508/apic14052.jpg';

					db.updateData(Posts,{
						'comments.name': name,
						'comments.website': website,
						'comments.time': time 
					},{$set:{'comments.$.head':url}},function(reply2,result2){
						console.log('===')
						console.log('===')
						console.log('===')
						console.log('===')

						console.log(reply2,result2)
					})
				}
			}
		})
	})
		
})