/* Designing Hypermedia APIs by Mike Amundsen (2011) */

/*
  simple 'quote-bot'
  - registers a new user account, if needed
  - posts quotes to the microblog site
  
  assumes the following links & forms:
  - a@rel='users-all'
  - a@rel='user'
  - a@rel='register'
  - a@rel='message-post'

  - form@class='add-user'
  - form@class="add-user".input@name="user"
  - form@class="add-user".input@name="password"
  - form@class="add-user".input@name="email"
  - form@class="add-user".input@name="name"
  - form@class="add-user".textarea@name="description"
  - form@class="add-user".input@name="avatar"
  - form@class="add-user".input@name="website"

  - form@class='message-post'
  - form@class="message-post".textarea@name="message"
  
*/
  
var p = null;

window.onload = function() {
  p = thisPage();
  p.init();
};

var thisPage = function() {

  var g = {};
  
  /* state values */
  g.startUrl = '/microblog/';
  g.wait=10;
  g.status = '';
  g.url = '';
  g.body = '';
  g.idx = 0;
    
  /* form@class="add-user" */
  g.user = {};
  g.user.user = 'robieBot5';
  g.user.password = 'robie';
  g.user.email = 'robie@example.org';
  g.user.name = 'Robie the Robot';
  g.user.description = 'a simple quote bot';
  g.user.avatar = 'http://amundsen.com/images/robot.jpg';
  g.user.website = 'http://robotstxt.org';

  /* form@class="message-post" */
  g.msg = {};
  g.msg.message = '';
      
  /* errors for this bot */
  g.errors = {};
  g.errors.noUsersAllLink = 'Unable to find a@rel="users-all" link';
  g.errors.noUserLink = 'Unable to find a@rel="user" link';
  g.errors.noRegisterLink = 'Unable to find a@rel="register" link'; 
  g.errors.noMessagePostLink = 'Unable to find a@rel="message-post" link';
  g.errors.noRegisterForm = 'Unable to find form@class="add-user" form';
  g.errors.noMessagePostForm = 'Unable to find form@class="message-post" form';
  g.errors.registerFormError = 'Unable to fill out the form@class="add-user" form';
  g.errors.messageFormError = 'Unable to fill out the form@class="message-post" form';
     
  /* some aesop's quotes to post */
  g.quotes = [];
  g.quotes[0] = 'Gratitude is the sign of noble souls';
  g.quotes[1] = 'Appearances are deceptive';
  g.quotes[2] = 'One good turn deserves another';
  g.quotes[3] = 'It is best to prepare for the days of necessity';
  g.quotes[4] = 'A willful beast must go his own way';
  g.quotes[5] = 'He that finds discontentment in one place is not likely to find happiness in another';
  g.quotes[6] = 'A man is known by the company he keeps';
  g.quotes[7] = 'In quarreling about the shadow we often lose the substance';
  g.quotes[8] = 'They are not wise who give to themselves the credit due to others';
  g.quotes[9] = 'Even a fool is wise-when it is too late!';
  
  function init() {
    g.status = getArg('status')||'start';
    g.url = getArg('url')||g.startUrl;
    g.body = getArg('body')||'';
    g.idx = getArg('idx')||0;

    updateUI();
    makeRequest();
  }
    
  function newQuote() {
    g.idx++;
    nextStep('start');
  }
  
  function updateUI() {
    var elm;
    
    elm = document.getElementById('status');
    if(elm) {
      elm.innerHTML = g.status + '<br />' + g.url + '<br />' + unescape(g.body);
    }    
  }
    
  /* these are the things this bot can do */
  function processResponse(ajax) {
    var doc = ajax.responseXML;

    if(ajax.status===200) {
      switch(g.status) {
        case 'start':
          findUsersAllLink(doc);
          break;
        case 'get-users-all':
          findMyUserName(doc);
          break;
        case 'get-register-link':
          findRegisterLink(doc);
          break;
        case 'get-register-form':
          findRegisterForm(doc);
          break;
        case 'post-user':
          postUser(doc);
          break;
        case 'get-message-post-link':
          findMessagePostForm(doc);
          break;
        case 'post-message':
          postMessage(doc);
          break;
        case 'completed':
          handleCompleted(doc);
          break;
        default:
          alert('unknown status: ['+g.status+']');
          return;
      }
    }
    else {
      alert(ajax.status);
    }
  }

  function findUsersAllLink(doc) {
    var elm, url;

    elm = getElementsByRelType('users-all','a',doc)[0];
    if(elm) {
      url = elm.getAttribute('href');
      nextStep('get-users-all',url);
    }
    else {
      alert(g.errors.noUsersAllLink);
    }
  }
  
  function findMyUserName(doc) {
    var coll, url, found, i, x;

    found=false;
    url=g.startUrl;
    
    coll = getElementsByRelType('user', 'a', doc);
    if(coll.length===0) {
      alert(g.errors.noUserLink);
    }
    else {
      for(i=0,x=coll.length;i<x;i++) {
        if(coll[i].firstChild.nodeValue===g.user.user) {
          found=true;
          break;
        }
      }

      if(found===true) {
        g.status = 'get-message-post-link';
      }
      else {
        g.status = 'get-register-link';
      }
      nextStep(g.status,url);
    }    
  }

  function findRegisterLink(doc) {
    var elm, url;

    elm = getElementsByRelType('register','a',doc)[0];
    if(elm) {
      url = elm.getAttribute('href');
      nextStep('get-register-form',url);
    }
    else {
      alert(g.errors.noRegisterLink);
    }
  }

  function findRegisterForm(doc) {
    var coll, url, found, i, x, args, c, body, elm, name;
    
    c=0;
    args = [];
    found=false;
    
    elm = getElementsByClassName('user-add','form',doc)[0];
    if(elm) {
      found=true;
    }
    else {
      alert(g.errors.noRegisterForm);
      return;
    }
    
    if(found===true) {
      url = elm.getAttribute('action');
      
      coll = elm.getElementsByTagName('input');
      for(i=0,x=coll.length;i<x;i++) {
        name = coll[i].getAttribute('name');
        if(g.user[name]!==undefined) {
          args[c++] = {'name':name,'value':g.user[name]};      
        }
      }
      coll = elm.getElementsByTagName('textarea');
      for(i=0,x=coll.length;i<x;i++) {
        name = coll[i].getAttribute('name');
        if(g.user[name]!==undefined) {
          args[c++] = {'name':name,'value':g.user[name]};      
        }
      }
    }
    
    if(args.length!==0) {
      body = '';
      for(i=0,x=args.length;i<x;i++) {
        if(i!==0) {
          body +='&';
        }
        body += args[i].name+'='+encodeURIComponent(args[i].value);
      }
      alert(body);
      nextStep('post-user',url,body);
    }
    else {
      alert(g.errors.registerFormError);
    }
  }

  function postUser(doc) {
    nextStep('get-message-post-link');
  }

  function findMessagePostForm(doc) {
    var coll, url, found, i, x, args, c, body, elm, name;
    
    c=0;
    args = [];
    found=false;
    
    elm = getElementsByClassName('message-post','form',doc)[0];
    if(elm) {
      found=true;
    }
    else {
      alert(g.errors.noMessagePostForm);
      return;
    }
    
    if(found===true) {
      url = elm.getAttribute('action');
      coll = elm.getElementsByTagName('textarea');
      for(i=0,x=coll.length;i<x;i++) {
        name = coll[i].getAttribute('name');
        if(g.msg[name]!==undefined) {
          if(name==='message') {
            args[c++] = {'name':name,'value':g.quotes[g.idx]};      
          }
          else {
            args[c++] = {'name':name,'value':g.msg[name]};      
          }
        }
      }
    }
    
    if(args.length!==0) {
      body = '';
      for(i=0,x=args.length;i<x;i++) {
        if(i!==0) {
          body +='&';
        }
        body += args[i].name+'='+escape(args[i].value);
      }
      nextStep('post-message',url,body);
    }
    else {
      alert(g.errors.messageFormError);
    }
  }
  
  function postMessage(doc) {
    nextStep('completed');
  }
  
  function handleCompleted(doc) {
    if(g.idx<9) {
      if(confirm('Succces! Should I wait ' + g.wait + ' seconds to post again?')===true) {
        setTimeout(newQuote,g.wait*1000);    
      }
    }
    else {
      alert('I posted all my quotes!');
    }
  }
  
  /* utilities */
  function getArg(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }

  function nextStep(status,url,body) {
    var href,adr;
    
    href = window.location.href;
    href = href.substring(0,href.indexOf('?'));
    adr = href + '?status=' + status;
    adr += '&idx=' + g.idx;
    if(url) {adr += '&url=' + encodeURIComponent(url);}
    if(body) {adr += '&body=' + encodeURIComponent(body);}
    
    window.location.href = adr;
  }

  function makeRequest() {
    var ajax, data, method;
    
    ajax=new XMLHttpRequest();
    if(ajax) {
      ajax.onreadystatechange = function() {
        if(ajax.readyState==4 || ajax.readyState=='complete') {
          processResponse(ajax);
        }
      };
      
      if(g.body!=='') {
        data = g.body;
        method = 'post';
      }
      else {
        method = 'get';
      }
      
      ajax.open(method,g.url,true);
      
      if(data) {
        ajax.setRequestHeader('content-type','application/x-www-form-urlencoded');
        ajax.setRequestHeader('authorization','Basic '+Base64.encode(g.user.user+':'+g.user.password));
      }
      
      g.url='';
      g.body='';
      
      ajax.setRequestHeader('accept','application/xhtml+xml');
      ajax.send(data);
    }
  }
  
  function getElementsByRelType(relType, tag, elm)
  {
    var testClass = new RegExp("(^|\\s)" + relType + "(\\s|$)");
    var tag = tag || "*";
    var elements = (tag == "*" && elm.all)? elm.all : elm.getElementsByTagName(tag);
    var returnElements = [];
    var current;
    var length = elements.length;
    for(var i=0; i<length; i++){
      current = elements[i];
      if(testClass.test(current.getAttribute('rel'))){
        returnElements.push(current);
      }
    }
    return returnElements;
  }

  function getElementsByClassName(className, tag, elm)
  {
    var testClass = new RegExp("(^|\\s)" + className + "(\\s|$)");
    var tag = tag || "*";
    var elements = (tag == "*" && elm.all)? elm.all : elm.getElementsByTagName(tag);
    var returnElements = [];
    var current;
    var length = elements.length;
    for(var i=0; i<length; i++){
      current = elements[i];
      if(testClass.test(current.getAttribute('class'))){
        returnElements.push(current);
      }
    }
    return returnElements;
  }

  var that = {};
  that.init = init;
  return that;
};
