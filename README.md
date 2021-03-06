# ākāśe [![Build Status](https://travis-ci.org/cedmax/akase.png?branch=master)](https://travis-ci.org/cedmax/akase)

ākāśe (sanskrit for "in the sky"/"to the sky") is a small decoupled, event-driven architecture framework.
It is based on Nicholas Zakas [Scalable Javascript Application Architecture](http://www.slideshare.net/nzakas/scalable-javascript-application-architecture-2012) and [RequireJS and AMD](http://www.slideshare.net/iivanoo/requirejs-12937421).

## Concepts
The concepts of the framework are well represented by the two presentations linked above.
Basically everything gets sandboxed and everyone is happy. ([play with it](https://github.com/cedmax/akase-playground))

## Modules & Sandbox
The modules you will have to create are proper AMD modules with this skeleton

```js
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
```

As in the example, every module has access to the sandbox, which is supposed to be the only external api accessible, but no one forces you not to require a framework (watch out that you are coupling your code with that specific framework, just saying)

```js
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
```

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

- namespace your own Api

        sandbox.api


## Setup & Core
Everything gets started in a proper RequireJS way

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
        - event _String_ - an event that drives the module start
        - waitForConfig _Boolean_ - (added in v1.1.0) if true the module would wait until a global object `akase.config.moduleName` is available and will extend the inlined config with it. Useful if you need dynamic data from the page (example below).<br/><br/>

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

```js
require(['akase', 'module1', 'module2', 'module3', 'module4'], function(core) {

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
```

**Wait for config** (*added in v1.1.0*)
```js
    core.start("module4", { waitForConfig: true})
```
In this case the core would wait for a global configuration on the global `akase` object before starting `module4`. 
Very useful if you need to pass dynamic data from the page rendered by the server to the application.

```js
akase.config['module4'] = {
    productId: 'AGS1241S'
}
```
The core is re-checking for 5 seconds and then give up, no error thrown.

<br/><br/>
In order to have RequireJS proper loading modules you'd read [RequireJS documentation](http://www.requirejs.org/) to configure the paths

#Thanks
To all the guys that helped me creating ākāśe with their inspiration or making me copy their ideas: [Marco Pracucci](https://github.com/pracucci), [Rocco Zanni](https://github.com/roccozanni), [Luca Lischetti](https://github.com/sirlisko), [Rocco Curcio](https://github.com/jsDotCr)
