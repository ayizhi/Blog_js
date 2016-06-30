var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var crypto = require('crypto');





module.exports = function(app){
	app.get('/',function(req,res){
		console.log(req.session.user)
		res.render('index',{
			title: '主页' ,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
		});
	});

	app.get('/reg',function(req,res){
		res.render('reg',{
			title: '主页',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
		})
	});

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

	app.get('/login',function(req,res){
		res.render('login',{title:'登录'})
	});

	app.post('/login',function(req,res){

	});

	app.get('/post',function(req,res){
		res.render('post',{title:'发表'});
	});

	app.post('/post',function(req,res){

	});

	app.get('/logout',function(req,res){

	});




};
