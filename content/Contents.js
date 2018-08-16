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
 #####  ####### #     # ####### ####### #     # #######  #####
#     # #     # ##    #    #    #       ##    #    #    #     #
#       #     # # #   #    #    #       # #   #    #    #
#       #     # #  #  #    #    #####   #  #  #    #     #####
#       #     # #   # #    #    #       #   # #    #          #
#     # #     # #    ##    #    #       #    ##    #    #     #
 #####  ####### #     #    #    ####### #     #    #     #####
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

"use strict";
// emergent: a mesh of computer simulations for modeling emergent behavior

window.onload = (function (win, doc) {

	console.log ("Initialize content");
	doc.EmerGen = doc.EmerGen || {};
	var language = doc.EmerGen.data0.content.language;
	var contents = doc.EmerGen.content = doc.EmerGen.content || {};
	for (var key in contents) {
		console.log ("content key", key);
		var content = contents[key][language];
		if (content) {
			console.log ("Produce button for", language, key);
			// produce buttons to display contents in hint arena
			// both when hovered and as a default when clicked
			// by putting the message in data0.content.clicked
		}
	}

}) (window, document);

