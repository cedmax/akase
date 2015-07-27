/*global define */

define(function() {
	'use strict';

	var api = {
		/* YOUR FANCY SANDBOXED API */
	};

	return function( notifier, moduleId ) {
		var registered = {};

		function sub( eventName, handler ) {
			if ( typeof registered[eventName] === 'undefined' ) {
				registered[eventName] = [];
			}
			registered[eventName].push( handler );
		}

		function subHandler( eventName, handler ) {
			if ( eventName instanceof Array ) {
				var len = eventName.length;

				for ( var i = 0; i < len; i++ ) {
					sub( eventName[i], handler );
				}
			} else {
				sub( eventName, handler );
			}
		}

		function pub( eventName, payload ) {
			if ( registered[eventName] instanceof Array ) {
				var handlers = [].concat( registered[eventName] ),
					len = handlers.length;

				for ( var i = 0; i < len; i++ ) {
					if ( handlers[i] ) {
						handlers[i]( payload );
					}
				}
			}
		}

		function notifyCore( eventName, payload ) {
			notifier( eventName, payload );
		}

		return {
			publish: notifyCore,
			handle: pub,
			subscribe: subHandler,
			api: api,
			module: moduleId
		};
	};
});
