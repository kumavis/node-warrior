Ember.TEMPLATES["application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n<div id=\"gameContainer\" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("showGame::hidden")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.render || depth0.render),stack1 ? stack1.call(depth0, "game", options) : helperMissing.call(depth0, "render", "game", options))));
  data.buffer.push("\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["create/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("Create a New World<br>\n==================<br>\nname: ");
  hashContexts = {'valueBinding': depth0};
  hashTypes = {'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Em.TextField", {hash:{
    'valueBinding': ("worldName")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n<button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "generateWorld", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashContexts = {'disabled': depth0};
  hashTypes = {'disabled': "STRING"};
  options = {hash:{
    'disabled': ("worldSettingsInvalid")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">generate world</button>");
  return buffer;
  
});

Ember.TEMPLATES["game"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("<div id=\"container\">\n  <div style=\"position:absolute; z-index:-1;\">Loading...</div>\n</div>\n<div id=\"crosshair\"></div>\n\n<div id=\"jseditor\" class=\"\"></div>\n\n<div id=\"chat\">\n  <ul id=\"messages\"></ul>\n  <div id=\"cmdbox\">\n    <input type=\"text\" id=\"cmd\" placeholder=\"Press <enter> to chat\" /><br/>\n  </div>\n</div>\n\n<nav class=\"bar-tab\" id=\"blocks\"></nav>\n<nav class=\"bar-tab\" id=\"tools\"></nav>");
  
});

Ember.TEMPLATES["host/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <li ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "launchWorld", "world", {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "world.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</li>\n  ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n    No Worlds Yet :( <br>\n  ");
  }

function program5(depth0,data) {
  
  
  data.buffer.push("Create A New One!");
  }

  data.buffer.push("Choose a level:\n<ul>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "world", "in", "controller", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "create", options) : helperMissing.call(depth0, "link-to", "create", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  return buffer;
  
});

Ember.TEMPLATES["menu/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push(" Join Lobby ");
  }

function program3(depth0,data) {
  
  
  data.buffer.push(" Host Game ");
  }

function program5(depth0,data) {
  
  
  data.buffer.push(" Settings ");
  }

  data.buffer.push("Menu<br>\n==========<br>\n<ul>\n  <!-- ");
  hashContexts = {'tagName': depth0};
  hashTypes = {'tagName': "STRING"};
  options = {hash:{
    'tagName': ("li")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "join.lobby", options) : helperMissing.call(depth0, "link-to", "join.lobby", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" -->\n  ");
  hashContexts = {'tagName': depth0};
  hashTypes = {'tagName': "STRING"};
  options = {hash:{
    'tagName': ("li")
  },inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "host", options) : helperMissing.call(depth0, "link-to", "host", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  <!-- ");
  hashContexts = {'tagName': depth0};
  hashTypes = {'tagName': "STRING"};
  options = {hash:{
    'tagName': ("li")
  },inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "menu.settings", options) : helperMissing.call(depth0, "link-to", "menu.settings", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" -->\n</ul>\n==========<br>");
  return buffer;
  
});

Ember.TEMPLATES["menu/settings"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("&lt;-- Back to main menu");
  }

  data.buffer.push("Set ALL the Settings!\n<select name=\"select\">\n  <option value=\"value1\">Example 1</option> \n  <option value=\"value2\" selected>Example 2</option>\n  <option value=\"value3\">Example 3</option>\n</select>\n\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "menu.index", options) : helperMissing.call(depth0, "link-to", "menu.index", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  return buffer;
  
});