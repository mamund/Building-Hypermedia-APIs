/* 2011-05-14 (mca) : maze-game.js */
/* Designing Hypermedia APIs by Mike Amundsen (2011) */

var thisPage = function() {

  var g = {};
  g.moves = 0;
  g.links = [];
  g.mediaType = "application/vnd.amundsen.maze+xml";
  g.startLink = "http://localhost:3000/maze/five-by-five/";
  g.sorryMsg = 'Sorry, I don\'t understand what you want to do.';
  g.successMsg = 'Congratulations! you\'ve made it out of the maze!';
      
  function init() {
    attachEvents();
    getDocument(g.startLink);
    setFocus();
  }

  function attachEvents() {
    var elm;
    
    elm = document.getElementsByName('interface')[0];
    if(elm) {
      elm.onsubmit = function(){return move();};
    }
  }

  function getDocument(url) {
    ajax.httpGet(url,null,processLinks,true,'processLinks',{'accept':g.mediaType});
  }

  function setFocus() {
    var elm;
    
    elm = document.getElementsByName('move')[0];
    if(elm) {
      elm.value = '';
      elm.focus();
    }  
  }
  
  function move() {
    var elm, mv, href;
    
    elm = document.getElementsByName('move')[0];
    if(elm) {
      mv = elm.value;
      if(mv === 'clear') {
        reload();
      }
      else {
        href = getLinkElement(mv);
        if(href) {
          updateHistory(mv);
          getDocument(href);
        }
        else {
          alert(g.sorryMsg);
        }
      }
      setFocus();
    }
    return false;
  }

  function reload() {
    history.go(0);
  }  
    
  function getLinkElement(key) {
    var i, x, rtn;
    
    for(i = 0, x = g.links.length; i < x; i++) {
      if(g.links[i].rel === key) {
        rtn = g.links[i].href;
        break;
      } 
    }
    return rtn || '';
  }

  function updateHistory(mv) {
    var elm, txt;
    
    elm = document.getElementById('history');
    if(elm) {
      txt = elm.innerHTML;
      g.moves++;
      if(mv==='exit') {
        txt = g.moves +': ' + g.successMsg + '<br />' + txt; 
      }
      else {
        txt = g.moves + ':' + mv + '<br />' + txt;      
      }
      elm.innerHTML = txt;
    }
  }
  
  function processLinks(response) {
    var xml, link, i, x, y, j, rels, href;
    
    g.links = [];
    xml = response.selectNodes('//link');
    for(i = 0, x = xml.length; i < x; i++) {
      href = xml[i].getAttribute('href');
      rels = xml[i].getAttribute('rel').split(' ');
      for(j = 0, y = rels.length; j < y; j++) {
        link = {'rel' : rels[j], 'href' : href};
        g.links[g.links.length] = link;
      }
    }    
    showOptions();
  }

  function showOptions() {
    var elm, i, x, txt;
    
    txt = '';    
    elm = document.getElementsByClassName('options')[0];
    if(elm) {
      for(i = 0, x = g.links.length; i < x; i++) {
        if(i>0){
          txt += ', ';
        }
        if(g.links[i].rel === 'collection') {
          txt += 'clear';
        }
        else {
          txt += g.links[i].rel;        
        }
      }
      elm.innerHTML = txt;
    }    
  }
  
  // publish methods  
  var that = {};
  that.init = init;
  
  return that;
};

window.onload = function() {
  var pg = thisPage();
  pg.init();
};
