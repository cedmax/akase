
define([ 'sandbox' ], function( Sandbox ) {
	'use strict';
	var r = require;

	var getConfig = function( moduleId ) {
		return window.akase && window.akase.config && window.akase.config[moduleId];
	};

	var events = {}, modules = {};

	var errorHandling = function( e, moduleId, eventId ) {
		/*global console*/
		console.log( 'module: ' + moduleId + ', event: ' + ( eventId || 'init' ) + ', message: ' + e.message );
	};

	var extend = function( destination, source ) {
		destination = destination || {};
		source = source || {};

		for ( var property in source ) {
			if ( source.hasOwnProperty( property ) ) {
				destination[property] = source[property];
			}
		}

		return destination;
	};

	var startModule = function( moduleId ) {
		var start = function( module ) {
			modules[moduleId].sandbox = new Sandbox( notify, moduleId );
			var instance = modules[moduleId].instance = module( modules[moduleId].sandbox );
			var c = ( modules[moduleId].config || {});
			try {
				instance.init.call( instance, c );
			} catch ( e ) {
				errorHandling( e, moduleId, 'init' );
			}
		};

		start( r( moduleId ) );
	};

	var startModuleOnTrigger = function( eventId, payload ) {
		var modulesToStart;
		if ( ( modulesToStart = events[eventId] ) ) {
			for ( var i = 0, len = modulesToStart.length; i < len; i++ ) {
				var moduleId = modulesToStart[i];

				if ( modules[moduleId].waitForConfig ) {
					modules[moduleId].triggerEvent = payload;
				} else {
					modules[moduleId].config = extend( modules[moduleId].config, payload );
					startModule( moduleId );
				}
			}
		}
	};

	var notify = function( eventId, payload ) {
		if ( !eventId ) { return; }
		for ( var moduleId in modules ) {
			if ( modules.hasOwnProperty( moduleId ) && modules[moduleId].instance ) {
				try {
					modules[moduleId].sandbox.handle( eventId, payload );
				} catch ( e ) {
					errorHandling( e, moduleId, eventId );
				}
			}
		}
		startModuleOnTrigger( eventId, payload );
	};

	var waitForConfig = function( moduleId ) {
		var extendAndCheckEvents = function( config ) {
			modules[moduleId].config = extend( config, modules[moduleId].config );
			modules[moduleId].waitForConfig = false;
			if ( typeof modules[moduleId].triggerEvent !== 'string' ) {
				modules[moduleId].config = extend( modules[moduleId].config, modules[moduleId].triggerEvent );
				startModule( moduleId );
			}
		};

		if ( !getConfig( moduleId ) ) {
			var start = new Date().getTime(),
				condition = false,
				interval = setInterval(function() {
					if ( ( new Date().getTime() - start < 5000 ) && !condition ) {
						condition = getConfig( moduleId );
					} else {
						if ( condition ) {
							extendAndCheckEvents( condition );
						}
						errorHandling({ message: 'Configuration timeout' }, moduleId, 'start' );
						clearInterval( interval );
					}
				}, 100 );
		} else {
			extendAndCheckEvents( getConfig( moduleId ) );
		}
	};

	var proxyStartModule = function( moduleId ) {
		var evt;
		if ( ( evt = modules[moduleId].triggerEvent ) ) {
			if ( !events[evt] ) {
				events[evt] = [];
			}
			events[evt].push( moduleId );
		}

		if ( modules[moduleId].waitForConfig ) {
			waitForConfig( moduleId );
		} else if ( !evt ) {
			startModule( moduleId );
		}
	};

	var createModule = function( moduleId, c ) {
		modules[moduleId] = {
			config: c && c.config,
			triggerEvent: c && c.event,
			instance: null,
			sandbox: null,
			waitForConfig: c && c.waitForConfig || false
		};
	};

	var destroyModule = function( moduleId ) {
		var instance = modules[moduleId] && modules[moduleId].instance;
		if ( instance && instance.destroy ) {
			instance.destroy();
		}
		delete modules[moduleId];
	};

	return {
		modules: modules,
		notify: notify,
		start: function( moduleId, c ) {
			if ( !moduleId ) {return;}

			destroyModule( moduleId );
			createModule( moduleId, c );
			proxyStartModule( moduleId );
		},
		stop: function( moduleIds ) {
			if ( !( moduleIds instanceof Array ) ) {
				moduleIds = [ moduleIds ];
			}

			for ( var i = 0, l = moduleIds.length; i < l; i++ ) {
				var moduleId = moduleIds[i];
				if ( !moduleId ) { continue; }
				destroyModule( moduleId );
				r.undef( moduleId );
			}
		}
	};
});
