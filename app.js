var mongoose = require('mongoose');

//连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/qjyd');


//创建一个schema结构
var Fe = mongoose.model('Fe',{
	name : {type : String},
	age : {type : Number},
	sex : {type : String},
});


var deguang = new Fe({
	name : 'lideguang',
	age : 23,
	sex :'male'
})

deguang.save(function(err,result){
	console.log('成功')
	console.log(result)
})

var Php = mongoose.model('Php',{
	'name' : String,
	'age' : Number,
	'sex' : String,
})

var lijun = new Php({
	name : 'fanglijun',
	age : 33,
	sex : 'male'
})

lijun.save(function(err,result){
	console.log('成功');
	console.log(result)
})