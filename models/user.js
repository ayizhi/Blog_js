var db = require('./db');
var crypto = require('crypto');


module.exports = User;

var Users = db.buildModel('user',{
		name: {type: String,ref:'post'},
		password: {type: String},
		email: {type: String},
		head: {type: String},
	})


function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}
//存
User.prototype.save = function(callback){

	var head = 'http://pics.sc.chinaz.com/files/pic/pic9/201508/apic14052.jpg';

	var user = {
		name: this.name,
		password: this.password,
		email: this.email,
		head: head
	};

	db.addData(Users,user,callback);
}

//查
User.get = function(name,callback){
	db.findData(Users,{name:name},callback)
};

User.model = Users;



