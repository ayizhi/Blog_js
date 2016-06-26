var mongoose = require('mongoose');
var settings = require('./settings.js');
var dbUrl = settings.dbUrl;
var db = mongoose.connect(dbUrl)//数据库实际操作

//创建model的封装
exports.buildModel = function(model,json){
	var theModel = new BuildModel(model,json);
	return theModel;
};

//需要保存其model名称，与schema属性
function BuildModel(modelName,json){
	this.Schema = new mongoose.Schema(json);
	this.modelName = modelName;
	this.model = db.model(this.modelName,this.Schema);
	console.log('success',this.model)
	return this.model;
}


//增
//model为实例化Entity对象，不是collection的名字
//conditions为json
exports.addData = function(model,conditions,callback){
	model.create(json,function(err,result){
		callback(err,result);
	})
}


//改
//model为实例化Entity对象，不是collection的名字
//conditions为json
//option为条件：{multi:true}
/*Valid options:
safe (boolean) safe mode (defaults to value set in schema (true))
upsert (boolean) whether to create the doc if it doesn't match (false)
multi (boolean) whether multiple documents should be updated (false)
runValidators: if true, runs update validators on this command. Update validators validate the update operation against the model's schema.
setDefaultsOnInsert: if this and upsert are true, mongoose will apply the defaults specified in the model's schema if a new document is created. This option only works on MongoDB >= 2.4 because it relies on MongoDB's $setOnInsert operator.
strict (boolean) overrides the strict option for this update
overwrite (boolean) disables update-only mode, allowing you to overwrite the doc (false)*/
exports.updateData = function(model,conditions,option,callback){
	model.update(conditions,option,function(err,result){
		callback(err,result)
	})
}

//删
exports.removeData = function(model,conditions,callback){
	model.remove(conditions,function(err,result){
		callback(err,result);
	})
}

