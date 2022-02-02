/* 2001-07-25 (mca) : collection+json */
/* Designing Hypermedia APIs by Mike Amundsen (2011) */

/**
 * Module dependencies.
 */

const express = require('express');
const errorhandler = require('errorhandler');
const bodyparser = require('body-parser');
const expressLayouts = require('express-ejs-layouts')
const cradle = require('cradle');

// for express
const app = module.exports = express();
const port = process.env.PORT ?? 3000;
const host = process.env.HOST ?? 'localhost';

// for couch
const dbHost = process.env.DB_HOST ?? 'localhost';
const dbPort = process.env.DB_PORT ?? 5984;
const credentials = { username: process.env.DB_USER ?? 'admin', password: process.env.DB_PASSWORD ?? 'password' };
const local = true;
let db;
if (local===true) {
  db = new cradle.Connection().database('html5-microblog');
}
else {
  db = new cradle.Connection(dbHost, dbPort, { auth: credentials }).database('html5-microblog');
}

// global data
const contentType = 'text/html';
const baseUrl = `http://${host}:${port}/microblog/`;

app.use(expressLayouts);
app.set('layout', __dirname + '/views/layout');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

const errorOptions = process.NODE_ENV === 'production' ? { dumpExceptions: true, showStack: true } : undefined;

app.use(errorhandler(errorOptions));

/* validate user (from  db) via HTTP Basic Auth */
function validateUser(req, res, next) {
  // handle auth stuff
  const auth = req.headers["authorization"];
  if (!auth){
    return authRequired(res, 'Microblog');
  }

  const parts = auth.split(' ');
  const scheme = parts[0];
  const credentials = new Buffer(parts[1], 'base64').toString().split(':');

  if ('Basic' != scheme) {
    return badRequest(res);
  }
  req.credentials = credentials;

  // ok, let's look this user up
  const view = '_design/microblog/_view/users_by_id';

  const options = {
    descending: 'true',
    key: `"${req.credentials[0]}"`
  };

  db.get(view, options, function(err, doc) {
    try {
      if(doc[0].value.password===req.credentials[1]) {
        next(req,res);
      }
      else {
        throw new Error('Invalid User');
      }
    }
    catch (ex) {
      return authRequired(res, 'Microblog');
    }
  });
}

// Routes

/* starting page */
app.get('/microblog/', function(req, res){
  const view = '_design/microblog/_view/posts_all';
  const options = {
    descending: 'true'
  };
  const ctype = acceptsXml(req);

  db.get(view, options, function(err, doc) {
    res.header('content-type',ctype);
    res.render('index', {
      title: 'Home',
      site: baseUrl,
      items: doc
    });
  });
});

/* single message page */
app.get('/microblog/messages/:i', function(req, res){
  const id = req.params.i;
  const view = '_design/microblog/_view/posts_by_id';
  const options = {
    descending: 'true',
    key: `"${id}"`
  };
  const ctype = acceptsXml(req);

  db.get(view, options, function(err, doc) {
    res.header('content-type',ctype);
    res.render('message', {
      title: id,
      site: baseUrl,
      items: doc
    });
  });
});

// add a message
app.post('/microblog/messages/', function(req, res) {
  validateUser(req, res, function(req,res) {
    let item;

    // get data array
    const text = req.body.message;
    if(text!=='') {
      item = {
        type: 'post',
        text,
        user: req.credentials[0],
        dateCreated: now()
      };

      // write to DB
      db.save(item, function(err, doc) {
        if(err) {
          res.status=400;
          res.send(err);
        }
        else {
          res.redirect('/microblog/', 302);
        }
      });
    }
    else {
      return badRequest(res);
    }
  });
});

/* single user profile page */
app.get('/microblog/users/:i', function(req, res){
  const id = req.params.i;
  const ctype = acceptsXml(req);
  const view = '_design/microblog/_view/users_by_id';
  const options = {
    descending: 'true',
    key: `"${id}"`
  };

  db.get(view, options, function(err, doc) {
    res.header('content-type',ctype);
    res.render('user', {
      title: id,
      site: baseUrl,
      items: doc
    });
  });
});

/* user messages page */
app.get('/microblog/user-messages/:i', function(req, res){
  const id = req.params.i;
  const ctype = acceptsXml(req);
  const view = '_design/microblog/_view/posts_by_user';
  const options = {
    descending: 'true',
    key:  `"${id}"`
  };

  db.get(view, options, function(err, doc) {
    res.header('content-type',ctype);
    res.render('user-messages', {
      title: id,
      site: baseUrl,
      items: doc
    });
  });
});

/* get user list page */
app.get('/microblog/users/', function(req, res){
  const view = '_design/microblog/_view/users_by_id';
  const ctype = acceptsXml(req);

  db.get(view, function(err, doc) {
    res.header('content-type',ctype);
    res.render('users', {
      title: 'User List',
      site: baseUrl,
      items: doc
    });
  });
});

/* post to user list page */
app.post('/microblog/users/', function(req, res) {
  const id = req.body.user;

  if (id==='') {
    res.status=400;
    res.send('missing user');
  } else {
    const { password, name, email, description, avatar, website } = req.body;
    const item = {
      type: 'user',
      password,
      name,
      email,
      description,
      imageUrl: avatar,
      websiteUrl: website,
      dateCreated: today()
    };

    // write to DB
    db.save(req.body.user, item, function(err, doc) {
      if (err) {
        res.status = 400;
        res.send(err);
      }
      else {
        res.redirect(302, '/microblog/users/');
      }
    });
  }
});

/* get user register page */
app.get('/microblog/register/', function(req, res){
  const ctype = acceptsXml(req);

  res.header('content-type',ctype);
  res.render('register', {
    title: 'Register',
    site: baseUrl
  });
});

/* support various content-types from clients */
function acceptsXml(req) {
  let ctype;
  const acc = req.headers["accept"];

  switch(acc) {
    case "text/xml":
      ctype = "text/xml";
      break;
    case "application/xml":
      ctype = "application/xml";
      break;
    case "application/xhtml+xml":
      ctype = "application/xhtml+xml";
      break;
    default:
      ctype = contentType;
      break;
  }
  return ctype;
}

/* compute the current date/time as a simple date */
function today() {
  const dt = new Date();
  const y = String(dt.getFullYear());
  const m = String(dt.getMonth()+1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');

  return y+'-'+m+'-'+d;
}

/* compute the current date/time */
function now() {
  const dt = new Date();
  const y = String(dt.getFullYear());
  const m = String(dt.getMonth()+1).padStart(2,'0');
  const d = String(dt.getDate()).padStart(2,'0');
  const h = String(dt.getHours()+1).padStart(2,'0');
  const i = String(dt.getMinutes()+1).padStart(2,'0');
  const s = String(dt.getSeconds()+1).padStart(2, '0');

  return y+'-'+m+'-'+d+' '+h+':'+i+':'+s;
}

/* return standard 403 response */
function forbidden(res) {
  const body = 'Forbidden';

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.statusCode = 403;
  res.end(body);
}

/* return standard 'auth required' response */
function authRequired(res,realm) {
  const r = (realm||'Authentication Required');
  res.statusCode = 401;
  res.setHeader('WWW-Authenticate', 'Basic realm="' + r + '"');
  res.end('Unauthorized');
}

/* return standard 'bad inputs' response */
function badRequest(res) {
  res.statusCode = 400;
  res.end('Bad Request');
}

// Only listen on $ node app.js
if (require.main === module) {
  app.listen(port, host,() => {
    console.log(`Express server listening on port http://${host}:${port}/`);
  });
}
