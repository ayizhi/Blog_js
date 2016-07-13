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
		Post.getTen(null,page,function(reply,result,total){
			posts = result;
			if(!reply.status){
				posts = [];
			};

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

		var tags = [req.body.tag1.trim(),req.body.tag2.trim(),req.body.tag3.trim()];
		console.log('tags',tags);

		var post = new Post(currentUser.name,req.body.title,req.body.post,tags,currentUser.head);
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


			Post.getTen(req.params.name,page,function(reply,posts,total){
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

			var user = null;
			if(req.session.user){
				var user = req.session.user[0] || req.session.user;
			}


			res.render('article',{
				title: req.params.title,
				post: post,
				user: user || '',
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.post('/u/:name/:day/:title',function(req,res){
		var date = new Date();
		var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes()<10? '0'+ date.getMinutes() : date.getMinutes());

		var head = 'http://pics.sc.chinaz.com/files/pic/pic9/201508/apic14052.jpg';

		var currentUser = req.session.user.name || req.session.user[0].name;




		var comment = {
			name: currentUser,
			email: req.body.email,
			website: req.body.website,
			time: time,
			content: req.body.content,
			head: head,
		};

		console.log(req.params,'======p======')
		console.log(req.body,'======b=====')


		var newComment = new Comment(req.body.post_name,req.params.day,req.params.title,comment);
		newComment.save(function(reply,result){
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

	app.get('/tags',function(req,res){
		var user = req.session.user || req.session.user[0];
		Post.getTags(function(err,data){
			if(err){
				req.flash('error',reply.message);
				return res.redirect('/');
			}
			var tags = data;

			res.render('tags',{
				title: '标签',
				tags: tags,
				user: user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			})
		})
	})

	app.get('/tags/:tag',function(req,res){
		var tag = req.params.tag;
		Post.getTag(tag,function(reply,result){
			if(!reply.status){
				req.flash('error',reply.message);
				return res.redirect('/');
			}

			res.render('tags',{
				title: 'TAG:' + req.params.tag,
				posts: result,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			})
		})
	});


	app.get('/search',function(req,res){
		Post.search(req.query.keyword,function(reply,result){
			if(!reply.status){
				req.flash('error',reply.message);
				return res.redirect('/');
			}

			res.render('search',{
				title: 'SEARCH: ' + req.query.keyword,
				posts: result,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			})
		})
	});

	app.get('/links',function(req,res){
		res.render('links',{
			title: '友情链接',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		})
	});


	app.get('/reprint/:name/:day/:title',checkLogin);
	app.get('/reprint/:name/:day/:title',function(req,res){
		Post.edit(req.params.name,req.params.day,req.params.title,function(reply,result){
			if(!reply.status){
				req.flash('error',reply.message);
				return res.redirect(back);
			}

			var currentUser = req.session.user[0] || req.session.user;
			var post = result[0] || result;
			var reprint_from = {
				name: post.name,
				day: post.time.day,
				title: post.title
			};

			var reprint_to = {
				name: currentUser.name,
				head: currentUser.head,
			};



			Post.reprint(reprint_from,reprint_to,function(reply2,result2){
				if(!reply2.status){
					req.flash('error','转载失败');
					return res.redirect('back');
				}

				req.flash('success','转载成功');
				var url = encodeURI('/u/' + post.name + '/' + post.time.day + '/' + post.time);
				res.redirect(url);
			})
		})
	})








	app.use(function(req,res){
		res.render('404');
	})


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
