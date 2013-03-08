/*global require, define */

define(['sandbox'], function(Sandbox) {
	'use strict';
	var r = require;

	var events = {}, modules = {};


	var extend = function(destination, source){
		destination = destination || {};

		for (var property in source) {
			if (source.hasOwnProperty(property)){
				destination[property] = source[property];
			}
		}

		return destination;
	};

	var startModule = function(moduleId){
		var start = function(module) {
			modules[moduleId].sandbox = new Sandbox(notify, moduleId);
			var instance = modules[moduleId].instance = module(modules[moduleId].sandbox);
			var c = (modules[moduleId].config || {});
			instance.init.call(instance, c);
		};

		if (r.defined(moduleId)) {
			start(r(moduleId));
		} else {
			r([moduleId], function(module) {
				start(module);
			});
		}
	};

	var startModuleOnTrigger = function(eventId, payload) {
		var modulesToStart;
		if ((modulesToStart = events[eventId])) {
			for (var i=0, len = modulesToStart.length; i<len; i++) {
				modules[modulesToStart[i]].config = extend(modules[modulesToStart[i]].config, payload);
				startModule(modulesToStart[i]);
			}
			delete events[eventId];
		}
	};

	var notify = function(eventId, payload){
		if (!eventId){ return; }

		for (var moduleId in modules) {
			if (modules.hasOwnProperty(moduleId) && modules[moduleId].instance) {
				modules[moduleId].sandbox.handle(eventId, payload);
			}
		}

		startModuleOnTrigger(eventId, payload);
	};

	var destroyModule = function(moduleId){
		var instance = modules[moduleId] && modules[moduleId].instance;
		if (instance && instance.destroy){
			instance.destroy();
		}
		delete modules[moduleId];
	};

	var proxyStartModule = function(moduleId, c){
		modules[moduleId] = {
			config: c && c.config,
			triggerEvent: c && c.event,
			instance: null,
			sandbox: null
		};

		var evt;
		if ((evt = modules[moduleId].triggerEvent)){
			if (!events[evt]) {
				events[evt] = [];
			}
			events[evt].push(moduleId);
		} else {
			startModule(moduleId);
		}
	};

	return {
		notify: notify,
		start: function (moduleId, c) {
			if (!moduleId) { return; }

			destroyModule(moduleId);
			proxyStartModule(moduleId, c);
		},
		stop: function (moduleId) {
			if (!moduleId) { return; }

			destroyModule(moduleId);
			r.undef(moduleId);
		}
	};
});
