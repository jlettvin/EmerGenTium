"use strict";

(function(doc,win) {

	var scrimmage1 = document.jlettvin.scrimmage.create({x:7, y:7, z:7});
	scrimmage1.unitTest();
	var iAnother = scrimmage1.xyz2i([0,0,1]);
	scrimmage1.irgba({i: iAnother, r:0, g:1, b:0, a:1, update: true});
	if (true) {
		scrimmage1.clear(true);
		var init = scrimmage1.init;
		var parms = {scrimmage: scrimmage1, sigma: 0.5, a: 0.5, normal: 0}
		function update(vals) { Object.assign(parms, vals); return parms; }
		init(update({fun: "plane"      , value: -1, r:0, g: 1, b: 0}));
		init(update({fun: "plane"      , value:  2, r:0, g: 0, b: 1}));
		init(update({fun: "cylinder"   , value:  5, r:1, g: 1, b: 0}));
		init(update({fun: "sphere"     , value:  6, r:1, g: 0, b: 0}));
		init(update({fun: "paraboloid" , value: 10, r:1, g: 1, b: 1}));
	}

	// TODO separate shared trackball to control each window independently
	//var scrimmage2 = document.jlettvin.scrimmage.create(2, 2, 2);


})(document,window);
