"use strict";

(function(doc,win) {
	// Construct a scrimmage
	var radius = 10;
	var the = document.jlettvin.scrimmage.create({x:radius, y:radius, z:radius});

	// Gain access to the data shapes
	var shapeChoices = the.shapes;

	// Add some test names not in the shapes list
	for (var choice of ['many', 'synchronic', 'lines', 'turtle']) {
		shapeChoices.push(choice);
	}

	// Keep index of last menu item for use in limiting shapeChoices
	var last = shapeChoices.length - 1;

	var shapeChoice = the.query['SHAPE'];  // Note shape keys are uppercase.
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
	var noiseChoices = [0.0, 0.03, 0.1, 0.3, 1.0];

	// Generic button constructor
	function makeQueryString(dropdown, label, shape, R, Noise, msg="foo") {
		var abbr = doc.createElement("ABBR");
		abbr.setAttribute("title", msg);
		var ref = doc.createElement("A");
		ref.innerHTML = label;
		var target = url + '?shape=' + shape;
		for (var i=0; i<3; ++i) target += '&' + radiusKeys[i] + '=' + R[i];
		target += '&NOISE=' + Noise;
		ref.setAttribute("href", target);
		abbr.appendChild(ref);
		dropdown.appendChild(abbr);
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
			the.query.NOISE,
			"Change all 3 axes radii to " + size
		);

		// One radius change only
		for (var radIndex = 0; radIndex < 3; ++radIndex) {
			var radii = [the.query.RX, the.query.RY, the.query.RZ];
			radii[radIndex] = size;
			makeQueryString(
				sizeDropdown,
				radiusKeys[radIndex] + '=' + size,
				shapeChoice,
				radii,
				the.query.NOISE,
				"Change " + radiusKeys[radIndex][1] + "axis radius to " + size
			);
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
			the.query.NOISE,
			"Change display data to example(s) of " + choice
		);
	}

	// Construct noise dropdown button
	var noiseDropdown  = doc.getElementById("noiseDropdown");
	for (var choice of noiseChoices) {
		makeQueryString(
			noiseDropdown,
			"NOISE=" + choice,
			shapeChoice,
			[the.query.RX, the.query.RY, the.query.RZ],
			choice,
			"Change normalized noise figure to " + choice
		);
	}
	/////////////////////////////////////////////////////////////////////

	// Run the builtin unit tests
	the.unitTest();
	the.noise();

	// Simplify access to scrimmage shape function
	var init = the.init;

	// Initialize shared shape parameter
	var parms = {
		scrimmage: the,         // the data set on which to operate
		sigma: 0.0,             // acceptable variation from index value
		a: 1.0,                 // shared opacity
		normal: 2,              // axis of directional geometry (not sphere)
		verbose: false,         // Output to console.log
	}

	// Run default tests for each shape
	function update(vals) { Object.assign(parms, vals); return parms; }
	//console.log("CHOOSE KEY:", key);
	function main() {

		var RX = the.query.RX;
		var RY = the.query.RX;
		var RZ = the.query.RZ;
		var RXY = Math.min(RX, RY);

		var cases = {
			many: [
				{fun: "plane"      , offset: -RZ             , r:0, g: 1, b: 0, normal: 2},
				{fun: "plane"      , offset:  RZ             , r:0, g: 0, b: 1, normal: 2},
				{fun: "cylinder"                 , radius:  5, r:1, g: 1, b: 0, normal: 2},
				{fun: "sphere"                   , radius:  7, r:1, g: 0, b: 0},
				{fun: "paraboloid" , offset:  -9 , radius:  7, r:1, g: 1, b: 1, sigma: 1},
			],
			synchronic: [
				{fun: "paraboloid" , offset: -7, RXY:  7, r:1, g: 0, b: 0},
				{fun: "plane"      , offset:  4         , r:0, g: 1, b: 0},
				{fun: "cylinder"   , radius:  4         , r:0, g: 0, b: 1},
			],
			plane: [
				{fun: key, offset: -1, r:1, g: 1, b: 1},
				{fun: key, offset:  0, r:1, g: 0, b: 0},
				{fun: key, offset:  1, r:0, g: 0, b: 0},
			],
			sphere: [
				{fun: key, radius: RXY  , r:1, g: 1, b: 1},
				{fun: key, radius: RXY-1, r:1, g: 0, b: 0},
				{fun: key, radius: RXY-2, r:0, g: 0, b: 0},
			],
			cylinder: [
				{fun: key, radius: RXY  , r:1, g: 1, b: 1},
				{fun: key, radius: RXY-1, r:1, g: 0, b: 0},
				{fun: key, radius: RXY-2, r:0, g: 0, b: 0},
			],
			paraboloid: [
				{fun: key, offset: 4-RZ, radius: RZ-4, r:1, g: 1, b: 1, sigma: 1.0},
				{fun: key, offset: 5-RZ, radius: RZ-5, r:1, g: 0, b: 0, sigma: 1.0},
				{fun: key, offset: 6-RZ, radius: RZ-6, r:0, g: 0, b: 0, sigma: 1.0},
			],
			points: [
				{fun: key, opacity: 1, offset: 31},
			],
		};

		function lines() {
			var RX = the.query.RX;
			var RY = the.query.RY;
			var RZ = the.query.RZ;
			var white = {r:1, g:1, b:1, a:1};            // discardable temp
			var red   = {r:1, g:0, b:0, a:1};            // discardable temp
			var green = {r:0, g:1, b:0, a:1};            // discardable temp
			var blue  = {r:0, g:0, b:1, a:1};            // discardable temp
			var xyzw  = [[-RX,-RY,-RZ], [+RX,+RY,+RZ]];  // segment ends
			var xyzr  = [[-RX,0,0], [+RX,0,0]];          // segment ends
			var xyzg  = [[0,-RY,0], [0,+RY,0]];          // segment ends
			var xyzb  = [[0,0,-RZ], [0,0,+RZ]];          // segment ends

			the.line({xyz: xyzw, rgba: white});
			the.line({xyz: xyzr, rgba:   red});
			the.line({xyz: xyzg, rgba: green});
			the.line({xyz: xyzb, rgba:  blue});

			the.update();
		}

		function turtle() {
			the.turtle(
				"(0,0,0)" +            // Where to start (implies ' ')
				"[1,0,0]" +            // Which direction to go
				"{0,0,0,1}" +          // What color/opacity to use
				"*2F" +               // Turtle commands
				"{1,0,0,1}[+0,+1,+0]3F" +  // red
				"{0,1,0,1}[-1,+0,+0]4F" +  // green
				"{0,0,1,1}[+0,-1,+0]5F" +  // blue
				"{1,1,0,1}[+0,+0,+1]6F" +  // yellow

				//"{0,0,1,1}" +
				//"[0,0,1]" +
				//"FFF" +             // Turtle commands
				//"{1,0,0,1}" +
				//"[-1,0,0]" +
				//"FFF" +             // Turtle commands
				" "
			);
			the.update();
		}

		switch(key) {
			case 'turtle':
				turtle();
				break;
			case 'lines':
				lines();
				break;
			default:
				if (shapeChoices.includes(key)) {
					for (var one of cases[key]) init(update(one));
				} else {
					console.log("INVALID CHOICE:", key, shapeChoices);
				}
				break;
		}
	}
	console.log("INITIALIZED");

	// TODO separate shared trackball to control each window independently
	//var scrimmage2 = document.jlettvin.scrimmage.create(2, 2, 2);

	main();

})(document,window);
