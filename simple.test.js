"use strict";

(function(doc,win) {
	// TODO implement circle and other 2D figures.
	// TODO add extents and (x0,y0,z0) for displacing 3D figures.
	// TODO use [i,j,k] normals instead of index for figures
	// TODO separate shared trackball to control each window independently



	// Construct a scrimmage
	// By default, set a small radius (10) for a cube edge of 21 voxels.
	// If the querystring contains values for RX, RY, and RZ
	// these will be substituted before creating the lattice.
	// If create is called and the querystring is empty
	// then the values specified here get used as a default.
	// Client programs need not have a query string, but just shape it like this.
	var radius = 10;
	var the = document.jlettvin.scrimmage.create({x:radius, y:radius, z:radius});

	// Gain access to the implemented simple data shapes
	var shapeChoices = the.shapes;

	// Shape functions in simple.js include simple shapes.
	// Combined shapes can be drawn as a group.
	// Tests for these are added to the button shapes menu.
	for (var choice of [
		'many',
		'synchronic',
		'lines',
		'turtle',
		'clutch0',
		'clutch1',
		'clutch2',
		'action1',
		'action2',
	]) {
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

		the.noise();

		var RX = the.query.RX;
		var RY = the.query.RX;
		var RZ = the.query.RZ;
		var RXY = Math.min(RX, RY);

		var cases = {
			many: [
				{fun: "plane"      , offset: -RZ             , r:0, g: 1, b: 0, normal: 2},
				{fun: "plane"      , offset:  RZ             , r:0, g: 0, b: 1, normal: 2},
				{fun: "cylinder"                , radius:   5, r:1, g: 1, b: 0, normal: 2},
				{fun: "sphere"                  , radius:   7, r:1, g: 0, b: 0},
				{fun: "paraboloid" , offset:  -9, radius:   7, r:1, g: 1, b: 1, sigma: 1},
			],
			synchronic: [
				{fun: "paraboloid" , offset:  -9, radius:   7, r:1, g: 0, b: 0},
				{fun: "plane"      , offset:   4             , r:0, g: 1, b: 0},
				{fun: "cylinder"   , offset:   4, radius:   7, r:0, g: 0, b: 1},
			],
			disk: [
				{fun: "disk"       , offset: -1, radius: RXY, r:0, g: 0, b: 0, normal: 2},
				{fun: "disk"       , offset:  0, radius: RXY, r:1, g: 0, b: 0, normal: 2},
				{fun: "disk"       , offset:  1, radius: RXY, r:1, g: 1, b: 1, normal: 2},
			],
			clutch0: [
				{fun: "disk"       , offset: -1, radius: RXY, r:1, g: 1, b: 1, normal: 2},
				{fun: "plane"      , offset: -0             , r:1, g: 0, b: 0, normal: 2},
				{fun: "disk"       , offset: +1, radius: RXY, r:1, g: 1, b: 1, normal: 2},
			],
			clutch1: [
				{fun: "disk"       , offset: -2, radius: RXY, r:1, g: 1, b: 1, normal: 2},
				{fun: "plane"      , offset: -1             , r:1, g: 0, b: 0, normal: 2},

				{fun: "disk"       , offset:  0, radius: RXY, r:0, g: 0, b: 0, normal: 2},

				{fun: "plane"      , offset: +1             , r:1, g: 0, b: 0, normal: 2},
				{fun: "disk"       , offset: +2, radius: RXY, r:1, g: 1, b: 1, normal: 2},
			],
			clutch2: [
				{fun: "disk"       , offset: -3, radius: RXY, r:1, g: 1, b: 1, normal: 2},
				{fun: "plane"      , offset: -2             , r:1, g: 0, b: 0, normal: 2},
				{fun: "disk"       , offset: -1, radius: RXY, r:0, g: 0, b: 0, normal: 2},

				{fun: "disk"       , offset: +1, radius: RXY, r:0, g: 0, b: 0, normal: 2},
				{fun: "plane"      , offset: +2             , r:1, g: 0, b: 0, normal: 2},
				{fun: "disk"       , offset: +3, radius: RXY, r:1, g: 1, b: 1, normal: 2},

				/*
				{fun: "cylinder"   , offset:   4, radius:   7, r:1, g: 1, b: 1,
					normal:
					[
						[-the.query.RX, -the.query.RY, -the.query.RZ],
						[           -4, +the.query.RY, +the.query.RZ],
					]
				},
				{fun: "cylinder"   , offset:   4, radius:   7, r:1, g: 1, b: 1,
					normal:
					[
						[           +4, -the.query.RY, -the.query.RZ],
						[+the.query.RX, +the.query.RY, +the.query.RZ],
					]
				},
				*/
			],
			action1: [
				{fun: 'paraboloid', offset: 4-RZ, radius: RZ-4, r:1, g: 1, b: 1, sigma: 1.0},
				{fun: 'paraboloid', offset: 3-RZ, radius: RZ-5, r:1, g: 0, b: 0, sigma: 1.0},
				{fun: 'paraboloid', offset: 6-RZ, radius: RZ-6, r:0, g: 0, b: 0, sigma: 1.0},
			],
			action2: [
				{fun: 'paraboloid', offset: 4-RZ, radius: RZ-4, r:1, g: 1, b: 1, sigma: 1.0},
				{fun: 'paraboloid', offset: 9-RZ, radius: RZ-5, r:1, g: 0, b: 0, sigma: 1.0},
				{fun: 'paraboloid', offset: 6-RZ, radius: RZ-6, r:0, g: 0, b: 0, sigma: 1.0},
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

		// MENU function
		function lines() {
			var RX = the.query.RX;
			var RY = the.query.RY;
			var RZ = the.query.RZ;
			var white = {r:1, g:1, b:1, a:1};            // discardable temp
			var red   = {r:1, g:0, b:0, a:1};            // discardable temp
			var green = {r:0, g:1, b:0, a:1};            // discardable temp
			var blue  = {r:0, g:0, b:1, a:1};            // discardable temp
			var xyzW  = [[-RX,-RY,-RZ,1], [+RX,+RY,+RZ,1]];  // segment ends
			var xyzR  = [[-RX,0,0,1], [+RX,0,0,1]];          // segment ends
			var xyzG  = [[0,-RY,0,1], [0,+RY,0,1]];          // segment ends
			var xyzB  = [[0,0,-RZ,1], [0,0,+RZ,1]];          // segment ends

			the.drawLine({xyzw: xyzW, rgba: white});
			the.drawLine({xyzw: xyzR, rgba:   red});
			the.drawLine({xyzw: xyzG, rgba: green});
			the.drawLine({xyzw: xyzB, rgba:  blue});

			the.update();
		}

		// MENU function
		function turtle1() {
			the.turtle(
				" center" +                       // Where to start (implies ' ')
				"[1,0,0]" +                       // Which direction to go
				"{0,0,0,1}" +                     // What color/opacity to use
				"v2F" +
				"red [0,1,0]3F" +                 // color names can be used
				"green [-1,0,0]4F" +
				"blue [0,-1,0]5F" +
				"yellow [0,0,1]6F" +
				"white [1,-7,-9]100F" +
				"^dswv[1,-1,0] cyan v10F" +
				"une[-1,1,0] magenta 10F" +
				"^"
			);
			the.update();
		}

		function turtle2() {
			the.turtle(
				"(0,0,0)[1,0,0]{0,0,0,1}vF" +
				"[1,1,0]2F" +
				"[1,1,1]3F" +
				"[0,1,0]4F" +
				"^"
			);
			the.update();
		}

		switch(key) {
			case 'turtle': turtle1(); break;
			case 'lines': lines(); break;
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
