
	function initialize(scrimmage, fun, value, sigma, rgba) {
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
			if (fun(xyz, value, sigma, scale)) {
				rgba.i = i;
				scrimmage.irgba(rgba);
			}
		}
	}

	function zplane(xyz, value, sigma, scale) {
		// TODO figure out why value == 1 is the same as value == 2
		//console.log("zplane:", xyz);
		var z = xyz[2];
		var upper = value + sigma, lower = value - sigma;
		z = Math.round(z + 0.5 * z / Math.abs(z));
		//console.log("zplane:", z);
		return (z <= upper && z >= lower);
	}

	function zcylinder(xyz, value, sigma, scale) {
		var x = xyz[0];
		var y = xyz[1];
		var r = Math.round(Math.sqrt(x**2 + y**2) + 0.5);
		var upper = value + sigma, lower = value - sigma;
		return (r <= upper && r >= lower);
	}

	function sphere(xyz, value, sigma, scale) {
		var x = xyz[0];
		var y = xyz[1];
		var z = xyz[2];
		var r = Math.round(Math.sqrt(x**2 + y**2 + z**2) + 0.5);
		var upper = value + sigma, lower = value - sigma;
		return (r <= upper && r >= lower);
	}

	function zparaboloid(xyz, value, sigma, scale) {
		var x = xyz[0];
		var y = xyz[1];
		var z = xyz[2];
		var r = Math.round((x**2 + y**2) / value + 0.5);
		var upper = z + sigma, lower = z - sigma;
		return (r <= upper && r >= lower);
	}

	var scrimmage1 = document.jlettvin.scrimmage.create({x:7, y:7, z:7});
	scrimmage1.unitTest();
	var iAnother = scrimmage1.xyz2i([0,0,1]);
	scrimmage1.irgba({i: iAnother, r:0, g:1, b:0, a:1, update: true});
	if (true) {
		scrimmage1.clear(true);
		var sigma = 0.5;
		var messages = document.getElementById("messages");
		messages.html = "ZPLANE(-2)";
		initialize(scrimmage1, zplane     , -2, sigma, {r:0, g:1, b:0, a:0.5});
		messages.html = "ZPLANE(2)";
		initialize(scrimmage1, zplane     ,  2, sigma, {r:0, g:0, b:1, a:0.5});
		messages.html = "ZCYLINDER(8)";
		initialize(scrimmage1, zcylinder  ,  5, sigma, {r:1, g:1, b:0, a:0.5});
		messages.html = "SPHERE(7)";
		initialize(scrimmage1, sphere     ,  6, sigma, {r:1, g:0, b:0, a:0.5});
		messages.html = "PARABOLOID(12)";
		initialize(scrimmage1, zparaboloid, 10, sigma, {r:1, g:1, b:1, a:0.5});
		messages.html = "INITIALIZED";
	}

	// TODO separate shared trackball to control each window independently
	//var scrimmage2 = document.jlettvin.scrimmage.create(2, 2, 2);

