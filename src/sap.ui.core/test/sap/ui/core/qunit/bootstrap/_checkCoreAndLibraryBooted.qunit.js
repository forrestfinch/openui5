/*global QUnit, jQuery */
(function() {
	"use strict";

	QUnit.test("Check Core Functionality", function(assert) {
		/* check that SAPUI5 has been loaded */
		assert.ok(jQuery, "jQuery has been loaded");
		assert.ok(jQuery.sap, "jQuery.sap namespace exists");
		assert.ok(window.sap, "sap namespace exists");
		assert.ok(sap.ui, "sap.ui namespace exists");
		assert.ok(typeof sap.ui.getCore === "function", "sap.ui.getCore exists");
		assert.ok(sap.ui.getCore(), "sap.ui.getCore() returns a value");

		var oCfg = new sap.ui.core.Configuration();
		assert.deepEqual(oCfg.modules, ["sap.m.library"], "Libraries");
	});

	QUnit.test("Check boot() has run", function(assert) {

		var id = jQuery("html").attr("data-sap-ui-browser");
		if ( sap.ui.Device.browser.name ) {
			assert.ok(typeof id === "string" && id, "browser is known: data-sap-ui-browser should have been set and must not be empty");
		} else {
			assert.ok(!id, "browser is unknown: data-sap-ui-browser should not have been set (or empty)");
		}

		assert.ok(jQuery.sap.getObject("sap.m"), "lib namespace exists");
		assert.ok(sap.ui.lazyRequire._isStub("sap.m.Button"), "Control from lib is available at least as lazy stub");
		new sap.m.Button();
		assert.ok(typeof sap.m.Button.prototype.attachPress === "function", "control lazily loaded initialized");
	});

}());