/* 2001-05-25 (mca) : collection+json */
/* Designing Hypermedia APIs by Mike Amundsen (2011) */

/**
 * Module dependencies.
 */

// for express
const express = require('express');
const app = module.exports = express();
const port = process.env.PORT ?? 3000;
const host = process.env.HOST ?? 'localhost';

const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');
const expressLayout = require('express-ejs-layouts')

// for couch
const cradle = require('cradle');
const db = new (cradle.Connection)().database('collection-data-tasks');

// global data
const contentType = 'application/json';

// Configuration
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json({ type: 'application/collection+json' }));
app.use(expressLayout);
app.use(express.static(__dirname + '/public'));

const errorOptions = process.NODE_ENV === 'production' ? { dumpExceptions: true, showStack: true } : undefined;
app.use(errorhandler(errorOptions));

// Routes

/* handle default task list */
app.get('/collection/tasks/', function (req, res) {

  const view = '_design/example/_view/due_date';

  db.get(view, function (err, doc) {
    res.header('content-type', contentType);
    res.render('tasks', {
      site: 'http://localhost:3000/collection/tasks/',
      items: doc
    });
  });
});

/* filters */
app.get('/collection/tasks/;queries', function (req, res) {
  res.header('content-type', contentType);
  res.render('queries', {
    layout: 'item-layout',
    site: 'http://localhost:3000/collection/tasks/'
  });
});

app.get('/collection/tasks/;template', function (req, res) {
  res.header('content-type', contentType);
  res.render('template', {
    layout: 'item-layout',
    site: 'http://localhost:3000/collection/tasks/'
  });
});

app.get('/collection/tasks/;all', function (req, res) {

  const view = '_design/example/_view/all';

  db.get(view, function (err, doc) {
    res.header('content-type', contentType);
    res.render('tasks', {
      site: 'http://localhost:3000/collection/tasks/',
      items: doc
    });
  });
});

app.get('/collection/tasks/;open', function (req, res) {

  const view = '_design/example/_view/open';

  db.get(view, function (err, doc) {
    res.header('content-type', contentType);
    res.render('tasks', {
      site: 'http://localhost:3000/collection/tasks/',
      items: doc
    });
  });
});

app.get('/collection/tasks/;closed', function (req, res) {

  const view = '_design/example/_view/closed';

  db.get(view, function (err, doc) {
    res.header('content-type', contentType);
    res.render('tasks', {
      site: 'http://localhost:3000/collection/tasks/',
      items: doc
    });
  });
});

app.get('/collection/tasks/;date-range', function (req, res) {

  const d1 = (req.query['date-start'] || '');
  const d2 = (req.query['date-stop'] || '');

  const options = {
    startkey: `"${d1}"`,
    endkey: `"${d2}"`
  };

  const view = '_design/example/_view/due_date';

  db.get(view, options, function (err, doc) {
    res.header('content-type', contentType);
    res.render('tasks', {
      site: 'http://localhost:3000/collection/tasks/',
      items: doc,
      query: view
    });
  });
});

/* handle single task item */
app.get('/collection/tasks/:i', function (req, res) {

  const view = req.params.i;

  db.get(view, function (err, doc) {
    res.header('content-type', contentType);
    res.header('etag', doc._rev);
    res.render('task', {
      layout: 'item-layout',
      site: 'http://localhost:3000/collection/tasks/',
      item: doc
    });
  });
});

/* handle creating a new task */
app.post('/collection/tasks/', function (req, res) {

  let description, completed, dateDue;

  // get data array
  const data = req.body.template.data;

  // pull out values we want
  for (let i = 0, x = data.length; i < x; i++) {
    switch (data[i].name) {
      case 'description':
        description = data[i].value;
        break;
      case 'completed':
        completed = data[i].value;
        break;
      case 'dateDue':
        dateDue = data[i].value;
        break;
    }
  }

  // build JSON to write
  const item = {
    description,
    completed,
    dateDue,
    dateCreated: today()
  };

  // write to DB
  db.save(item, function (err, doc) {
    if (err) {
      res.status(400).send(err);
    }
    else {
      res.redirect(302, '/collection/tasks/');
    }
  });
});

/* handle updating an existing task item */
app.put('/collection/tasks/:i', function (req, res) {

  const idx = (req.params.i || '');
  const rev = req.header("if-match", "*");
  let description, completed, dateDue;

  // get data array
  let data = req.body.template.data;

  // pull out values we want
  for (let i = 0, x = data.length; i < x; i++) {
    switch (data[i].name) {
      case 'description':
        description = data[i].value;
        break;
      case 'completed':
        completed = data[i].value;
        break;
      case 'dateDue':
        dateDue = data[i].value;
        break;
    }
  }

  // build JSON to write
  const item = {
    description,
    completed,
    dateDue,
    dateCreated: today()
  };

  db.save(idx, rev, item, function (err, doc) {
    // return the same item
    res.redirect('/collection/tasks/' + idx, 302);
  });
});

/* handle deleting existing task */
app.delete('/collection/tasks/:i', function (req, res) {
  const idx = (req.params.i || '');
  const rev = req.header("if-match", "*");

  db.remove(idx, rev, function (err, doc) {
    if (err) {
      res.status = 400;
      res.send(err);
    }
    else {
      res.status = 204;
      res.send();
    }
  });
});

function today() {
  const dt = new Date();
  const y = String(dt.getFullYear());
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');

  return y + '-' + m + '-' + d;
}

// Only listen on $ node app.js
if (require.main === module) {
  app.listen(port, host, () => {
    console.log(`Express server listening on port http://${host}:${port}/`);
  });
}
