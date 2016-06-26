var mongoose = require('mongoose');
var db = require('./module/db.js');

var thejava = db.buildModel('java',{
	name : {type : String},
	age : {type : Number},
	sex : {type : String},
})

db.addData(thejava,{
	name : 'lulu',
 	age : 23,
 	sex :'male'
},function(err,result){
	if(err){
		console.log('failure')
		return
	}
	console.log(result,'success')

})



//创建一个schema结构
// var Fe = mongoose.model('Fe',{
// 	name : {type : String},
// 	age : {type : Number},
// 	sex : {type : String},
// });


// var deguang = new Fe({
// 	name : 'lideguang',
// 	age : 23,
// 	sex :'male'
// })

// deguang.save(function(err,result){
// 	console.log('成功')
// 	console.log(result)
// })

