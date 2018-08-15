/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
++                                                                             ++
++         #######                          #####                              ++
++         #        #    #  ######  #####  #     #  ######  #    #             ++
++         #        ##  ##  #       #    # #        #       ##   #             ++
++         #####    # ## #  #####   #    # #  ####  #####   # #  #             ++
++         #        #    #  #       #####  #     #  #       #  # #             ++
++         #        #    #  #       #   #  #     #  #       #   ##             ++
++         #######  #    #  ######  #    #  #####   ######  #    #             ++
++                                                                             ++
++         EmerGen Emergent Behavior modeling                                  ++
++                                                                             ++
**         (c) Copyright 2018, Jonathan D. Lettvin                             ++
**             All rights reserved.                                            **
**                                                                             **
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      #    #    #     #    #     #####   #####  ######    ###   ######  #######
      #   # #   #     #   # #   #     # #     # #     #    #    #     #    #
      #  #   #  #     #  #   #  #       #       #     #    #    #     #    #
      # #     # #     # #     #  #####  #       ######     #    ######     #
#     # #######  #   #  #######       # #       #   #      #    #          #
#     # #     #   # #   #     # #     # #     # #    #     #    #          #
 #####  #     #    #    #     #  #####   #####  #     #   ###   #          #
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 #####  ####### #     # ######   #####  #######
#     # #     # #     # #     # #     # #
#       #     # #     # #     # #       #
 #####  #     # #     # ######  #       #####
      # #     # #     # #   #   #       #
#     # #     # #     # #    #  #     # #
 #####  #######  #####  #     #  #####  #######
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

"use strict";
// emergent: a mesh of computer simulations for modeling emergent behavior

