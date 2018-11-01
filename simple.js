"use strict";

(function(doc,win) {
	// TODO
	// isize doesn't work, but perhaps we can do this all with opacity.

	doc.jlettvin = doc.jlettvin || {};
	doc.jlettvin.scrimmage = doc.jlettvin.scrimmage || {
		create: function(arg) {

			var Rx, Ry, Rz;

			if (arg.length == undefined) { Rx = arg.x; Ry = arg.y; Rz = arg.z; }
			else                      { Rx = arg[0]; Ry = arg[1]; Rz = arg[2]; }

			var the = { // Data structure local to this instance
				winW    : win.innerWidth,
				winH    : win.innerHeight,
				Acamera : 6.5,         // Orthogonal camera position distances
				range   : 0.5,         // Scalars help nodes fit within window
				edge    : 0.25,        // Should be range/2 to maintain gap
				margin  : 0.9,         // Fit visualization to window
				lattice : [],          // linear array of node objects
				carrier : [],

				clear: function(update = false) {
					for(var i=the.lattice.length; i-- > 0;) {
						var material = the.lattice[i].material;
						Object.assign(material.color, {r:0, g:0, b:0});
						material.opacity = 0;
						material.needsUpdate = true;
					}
					if (update) {
						renderLattice();
						the.controls.update();
					}
				},

				irgba: function(rgba) {
					// Returns the previous values
					if (rgba.i === "undefined") {
						console.log("irgba: MISSING INDEX!");
						return [0,0,0,0];
					}
					var i        = rgba.i;
					var update   = false;
					var colors   = false;
					var node     = the.lattice[i];
					var material = node.material;
					var color    = material.color;
					var opacity  = material.opacity;
					var old      = [color.r, color.b, color.b, opacity];

					for (var key in rgba) {
						switch(key) {
							case 'r': color.r = rgba.r; colors = true; break;
							case 'g': color.g = rgba.g; colors = true; break;
							case 'b': color.b = rgba.b; colors = true; break;
							case 'a': material.opacity = rgba.a; colors = true; break;
							case 'update': update = true; break;
							default: break;
						};
					}

					material.needsUpdate = true;

					update && the.update();

					return old;
				},

				update: function() {
					renderLattice();
					the.controls.update();
				},

				// Convert coordinates to index
				xyz2i: function(xyz) {
					//var the = document.jlettvin.scrimmage;
					var value = 
						the.axis[0][xyz[0]+the.RX] +
						the.axis[1][xyz[1]+the.RY] +
						the.axis[2][xyz[2]+the.RZ];
					return (value);
				},

				// Convert index to coordinates
				i2xyz: function(i) { // ~~(foo%bar) gives the integer modulus
					//var the = document.jlettvin.scrimmage;
					var x = ~~(i % the.DX) - the.RX; i /= the.DX;
					var y = ~~(i % the.DY) - the.RY; i /= the.DY;
					var z = ~~(i     ) - the.RZ;
					return [x,y,z];
				},

				initialize: function(scrimmage, fun, value, sigma, rgba, normal) {
					// reimplement (merge) into init
					// reimplement (avoid loops)
					var flat;
					switch(normal) {
						case 0: flat = [1,2]; break;
						case 1: flat = [0,2]; break;
						case 2: flat = [0,1]; break;
					}
					rgba.update = false;
					for (var i=scrimmage.lattice.length; i-- > 0;) {
						var node = scrimmage.lattice[i];
						var scale = 0.5 / scrimmage.size;
						// Normalize coordinates
						var xyz = [
							Math.round(scale * node.position.x),
							Math.round(scale * node.position.y),
							Math.round(scale * node.position.z),
						];
						if (scrimmage[fun](xyz, value, sigma, scale, normal, flat)) {
							rgba.i = i;
							scrimmage.irgba(rgba);
						}
					}
				},

				init: function(parms) {
					if (parms.verbose == true) console.log("INIT:", parms);
					the.initialize(
						parms.scrimmage,
						parms.fun,
						parms.value,
						parms.sigma,
						{r: parms.r, g: parms.g, b: parms.b, a: parms.a},
						parms.normal,
					);
				},

				plane: function(xyz, value, sigma, scale, normal, flat) {
					// TODO figure out why value == 1 is the same as value == 2
					//console.log("zplane:", xyz);
					var z = xyz[normal];
					var upper = value + sigma, lower = value - sigma;
					z = Math.round(z + 0.5 * z / Math.abs(z));
					//console.log("zplane:", z);
					return (z <= upper && z >= lower);
				},

				cylinder: function(xyz, value, sigma, scale, normal, flat) {
					var x = xyz[flat[0]];
					var y = xyz[flat[1]];
					var r = Math.round(Math.sqrt(x**2 + y**2) + 0.5);
					var upper = value + sigma, lower = value - sigma;
					return (r <= upper && r >= lower);
				},

				sphere: function(xyz, value, sigma, scale, normal, flat) {
					var x = xyz[0];
					var y = xyz[1];
					var z = xyz[2];
					var r = Math.round(Math.sqrt(x**2 + y**2 + z**2) + 0.5);
					var upper = value + sigma, lower = value - sigma;
					return (r <= upper && r >= lower);
				},

				paraboloid: function(xyz, value, sigma, scale, normal, flat) {
					var x = xyz[flat[0]];
					var y = xyz[flat[1]];
					var z = xyz[normal];
					var r = Math.round((x**2 + y**2) / value + 0.5);
					var upper = z + sigma, lower = z - sigma;
					return (r <= upper && r >= lower);
				}
			};

			// Radial axial node count of nodes beyond ctr
			the.RX = Rx;
			the.RY = Ry;
			the.RZ = Rz;
			// Counts of nodes along each axis (including 1 extra for center)
			the.DX = 1 + 2 * the.RX;
			the.DY = 1 + 2 * the.RY;
			the.DZ = 1 + 2 * the.RZ;
			// Count of lattice vertices
			the.N  = the.DX * the.DY * the.DZ;
			// Use largest of radii to scale nodes to fit within window and axes
			the.shrink  = 1.0 / Math.max(the.RX, Math.max(the.RY, the.RZ));
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
				dynamicDampingFactor : 0.2,
			});

			// When to update
			the.controls.addEventListener('change', renderLattice);

			// window resize
			win.addEventListener('resize', function () {
				the.winW          = win.innerWidth;
				the.winH          = win.innerHeight;
				the.camera.aspect = the.winW / the.winH;

				the.camera.updateProjectionMatrix();
				the.renderer.setSize(the.winW*the.shrink, the.winH*the.shrink);
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
			for(var k = -the.RZ; k <= the.RZ; ++k) {
				var z = the.shrink * k;
				//var size = the.shrink * the.edge;
				var material = {transparent: true, opacity: 0} ;
				for(var j = -the.RY; j <= the.RY; ++j) {
					var y = the.shrink * j;
					for(var i = -the.RX; i <= the.RX; ++i) {
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
			//console.log("NODE(0,0,0):", lattice[iCenter]);

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
				console.log("UNIT TESTS");

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
					console.log(PF, result, "UNIT(", unit, "): ", title);
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

				var units = [unit1];            // List of tests

				for(var unit of units) unit();  // Execute tests in list
			}
			// UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU

			the.scene.add(the.ambientLight);
			the.scene.add(the.axisHelper);
			the.scene.add(the.nodeObject);

			the.irgba({i: the.xyz2i([0,0,0]), r:1, g:0, b:0, a:1});  // add red cube

			doc.body.appendChild(the.renderer.domElement);

			animationLoop();

			return the;
		}
	}
})(document,window);