# ākāśe v.0.1

ākāśe (sanskrit for "in the sky"/"to the sky") is a small decoupled, event-driven architecture framework.  
It is based on Nicholas Zakas [Scalable Javascript Application Architecture](http://www.slideshare.net/nzakas/scalable-javascript-application-architecture-2012) and [RequireJS and AMD](http://www.slideshare.net/iivanoo/requirejs-12937421).

## Concepts
The concepts of the framework are well represented by the two presentations linked above.  
Basically everything gets sandboxed and everyone is happy.


## Modules & Sandbox
The modules you will have to create are proper AMD modules with this skeleton


    define(function(){
    	'use strict';

    	return function(sandbox){

        	//the logic of the module
			function doSomething(){
				//do something
			}

            return {
                init:function(config){
                    //the initialization code
                    sandbox.subscribe('myEventName', doSomething)
                },
                destroy: function(){
            	    //optional destroy method, useful to remove callbacks from DOM event
                }
            };
        };
    });

As in the example, every module has access to the sandbox, which is supposed to be the only external api accessible, but no one forces you not to require a framework (watch out that you are coupling your code with that specific framework, just saying)

    define(['jQuery'], function($){
        'use strict';

        return function(sandbox){

			function doSomething(){
				//do something
			}

            return {
                init:function(config){
                	$('#myElm').on('click', doSomething);
                }
            };
        };
    });

The sandbox API should be defined/extended by you, the only API available out of the box allows to:

- access the module name

		sandbox.module 	

- publish an event through the whole architecture  

		sandbox.publish(eventName, payload)
	
	Parameters: 
	- eventName _String_ - the name of the event 
	- payload _Object_ - the optional payload to be sent to the subscribing modules<br/><br/>

- subscribe to an event

		sandbox.subscribe(eventName(s), callback)
	
	Parameters: 
	- eventName(s) _String|Array[String]_ - the event(s) the module will subscribe to
	- callback _Function_ - the callback to be invoked (the payload will be injected as argument)<br/><br/>

- renders a mustache template (Mustache required)
		
		sandbox.api.render(template, data)

	Parameters: 
	- template _String_ - the template as an inlined string
	- data _Object_ - the data to build the template with<br/><br/>


## Setup & Core
Everything gets started in a proper requireJS way

	<script data-main="main.js" src="/assets/javascripts/require.js"></script>


The main file should require ākāśe core lib in order to take advantage of the framework

	require(['akase'], function(core) {
		//[...]
	});


the core exposes 3 methods in order to:
	
- load and initialize a module

		start(moduleId, options)

	Parameters:
	- moduleId _String_ - the name of the module
	- options _Object_ - 2 properties allowed:
		- config _Object_ - a configuration object to be injected in the init of the module
		- event _String_ - an event that drives the module start<br/><br/>

- stop and undefine the module (next start will reload the resource)
	
		stop(moduleId)

	Parameters:
	- moduleId (String) - the name of the module<br/><br/>

- broadcast events into the architecture, it works as the sandbox.publish
	notify(event, payload)
	
	Parameters: 
	- eventName _String_ - the name of the event 
	- payload _Object_ - the optional payload to be sent to the subscribing modules<br/><br/>


example of a proper main.js

	require(['akase'], function(core) {

		var audio  = document.createElement("audio"),
		canPlayMP3 = (typeof audio.canPlayType === "function" && audio.canPlayType("audio/mpeg") !== "");

		core.start("module1", {
			config: {
				hasMp3Support: canPlayMP3
			}
		});

		core.start("module2");
		core.start("module3", { event: "audio:stop" });

	});

In order to have RequireJS properl loading modules you'd read [requireJS documentation](http://www.requirejs.org/) to configure the paths

