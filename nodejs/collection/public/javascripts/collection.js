/* 2001-05-25 (mca) : collection.js */
/* Designing Hypermedia APIs by Mike Amundsen (2011) */

var cjs = function() {
  
  var g = {};
  g.data = {};
  g.item = {};
  g.collectionUrl = ''; 
  g.contentType = 'application/collection+json';
  g.filterUrl = '';

  g.inputForm=true;
  g.editForm=true;
    
  function init() {
    g.filterUrl = getArg('filter');
    if(g.filterUrl!=='') {
      loadList(unescape(g.filterUrl));
    }
    else {
      loadList();    
    }
    showLinks();
    showItems();
    showQueries();
    buildTemplate();
  }

  function loadList(href) {
    var ajax;
    var url = (href || g.collectionUrl);
    
    ajax=new XMLHttpRequest();
    if(ajax) {
      ajax.open('get',url,false);
      ajax.send(null);
      if(ajax.status===200) {
        g.data = JSON.parse(ajax.responseText);
      }
    }
  }

  function loadItem(href) {
    var ajax;
    
    ajax=new XMLHttpRequest();
    if(ajax) {
      ajax.open('get',href,false);
      ajax.send(null);
      if(ajax.status===200) {
        g.etag = ajax.getResponseHeader('etag');
        g.item = JSON.parse(ajax.responseText);
      }
    }
  }

  function filterData(href, rel) {
    var url, coll, i, x, a, args, data;
    
    coll = document.getElementsByTagName('a');
    for(i=0,x=coll.length;i<x;i++) {
      if(coll[i].rel===rel) {
        a = coll[i];
        break;
      }
    }

    url = window.location.href;
    if(url.indexOf('?')!=-1) {
      url = url.substring(0,url.indexOf('?'));
    }
    
    args = (a.getAttribute('args') || '');
    if(args==='') {
      window.location = url + "?filter="+encodeURIComponent(href.replace('http://localhost:3000',''));
    }
    else {
      data = JSON.parse(unescape(args));
      for(i=0,x=data.length;i<x;i++) {
        data[i].value = prompt(data[i].name);
      }

      url = url + "?filter="+encodeURIComponent(href.replace('http://localhost:3000','')+'?');

      for(i=0,x=data.length;i<x;i++) {
        if(i>0) {
          url += encodeURIComponent('&');
        }
        url += encodeURIComponent(data[i].name+'='+data[i].value);
      }
      window.location = url;
    }
  }

  function showLinks() {
    var dst;
    
    dst = document.getElementById('links');
    if(dst) {
      dst.appendChild(processLinks(g.data.collection.links));
    }
  }
    
  function showItems() {
    var dst, coll, dl, dt, dd, i, x;
    
    dst = document.getElementById('collection');
    if(dst) {
      dl = document.createElement('dl');
      
      coll = g.data.collection.items;
      if(coll) {
        // handle items
        for(i = 0, x = coll.length; i < x; i++) {
          dt = document.createElement('dt');
          dt.appendChild(processItemLink(coll[i], true, i));
          
          dd = document.createElement('dd');
          dd.title = coll[i].href;
          dd.appendChild(processData(coll[i].data));
          dd.appendChild(processLinks(coll[i].links));

          dl.appendChild(dt);
          dl.appendChild(dd);
        }
      }
      dst.appendChild(dl);
    }
  }

  function showQueries() {
    var dst;
    
    dst = document.getElementById('queries');
    if(dst) {
      dst.appendChild(processLinks(g.data.collection.queries));
    }
  }

  function processLinks(coll) {
    var ul, li, i, x, a, args;
        
    ul = document.createElement('ul');

    if(coll) {
      for(i = 0, x = coll.length; i < x; i++) {
        a = document.createElement('a');
        a.href = coll[i].href;
        a.rel = coll[i].rel;
        a.className = coll[i].name || '';
        a.title = coll[i].name || '';

        if(coll[i].data) {
          args = JSON.stringify(coll[i].data);
          a.setAttribute('args',escape(args));
        }
        
        if(coll[i].rel!=='profile' && coll[i].rel!=='author') {
          a.onclick = function(){filterData(this.href, this.rel); return false;};
        }

        a.appendChild(document.createTextNode(coll[i].prompt || coll[i].rel));

        li = document.createElement('li');
        li.appendChild(a);         
        ul.appendChild(li);
      }  
    }
    return ul;
  }
    
  function processItemLink(item, editable, x) {
    var a, edit;
    edit = editable || true;
    
    a = document.createElement('a');
    if(item) {
      a.className = 'item-link';
      a.href = item.href;
      a.title = 'item-link';
      a.appendChild(document.createTextNode('Item '+x));
      if(edit === true) {
        a.onclick = function(){showItem(item.href); return false;};
      }
    }
    return a;  
  }
  
  function processData(coll) {
    var i, x, ul, li, sp;

    ul = document.createElement('ul');
    
    if(coll) {
      for(i = 0, x = coll.length; i < x; i++) {
        if(coll[i].name && coll[i].value) {
          li = document.createElement('li');            
          sp = document.createElement('span');
          sp.className = coll[i].name;
          sp.title = coll[i].name;
          sp.innerHTML = coll[i].value;
          li.appendChild(sp);
          ul.appendChild(li);
        }
      }
    }
    return ul;    
  }
      
  function buildTemplate() {
    var dst, coll, i, x, form, fset;
    
    dst = document.getElementById('write-template');
    if(dst) {
      form = templateForm();
      fset = document.createElement('fieldset');
      
      coll = g.data.collection.template.data;
      for(i = 0, x = coll.length; i < x; i++) {
        fset.appendChild(processInputElement(coll[i]));
      }
      
      fset.appendChild(templateButtons());
      form.appendChild(fset);
       
      dst.appendChild(templateLink());
      dst.appendChild(form);
    }    
  }

  function templateForm(href) {
    var form,action;
    action = href || g.collectionUrl;
    
    form = document.createElement('form');
    form.method="post";
    form.action=action; 
    form.style.display='none';
    form.id = 'input-form';
    form.onsubmit = function(){submitInputForm();return false;};
    
    return form;
  }
  
  function processInputElement(item) {
    var lbl, inp, p;
    
    if(item) {
      lbl = document.createElement('label');
      lbl.for = item.name;
      lbl.innerHTML = item.prompt || item.name;
      
      inp = document.createElement('input');
      inp.type="text";
      inp.name = item.name;
      if(inp.value!=='') {
        inp.value = item.value;
      }
      else {
        inp.placeholder = item.name;
      }
      
      p = document.createElement('p');
      p.appendChild(lbl);
      p.appendChild(inp);
    }
    return p;
  }

  function templateButtons() {
    var inp, p;
    
    inp = document.createElement('input');
    inp.type = 'submit';
    inp.value = 'Save';
    inp.name = 'save';
    p = document.createElement('p');
    p.className = 'buttons';
    p.appendChild(inp);

    inp = document.createElement('input');
    inp.type = 'button';
    inp.value = 'Delete';
    inp.name = 'delete';
    inp.onclick = function(){deleteItem(false);};
    inp.style.display='none';
    p.appendChild(inp);

    inp = document.createElement('input');
    inp.type = 'button';
    inp.value = 'Cancel';
    inp.name = 'cancel';
    inp.onclick = function(){toggleInputForm(false);};
    p.appendChild(inp);

    return p;  
  }

  function templateLink() {
    var a, p;
    
    a = document.createElement('a');
    a.href='#';
    a.onclick = function(){toggleInputForm(); return false;};
    a.appendChild(document.createTextNode('Add Task'));
    p = document.createElement('p');
    p.className='input-block';
    p.appendChild(a);

    return p;  
  }
        
  function showItem(href) {
    loadItem(href);
    showEditForm(href,g.item);
  }
  
  function showEditForm(href) {
    var coll, i, x, str, form, name, inp;
    str = '';
    
    form = document.getElementById('input-form');
    if(form) {
      form.action = href;
      form.setAttribute('etag',g.etag);
    }
    
    coll = g.item.collection.items[0].data;
    
    for( i = 0, x = coll.length; i < x; i++) {
      name = coll[i].name;
      inp = document.getElementsByName(name)[0];
      if(inp) {
        inp.value = coll[i].value;
      }
    }

    for( i = 0, x = coll.length; i < x; i++) {
      name = coll[i].name;
      inp = document.getElementsByName(name)[0];
      if(inp) {
        inp.value = coll[i].value;
      }
    }
    
    inp = document.getElementsByName('delete')[0];
    if(inp) {
      inp.style.display = 'inline';
    }
    toggleInputForm(true);
  }

  function toggleInputForm() {
    var elm, coll, i, x, inp;
    
    elm = document.getElementById('input-form');
    if(elm) {
      if(g.inputForm===true) {
        elm.style.display='block';
        g.inputForm=false;
      }
      else {
        elm.style.display='none';
        g.inputForm=true;
        coll = document.getElementsByTagName('input');
        for(i = 0, x = coll.length; i < x; i++) {
          if(coll[i].type === 'text') {
            coll[i].value = '';
          }
        }
        inp = document.getElementsByName('delete')[0];
        if(inp) {
          inp.style.display = 'none';
        }
      }
    }
  }
  
  function submitInputForm() {
    var item, form, coll, i, x, z, etag, href, ajax;
    
    form = document.getElementById('input-form');
    if(form) {
      coll = form.getElementsByTagName('input');
      item = '{"template" : {"data" : [';
      z=0;
      for(i=0,x=coll.length;i<x;i++) {
        if(coll[i].type=="text") {
          if(z>0) {
            item +=",";
          }
          item += '{"name" : "'+coll[i].name+'", ';
          item += '"value" : '+(coll[i].value==='true'||coll[i].value==='false'?coll[i].value+'}':'"'+coll[i].value+'"}');
          z++;
        }
      }
      item += "]}}";

      href = form.action;
      etag = form.getAttribute('etag');

      if(href)
      {
        ajax=new XMLHttpRequest();
        if(ajax) {
          if(etag && etag!=='') {
            ajax.open('put',href,false);
            ajax.setRequestHeader('if-match',etag);
          }
          else {
            ajax.open('post',href,false);          
          }
          ajax.setRequestHeader('content-type',g.contentType);
          ajax.send(item);
          if(ajax.status>399) {
            alert('Error sending task!\n'+ajax.status);
          }
          else {
            window.location = window.location;
          }
        }
      }
    }
  }

  function deleteItem() {
    var form,href,etag,ajax;

    form = document.getElementById('input-form');
    if(form) {
      href = form.action;
      etag = form.getAttribute('etag');
      if(href) {
        ajax=new XMLHttpRequest();
        if(ajax) {
          ajax.open('delete',href,false);
          ajax.setRequestHeader('if-match',etag);
          ajax.send(null);
          if(ajax.status>399) {
            alert('Error deleting task!/n'+ajax.status+'\n'+ajax.statusText);
          }
          else {
            window.location = window.location;
          }
        }
      }
    }
    return false;
  }
  
  function getArg(arg)
  {
    var id,match,rex;
    arg = arg || '';
    id = '';
    
    rex = new RegExp("(?:\\?|&){@arg}=([^&]*)".replace('{@arg}',arg));
    match = rex.exec(location.search.replace("+"," "));
    
    if (match !== null)
    {
      id=match[1];
    }
    return id;
  }

  var that = {};
  that.init = init;
  that.g = g;
  return that;
};

/* start the app */
window.onload = function() {
  var c = null;

  c = cjs();
  c.g.collectionUrl = '/collection/tasks/';
  c.init();
};