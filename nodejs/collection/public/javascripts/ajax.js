// ajax services
// from ajax-patterns book/site
// 2007-04-05 (mca) : changed root to 'ajax'
// 2007-04-06 (mca) : added try-catch for http.open
//                  : added status and statusText for return
//                  : changed public methods to http[method]
//                  : added support for sending request header array

var ajax = {

  shouldDebug: false,
  shouldEscapeVars: false,
  shouldMakeHeaderMap: true,

  calls : new Array(),
  pendingResponseCount : 0,

  randomizeGets : false,
  
   /**************************************************************************
      PUBLIC METHODS
   *************************************************************************/

  // http get methods
  httpGet: function(url, urlVars, callbackFunction, expectingXML, callingContext, reqHdrs) {
    this._callServer(url, urlVars, callbackFunction, expectingXML,
                    callingContext, "GET", null, null, null, reqHdrs);
  },

  httpGetXML: function(url, callbackFunction, reqHdrs) {
    this.httpGet(url, null, callbackFunction, true, null, reqHdrs);
  },

  httpGetPlainText: function(url, callbackFunction, reqHdrs) {
    this.httpGet(url, null, callbackFunction, false, null, reqHdrs);
  },

  // http post methods
  httpPost:
    function(url, optionalURLVars, callbackFunction, expectingXML,
             callingContext, bodyType, body, reqHdrs) {
      this._callServer(url, optionalURLVars, callbackFunction, expectingXML,
                      callingContext, "POST", null, bodyType, body, reqHdrs);
  },

  httpPostForPlainText: function(url, vars, callbackFunction, reqHdrs) {
    this.httpPostVars(url, vars, null, callbackFunction, false,
                    null, "POST", null, null, reqHdrs);
  },

  httpPostForXML: function(url, vars, callbackFunction, reqHdrs) {
    this.httpPostVars(url, vars, null, callbackFunction, true,
                    null, "POST", null, null, reqHdrs);
  },

  httpPostVars:
    function(url, bodyVars, optionalURLVars, callbackFunction, expectingXML,
             callingContext, reqHdrs) {
      this._callServer(url, optionalURLVars, callbackFunction, expectingXML,
                      callingContext, "POST", bodyVars, null, null, reqHdrs);
  },

  // other http methods
  httpHead: function(url, urlVars, callbackFunction, expectingXML, callingContext, reqHdrs)
  {
    this._callServer(url, urlVars, callbackFunction, expectingXML,
                    callingContext, "HEAD", null, null, null, reqHdrs);
  },

  httpPut:
    function(url, optionalURLVars, callbackFunction, expectingXML,
             callingContext, bodyType, body, reqHdrs) {
      this._callServer(url, optionalURLVars, callbackFunction, expectingXML,
                      callingContext, "PUT", null, bodyType, body, reqHdrs);
  },

  httpDelete: function(url, urlVars, callbackFunction, expectingXML, callingContext, reqHdrs) {
    this._callServer(url, urlVars, callbackFunction, expectingXML,
                    callingContext, "DELETE", null, null, null, reqHdrs);
  },

  httpOptions:
    function(url, optionalURLVars, callbackFunction, expectingXML,
             callingContext, bodyType, body, reqHdrs) {
      this._callServer(url, optionalURLVars, callbackFunction, expectingXML,
                      callingContext, "OPTIONS", null, bodyType, body, reqHdrs);
  },

  httpTrace:
    function(url, optionalURLVars, callbackFunction, expectingXML,
             callingContext, bodyType, body, reqHdrs) {
      this._debug("trace");
      this._callServer(url, optionalURLVars, callbackFunction, expectingXML,
                      callingContext, "TRACE", null, bodyType, body, reqHdrs);
  },

  /**************************************************************************
     PRIVATE METHODS
  *************************************************************************/

  _callServer: function(url, urlVars, callbackFunction, expectingXML,
                       callingContext, requestMethod, bodyVars,
                       explicitBodyType, explicitBody, reqHdrs) {
    
    if (urlVars==null) {
      urlVars = new Array();
    }

    this._debug("_callServer() called. About to request URL\n"
                + "call key: [" + this.calls.length + "]\n"
                + "url: [" + url + "]\n"
                + "callback function: [" + callbackFunction + "]\n"
                + "treat response as xml?: [" + expectingXML + "]\n"
                + "Request method?: [" + requestMethod + "]\n"
                + "calling context: [" + callingContext + "]\n"
                + "explicit body type: [" + explicitBodyType + "]\n"
                + "explicit body: [" + explicitBody + "]\n"
                + "urlVars: [" + this._describe(urlVars) + "]\n"
                + "bodyVars: [" + this._describe(bodyVars) + "]\n"
                + "reqHdrs: [" + this._describe(reqHdrs) + "]"
              );


    var xReq = this._createXMLHttpRequest();
    xReq.onreadystatechange = function() {
      ajax._onResponseStateChange(call);
    }

    var call = {xReq: xReq,
                callbackFunction: callbackFunction,
                expectingXML: expectingXML,
                callingContext: callingContext,
                url: url};

    if (urlVars!=null) {
      var urlVarsString = this._createHTTPVarSpec(urlVars);
      if (urlVarsString.length > 0) { // TODO check if appending with & instead
        url += "?" + urlVarsString;
      }
    }

    // 2007-04-06 (mca) : added trap for fatal open errors
    try
    {
        if(ajax.randomizeGets)
        {
            if(url.indexOf('?')==-1)
                url +='?'+Math.random();
            else
                url +='&'+Math.random();
        }
        xReq.open(requestMethod, url, true);
    }
    catch(ex)
    {
        alert(
            'ERROR:\nXMLHttpRequest.open failed for\n'+
            url+' ['+requestMethod+']'+'\n'+
            ex.message
            );
        return;
    }

    if(reqHdrs!=null)
        this._appendHeaders(xReq,reqHdrs);
    
    if (   requestMethod=="GET"
        || requestMethod=="HEAD"
        || requestMethod=="DELETE") {
      this._debug("Body-less request to URL " + url);
      xReq.send(null);
      return;
    }

    if (   requestMethod=="POST"
        || requestMethod=="PUT"
        || requestMethod=="OPTIONS"
        || requestMethod=="TRACE") {
      bodyType = null;
      body = null;
      if (explicitBodyType==null) { // It's a form
        bodyType = 'application/x-www-form-urlencoded; charset=UTF-8';
        body = this._createHTTPVarSpec(bodyVars);
      } else {
        bodyType = explicitBodyType;
        body = explicitBody;
      }
      this._debug("Content-Type: [" + bodyType + "]\nBody: [" + body + "].");
      xReq.setRequestHeader('Content-Type',  bodyType);
      xReq.send(body);
      return;
    }

    this._debug("ERROR: Unknown Request Method: " + requestMethod);


  },

  // The callback of xmlHttpRequest is a dynamically-generated function which
  // immediately calls this function.
  _onResponseStateChange: function(call) {

    xReq = call.xReq;

    if (xReq.readyState < 4) { //Still waiting
      return;
    }

    if (xReq.readyState == 4) { //Transmit to actual callback
      this._debug("Call " + this._describe(call)
                + " with context [" + call.callingContext+"]"
                + " to " + call.url + " has returned.");
      callbackFunction = call.callbackFunction;
      if (!callbackFunction) { // Maybe still loading, e.g. in another JS file
        setTimeout(function() {
          _onResponseStateChange(call);
        }, 100);
      }
      var content = call.expectingXML ? xReq.responseXML : xReq.responseText;     	 
      responseHeaders = xReq.getAllResponseHeaders();
      headersForCaller = this.shouldMakeHeaderMap ?
        this._createHeaderMap(responseHeaders) : responseHeaders;
      // 2007-04-06 (mca) : added status and statusText as optional returns
      callbackFunction(content, headersForCaller, call.callingContext, xReq.status, xReq.statusText);
    }

    call = null; // Technically the responsibility of GC
    this.pendingResponseCount--;

  },

  // Browser-agnostic factory function
  _createXMLHttpRequest: function() {
    if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      return new ActiveXObject('Microsoft.XMLHTTP')
    } else {
      _error("Could not create XMLHttpRequest on this browser");
      return null;
    }
  },

  _createHTTPVarSpec: function(vars) {
      var varsString = "";
      for( key in vars ) {
        var value = vars[key];
        if (this.shouldEscapeVars) {
          escapePlusRE =  new RegExp("\\\+");
          value = value.replace(escapePlusRE, "%2B");
        }
        varsString += '&' + key + '=' + value;
      }
      if (varsString.length > 0) {
        varsString = varsString.substring(1); // chomp initial '&'
      }
      this._debug("Built var String: " + varsString)
      return varsString;
   },

  /* Creates associative array from header type to header */
  _createHeaderMap: function(headersText) {
    extractedHeaders = headersText.split("\n");
    delete extractedHeaders[extractedHeaders.length]; // Del blank line at end
    headerMap = new Array();
    for (i=0; i<extractedHeaders.length-2; i++) {
      head = extractedHeaders[i];
      fieldNameEnding = head.indexOf(":");
      field = head.substring(0, fieldNameEnding);
      value = head.substring(fieldNameEnding + 2, head.length);
      value = value.replace(/\s$/, "");
      headerMap[field] = value;
    }
    return headerMap;
  },

  _appendHeaders:function(xReq,rh)
  {
    for(key in rh)
        xReq.setRequestHeader(key,rh[key]);
    //return xReq;
  },
  
  _debug: function(message) {
      if (this.shouldDebug) {
        alert("AjaxJS Message:\n\n" + message);
      }
  },

  _error: function(message) {
      if (this.shouldDebug) {
        alert("AjaxJS ERROR:\n\n" + message);
      }
  },

  _describe: function(obj) {
    if (obj==null) { return null; }
    switch(typeof(obj)) {
      case 'object': {
        var message = "";
        for (key in obj) {
          message += ", [" + key + "]: [" + obj[key] + "]";
        }
        if (message.length > 0) {
          message = message.substring(2); // chomp initial ', '
        }
        return message;
      }
      default: return "" + obj;
    }
  }
};
