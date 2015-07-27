require([ 'sandbox' ], function( Sandbox ) {
	'use strict';

	QUnit.start();
	var sandbox;

	var notifier = function( event, payload ) {
		sandbox.handle( event, payload );
	};

	sandbox = new Sandbox( notifier, 'moduleName' );

	test( 'notify', 1, function() {
		var a = 0;

		sandbox.subscribe( 'testNotify', function() {
			a = 2;
		});

		sandbox.publish( 'testNotify' );

		equal( a, 2, 'notification works' );
	});

	test( 'notify with a payload', 1, function() {
		var a = 0 ;

		sandbox.subscribe( 'testNotify', function( payload ) {
			a = payload.test;
		});
		sandbox.publish( 'testNotify', { test: 1 });

		equal( a, 1, 'payload rocks' );
	});

	test( 'multiple notifications', 2, function() {
		var a = 0, b = 0;

		sandbox.subscribe( 'testNotify', function( payload ) {
			a = payload.test;
		});

		sandbox.subscribe( 'testNotify' );

		sandbox.subscribe( 'testNotify', function( payload ) {
			b = payload.test;
		});

		sandbox.publish( 'testNotify', { test: 1 });

		equal( a, 1, 'payload rocks' );
		equal( b, 1, 'payload rocks for both registration' );
	});

	test( 'multiple notifications', 9, function() {
		var a = 0, b = 0, c = 0;

		sandbox.subscribe( 'testNotify', function( payload ) {
			a = payload.test;
			sandbox.subscribe( 'testNotify', function( payload ) {
				if ( b < 2 ) {
					b = payload.test;
				} else {
					c = payload.test;
				}
			});
		});

		sandbox.publish( 'testNotify', { test: 1 });

		equal( a, 1, 'first notification' );
		equal( b, 0, 'seems' );
		equal( c, 0, 'to work' );

		sandbox.publish( 'testNotify', { test: 2 });

		equal( a, 2, 'second notification' );
		equal( b, 2, 'is more' );
		equal( c, 0, 'tricky' );

		sandbox.publish( 'testNotify', { test: 3 });

		equal( a, 3, 'third notification' );
		equal( b, 2, 'really' );
		equal( c, 3, 'rocks' );
	});

	test( 'test array of subscription', 1, function() {
		var a = 0;

		sandbox.subscribe([ 'testNotify1', 'testNotify2' ], function() {
			a++;
		});

		sandbox.publish( 'testNotify1' );
		sandbox.publish( 'testNotify2' );

		equal( a, 2, 'notification works' );
	});

});
