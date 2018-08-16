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
 #####  ####### #     # ####### ######     #    #
#     # #       ##    # #       #     #   # #   #
#       #       # #   # #       #     #  #   #  #
#  #### #####   #  #  # #####   ######  #     # #
#     # #       #   # # #       #   #   ####### #
#     # #       #    ## #       #    #  #     # #
 #####  ####### #     # ####### #     # #     # #######
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

"use strict";
// emergent: a mesh of computer simulations for modeling emergent behavior

console.clear ();

var message = [];
document.EmerGen = document.EmerGen || {};
var data0 = document.EmerGen.data0 = document.EmerGen.data0 || {};

//------------------------------------------------------------------------------
// PHP and shell style HEREDOC
function HEREDOC (f)
//------------------------------------------------------------------------------
{
	return f.             // for the function provided
		toString().       // convert the source to a string
		split('\n').      // split the string into an array of lines
		slice(1,-1).      // remove the first and last lines
		join('\n').       // restore the rest to a string
		normalize('NFC'); // then perform Unicode Normalization Form C transform.
} // HEREDOC

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  ###   #     # ####### ######  #######  #####  ######  #######  #####  #######
   #    ##    #    #    #     # #     # #     # #     # #       #     #    #
   #    # #   #    #    #     # #     # #       #     # #       #          #
   #    #  #  #    #    ######  #     #  #####  ######  #####   #          #
   #    #   # #    #    #   #   #     #       # #       #       #          #
   #    #    ##    #    #    #  #     # #     # #       #       #     #    #
  ###   #     #    #    #     # #######  #####  #       #######  #####     #
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

//*******************************************************************************
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
} // introspect

//*******************************************************************************
function pushCall (msg) {
	message.push (msg);
	var say = document.getElementById ("problem").innerHTML = "PUSHED: "+msg;
	if (data0.talking) console.log (say);
};

//*******************************************************************************
function pullCall (msg) {
	var fault = false;
	var current = document.getElementById ("problem");
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
	document.getElementById ("problem").innerHTML = future;
	if (data0.talking) console.log (future);
	if (fault) exit (future);
};

//*******************************************************************************
function verbose () {
	if (data0.talking) {
		var I = arguments.length;
		var display = '';
		for (var i=0; i<I; ++i) { display += ' ' + arguments[i]; }
		console.log (display);
	}
};

