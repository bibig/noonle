
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  // , logger = express.logger()
  , node = require('./routes/node')
  , page = require('./routes/page')
  , theme = require('./routes/theme')
  , message = require('./routes/message')
  , load = require('./lib/load')
  , counter = require('./lib/counter')
  , form = require('./lib/form')
  , authorize = require('./lib/authorize')
  , validate = require('./lib/common_validator')
  , http = require('http')
  , path = require('path')
  , isProduction = process.env.NODE_ENV === 'production'
  , app = express();


/*
function appLogger (req, res, next) {
  if (!(/\.(png|jpg|gif|jpeg)$/i).test(req.path)) {
    logger(req, res, next);
  } else {
    next();
  }
};
*/

app.configure(function(){
  app.set('port', isProduction ? 8080 : 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger(isProduction ? 'default' : 'dev'));
  //app.use(conditionalLogger);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use('/asserts', require('stylus').middleware({
  	src:__dirname + '/public',
  	compress: (isProduction ? true : false),
  	force: (isProduction ?  false : true)
  	}));
  app.use('/asserts', express.static(path.join(__dirname, 'public')));
  app.use(express.cookieParser(process.env.NOONLE_COOKIE_KEY || 'hello123'));
  // app.use(express.session());
  app.use(express.cookieSession({maxAge: 60 * 60 * 1000, secret: process.env.NOONLE_COOKIE_SESSION_KEY || 'imsecret!'}));
  app.use(require('connect-flash')());
  app.use(express.csrf());
  app.use(app.router);
});

app.configure('development', function (){
  app.use(express.errorHandler());
});

app.configure('production', function () {
  app.use(function(err, req, res, next){
    console.error(err);
    res.status(501);
    res.send('很抱歉，出错了');
  });
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

app.param('w_nid_pages',  load.root); // check if the nid is under control of root
app.param('w_nid_pages',  load.nodeWithPages);
app.param('w_nid_pages',  authorize.checkAdmin);

app.param('pid', load.page);
app.param('_pid', validate.ifNodeIsFrozen);
app.param('_pid', load.newPage);


// site default node
app.get('/', node.index);

app.post('/auth/read/:a_r_nid', validate.form, authorize.submitForRead);
app.post('/auth/admin/:a_w_nid', validate.form, authorize.submitForAdmin);
app.get('/auth/admin/:a_w_nid', form.login);
app.post('/auth/root', [load.root, validate.form], authorize.submitForRoot);

// create new node
// app.get('/new', form.node);

app.get('/new', node.create);
app.get('/create/:_nid', form.node);
app.post('/create/:_nid', validate.form, node.save);

// edit node
app.get('/edit/:w_nid', form.node);
app.post('/edit/:w_nid', validate.form, node.update);

// set node
app.get('/set/:w_nid', form.node);
app.post('/set/:w_nid', validate.form, node.set);

// create new page
app.get('/new/:w_nid', page.create);
app.get('/create/:w_nid/:_pid', form.page);
app.post('/create/:w_nid/:_pid', validate.form, page.save);


// edit page
app.get('/edit/:w_nid/:pid', form.page);
app.post('/edit/:w_nid/:pid', validate.form, page.update);

// set page
app.get('/set/:w_nid/:pid', form.page);
app.post('/set/:w_nid/:pid', validate.form, page.set);

// design
app.get('/design/:w_nid_pages/themes', node.design);
app.post('/design/:w_nid/save', node.saveDesign);


// base design
app.get('/themes/init', load.root, theme.init);
app.get('/themes', load.root, theme.list);

app.get('/:r_nid_pages', counter.nodeHit, node.read);

app.get('/:r_nid/:pid', counter.pageHit, page.read);

// 404 page
// $ curl http://localhost:3000/notfound
// $ curl http://localhost:3000/notfound -H "Accept: application/json"
// $ curl http://localhost:3000/notfound -H "Accept: text/plain"
app.use(function(req, res){
  // res.status(404);
  // respond with html page
  if (req.accepts('html')) {
  	// console.log(req);
  	res.redirect('/404');
    // res.r('404', { url: req.protocol  + '://' + req.host + req.url });
    return;
  }
  
  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }
  
  // default to plain-text. send()
  res.type('txt').send('Not found');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});