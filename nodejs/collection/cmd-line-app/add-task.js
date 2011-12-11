/* 2001-05-25 (mca) : add-task.js */
/* Designing Hypermedia APIs by Mike Amundsen (2011) */

var http = require('http');

// set teh vars
var client, host, port, path, args, help;
host = 'localhost';
port = 3000;
path = '/collection/tasks/';
hdrs = {};
args = {};

help = '*** Usage:\n' +
   'node add-task.js "<description>" "<dueDate>" [<completed>]\n' +
   '  Where:\n' +
   '    <description> is text of task (in quotes)\n' +
   '    <dueDate> is YYYY-MM-DD (in quotes)\n' +
   '    <completed> is true|false';
   
// check args and fire off processing
if(process.argv.length<4 || process.argv.length>5) {
  console.log(help);
}
else {
  args.description = process.argv[2];
  args.dateDue = process.argv[3];
  args.completed = (process.argv[4]||false);

  client = http.createClient(port,host);
  getTemplate();
}

// get the server's write template
function getTemplate() {
  // request the template
  var req = client.request('GET', path, {'host':host+':'+port});

  // event handlers
  req.on('response', function(response) {
    var body = '';
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('error', function(error) {
      console.log(error);
    });
    response.on('end', function() {
      var data = JSON.parse(body);
      buildTask(data.collection.template);
    });
  });

  req.on('error', function(error) {
    console.log(error);
  });

  req.end();
}

// write the task data to the server
function buildTask(template) {
  var coll, i, x, msg;
  
  // populate the template
  coll = template.data;
  for(i=0,x=coll.length;i<x;i++) {
    switch(coll[i].name) {
      case 'description':
        coll[i].value = args.description;
        break;
      case 'dateDue':
        coll[i].value = args.dateDue;
        break;
      case 'completed':
        coll[i].value = args.completed;
        break;
    }  
  }
  msg = '{"template" : '+JSON.stringify(template)+"}";
  sendData(msg);
}

// send the data to the server for storage
function sendData(msg) {
  // set up request
  var hdrs = {
    'host' : host+':'+port,
    'content-type' : 'application/collection+json',
    'content-length' : (msg.length)
  };
  
  // pass data to the server
  var req = client.request('POST', path, hdrs);
  req.write(msg);

  // event handlers
  req.on('response', function(response) {
    var body = '';
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('error', function(error) {
      console.log(error);
    });
    response.on('end', function() {
      console.log('*** task added!');
    });
  });

  req.on('error', function(error) {
    console.log(error);
  });

  req.end();  
}

// eof