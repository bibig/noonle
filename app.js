
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  // , logger = express.logger()
  , node = require('./routes/node')
  , page = require('./routes/page')
  , message = require('./routes/message')
  , load = require('./lib/load')
  , counter = require('./lib/counter')
  , form = require('./lib/form')
  , authorize = require('./lib/authorize')
  , validate = require('./lib/common_validator')
  , http = require('http')
  , path = require('path');

var app = express();
/*var conditionalLogger = function (req, res, next) {
	if (!(/\.(png|jpg|gif|jpeg)$/i).test(req.path)) {
		logger(req, res, next);
	} else {
		next();
	}
};*/

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	//app.use(conditionalLogger);
	app.use(express.bodyParser());
	// app.use(expressValidator);
	app.use(express.methodOverride());
	app.use(express.cookieParser('Adfdsfer134jhsdf234'));
	// app.use(express.session());
	app.use(express.cookieSession({maxAge: 60 * 60 * 1000, secret: 'imsecret'}));
	app.use(require('connect-flash')());
	app.use(express.csrf());
	app.use(app.router);
	// app.use(require('stylus').middleware(__dirname + '/public'));
	app.use('/asserts', express.static(path.join(__dirname, 'public')));
});

// console.log(express.errorHandler.toString());

app.configure('development', function(){
	
	/*
	app.use(function(err, req, res, next){
		// console.error(err);
		res.send('Fail Whale, yo.');
	});
	*/
	
  	app.use(express.errorHandler());
});

app.param('_nid',  load.newNode);
app.param('_nid',  load.root); // check if the nid is under control of root
app.param('_nid',  authorize.checkAdmin);

app.param('r_nid_pages',  load.nodeWithPages);
app.param('r_nid_pages',  authorize.checkRead);

app.param('r_nid',  load.node);
app.param('r_nid',  authorize.checkRead);

app.param('a_r_nid',  load.node);
app.param('a_w_nid',  load.nodeOrNewNode);
app.param('a_w_nid',  load.root); // check if the nid is under control of root

app.param('w_nid',  load.root); // check if the nid is under control of root
app.param('w_nid',  load.node);
app.param('w_nid',  authorize.checkAdmin);

app.param('pid', load.page);
app.param('_pid', validate.ifNodeIsFrozen);
app.param('_pid', load.newPage);


// site default node
app.get('/', node.index);

app.post('/read/auth/:a_r_nid', validate.form, authorize.submitForRead);
app.post('/admin/auth/:a_w_nid', validate.form, authorize.submitForAdmin);
// app.post('/auth', authorize.submit);

// create new node
// app.get('/new', form.node);

app.get('/new', node.create);
app.get('/create/:_nid', form.node);
app.post('/create/:_nid', validate.form, node.save);
// app.post('/create/:_nid', node.save);

// edit node
app.get('/edit/:w_nid', form.node);
app.post('/edit/:w_nid', validate.form, node.update);
// app.post('/edit/:w_nid', node.update);

// set node
app.get('/set/:w_nid', form.node);
app.post('/set/:w_nid', validate.form, node.set);
// app.post('/set/:w_nid', node.set);

// create new page
app.get('/new/:w_nid', page.create);
app.get('/create/:w_nid/:_pid', form.page);
app.post('/create/:w_nid/:_pid', validate.form, page.save);
// app.post('/create/:w_nid/:_pid', page.save);


// edit page
app.get('/edit/:w_nid/:pid', form.page);
app.post('/edit/:w_nid/:pid', validate.form, page.update);
// app.post('/edit/:w_nid/:pid', page.update);

// set page
app.get('/set/:w_nid/:pid', form.page);
app.post('/set/:w_nid/:pid', validate.form, page.set);
// app.post('/set/:w_nid/:pid', page.set);

app.get('/:r_nid_pages', counter.nodeHit, node.read);
// app.get('/:r_nid_pages', node.read);


app.get('/:r_nid/:pid', counter.pageHit, page.read);
// app.get('/:r_nid/:pid', page.read);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
