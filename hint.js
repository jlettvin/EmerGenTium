"use strict";

//------------------------------------------------------------------------------
// PHP and shell style HEREDOC
function HEREDOC (f)
//------------------------------------------------------------------------------
{
	return f.toString().split('\n').slice(1,-1).join('\n').normalize('NFC');
} // HEREDOC

window.onload = (function (win, doc) {

	doc.EmerGen = doc.EmerGen || {};

	function hints (target="hoverHints") {

		var hint = {
			title: HEREDOC (function () {/*
This is a title.
It's used to announce the website.
*/}),
			manifold: HEREDOC (function () {/*
This is a canvas called manifold.
It's used to draw things.
*/}),
			subtitle: HEREDOC (function () {/*
This is a subtitle.
It is used to narrow the scope.
*/}),
		};

		var elements = doc.getElementsByClassName ("hint");
		var hintkeys = Object.keys (hint);
		for (var element of elements) {
			element.addEventListener ("mouseenter", function (event) {
				for (var key of event.target.classList) {
					var msg = hint[key];
					if (msg) {
						doc.getElementById (target).innerHTML = msg;
						break;
					}
				}
			});
			element.addEventListener ("mouseleave", function (event) {
				doc.getElementById (target).innerHTML = "";
			});
		}
	}

	doc.EmerGen.hints = hints;

}) (window, document);
