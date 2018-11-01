"use strict";

(function(doc,win) {

	var test = 3;
	var choose = ["many", "plane", "sphere", "cylinder", "paraboloid"];
	var last = choose.length - 1;

	var pairs = location.search.slice(1).split('&');
	var query = {};
	pairs.forEach(function(pair) {
		pair = pair.split('=');
		query[pair[0]] = decodeURIComponent(pair[1] || '');
	});
	var input = query['type'];
	var reindex = choose.indexOf(input);
	if (reindex > -1) test = reindex;
	var key = choose[test > last ? last : (test < 0 ? 0 : test)];

	var buttons = doc.getElementById("buttons");
	var url = location.href.split('?')[0];
	var qmark = url.indexOf('?');
	if (qmark >= 0) url = url.substr(qmark);
	for (var choice of choose) {
		var btn = doc.createElement("BUTTON");
		var t = document.createTextNode(choice);
		var target = url + '?type=' + choice;
		btn.setAttribute("onClick", "window.location.href='"+target+"'");
		btn.appendChild(t);
		buttons.appendChild(btn);
	}

	var scrimmage1 = document.jlettvin.scrimmage.create({x:7, y:7, z:7});
	scrimmage1.unitTest();
	//var iAnother = scrimmage1.xyz2i([0,0,1]);
	//scrimmage1.irgba({i: iAnother, r:0, g:1, b:0, a:1, update: true});
	var init = scrimmage1.init;
	var parms = {
		scrimmage: scrimmage1,  // the data set on which to operate
		sigma: 0.5,             // acceptable variation from index value
		a: 1.0,                 // shared opacity
		normal: 0,              // axis of directional geometry (not sphere)
		verbose: false,         // Output to console.log
	}

	//scrimmage1.clear(true);

	switch(key) {
		case 'many':
			function update(vals) { Object.assign(parms, vals); return parms; }
			init(update({fun: "plane"      , value: -1, r:0, g: 1, b: 0}));
			init(update({fun: "plane"      , value:  2, r:0, g: 0, b: 1}));
			init(update({fun: "cylinder"   , value:  5, r:1, g: 1, b: 0}));
			init(update({fun: "sphere"     , value:  6, r:1, g: 0, b: 0}));
			init(update({fun: "paraboloid" , value: 10, r:1, g: 1, b: 1}));
			break;
		case 'plane':
			init(update({fun: key, value: -2, r:1, g: 1, b: 1}));
			init(update({fun: key, value:  2, r:0, g: 0, b: 0}));
			break;
		case 'sphere':
			init(update({fun: key, value: 6, r:1, g: 1, b: 1}));
			init(update({fun: key, value: 5, r:0, g: 0, b: 0}));
			break;
		case 'cylinder':
			init(update({fun: key, value: 7, r:1, g: 1, b: 1}));
			init(update({fun: key, value: 6, r:1, g: 0, b: 0}));
			init(update({fun: key, value: 5, r:0, g: 0, b: 0}));
			break;
		case 'paraboloid':
			init(update({fun: key, value: 10, r:1, g: 1, b: 1}));
			init(update({fun: key, value:  8, r:0, g: 0, b: 0}));
			break;
	}

	// TODO separate shared trackball to control each window independently
	//var scrimmage2 = document.jlettvin.scrimmage.create(2, 2, 2);


})(document,window);
