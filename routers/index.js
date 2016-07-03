var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var Post = require('../models/post.js');
var crypto = require('crypto');



module.exports = function(app){
	app.get('/',function(req,res){
		Post.get(null,function(reply,result){
			var posts = [];
			if(reply.status){
				posts = result;
			};

			console.log(posts)
			console.log(req.session.user);

			res.render('index',{
				title: '主页',
				user: req.session.user,
				posts: posts,
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
		console.log(req.body)
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
			console.log(status,result)
			if(status.status){
				req.flash('error','改用户已经存在');
				return res.redirect('/reg')
			}
			newRegister.save(function(status,result){
				console.log(status,result)
				if(status.status == 'false'){
					req.flash('error',status.message);
					return res.redirect('/reg');
				}
				req.flash('success','注册成功');
				console.log('注册成功')
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
				console.log(reply.message);
				return res.redirect('/login');
			}
			
			var dbPassword = result[0].password;

			if(dbPassword != password){
				console.log('密码错误')
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
		});;
	});

	app.post('/post',checkLogin)
	app.post('/post',function(req,res){
		var currentUser = req.session.user;
		console.log('asd asd asd sad ads as: ',currentUser)
		var post = new Post(currentUser[0].name,req.body.title,req.body.post);
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
