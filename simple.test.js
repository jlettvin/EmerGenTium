"use strict";

(function(doc,win) {

	// Construct a scrimmage
	var scrimmage1 = document.jlettvin.scrimmage.create({x:7, y:7, z:7});

	// Gain access to the data initializers
	var choose = scrimmage1.initializers;

	// Add some test names not in the initializers list
	choose.push('many');

	// Keep index of last menu item for use in limiting choices
	var last = choose.length - 1;

	// Extract query dictionary from query string
	var pairs = location.search.slice(1).split('&');
	var query = {};
	pairs.forEach(function(pair) {
		pair = pair.split('=');
		query[pair[0]] = decodeURIComponent(pair[1] || '');
	});
	var input = query['initializer'];
	var test = choose.indexOf(input);

	// Chose a default initializer, in case the querystring is absent
	if (test < 0) test = 0;

	// Get the test name from its index
	var key = choose[test > last ? last : (test < 0 ? 0 : test)];

	// Generate buttons to enable choosing tests by user
	var buttons = doc.getElementById("buttons");
	var url = location.href.split('?')[0];
	var qmark = url.indexOf('?');
	if (qmark >= 0) url = url.substr(qmark);
	for (var choice of choose) {
		var btn = doc.createElement("BUTTON");
		var t = document.createTextNode(choice);
		var target = url + '?initializer=' + choice;
		btn.setAttribute("onClick", "window.location.href='"+target+"'");
		btn.appendChild(t);
		buttons.appendChild(btn);
	}

	// Run the builtin unit tests
	scrimmage1.unitTest();
	scrimmage1.clear(true);

	// Simplify access to scrimmage initializer function
	var init = scrimmage1.init;

	// Initialize shared initializer parameter
	var parms = {
		scrimmage: scrimmage1,  // the data set on which to operate
		sigma: 0.5,             // acceptable variation from index value
		a: 1.0,                 // shared opacity
		normal: 0,              // axis of directional geometry (not sphere)
		verbose: false,         // Output to console.log
	}

	// Run default tests for each initializer
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
		case 'points':
			init(update({fun: key, value: 17, r:1, g: 1, b: 1}));
			break;
	}

	// TODO separate shared trackball to control each window independently
	//var scrimmage2 = document.jlettvin.scrimmage.create(2, 2, 2);


})(document,window);
