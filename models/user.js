var db = require('./db');

module.exports = User;

var Users = db.buildModel('user',{
		name: {type: String,ref:'post'},
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

	db.addData(Users,user,callback);
}

//查
User.get = function(name,callback){
	db.findData(Users,{name:name},callback)
};

User.model = Users;



