var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');//log 记录器
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routers/index');
var settings = require('./settings');
var flash = require('connect-flash');
var db = require('./models/db');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var app = express();

//设置端口
app.set('port',process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(flash());
app.use(logger('dev'));
/*
express项目中通常使用body-parser进行post参数的解析，最常用的是其中的json和urlencoded的parser，可分别对以JSON格式的post参数和urlencoeded的post参数进行解析，均可获得一个JSON化的req.body，如：

{
    "username": "user",
    "password": "pass"
}
body-parser还有一个raw parser，可以获取一个buffer对象的req.body。
通过详细阅读body-parser的源代码，可以知道，各个parser会对req headers及post参数进行一系列的判断和处理，只有满足条件的情况下才对post参数进行解析，解析之前，首先使用raw-body模块对req进行处理，其处理过程是将req作为一个readable stream进行处理，从而得到raw body内容，然后按具体的格式进行解析。
在express项目中，通常顺序调用body-parser所提供的parser，这样当一个parser无法满足post参数解析条件时，还可以使用另一个parser进行解析（在某些特殊的请求中，有可能所有parser均无法解析）。
app.use(bodyParser.raw);
app.use(bodyParser.json);
app.use(bodyParser.urlencoded({
    extended: false
});
但body-parser的各个parser在解析的过程中，若对满足解析条件的post参数进行了解析，req作为一个stream对象，已经被消耗，无法再使用另一个parser对post参数解析，也即post参数只能被第一个满足解析条件的parser进行解析。因此即使先后调用raw、json、urlencoded这三个parser，也只能得到一个body，具体格式由各parser的调用次序及post参数满足的解析条件决定。JSON化的body和raw body如同鱼与熊掌，二者不可得兼。
但在有些场合下，可能需要在解析body的同时使用raw body进行其他操作，如某些应用场景下就需要使用raw body参与签名运算以对访问者进行鉴权。
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.use(session({
	secret: settings.cookieSecret,
	key: settings.db,
	cookie: {maxAge: 1000*60*60*24*30},//30 days
	store: new MongoStore({
		// db: settings.db,
		// host: settings.host,
		// port: settings.port
		url: settings.dbUrl
	})
}));




routes(app);

app.listen(app.get('port'),function(){
	console.log('Express server listening on port ' + app.get('port'));
})


module.exports = app;