window.onload = (function (win, doc) {

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 #####  ####### ####### #     # ######
#     # #          #    #     # #     #
#       #          #    #     # #     #
 #####  #####      #    #     # ######
      # #          #    #     # #
#     # #          #    #     # #
 #####  #######    #     #####  #
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

	var data0;
	var message = [];

	function setup () {
		console.clear ();

		doc.EmerGen = doc.EmerGen || {};
		doc.EmerGen.data0 = doc.EmerGen.data0 || {
			pi       : Math.PI,
			twopi    : Math.PI*2,
			talking  : true,
			REGISTER : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			shape    : [1,1,1],
			Rb       : 5,
			Rc       : 5,
			Wl       : 2,
			manifold: {
				scene: null,
				camera: null,
				renderer: null,
				controls: null,
			},
			EmerGen: {
				scale: 1,
				coeff: 0.02,
				opacity: 1,
				R:5,
			},
			button: {
				element: document.getElementById("buttonTime"),
				pause: true,
			},
		};
		data0  = doc.EmerGen.data0;

		data0.EmerGen.X = data0.EmerGen.Y = data0.EmerGen.Z = data0.EmerGen.R;
		data0.EmerGen.radius = Math.sqrt(
			data0.EmerGen.X**2 + data0.EmerGen.Y**2 + data0.EmerGen.Z**2
		);

		doc.EmerGen.main = main;
		doc.EmerGen.hoverHint = hoverHint;
		doc.EmerGen.hintTime  = hintTime;
		doc.EmerGen.eventTime = eventTime;
		doc.EmerGen.hintTalk  = hintTalk;
		doc.EmerGen.eventTalk = eventTalk;
	}

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
####### #     #   ###   #######
#        #   #     #       #
#         # #      #       #
#####      #       #       #
#         # #      #       #
#        #   #     #       #
####### #     #   ###      #
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

	function exit ( status ) {
		// http://kevin.vanzonneveld.net
		// +   original by: Brett Zamir (http://brettz9.blogspot.com)
		// +      input by: Paul
		// +   bugfixed by: Hyam Singer (http://www.impact-computing.com/)
		// +   improved by: Philip Peterson
		// +   bugfixed by: Brett Zamir (http://brettz9.blogspot.com)
		// %        note 1: expirimental. Please comment on this function.
		// *     example 1: exit();
		// *     returns 1: null

		var i;

		if (typeof status === 'string') {
			alert(status);
		}

		window.addEventListener(
			'error',
			function (e) {
				e.preventDefault();
				e.stopPropagation();
			},
			false);

		var handlers = [
			'copy', 'cut', 'paste',
			'beforeunload', 'blur', 'change', 'click', 'contextmenu', 'dblclick',
			'focus', 'keydown', 'keypress', 'keyup', 'mousedown', 'mousemove',
			'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll',
			'DOMNodeInserted', 'DOMNodeRemoved', 'DOMNodeRemovedFromDocument',
			'DOMNodeInsertedIntoDocument', 'DOMAttrModified',
			'DOMCharacterDataModified', 'DOMElementNameChanged',
			'DOMAttributeNameChanged', 'DOMActivate', 'DOMFocusIn',
			'DOMFocusOut', 'online', 'offline', 'textInput',
			'abort', 'close', 'dragdrop', 'load', 'paint', 'reset', 'select',
			'submit', 'unload'
		];

		function stopPropagation (e) {
			e.stopPropagation();
			// e.preventDefault(); // Stop for the form controls, etc., too?
		}
		for (i=0; i < handlers.length; i++) {
			window.addEventListener(
				handlers[i], function (e) {
					stopPropagation(e);
				},
				true);
		}

		if (window.stop) {
			window.stop();
		}

		throw '';
	}

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#     # ####### #     # ####### ######  #     #   ###   #     # #######
#     # #     # #     # #       #     # #     #    #    ##    #    #
#     # #     # #     # #       #     # #     #    #    # #   #    #
####### #     # #     # #####   ######  #######    #    #  #  #    #
#     # #     #  #   #  #       #   #   #     #    #    #   # #    #
#     # #     #   # #   #       #    #  #     #    #    #    ##    #
#     # #######    #    ####### #     # #     #   ###   #     #    #
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

	function hoverHint (msg) {
		var element = doc.getElementById ("hoverHints");
		element.innerHTML = msg || "";
	}

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  ###   #     # ####### ######  #######  #####  ######  #######  #####  #######
   #    ##    #    #    #     # #     # #     # #     # #       #     #    #
   #    # #   #    #    #     # #     # #       #     # #       #          #
   #    #  #  #    #    ######  #     #  #####  ######  #####   #          #
   #    #   # #    #    #   #   #     #       # #       #       #          #
   #    #    ##    #    #    #  #     # #     # #       #       #     #    #
  ###   #     #    #    #     # #######  #####  #       #######  #####     #
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

	function introspect () {
		// Enables easier introspection for the EmerGen user.
		var I = arguments.length;
		if (I > 0) {
			var fun = arguments[0];
			var args = [];
			for (var i=1; arguments[i]; ++i) args.push (arguments[i]);
			pushCall (fun.name);
			fun.apply (null, args);
			pullCall (fun.name);
		}
	}

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#     #    #    #     #   ###   ####### ####### #       ######
##   ##   # #   ##    #    #    #       #     # #       #     #
# # # #  #   #  # #   #    #    #       #     # #       #     #
#  #  # #     # #  #  #    #    #####   #     # #       #     #
#     # ####### #   # #    #    #       #     # #       #     #
#     # #     # #    ##    #    #       #     # #       #     #
#     # #     # #     #   ###   #       ####### ####### ######
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

	// --------------------------------------------------------------------------
	var makeCell = function (x, y, z, r, g, b) {
		var X = data0.EmerGen.X, Y = data0.EmerGen.Y, Z = data0.EmerGen.Z;
		var radius = Math.sqrt (x*x+y*y+z*z);

		var cell = function () {
			cell.r = Math.random ();
			cell.g = Math.random ();
			cell.b = Math.random ();

			cell.mesh.scale.x = 0.3 * Math.random ();
			cell.mesh.scale.y = 0.3 * Math.random ();
			cell.mesh.scale.z = 0.3 * Math.random ();

			cell.material.emissive.setRGB (cell.r, cell.g, cell.b);
			cell.geometry.verticesNeedUpdate = true;
			cell.geometry.colorsNeedUpdate = true;
		};

		cell.r = r;
		cell.g = g;
		cell.b = b;
		// Absolute corner indices
		cell.X = x+X;
		cell.Y = y+Y;
		cell.Z = z+Z;
		cell.x = x*data0.EmerGen.scale;
		cell.y = y*data0.EmerGen.scale;
		cell.z = z*data0.EmerGen.scale;
		cell.radius = radius;
		cell.o = data0.EmerGen.opacity;
		cell.t = true;
		cell.mesh =  null;

		cell.color    = new THREE.Color (cell.r, cell.g, cell.b);
		cell.geometry = new THREE.BoxGeometry (1, 1, 1);

		cell.material = new THREE.MeshLambertMaterial ({
			emissive: cell.color,
			emissiveIntensity: 1,
			transparent: cell.t,
			opacity: cell.o
		});
		cell.mesh = new THREE.Mesh (cell.geometry, cell.material);
		cell.mesh.position.set (cell.x,cell.y,cell.z);
		data0.manifold.scene.add (cell.mesh);
		return cell;
	};

	//var edge = function (x0, x1, y0, y1, z0, z1) {
		//var vertex0 = new THREE Vector3 (x0, y0, z0);
		//var vertex1 = new THREE Vector3 (x1, y1, z1);
	//};

	// --------------------------------------------------------------------------
	var initializeManifold = function () {
		data0.manifold.scene    = new THREE.Scene ();
		data0.manifold.camera   = new THREE.PerspectiveCamera (50, 1, 0.1, 1000);
		data0.manifold.renderer = new THREE.WebGLRenderer (
			{canvas: manifold, alpha: true});
		data0.manifold.controls = new THREE.OrbitControls (
			data0.manifold.camera, data0.manifold.renderer.domElement);

		data0.manifold.camera.position.z = data0.EmerGen.R*5*data0.EmerGen.scale;
		data0.manifold.renderer.setClearColor ( 0x7f7f7f, 0.5 );
		data0.manifold.renderer.setSize (501, 501);

		data0.grid = [];
		data0.linear = [];

		// TODO use ijk instead of xyz for corner-based coordinates
		// Generate grid[k][j][i] cube of cells.
		var X = data0.EmerGen.X, Y = data0.EmerGen.Y, Z = data0.EmerGen.Z;
		for (var z=-Z; z<=Z; z++) {
			var grid = data0.grid;
			grid.push ([]);
			var planes = grid.length;
			for (var y=-Y; y<=Y; y++) {
				var plane = grid[planes-1];
				plane.push ([]);
				var lines = plane.length;
				data0.grid[data0.grid.length-1].push ([]);
				for (var x=-X; x<=X; x++) {
					var line = plane[lines-1];
					var cell = makeCell (
						x, y, z,
						Math.random (), Math.random (), Math.random ()
					);
					line.push (cell);  // Store node in cartesian space.
					data0.linear.push (cell);
				}
			}
		}
		var boxGeo = new THREE.BoxGeometry (2*X+1, 2*Y+1, 2*Z+1);
		var edges = new THREE.EdgesGeometry (boxGeo);
		var line = new THREE.LineSegments (
			edges,
			new THREE.LineBasicMaterial ({color: 0})
		);
		data0.manifold.scene.add (line);

		var axesHelper = new THREE.AxesHelper (2*X);
		{
			// make sure to update this on window resize
			//var localToCameraAxesPlacement = new THREE.Vector3(
				//0.45 * camera.aspect,-0.45,-2);
		}
		
		data0.manifold.scene.add (axesHelper);
	}

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   #    #     #   ###   #     #    #    ####### #######
  # #   ##    #    #    ##   ##   # #      #    #
 #   #  # #   #    #    # # # #  #   #     #    #
#     # #  #  #    #    #  #  # #     #    #    #####
####### #   # #    #    #     # #######    #    #
#     # #    ##    #    #     # #     #    #    #
#     # #     #   ###   #     # #     #    #    #######
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    var animate = function () {
		if (!data0.button.pause) requestAnimationFrame (animate);
		for (var plane of data0.grid) {
			for (var line of plane) {
				for (var cell of line) {
					cell ();
				}
			}
		}
		data0.manifold.renderer.render (
			data0.manifold.scene,
			data0.manifold.camera);
		data0.manifold.controls.update ();
		{
			//var camera = getCamera();
			//camera.updateMatrixWorld();
			//var axesPlacement = camera.localToWorld(
				//localToCameraAxesPlacement.clone());
			//axisHelper.position.copy(axesPlacement);
		}
    }

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#######                          #####
#        #    #  ######  #####  #     #  ######  #    #
#        ##  ##  #       #    # #        #       ##   #
#####    # ## #  #####   #    # #  ####  #####   # #  #
#        #    #  #       #####  #     #  #       #  # #
#        #    #  #       #   #  #     #  #       #   ##
#######  #    #  ######  #    #  #####   ######  #    #
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

	//***************************************************************************
	var pushCall = function (msg) {
		message.push (msg);
		var say = doc.getElementById ("problem").innerHTML = "PUSHED: "+msg;
		if (data0.talking) console.log (say);
	};

	//***************************************************************************
	var pullCall = function (msg) {
		var fault = false;
		var current = doc.getElementById ("problem");
		current.innerHTML = '';
		var future = '';
		if (message.length > 0) {
			var last = message.pop ();
			if (last != msg) {
				fault = true;
				future = "unmatched push/pull";
			}
			if (message.length > 0) {
				future = "PULLED: " + msg;
			}
		}
		doc.getElementById ("problem").innerHTML = future;
		if (data0.talking) console.log (future);
		if (fault) exit (future);
	};

	//***************************************************************************
	var verbose = function () {
		if (data0.talking) {
			var I = arguments.length;
			var display = '';
			for (var i=0; i<I; ++i) { display += ' ' + arguments[i]; }
			console.log (display);
		}
	};

	//***************************************************************************
	var hintTime = function () {
		hoverHint (
			[
				"Clicking MOVE turns on animation.",
				"This button is relabeled STOP.",
				"Clicking STOP turns off animation."
			].join("\n")
		);
	};
	var eventTime = function () {
		message.push ("eventTime");
		console.log ("TIME");
		data0.button.pause = !data0.button.pause;
		data0.button.element.innerHTML = data0.button.pause ? "MOVE" : "STOP";
		if (!data0.button.pause) animate ();
	};

	//***************************************************************************
	var hintTalk = function () {
		hoverHint (
			[
				"Clicking TALK turns on console logging.",
				"This button is relabeled MUTE.",
				"Clicking MUTE turns off console logging."
			].join("\n")
		);
	};
	var eventTalk = function () {
		console.log ("TALK");
		data0.talking = !data0.talking;
		doc.getElementById("buttonTalk").innerHTML =
			data0.talking ? "MUTE" : "TALK";
	};

	//***************************************************************************

	var integer;

	//TODO update machine to enable access from these functions
	//***************************************************************************
	var LOLdigit0 = function (machine, chr) {
		integer = chr.charCodeAt(chr) - 0x30;
	};

	//***************************************************************************
	var LOLdigitN = function (machine, chr) {
		integer = integer * 10 + chr.charCodeAt(chr) - 0x30;
	};

	//***************************************************************************
	var LOLPUSHint = function (machine, chr) {
		machine.PUSH (integer);
	};

	//***************************************************************************
	var LOLADD = function (machine, chr) {
		var A = machine.POP ();
		var B = machine.POP ();
		machine.PUSH (A+B);
	};

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 #####                                  #######
#     #   #####    ##     #####  ######    #       ##    #####   #       ######
#           #     #  #      #    #         #      #  #   #    #  #       #
 #####      #    #    #     #    #####     #     #    #  #####   #       #####
      #     #    ######     #    #         #     ######  #    #  #       #
#     #     #    #    #     #    #         #     #    #  #    #  #       #
 #####      #    #    #     #    ######    #     #    #  #####   ######  ######
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

	// Character class names/indices bidirectional association
	var cclass = {};
	// Character classes (like SPACE, DIGIT, PUNCT) associate chars with class
	var cchars = {};
	// Character table where ctable[ord(char)] is character class
	var ctable = new Uint8Array (256);

	// State table vector (state value indexes this vector)
	var stable = [];
	// state names/indices bidirectional association
	var snames = {};
	// specification for transitions to fill tables
	var transitions = { // All states must be initialized here as follows.
		"error": [],
		"home": [],
		"integer": []
	};

	//***************************************************************************
	var initializeStateTables = function () {
		var counter;
		var transcount = Object.keys (transitions).length;

		verbose ("\tINITIALIZE CHARACTER CLASSES");
		cclass[0] = "FINAL"; cclass["FINAL"] = 0;
		cclass[1] = "SPACE"; cclass["SPACE"] = 1;
		cclass[2] = "DIGIT"; cclass["DIGIT"] = 2;
		cclass[3] = "UPPER"; cclass["UPPER"] = 3;
		cclass[4] = "LOWER"; cclass["LOWER"] = 4;
		cclass[5] = "PUNCT"; cclass["PUNCT"] = 5;

		verbose ("\tINITIALIZE CHARACTER SETS");
		cchars["FINAL"] = "";
		cchars["SPACE"] = "\t\n\r\f ";
		cchars["DIGIT"] = "0123456789";
		cchars["UPPER"] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		cchars["LOWER"] = "abcdefghijklmnopqrstuvwxyz";
		cchars["PUNCT"] = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

		verbose ("\tINITIALIZE CHARACTER CLASS TABLE");
		for (var key in cchars) {
			var val = cchars[key];
			var cls = cclass[key];
			for (var c of val) ctable[c.charCodeAt(0)] = cls;
		}

		verbose ("\tINITIALIZE TRANSITIONS DESCRIPTORS");
		transitions["home"   ].push (
			["home"   , cchars["SPACE"], null, null      ]);
		transitions["home"   ].push (
			["integer", cchars["DIGIT"], null, LOLdigit0 ]);
		transitions["integer"].push (
			["integer", cchars["DIGIT"], null, LOLdigitN ]);
		transitions["integer"].push (
			["home"   , cchars["SPACE"], null, LOLPUSHint]);

		verbose ("\tINITIALIZE TRANSITIONS TABLE TO ZEROS");
		for (var N=transcount; N--; ) stable.push (new Uint8Array (256));

		verbose ("\tINITIALIZE TRANSITIONS TABLE STATE NAMES");
		counter = 0;
		for (var key in transitions) {
			snames[key] = counter; snames[counter] = key;
			++counter;
		}

		verbose ("\tINITIALIZE TRANSITIONS TABLE STATE TABLES");
		counter = 0;
		for (var key in transitions) {
			var trn = transitions[key];
			var table = stable[counter];
			for (var tuple of trn) {
				var tgtname = tuple[0];
				var chr = tuple[1];
				var target = snames[tgtname];
				for (var c of chr) table[c.charCodeAt(0)] = target;
			}
			++counter;
		}
	}

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    ######     #    ######   #####  #######
    #     #   # #   #     # #     # #
    #     #  #   #  #     # #       #
    ######  #     # ######   #####  #####
    #       ####### #   #         # #
    #       #     # #    #  #     # #
    #       #     # #     #  #####  #######
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

	//***************************************************************************
	var parse = function () {
		console.log ("PARSER 2");
		var source =  doc.getElementById ("source").value;
		var count = source.length;
		var state = 1;
		var stack = [state];
		var error = [];
		var chr, ord;
		for (var n=0; n<count && error.length === 0; ++n) {
			chr = source[n];
			ord = chr.charCodeAt (0);
			var prior = state;

			var state = stack[stack.length-1];
			var next = stable[state][ord];
			console.log ("STATE:", ord, prior, state, next);
			switch (state) {
				case 0:  // TERMINAL STATE
					error.push ("terminal");
					break;
				case 1:  // BASE STATE
					console.log (chr, cclass[ctable[ord]]);
					break;
				default:
					error.push ("UKNOWN STATE", state);
					break;
			}
		}
	};

	//***************************************************************************
	var run = function () {
	};

	//***************************************************************************
	var show = function () {
	};

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#     #    #      ###   #     #
##   ##   # #      #    ##    #
# # # #  #   #     #    # #   #
#  #  # #     #    #    #  #  #
#     # #######    #    #   # #
#     # #     #    #    #    ##
#     # #     #   ###   #     #
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

	var main = function () {
		console.log ("MAIN: with parse disabled");
		introspect (initializeStateTables);
		initializeManifold ();
		animate ();
		doc.EmerGen.hints ();
		//introspect (parse);
		//introspect (run);
		//introspect (show);
		//introspect (manifold);
	};

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
####### #     # ####### ######  #     # ######  #######   ###   #     # #######
#       ##    #    #    #     #  #   #  #     # #     #    #    ##    #    #
#       # #   #    #    #     #   # #   #     # #     #    #    # #   #    #
#####   #  #  #    #    ######     #    ######  #     #    #    #  #  #    #
#       #   # #    #    #   #      #    #       #     #    #    #   # #    #
#       #    ##    #    #    #     #    #       #     #    #    #    ##    #
####### #     #    #    #     #    #    #       #######   ###   #     #    #
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

	setup ();
	introspect (doc.EmerGen.main);

})(window, document);
