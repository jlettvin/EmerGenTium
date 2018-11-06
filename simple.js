"use strict";

function shapeDropdownFunction() {
    document.getElementById("shapeDropdown").classList.toggle("show");
}
function sizeDropdownFunction() {
    document.getElementById("sizeDropdown").classList.toggle("show");
}
function noiseDropdownFunction() {
    document.getElementById("noiseDropdown").classList.toggle("show");
}

(function(doc,win) {
	// TODO
	// isize doesn't work, but perhaps we can do this all with opacity.

	// Close the dropdown if the user clicks outside of it
	win.onclick = function(event) {
		var the = document.jlettvin.scrimmage.the;
		if (!event.target.matches('.dropbtn')) {
			var dropdowns = document.getElementsByClassName("dropdown-content");
			var i;
			for (i = 0; i < dropdowns.length; i++) {
				var openDropdown = dropdowns[i];
				if (openDropdown.classList.contains('show')) {
					openDropdown.classList.remove('show');
				}
			}
		}

		if      (event.target.id == 'KeyA') { alongA(); }
		else if (event.target.id == 'KeyX') { alongX(); }
		else if (event.target.id == 'KeyY') { alongY(); }
		else if (event.target.id == 'KeyZ') { alongZ(); }
		else { the.verbose("KEYBOARD:", event); }
	}

	function alongA() {
		var the = document.jlettvin.scrimmage.the;
		the.verbose("alongA");
		the.camera.position.set(the.Acamera,the.Acamera,the.Acamera);
		the.update();
	}
	function alongX() {
		var the = document.jlettvin.scrimmage.the;
		the.verbose("alongX");
		the.camera.position.set(the.orthogonal,0,0);
		the.update();
	}
	function alongY() {
		var the = document.jlettvin.scrimmage.the;
		the.verbose("alongY");
		the.camera.position.set(0,the.orthogonal,0);
		the.update();
	}
	function alongZ() {
		var the = document.jlettvin.scrimmage.the;
		the.verbose("alongZ");
		the.camera.position.set(0,0,the.orthogonal);
		the.update();
	}

	// Handle hotkeys
	function keyup(evt) {
		var the = document.jlettvin.scrimmage.the;

		the.verbose(evt);
		switch(evt.code) {
			case 'KeyA': alongA(); break;
			case 'KeyX': alongX(); break;
			case 'KeyY': alongY(); break;
			case 'KeyZ': alongZ(); break;
		}
	}

	win.onkeyup = function(evt) {
		keyup(evt);
	}

	// Make semi-globals
	doc.jlettvin = doc.jlettvin || {};
	doc.jlettvin.scrimmage = doc.jlettvin.scrimmage || {
		create: function(arg) {

			var Rx, Ry, Rz;

			var args = arg.length;
			if (args == undefined) { Rx =  arg.x; Ry =  arg.y; Rz =  arg.z; }
			else if(args == 3)     { Rx = arg[0]; Ry = arg[1]; Rz = arg[2]; }

			var the = {query: {NOISE: 0.1}};

			the.oldQuery = location.search.slice.length && location.search.slice(1);
			function getQuery() { // Extract query dictionary from query string
				//the.verbose("GETQUERY:", the.query);
				var pairs = the.oldQuery.split('&');
				pairs.forEach(function(pair) {
					pair = pair.split('=');
					var theString = decodeURIComponent(pair[1] || '');
					var theNumber = Number(theString);
					var theValue  = Number.isNaN(theNumber) ? theString : theNumber;
					the.query[pair[0].toUpperCase()] = theValue;
				});
				the.query.RX = the.query.RX || Rx || 10;
				the.query.RY = the.query.RY || Ry || 10;
				the.query.RZ = the.query.RZ || Rz || 10;
				the.query.NOISE = the.query.NOISE || 0.01;
			}

			function setQuery(name=null, value=null) {
				//the.verbose("SETQUERY:", the.query);
				var keys = Object.keys(the.query);
				var twixt = '';
				the.newQuery = "";
				for (var key of keys) {
					the.newQuery += twixt + key + '=';
					the.newQuery += encodeURIComponent(the.query[key] || '');
					twixt = '&';
				};
			}
			the.setQuery = setQuery;

			//the.verbose("OLD QUERY:", the.oldQuery);
			getQuery();
			//the.verbose("KEY QUERY:", the.query);
			setQuery();
			//the.verbose("NEW QUERY:", the.newQuery);

			Object.assign(the, {
				//the = { // Data structure local to this instance
				winW    : win.innerWidth,
				winH    : win.innerHeight,
				Acamera : 6.5,         // Orthogonal camera position distances
				range   : 0.5,         // Scalars help nodes fit within window
				edge    : 0.25,        // Should be range/2 to maintain gap
				margin  : 0.9,         // Fit visualization to window
				lattice : [],          // linear array of node objects
				carrier : [],
				follow  : false,

				verbose: function() {
					if (the.follow) {
						console.log("   (verbose) ", arguments);
					}
				},

				clear: function(update = false) {
					for(var i=the.lattice.length; i-- > 0;) {
						var material = the.lattice[i].material;
						Object.assign(material.color, {r:0, g:0, b:0});
						material.opacity = 0;
						material.needsUpdate = true;
					}
					if (update) the.update();
				},

				noise: function(update = false) {
					for(var i=the.lattice.length; i-- > 0;) {
						var material = the.lattice[i].material;
						Object.assign(material.color, {
							r:Math.random(),
							g:Math.random(),
							b:Math.random(),
						});
						material.opacity = the.query.NOISE;
						material.needsUpdate = true;
					}
					if (update) the.update();
				},

				irgba: function(rgba) {
					if (rgba.i === undefined) {
						the.verbose("irgba: MISSING INDEX!");
						return;
					}
					var node     = the.lattice[rgba.i];
					var material = node.material;
					var color    = material.color;
					color.r = rgba.r;
					color.g = rgba.g;
					color.b = rgba.b;
					material.opacity = rgba.a;

					material.needsUpdate = true;
				},

				update: function() {
					renderLattice();
					the.controls.update();
				},

				// Convert coordinates to index
				xyz2i: function(xyz) {
					//var the = document.jlettvin.scrimmage;
					var value = 
						the.axis[0][xyz[0]+the.query.RX] +
						the.axis[1][xyz[1]+the.query.RY] +
						the.axis[2][xyz[2]+the.query.RZ];
					return (value);
				},

				// Convert index to coordinates
				i2xyz: function(i) { // ~~(foo%bar) gives the integer modulus
					//var the = document.jlettvin.scrimmage;
					var x = ~~(i % the.DX) - the.query.RX; i /= the.DX;
					var y = ~~(i % the.DY) - the.query.RY; i /= the.DY;
					var z = ~~(i     ) - the.query.RZ;
					return [x,y,z];
				},

				init: function(parms) {
					the.follow = parms.verbose;
					the.verbose("INIT:", parms);
					var flat;
					var xyz;
					switch(parms.normal) {
						case 0: flat = [1,2]; break;
						case 1: flat = [0,2]; break;
						case 2: flat = [0,1]; break;
					}
					var rgba = {r: parms.r, g: parms.g, b: parms.b, a: parms.a};
					var scale = 0.5 / parms.scrimmage.size;
					for (var i=parms.scrimmage.lattice.length; i-- > 0;) {
						var node = parms.scrimmage.lattice[i];
						// Normalize coordinates
						var xyz = [
							Math.trunc(scale * node.position.x),
							Math.trunc(scale * node.position.y),
							Math.trunc(scale * node.position.z),
						];
						//the.verbose("USE:", parms.fun);
						if (parms.scrimmage[parms.fun](
							xyz, rgba, parms.offset, parms.radius, parms.sigma,
							scale, parms.normal, flat))
						{
							rgba.i = i;
							//the.verbose("RGBA:", rgba);
							parms.scrimmage.irgba(rgba);
						}
					}
					the.update();
				},

				line: function(parms) {
					the.verbose("LINE:", parms);
					var rgba = parms.rgba;
					var x0 = parms.xyz[0][0]
					var y0 = parms.xyz[0][1]
					var z0 = parms.xyz[0][2]
					var x1 = parms.xyz[1][0]
					var y1 = parms.xyz[1][1]
					var z1 = parms.xyz[1][2]
					var dx = Math.abs(x1-x0), sx = x0<x1 ? 1 : -1;
					var dy = Math.abs(y1-y0), sy = y0<y1 ? 1 : -1;
					var dz = Math.abs(z1-z0), sz = z0<z1 ? 1 : -1;
					var dm = Math.max(dx, dy, dz), i = dm;
					x1 = y1 = z1 = dm/2; // error offset
					for(;;) {  // loop
						rgba.i = the.xyz2i([x0, y0, z0]);
						the.irgba(rgba);
						if (i-- == 0) break;
						x1 -= dx; if (x1 < 0) { x1 += dm; x0 += sx; } 
						y1 -= dy; if (y1 < 0) { y1 += dm; y0 += sy; } 
						z1 -= dz; if (z1 < 0) { z1 += dm; z0 += sz; } 
					}
				},

				pixel: function(pen, xyz, rgba) {
					// TODO add sign * 0.5 to each increment
					if (pen) {
						var irgba = {};
						// round away from 0
						var x = xyz[0]; x += (x < 0) ? -0.5 : +0.5;
						var y = xyz[1]; y += (y < 0) ? -0.5 : +0.5;
						var z = xyz[2]; z += (z < 0) ? -0.5 : +0.5;
						var xyzn = [~~x, ~~y, ~~z];
						Object.assign(irgba, rgba);
						irgba.i = the.xyz2i(xyzn);
						the.irgba(irgba);
					}
					//the.verbose("TRAIL:", pen, xyzn, irgba);
				},

				march: function(pen, count, xyz, ijk, rgba) {
					if (pen) {
						count += !count;
						the.verbose("MARCH:", count, ijk);
						while (count-- > 0) {
							xyz = [
								xyz[0]+ijk[0],
								xyz[1]+ijk[1],
								xyz[2]+ijk[2]
							];
							the.pixel(pen, xyz, rgba);
						}
					}
					return xyz;
				},

				turtle: function(stream) {
					the.verbose("STREAM["+stream+']');
					var count = 0;
					var pen = false;
					var xyz = [0,0,0];
					var ijk = [1,0,0];
					var rgba = {r:0, g:0, b:0, a:0};
					var VALUE = "([-+]?[0-9]+\.?[0-9]*)";
					var PAREN = new RegExp(
						"^\\(" + VALUE + "," + VALUE + "," + VALUE + "\\)");
					var BRACE = new RegExp(
						"^\\[" + VALUE + "," + VALUE + "," + VALUE + "\\]");
					var BRACK = new RegExp(
						"^\\{" + VALUE + "," + VALUE + "," + VALUE + "," + VALUE + "\\}");
					var LEGAL =  new RegExp("^([0-9AXYZF \*]+)");
					var result = null;
					do {
						result = stream.match(PAREN);
						if (result) {
							the.verbose("PAREN: ("+result[1]+")", result);
							stream = stream.substr(result[0].length);
							xyz[0] = Number(result[1]);
							xyz[1] = Number(result[2]);
							xyz[2] = Number(result[3]);
							the.verbose("XYZ:", xyz, result);
							continue;
						}
						result = stream.match(BRACE);
						if (result) {
							the.verbose("BRACE: ["+result[1]+"]", result);
							stream = stream.substr(result[0].length);
							ijk[0] = Number(result[1]);
							ijk[1] = Number(result[2]);
							ijk[2] = Number(result[3]);
							var norm = Math.sqrt(ijk[0]**2 + ijk[1]**2 + ijk[2]**2);
							if (norm == 0) { error("Vector length 0"); break; }
							ijk[0] /= norm;
							ijk[1] /= norm;
							ijk[2] /= norm;
							the.verbose("IJK:", ijk, result);
							continue;
						}
						result = stream.match(BRACK);
						if (result) {
							the.verbose("BRACK: {"+result[1]+"}", result);
							stream = stream.substr(result[0].length);
							rgba.r = Number(result[1]);
							rgba.g = Number(result[2]);
							rgba.b = Number(result[3]);
							rgba.a = Number(result[4]);
							the.verbose("RGBA:", rgba, result);
							continue;
						}
						//the.verbose("STR:", stream);
						result = stream.match(LEGAL);
						//the.verbose("RES:", result);
						if (result) {
							//the.verbose("LEGAL: '"+result[1]+"'", result);
							stream = stream.substr(result[0].length);
							var chs = result[1];
							var I   = chs.length;
							for (var i=0; i < I; ++i) {
								var ch = chs[i];
								switch(ch) {
									case '0':
									case '1': case '2': case '3':
									case '4': case '5': case '6':
									case '7': case '8': case '9':
										count = count * 10 + Number(ch);
										the.verbose("COUNT N:", count);
										break;
									case ' ':
										//the.verbose("UP");
										pen = false;
										count = 0;
										break; // pen up
									case '*':
										//the.verbose("DN");
										pen =  true;
										the.pixel(pen, xyz, rgba);
										count = 0;
										break;
									case 'F': // forward
										//the.verbose("FORWARD");
										xyz = the.march(pen, count, xyz, ijk, rgba);
										count = 0;
										break;
									case 'A': alongA(); count = 0; break;
									case 'X': alongX(); count = 0; break;
									case 'Y': alongY(); count = 0; break;
									case 'Z': alongZ(); count = 0; break;
									default:
										the.verbose("INVALID T '"+ch+"'");
										return;
										break;
								}
							}
							continue;
						}
						the.verbose("ILLEGAL: '"+stream+"'");
						break;
					} while (stream.length > 0); //result != null);
				}
			});

			var shapes = {

				plane: function(xyz, rgba, offset, radius, sigma, scale, normal, flat) {
					var z = xyz[normal];
					var upper = offset + sigma, lower = offset - sigma;
					z = Math.trunc(z);
					return (z <= upper && z >= lower);
				},

				cylinder: function(xyz, rgba, offset, radius, sigma, scale, normal, flat) {
					var x = xyz[flat[0]];
					var y = xyz[flat[1]];
					var r = Math.trunc(Math.sqrt(x**2 + y**2) + 0.5);
					var upper = radius + sigma, lower = radius - sigma;
					var ret = (r <= upper && r >= lower);
					//the.verbose("RET:", ret, radius, sigma);
					return ret;
				},

				sphere: function(xyz, rgba, offset, radius, sigma, scale, normal, flat) {
					var x = xyz[0];
					var y = xyz[1];
					var z = xyz[2];
					var r = Math.trunc(Math.sqrt(x**2 + y**2 + z**2) + 0.5);
					var upper = radius + sigma, lower = radius - sigma;
					return (r <= upper && r >= lower);
				},

				paraboloid: function(xyz, rgba, offset, radius, sigma, scale, normal, flat) {
					var x = xyz[flat[0]];
					var y = xyz[flat[1]];
					var z = xyz[normal];
					var r = Math.trunc(offset / 2 + (x**2 + y**2) / radius + 0.5);
					var upper = z + sigma, lower = z - sigma;
					return (r <= upper && r >= lower);
				},

				points: function(xyz, rgba, offset, radius, sigma, scale, normal, flat) {
					var ret = ((the.xyz2i(xyz) % offset) == 0);
					if (ret) {
						rgba.r = Math.random();
						rgba.g = Math.random();
						rgba.b = Math.random();
						rgba.a = Math.random();
					}
					return ret;
				},

			};
			Object.assign(the, shapes);
			the.shapes = Object.keys(shapes);
			//the.verbose("SHAPES:", the.shapes);

			// Radial axial node count of nodes beyond ctr
			//the.RX = the.query.RX;
			//the.RY = the.query.RY;
			//the.RZ = the.query.RZ;
			// Counts of nodes along each axis (including 1 extra for center)
			the.DX = 1 + 2 * the.query.RX;
			the.DY = 1 + 2 * the.query.RY;
			the.DZ = 1 + 2 * the.query.RZ;
			// Count of lattice vertices
			the.N  = the.DX * the.DY * the.DZ;
			// Use largest of radii to scale nodes to fit within window and axes
			the.shrink  = 1.0 / Math.max(the.query.RX, Math.max(the.query.RY, the.query.RZ));
			the.size    = the.shrink * the.edge;

			//var sizes         = []; // node cube size array
			the.axis          = [   // ndarray-style summable axes
				new Int32Array(the.DX),
				new Int32Array(the.DY),
				new Int32Array(the.DZ),
			];

			// Now instance global THREE resources
			the.scene         = new THREE.Scene();
			the.camera        = new THREE.PerspectiveCamera(10, the.winW / the.winH, 1, 1000);
			the.renderer      = new THREE.WebGLRenderer({alpha: true, antialias: true});
			the.controls      = new THREE.TrackballControls(the.camera);
			the.ambientLight  = new THREE.AmbientLight('#EEEEEE');
			the.axisHelper    = new THREE.AxesHelper(1.25);
			the.nodeObject    = new THREE.Object3D();
			the.bufGeom       = new THREE.BufferGeometry();
			the.allGeom       = new THREE.CubeGeometry(the.size, the.size, the.size);

			the.camera.position.set(the.Acamera, the.Acamera, the.Acamera);
			the.camera.lookAt(the.scene.position);

			// Fit doc element into window without scrollbars
			the.renderer.setSize(the.margin * the.winW, the.margin * the.winH);
			the.renderer.setPixelRatio(win.devicePixelRatio);

			// How the trackball controls work
			Object.assign(the.controls,{
				rotateSpeed          : 5.0,
				zoomSpeed            : 3.2,
				panSpeed             : 0.8,
				noZoom               : false,
				noPan                : true,
				staticMoving         : false,
				dynamicDampingFactor : 1.0,
				//dynamicDampingFactor : 0.2,
			});

			// When to update
			the.controls.addEventListener('change', renderLattice);

			// window resize
			win.addEventListener('resize', function () {
				the.winW          = win.innerWidth;
				the.winH          = win.innerHeight;
				the.camera.aspect = the.winW / the.winH;

				the.camera.updateProjectionMatrix();
				the.renderer.setSize(the.margin * the.winW, the.margin * the.winH);
				the.controls.handleResize();
				renderLattice();
			}, false);

			// Generate axes for conversion from (x,y,z) to global index
			var axis = the.axis;
			for(var k = 0; k <= the.DZ; ++k) { axis[2][k] = k * the.DY * the.DX; }
			for(var j = 0; j <= the.DY; ++j) { axis[1][j] = j          * the.DX; }
			for(var i = 0; i <= the.DX; ++i) { axis[0][i] = i                  ; }

			// Construct lattice and indexable lattice list
			the.bufGeom.fromGeometry(the.allGeom);
			for(var k = -the.query.RZ; k <= the.query.RZ; ++k) {
				var z = the.shrink * k;
				//var size = the.shrink * the.edge;
				var material = {transparent: true, opacity: 0} ;
				for(var j = -the.query.RY; j <= the.query.RY; ++j) {
					var y = the.shrink * j;
					for(var i = -the.query.RX; i <= the.query.RX; ++i) {
						//sizes.push(size);
						var x = the.shrink * i;
						var nodeMat = new THREE.MeshLambertMaterial(material);
						var node    = new THREE.Mesh(the.bufGeom, nodeMat);
						nodeMat.color.setRGB(0, 0, 0);
						node.position.set(x*the.range, y*the.range, z*the.range);
						the.nodeObject.add(node);
						the.lattice.push(node);
					}
				}
			}
			/*
			// After filling size array, make available as a geometry attribute
			bufGeom.addAttribute(
				'size',
				new THREE.Float32BufferAttribute(sizes, 1).setDynamic(true));
			 */


			// Observe node at (0,0,0) and make access simpler
			//the.verbose("NODE(0,0,0):", lattice[iCenter]);

			/*
				// Change the node size
	function isize(i, want) {
	// Returns the previous values
		var node = lattice[i];
		var geom = node.geometry;
		var sizes = geom.attributes.size.array;
		var old  = sizes[i];
	// TODO This doesn't work
		sizes[i] = want;
		geom.attributes.size.needsUpdate = true;
		return old
	}
			// Test control of node size
	isize(iCenter, 2);  // TODO This doesn't work (see isize)
			 */

			// Change the node color/opacity

			function animationLoop() {
				requestAnimationFrame(animationLoop);
				the.controls.update();
			}

			function renderLattice() {
				the.renderer.render(the.scene, the.camera);
			}

			// UNIT TESTS UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU
			the.unitTest = function() {
				the.verbose("UNIT TESTS");

				// Compare lists
				var listsEqual = function(a, b) {
					const ai = a.length, bi = b.length;
					if (ai != bi) return false;
					for (var i=ai; i>0; --i) if (a[i] != b[i]) return false;
					return true;
				};

				// Implement unit test review
				var test = function(unit, result, title) {
					const msg = ["[FAIL]", "[PASS]"];
					var PF = msg[~~result];
					the.verbose("UNIT(", unit, "): ", PF, result, title);
				}

				// 11111111111111111111111111111111111111111111111111111111111111
				var unit1 = function() {
					var theCenter = [0,0,0];
					var iCenter   = the.xyz2i(theCenter);
					var xyzCenter = the.i2xyz(iCenter);
					test( 1,
						listsEqual(theCenter, xyzCenter),
						"index <-> [x,y,z] cvt");
				}

				// 22222222222222222222222222222222222222222222222222222222222222
				var unit2 = function() {
					the.turtle(
						"(5,5,5)" +            // Where to start (implies ' ')
						"[1,2,3]" +            // Which direction to go
						"{0,0,0,1}" +          // What color/opacity to use
						"*F "                  // Turtle commands
					);
				}

				var units = [unit1]; //, unit2];     // List of tests

				for(var unit of units) unit();  // Execute tests in list
			}
			// UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU

			the.orthogonal = Math.sqrt(3 * (the.Acamera ** 2));

			the.scene.add(the.ambientLight);
			the.scene.add(the.axisHelper);
			the.scene.add(the.nodeObject);

			doc.body.appendChild(the.renderer.domElement);

			animationLoop();

			doc.jlettvin.scrimmage.the = the;
			return the;
		}
	}
})(document,window);
