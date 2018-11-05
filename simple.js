"use strict";




/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function shapeFunction() {
    document.getElementById("shapeDropdown").classList.toggle("show");
}
function sizeFunction() {
    document.getElementById("sizeDropdown").classList.toggle("show");
}
function noiseFunction() {
    document.getElementById("noiseDropdown").classList.toggle("show");
}

(function(doc,win) {
	// TODO
	// isize doesn't work, but perhaps we can do this all with opacity.

	// Close the dropdown if the user clicks outside of it
	win.onclick = function(event) {
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
				//console.log("GETQUERY:", the.query);
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
				//console.log("SETQUERY:", the.query);
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

			//console.log("OLD QUERY:", the.oldQuery);
			getQuery();
			//console.log("KEY QUERY:", the.query);
			setQuery();
			//console.log("NEW QUERY:", the.newQuery);

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
						console.log("irgba: MISSING INDEX!");
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
					if (parms.verbose == true) console.log("INIT:", parms);
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
						//console.log("USE:", parms.fun);
						if (parms.scrimmage[parms.fun](
							xyz, rgba, parms.offset, parms.radius, parms.sigma,
							scale, parms.normal, flat))
						{
							rgba.i = i;
							//console.log("RGBA:", rgba);
							parms.scrimmage.irgba(rgba);
						}
					}
					the.update();
				},

				line: function(parms) {

					/*
void plotLine3d(int x0, int y0, int z0, int x1, int y1, int z1)
{
   int dx = abs(x1-x0), sx = x0<x1 ? 1 : -1;
   int dy = abs(y1-y0), sy = y0<y1 ? 1 : -1; 
   int dz = abs(z1-z0), sz = z0<z1 ? 1 : -1; 
   int dm = max(dx,dy,dz), i = dm; // maximum difference
   x1 = y1 = z1 = dm/2; // error offset
 
   for(;;) {  // loop
      setPixel(x0,y0,z0);
      if (i-- == 0) break;
      x1 -= dx; if (x1 < 0) { x1 += dm; x0 += sx; } 
      y1 -= dy; if (y1 < 0) { y1 += dm; y0 += sy; } 
      z1 -= dz; if (z1 < 0) { z1 += dm; z0 += sz; } 
   }
}
*/
					console.log("LINE:", parms);
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
					//console.log("RET:", ret, radius, sigma);
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
			//console.log("SHAPES:", the.shapes);

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
					console.log("UNIT(", unit, "): ", PF, result, title);
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

			doc.body.appendChild(the.renderer.domElement);

			animationLoop();

			return the;
		}
	}
})(document,window);
