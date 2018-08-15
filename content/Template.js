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
####### ####### #     # ######  #          #    ####### #######
   #    #       ##   ## #     # #         # #      #    #
   #    #       # # # # #     # #        #   #     #    #
   #    #####   #  #  # ######  #       #     #    #    #####
   #    #       #     # #       #       #######    #    #
   #    #       #     # #       #       #     #    #    #
   #    ####### #     # #       ####### #     #    #    #######
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

"use strict";
// emergent: a mesh of computer simulations for modeling emergent behavior

window.onload = (function (win, doc) {

	doc.jlettvin = doc.jlettvin || {};
	doc.jlettvin.emergent = doc.jlettvin.emergent || {};
	doc.jlettvin.emergent.content = doc.jlettvin.emergent.content || {};

	doc.jlettvin.emergent.content["Template"] = {
		American: HEREDOC (function () { /*
Hello.
Goodbye.
*/}),
		Texan: HEREDOC (function () { /*
Howdy.
Don't squat on your spurs.
*/}),
		English: HEREDOC (function () { /*
Cheers.
Cheerio.
*/}),
		Italian: HEREDOC (function () { /*
Pronto.
Ciao.
*/}),
	};

}) (window, document);

