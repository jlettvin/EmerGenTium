"use strict";

(function(doc,win) {
	// Construct a scrimmage
	var radius = 10;
	var scrimmage1 = document.jlettvin.scrimmage.create(
		{x:radius, y:radius, z:radius});
	var the = scrimmage1;

	// Gain access to the data shapes
	var shapeChoices = scrimmage1.shapes;

	// Add some test names not in the shapes list
	for (var choice of ['many', 'synchronic']) shapeChoices.push(choice);

	// Keep index of last menu item for use in limiting shapeChoices
	var last = shapeChoices.length - 1;

	var shapeChoice = scrimmage1.query['SHAPE'];  // Note shape keys are uppercase.
	//console.log("CHOICE:", shapeChoice);
	var test = shapeChoices.indexOf(shapeChoice);

	// Chose a default shape, in case the querystring is absent
	if (test < 0) test = 0;

	// Get the test name from its index
	var key = shapeChoices[test > last ? last : (test < 0 ? 0 : test)];
	//console.log("KEY:", key, "TEST:", test);

	/////////////////////////////////////////////////////////////////////
	// Prepare to construct dropdown buttons
	var url = location.href.split('?')[0];
	var qmark = url.indexOf('?');
	if (qmark >= 0) url = url.substr(qmark);
	var radiusKeys = ['RX', 'RY', 'RZ'];
	var radii = [10, 20, 30];
	var noiseChoices = [0.0, 0.01, 0.03, 0.1, 0.3];

	// Generic button constructor
	function makeQueryString(dropdown, label, shape, R, Noise) {
		var ref = doc.createElement("A");
		ref.innerHTML = label;
		var target = url + '?shape=' + shape;
		for (var i=0; i<3; ++i) target += '&' + radiusKeys[i] + '=' + R[i];
		target += '&NOISE=' + Noise;
		ref.setAttribute("href", target);
		dropdown.appendChild(ref);
	}

	// Construct size dropdown button
	var sizeDropdown = doc.getElementById("sizeDropdown");
	for (var size of radii) {

		// All radii the same
		makeQueryString(
			sizeDropdown,
			"R=" + size,
			shapeChoice,
			[size, size, size],
			the.query.NOISE);

		// One radius change only
		for (var radIndex = 0; radIndex < 3; ++radIndex) {
			var radii = [the.query.RX, the.query.RY, the.query.RZ];
			radii[radIndex] = size;
			makeQueryString(
				sizeDropdown,
				radiusKeys[radIndex] + '=' + size,
				shapeChoice,
				radii,
				the.query.NOISE);
		}
	}

	// Construct shape dropdown button
	var shapeDropdown  = doc.getElementById("shapeDropdown");
	for (var choice of shapeChoices) {
		makeQueryString(
			shapeDropdown,
			choice,
			choice,
			[the.query.RX, the.query.RY, the.query.RZ],
			the.query.NOISE);
	}

	// Construct noise dropdown button
	var noiseDropdown  = doc.getElementById("noiseDropdown");
	for (var choice of noiseChoices) {
		makeQueryString(
			noiseDropdown,
			"NOISE=" + choice,
			shapeChoice,
			[the.query.RX, the.query.RY, the.query.RZ],
			choice);
	}
	/////////////////////////////////////////////////////////////////////

	// Run the builtin unit tests
	scrimmage1.unitTest();
	scrimmage1.noise();

	// Simplify access to scrimmage shape function
	var init = scrimmage1.init;

	// Initialize shared shape parameter
	var parms = {
		scrimmage: scrimmage1,  // the data set on which to operate
		sigma: 0.0,             // acceptable variation from index value
		a: 1.0,                 // shared opacity
		normal: 2,              // axis of directional geometry (not sphere)
		verbose: false,         // Output to console.log
	}

	// Run default tests for each shape
	function update(vals) { Object.assign(parms, vals); return parms; }
	//console.log("CHOOSE KEY:", key);
	switch(key) {
		case 'many':
			init(update({fun: "plane"      , offset: -radius        , r:0, g: 1, b: 0}));
			init(update({fun: "plane"      , offset:  radius        , r:0, g: 0, b: 1}));
			init(update({fun: "cylinder"                , radius:  5, r:1, g: 1, b: 0}));
			init(update({fun: "sphere"                  , radius:  7, r:1, g: 0, b: 0}));
			init(update({fun: "paraboloid" , offset:  -9, radius:  7, r:1, g: 1, b: 1, sigma: 1}));
			break;
		case 'synchronic':
			init(update({fun: "paraboloid" , offset: -7, radius:  7, r:1, g: 0, b: 0}));
			init(update({fun: "plane"      , offset:  4, r:0, g: 1, b: 0}));
			init(update({fun: "cylinder"   , radius:  4, r:0, g: 0, b: 1}));
			break;
		case 'plane':
			init(update({fun: key, offset: -1, r:1, g: 1, b: 1}));
			init(update({fun: key, offset:  0, r:1, g: 0, b: 0}));
			init(update({fun: key, offset:  1, r:0, g: 0, b: 0}));
			break;
		case 'sphere':
			init(update({fun: key, radius: radius  , r:1, g: 1, b: 1}));
			init(update({fun: key, radius: radius-1, r:1, g: 0, b: 0}));
			init(update({fun: key, radius: radius-2, r:0, g: 0, b: 0}));
			break;
		case 'cylinder':
			//console.log("SWITCH:", radius);
			init(update({fun: key, radius: radius  , r:1, g: 1, b: 1}));
			init(update({fun: key, radius: radius-1, r:1, g: 0, b: 0}));
			init(update({fun: key, radius: radius-2, r:0, g: 0, b: 0}));
			break;
		case 'paraboloid':
			init(update({fun: key, offset: 4-radius, radius: radius-4, r:1, g: 1, b: 1, sigma: 1.0}));
			init(update({fun: key, offset: 5-radius, radius: radius-5, r:1, g: 0, b: 0, sigma: 1.0}));
			init(update({fun: key, offset: 6-radius, radius: radius-6, r:0, g: 0, b: 0, sigma: 1.0}));
			break;
		case 'points':
			init(update({fun: key, opacity: 1, offset: 31}));
			break;
	}
	console.log("INITIALIZED");

	// TODO separate shared trackball to control each window independently
	//var scrimmage2 = document.jlettvin.scrimmage.create(2, 2, 2);


})(document,window);
