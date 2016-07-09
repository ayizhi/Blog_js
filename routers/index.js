var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');
var crypto = require('crypto');
var markdown = require('markdown').markdown;
var db = require('../models/db.js');




module.exports = function(app){
	app.get('/',function(req,res){
		var page = req.query.p ? parseInt(req.query.p) : 1;
		console.log(page);
		Post.getTen(null,page,function(reply,result,total){
			posts = result;
			if(!reply.status){
				posts = [];
			};


			console.log('=1=24==124312',page * 10 <= total,page,total)

			res.render('index',{
				title: '主页',
				posts: posts,
				page: page,
				isFirstPage: page == 1,
				isLastPage: page * 10 >= total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString() 
			})

		})
	});

	app.get('/reg',checknotLogin);
	app.get('/reg',function(req,res){
		res.render('reg',{
			title: '注册',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
		})
	});

	app.post('/reg',checknotLogin);
	app.post('/reg',function(req,res){

		var username = req.body.name;
		var password = req.body.password;
		var password_confirm = req.body['password-confirm'];
		var email = req.body.email;
		if(password != password_confirm){
			req.flash('error','两次密码不一致');
			return res.redirect('/reg');
		}

		var md5 = crypto.createHash('md5');
		password = md5.update(req.body.password).digest('hex');


		var newRegister = new User({
			name: username,
			password: password,
			email: email,
		})

		User.get(username,function(status,result){

			if(status.status){
				req.flash('error','改用户已经存在');
				return res.redirect('/reg')
			}
			newRegister.save(function(status,result){

				if(status.status == 'false'){
					req.flash('error',status.message);
					return res.redirect('/reg');
				}
				req.flash('success','注册成功');
				req.session.user = result;
				res.redirect('/')
			})
		})
	});

	app.get('/login',checknotLogin);
	app.get('/login',function(req,res){
		res.render('login',{
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
		});
	});

	app.post('/login',checknotLogin);
	app.post('/login',function(req,res){
		var name = req.body.name;
		var password = req.body.password;
		var md5 = crypto.createHash('md5');
		password = md5.update(password).digest('hex');
		User.get(name,function(reply,result){

			if(!reply.status){
				return res.redirect('/login');
			}
			
			var dbPassword = result[0].password;

			if(dbPassword != password){
				req.flash('error','密码错误！');
				return res.redirect('/login');
			}
			//正确，存入session
			req.session.user = result;
			req.flash('success','登录成功');
			res.redirect('/');
		})
	});

	app.get('/post',checkLogin)
	app.get('/post',function(req,res){
		res.render('post',{
			title: '发表',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
		});
	});

	app.post('/post',checkLogin)
	app.post('/post',function(req,res){
		var currentUser = req.session.user;

		if(currentUser.length){
			currentUser = currentUser[0]
		}else{
			currentUser = currentUser;
		}

		var post = new Post(currentUser.name,req.body.title,req.body.post);
		post.save(function(reply,result){
			if(!reply.status){
				req.flash('error',reply.message);
				return res.redirect('/');
			}
			req.flash('success',reply.message);
			res.redirect('/');
		})
	});

	app.get('/logout',checkLogin)
	app.get('/logout',function(req,res){
		req.session.user = null;
		req.flash('success','登出成功');
		res.redirect('/');
	});

	app.get('/upload',checkLogin);
	app.get('/upload',function(req,res){
		res.render('upload',{
			title: '文件上传',
			user: req.session.user,
			success: req.flash('success').toString(),
			error:req.flash('error').toString()
		})
	});

	app.post('/upload',checkLogin);
	app.post('/upload',function(req,res){
		req.flash('success','上传成功');
		return res.redirect('/upload');
	});

	app.get('/u/:name',function(req,res){
		User.get(req.params.name,function(reply,user){
			if(!reply){
				req.flash('error',reply.message)
				return res.redirect('/')
			}

			//user有可能是array还是obj
			if(user.length){
				user = user[0];
			}

			var page = req.query.p ? parseInt(req.query.p) : 1;


			Post.getTen(user.name,page,function(reply,posts,total){
				if(!reply){
					req.flash('error',reply.message)
					return res.redirect('/')
				};

				res.render('user',{
					title: user.name,
					posts: posts,
					page:page,
					isFirstPage: page == 1,
					isLastPage: page * 10 >= total ,
					user: req.session.user,
					success: req.flash('success').toString(),
					error:req.flash('error').toString()
				})
			})
		})
	});

	app.get('/u/:name/:day/:title',function(req,res){
		Post.getOne(req.params.name,req.params.day,req.params.title,function(reply,post){
			if(!reply.status){
				req.flash('error',reply.message)
				return res.redirect('/');
			}
		

			if(post.length){
				post = post[0]
			}
			console.log(req.params.day,post.time.day,'=======')

			res.render('article',{
				title: req.params.title,
				post: post,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.post('/u/:name/:day/:title',function(req,res){
		var date = new Date();
		var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes()<10? '0'+ date.getMinutes() : date.getMinutes());
		var comment = {
			name:req.body.name,
			email: req.body.email,
			website: req.body.website,
			time: time,
			content: req.body.content
		};
		console.log('-=1=3=1=2312')
		var newComment = new Comment(req.params.name,req.params.day,req.params.title,comment);
		newComment.save(function(reply,result){

			console.log(reply)

			if(!reply.status){
				req.flash('error',reply.message);
				return res.redirect('back');
			}
			req.flash('success',reply.message);
			res.redirect('back');
		})
	})

	app.get('/edit/:name/:day/:title',checkLogin);
	app.get('/edit/:name/:day/:title',function(req,res){
		var currentUser = req.session.user;
		Post.edit(req.params.name,req.params.day,req.params.title,function(reply,post){
			if(!reply.status){
				req.flash('error',reply.message);
				return res.redirect('/');
			}

			if(post.length){
				post = post[0]
			}

			res.render('edit',{
				title: '编辑',
				day:req.params.day,
				title:req.params.title,
				name:req.params.name,
				post: post,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
			})
		})
	});



	app.post('/edit/:name/:day/:title',checkLogin);
	app.post('/edit/:name/:day/:title',function(req,res){
		var currentUser = req.session.user;
		Post.update(req.params.name,req.params.day,req.params.title,req.body.post,function(reply,result){
			var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
				
			console.log('-==========',url)
			if(!reply.status){
				req.flash('error',reply.message);
				return res.redirect(url);
			}

			req.flash('success',reply.message);
			res.redirect(url)
		
		})
	})

	app.get('/remove/:name/:day/:title',checkLogin);
	app.get('/remove/:name/:day/:title',function(req,res){
		var currentUser = req.session.user;
		Post.remove(req.params.name,req.params.day,req.params.title,function(reply){
			if(!reply.status){
				req.flash('error',reply.message);
				return redirect('back');
			}

			req.flash('success',reply.message);
			res.redirect('/');
		})
	})

	app.get('/archive',function(req,res){
		Post.getArchive(function(reply,result){
			if(!reply.status){
				req.flash('error',reply.message);
				return res.redirect('/');
			}

			console.log('=======',result)
			var posts = result;

			res.render('archive',{
				title: '存档',
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});


	function checkLogin(req,res,next){
		if(!req.session.user){
			req.flash('error','未登录!');
			res.redirect('/login');
		}

		next();
	}

	function checknotLogin(req,res,next){
		if(req.session.user){
			req.flash('error','已登录');
			res.redirect('back');
		}

		next();
	}

};
