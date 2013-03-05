require(['akase'], function(core){
	'use strict';

	QUnit.start();

	module('core', {
		tearDown: function(){
			core.stop('name');
			core.stop('name1');
			core.stop('name2');
			core.stop('name3');
		}
	});

	test('Core Interface', 1, function() {
		core.start();
		core.notify();
		core.stop();
		equal(1, 1, 'all interface are existing');
	});

	asyncTest('Core register function registers module to the core object, starts executes the init', 2, function() {

		var called = false;

		define('name', function(){
			return function(){
				return {
					init: function(){
						called=true;
					}
				};
			};
		});

		ok(!called, 'register does not call init function');

		require(['name'], function(){
			core.start('name');
			ok(called, 'start function calls init function');
			start();
		});

	});

	asyncTest('stopping a module should call the destroy method', 2, function() {
		var active = false;

		define('name', function(){
			return function(){
				return {
					init: function(){
						active=true;
					},
					destroy: function() {
						active=false;
					}
				};
			};
		});

		require(['name'], function(){
			core.start('name');
			ok(active, 'module started');

			core.stop('name');
			ok(!active, 'module stopped');
			start();
		});
	});

	asyncTest('starting a module already started should call the destroy method', 4, function() {
		var init = 0;
		var destroy = 0;

		define('name', function(){
			return function(){
				return {
					init: function(){
						init++;
					},
					destroy: function() {
						destroy++;
					}
				};
			};
		});

		require(['name'], function(){
			core.start('name');
			equal(init, 1, 'module started');
			equal(destroy, 0, 'module started');

			core.start('name');
			equal(init, 2, 'module started');
			equal(destroy, 1, 'module started');
			start();
		});
	});


	asyncTest('stopping a module not started should not call destroy method', 1, function() {

		var called = false;

		define('name', function(){
			return function(){
				return {
					init: function(){},
					destroy: function() {
						called=true;
					}
				};
			};
		});

		require(['name'], function(){
			core.stop('name');
			ok(!called, 'destroy has not been called');
			start();
		});

	});

	asyncTest('stopping a module without destroy method should not break', 1, function() {
		define('name', function(){
			return function(){
				return {
					init: function(){}
				};
			};
		});

		require(['name'], function(){
			core.start('name');
			core.stop('name');
			ok(true, 'everything works FTW!');
			start();
		});
	});

	asyncTest('stopping a module should undefine it', 2, function() {
		define('name', function(){
			return function(){
				return {
					init: function(){}
				};
			};
		});

		require(['name'], function(){
			core.start('name');
			ok(require.defined('name'), 'module is defined');

			core.stop('name');
			ok(!require.defined('name'), 'stopped module is not defined anymore');

			start();
		});
	});

	asyncTest('sandbox should be available in a newly registered module', 1, function() {

		define('name', function(){
			return function(sandbox){
				return {
					init: function(){
						ok(sandbox, 'module has access to sandbox');
					}
				};
			};
		});

		require(['name'], function(){
			core.start('name');
			start();
		});
	});

	asyncTest('modules should not communicate if a module is stopped', 1, function() {

		define('name1', function(){
			return function(sandbox){
				return {
					init: function(){
						sandbox.subscribe('Hello from name2', function(data) {
							ok(data, 'Event has been received');
						});
					}
				};
			};
		});

		define('name2', function(){
			return function(sandbox){
				return {
					init: function(){
						sandbox.publish('Hello from name2', true);
						ok(true, 'Everything went just fine');
					}
				};
			};
		});

		require(['name1', 'name2'], function(){
			core.start('name1');
			core.stop('name1');
			core.start('name2');
			start();
		});

	});

	asyncTest('modules should be able to communicate with each other', 1, function() {

		define('name1', function(){
			return function(sandbox){
				return {
					init: function(){
						sandbox.subscribe('Hello from name2', function(data) {
							ok(data, 'Event has been received');
						});
					}
				};
			};
		});

		define('name2', function(){
			return function(sandbox){
				return {
					init: function(){
						sandbox.publish('Hello from name2', true);
					}
				};
			};
		});

		require(['name1', 'name2'], function(){
			core.start('name1');
			core.start('name2');
			start();
		});

	});

	asyncTest('notification should be working on the core', 1, function() {

		define('name1', function(){
			return function(sandbox){
				return {
					init: function(){
						sandbox.subscribe('Hello from name2', function(data) {
							ok(data, 'Event has been received');
						});
					}
				};
			};
		});
		
		require(['name1'], function(){
			core.start('name1');
			core.notify('Hello from name2', true);
			start();
		});

	});

	asyncTest('module should have access to module configuration', 1, function() {
		define('name', function(){
			return function(){
				return {
					init: function(config){
						equal(config.some, 'thing', 'We have accessed the app configuration');
					}
				};
			};
		});

		require(['name'], function(){
			core.start('name', {config: {
				some: 'thing'
			}});
			start();
		});

	});

	asyncTest('module configuration should be able to be injected during start', 1, function() {
		define('name', function(){
			return function(){
				return {
					init: function(config){
						equal(config.hello, 'world', 'We have access to module specific configuration');
					}
				};
			};
		});

		require(['name'], function(){
			core.start('name', { config: { hello : 'world' }});
			start();
		});
	});

	asyncTest('startWhen should load a module when a specific event is published', 2, function(){
		define('name3', function(){
			return function(){
				return {
					init: function(c){
						ok(c.prop1, 'module loaded');
					}
				};
			};
		});

		core.start('name3', {config: { prop1: true }, event: 'event_Name'});

		define('name4', function(){
			return function(){
				return {
					init: function(c){
						ok(!c.prop1, 'module loaded');
					}
				};
			};
		});

		core.start('name4', { config: { prop1: false }, event: 'another_event_Name'});

		define('name5', function(){
			return function(){
				return {
					init: function(c){
						ok(c.prop1, 'module loaded');
						start();
					}
				};
			};
		});

		core.start('name5', { config: { prop1: true }, event: 'another_event_Name'});
		core.notify('another_event_Name');
	});

});
