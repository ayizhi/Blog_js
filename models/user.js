var db = require('./db');

module.exports = User;

var Classmate = db.buildModel('classmate',{
		name: {type: String},
		password: {type: String},
		email: {type: String},
	})


function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}
//存
User.prototype.save = function(callback){
	var user = {
		name: this.name,
		password: this.password,
		email: this.email
	};

	db.addData(Classmate,user,callback);
}

//查
User.get = function(name,callback){
	db.findData(Classmate,{name:name},callback)
}



