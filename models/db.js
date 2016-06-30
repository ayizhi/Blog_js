var mongoose = require('mongoose');
var settings = require('../settings.js');
var dbUrl = 'mongodb://' + settings.host + ':' + settings.port + '/' + settings.db;
var db = mongoose.connect(dbUrl)//数据库实际操作


//mongoose:前台界面：不操作数据库，只操作类！
//create 和 remove 操作返回 promise 对象， update 和 find 操作返回 query 对象，需要注意的是，使用 find前缀 方法（如：Model.findOneAndRemove、Model.findByIdAndRemove、Model.findByIdAndUpdate）时返回对象均为 query




//创建model的封装
exports.buildModel = function(modelName,json){
	var theModel = new BuildModel(modelName,json);
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
	model.create(conditions,function(err,result){
		if(err){
			console.log(err)
			callback({'status':false,'message':'add fail'},result);
			return
		}
		console.log('add success')
		callback({'status':true,'message':'add success'},result);
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
exports.updateData = function(model,conditions,options,callback){
	model.update(conditions,options,function(err,result){
		if(err){
			console.log(err);
			callback({'status':false,'message':'update fail'},result);	
			return
		}else{
			if(result.n != 0){
				console.log('update success');
				callback({'status':true,'message':'update success'},result);
			}else{
				console.log('update cannot find data');
				callback({'status':false,'message':'update cannot find data'},result);
				return
			}
		}
	})
}

//删
//model为实例化Entity对象，不是collection的名字
//conditions为json
//还要通过result.result.n判断除err外的成不成功删除的状态
exports.removeData = function(model,conditions,callback){
	model.remove(conditions,function(err,result){
		if(err){
			console.log(err);
			callback({'status':false,'message':'remove fail'},result);
			return
		}else{
			if(result.result.n != 0){
				console.log('remove success');
				callback({'status':true,'message':'remove success'},result);
			}else{
				console.log('remove cannot find data');
				callback({'status':false,'message':'remove cannot find data'},result);
				return;
			}
		}
	})
}

//查
//非关联
//conditions:条件
//fields:需要查询的字段
//options: {'skip':10,'limit':'10'...etc}
//例子:Blog.find({}, null, {sort: {'_id': -1}, skip : ( pageIndex - 1 ) * pageSize, limit : pageSize },function)
exports.findData = function(model,conditions,callback,fields,options){
	model.find(conditions,fields,options,function(err,result){
		if(err){
			console.log(err);
			callback({'status':false,'message':'find fail'},result);
			return
		}else{
			if(result.length != 0){
				console.log('find success');
				callback({'status':true,'message':'find success'},result);
			}else{
				console.log('cannot find data');
				callback({'status':false,'message':'cannot find data'},result);
				return;
			}
		}
	})
}


//查
//关联查找
//mongoose本身支持promise化
//  conditions
//  path :The field need to be refilled （需要覆盖的字段）
/*
fields
　　类型：Object或String，可选，指定填充 document 中的哪些字段。
　　Object类型的时，格式如:{name: 1, _id: 0},为0表示不填充，为1时表示填充。
　　String类型的时，格式如:"name -_id"，用空格分隔字段，在字段名前加上-表示不填充。详细语法介绍 query-selectz
*/
//  refmodel （关联的字段，有path可为null）要关联的model名，也可以是schema的ref属性
//	match <Object> Conditions for the population query 附加查询条件
//  options 附加查询选项

/*
path <Object, String> either the path to populate or an object specifying all parameters
[select] <Object, String> Field selection for the population query
[model] <Model> The model you wish to use for population. If not specified, populate will look up the model by the name in the Schema's ref field.
[match] <Object> Conditions for the population query
[options] <Object> Options for the population query (sort, etc)
*/

exports.populateFind = function(model,conditions,path,fields,refmodel,match,options,callback){
	var promise = model.find(conditions).populate(path,fields,refmodel,match,options).exec()
	promise.then(function(err,result){
		 if(err) {
                console.log(err);
                callback({status: false, message: 'population find fail'},result);
            } else {
                if(result.length!=0){
                    console.log('population find success!');
                    callback({status: true, message: 'population find success'},result);
                }
                else{
                    console.log('cannot find data');
                    callback({status: false, message: 'cannot find data'},result);
                }
            }
	})
}

