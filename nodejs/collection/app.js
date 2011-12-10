/* 2001-05-25 (mca) : collection+json */
/* Designing Hypermedia APIs by Mike Amundsen (2011) */

/**
 * Module dependencies.
 */

// for express
var express = require('express');
var app = module.exports = express.createServer();

// for couch
var cradle = require('cradle');
var db = new(cradle.Connection)().database('collection-data-tasks');

// global data
var contentType = 'application/json';

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// register custom media type as a JSON format
express.bodyParser.parse['application/collection+json'] = JSON.parse;

// Routes

/* handle default task list */
app.get('/collection/tasks/', function(req, res){

  var view = '/_design/example/_view/due_date';
  
  db.get(view, function (err, doc) {
    res.header('content-type',contentType);
    res.render('tasks', {
      site  : 'http://localhost:3000/collection/tasks/',
      items : doc
    });
  });
});

/* filters */
app.get('/collection/tasks/;queries', function(req, res){
  res.header('content-type',contentType);
  res.render('queries', {
    layout : 'item-layout',
    site  : 'http://localhost:3000/collection/tasks/',
  });
});

app.get('/collection/tasks/;template', function(req, res){
  res.header('content-type',contentType);
  res.render('template', {
    layout : 'item-layout',
    site  : 'http://localhost:3000/collection/tasks/',
  });
});

app.get('/collection/tasks/;all', function(req, res){

    var view = '/_design/example/_view/all';
    
    db.get(view, function (err, doc) {
    res.header('content-type',contentType);
    res.render('tasks', {
      site  : 'http://localhost:3000/collection/tasks/',
      items : doc
    });
  });
});

app.get('/collection/tasks/;open', function(req, res){

    var view = '/_design/example/_view/open';
    
    db.get(view, function (err, doc) {
    res.header('content-type',contentType);
    res.render('tasks', {
      site  : 'http://localhost:3000/collection/tasks/',
      items : doc
    });
  });
});

app.get('/collection/tasks/;closed', function(req, res){

    var view = '/_design/example/_view/closed';
    
    db.get(view, function (err, doc) {
    res.header('content-type',contentType);
    res.render('tasks', {
      site  : 'http://localhost:3000/collection/tasks/',
      items : doc
    });
  });
});

app.get('/collection/tasks/;date-range', function(req, res){

    var d1 = (req.query['date-start'] || '');
    var d2 = (req.query['date-stop'] || '');

    var options = {};
    options.startkey=String.fromCharCode(34)+d1+String.fromCharCode(34);
    options.endkey=String.fromCharCode(34)+d2+String.fromCharCode(34);
     
    var view = '/_design/example/_view/due_date';   
    
    db.get(view, options, function (err, doc) {
    res.header('content-type',contentType);
    res.render('tasks', {
      site  : 'http://localhost:3000/collection/tasks/',
      items : doc,
      query : view
    });
  });
});

/* handle single task item */
app.get('/collection/tasks/:i', function(req, res){

    var view = '/'+req.params.i;
    
    db.get(view, function (err, doc) {
    res.header('content-type',contentType);
    res.header('etag',doc._rev);
    res.render('task', {
      layout : 'item-layout',
      site  : 'http://localhost:3000/collection/tasks/',
      item : doc,
    });
  });
});

/* handle creating a new task */
app.post('/collection/tasks/', function(req, res){
  
  var description, completed, dateDue, data;
  
  // get data array
  data = req.body.template.data; 

  // pull out values we want
  for(i=0,x=data.length;i<x;i++) {
    switch(data[i].name) {
      case 'description' :
        description = data[i].value;
        break;
      case 'completed' :
        completed = data[i].value;
        break;
      case 'dateDue' :
        dateDue = data[i].value;
        break;
    }    
  }
  
  // build JSON to write
  var item = {};
  item.description = description;
  item.completed = completed;
  item.dateDue = dateDue;
  item.dateCreated = today();
  
  // write to DB
  db.save(item, function(err, doc) {
    if(err) {
      res.status=400;
      res.send(err);
    }
    else {
      res.redirect('/collection/tasks/', 302);
    }
  });  
});

/* handle updating an existing task item */
app.put('/collection/tasks/:i', function(req, res) {

  var idx = (req.params.i || '');
  var rev = req.header("if-match", "*");
  var description, completed, dateDue, data;
  
  // get data array
  data = req.body.template.data; 

  // pull out values we want
  for(i=0,x=data.length;i<x;i++) {
    switch(data[i].name) {
      case 'description' :
        description = data[i].value;
        break;
      case 'completed' :
        completed = data[i].value;
        break;
      case 'dateDue' :
        dateDue = data[i].value;
        break;
    }    
  }
  
  // build JSON to write
  var dt = new Date();
  var item = {};
  item.description = description;
  item.completed = completed;
  item.dateDue = dateDue;
  item.dateCreated = today();
   
  db.save(idx, rev, item, function (err, doc) {
    // return the same item
    res.redirect('/collection/tasks/'+idx, 302);
  });
});

/* handle deleting existing task */
app.delete('/collection/tasks/:i', function(req, res) {
  var idx = (req.params.i || '');
  var rev = req.header("if-match", "*");
  
  db.remove(idx, rev, function (err, doc) {
    if(err) {
      res.status=400;
      res.send(err);
    } 
    else {
      res.status= 204;
      res.send();
    }
  });
});

function today() {
  var y, m, d, dt;
  
  dt = new Date();
  y = dt.getFullYear();
  m = dt.getMonth()+1;
  if(m.length===1) {
    m = '0'+m;
  }
  d = dt.getDate();
  if(d.length===1) {
    d = '0'+d;
  }
  return y+'-'+m+'-'+d
};

// Only listen on $ node app.js
if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
