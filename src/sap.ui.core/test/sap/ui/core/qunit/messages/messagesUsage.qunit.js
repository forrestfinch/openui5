/* global sinon, QUnit*/
sap.ui.define([
	'sap/base/util/isPlainObject',
	'sap/m/Input',
	'sap/ui/model/Model',
	'sap/ui/model/type/Integer',
	'sap/ui/core/message/Message',
	'sap/ui/core/message/MessageManager',
	'sap/ui/core/library',
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/UIComponent',
	'sap/ui/qunit/utils/createAndAppendDiv'
], function(isPlainObject, Input, Model, Integer, Message, MessageManager, library, Component, ComponentContainer, JSONModel, UIComponent, createAndAppendDiv){
	"use strict";

	// create content div
	createAndAppendDiv('content');

	QUnit.module("MessageManager components", {
		before: function(){
			this.spyDataState = function(oControl, fnTest) {
				if (oControl.refreshDataState) {
					var fnRefresh = oControl.refreshDataState;
					oControl.refreshDataState = function(sName, oDataState) {
						Input.prototype.refreshDataState.apply(oControl, arguments);
						fnTest(sName, oDataState);
						oControl.refreshDataState = fnRefresh;
					};
				}
			};

			//create some components for testing
			var pCompContRendered = Component.create({
				name: "components"
			}).then(function(oComponent) {
				new ComponentContainer("CompCont", {
					component: oComponent
				}).placeAt("content");
			});

			var pCompContEnabledRendered = Component.create({
				name: "components.enabled",
				handleValidation: true
			}).then(function(oComponent) {
				new ComponentContainer("CompCont2", {
					component: oComponent
				}).placeAt("content");
			});

			var pCompContDisabledRendered = Component.create({
				name: "components.disabled",
				handleValidation: true // Note: same setting in component metadata overrides this
			}).then(function(oComponent) {
				new ComponentContainer("CompCont3", {
					component: oComponent
				}).placeAt("content");
			});

			this.initModel = function() {
				this.oModel = new JSONModel();
				var oData = {
					form: {
						firstname: "Fritz",
						lastname: "Heiner",
						street: "im",
						nr: 1,
						zip: "12345"
					}
				};
				this.oModel.setData(oData);
				sap.ui.getCore().setModel(this.oModel);
			};

			return Promise.all([pCompContRendered, pCompContEnabledRendered, pCompContDisabledRendered]).then(function() {
				sap.ui.getCore().applyChanges();
			});
		},

		beforeEach : function() {
			this.initModel();
		},

		afterEach : function() {
			this.oModel.destroy();
		}
	});

	QUnit.test("componentEnabled", function (assert) {
		var done = assert.async();

		var oCompZip = sap.ui.getCore().byId("zip_enabled");

		this.spyDataState(oCompZip, function (sName, oDataState) {
			assert.ok(oDataState.getMessages().length == 1, 'Format Message created');
			assert.ok(oCompZip.getValueState() === library.ValueState.Error, 'Input: ValueState set correctly');
			assert.ok(oCompZip.getValueStateText() === 'Enter a value with no more than 5 characters', 'Input: ValueStateText set correctly');
		});
		var oCoreValHandler = function (oEvent) {
			assert.ok(false, "should never be called");
		};
		sap.ui.getCore().attachValidationError(oCoreValHandler);
		oCompZip.setValue('123456');

		setTimeout(function () {
			this.spyDataState(oCompZip, function (sName, oDataState) {
				assert.ok(oDataState.getMessages().length == 0, 'Validation Message deleted');
				assert.ok(oCompZip.getValueState() === library.ValueState.None, 'Input: ValueState set correctly');
				assert.ok(oCompZip.getValueStateText() === '', 'Input: ValueStateText set correctly');
				done();
			});
			oCompZip.setValue('12345');
			sap.ui.getCore().detachValidationError(oCoreValHandler);
		}.bind(this), 0);
	});

	QUnit.test("componentDisabled", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oMessageModel = oMessageManager.getMessageModel();
		var oCompZip = sap.ui.getCore().byId("zip_disabled");

		var oValHandler = function(oEvent) {
			if (oEvent.getParameter("dataState").getMessages() && oEvent.getParameter("dataState").getMessages().length > 0) {
				assert.ok(false,"should never be called");
			}
		};
		oCompZip.getBinding("value").attachDataStateChange(oValHandler);
		sap.ui.getCore().attachValidationError(oValHandler);
		oCompZip.setValue('123456');
		assert.ok(isPlainObject(oMessageModel.getObject('/')) || oMessageModel.getObject('/').length == 0, 'No Messages in Model');
		sap.ui.getCore().detachValidationError(oValHandler);
	});

	QUnit.test("component handle validation undefined", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oMessageModel = oMessageManager.getMessageModel();

		var oCompZip = sap.ui.getCore().byId("zip");
		var oChangeHandler = function(oEvent) {
			if (oEvent.getParameter("dataState").getMessages() && oEvent.getParameter("dataState").getMessages().length > 0) {
				assert.ok(false,"should never be called");
			}
		};
		var oValHandler = function(oEvent) {
			assert.ok(true,oEvent.sId);
			sap.ui.getCore().detachValidationError(oValHandler);
		};
		oCompZip.getBinding("value").attachDataStateChange(oChangeHandler);
		sap.ui.getCore().attachValidationError(oValHandler);
		oCompZip.setValue('123456');
		assert.ok(isPlainObject(oMessageModel.getObject('/')) || oMessageModel.getObject('/').length == 0, 'No Messages in Model');
	});

	QUnit.module("Component: handleValidation / registerObject", {
		createComponent: function(metadataHV, instanceHV) {
			var flags = {
				"undefined": "na",
				"true": "true",
				"false" : "false"
			};
			var sComponentName = "sap.ui.test.handlevalidation."
				+ flags[metadataHV] + "." + flags[instanceHV];

			var sClassName = sComponentName + ".Component";
			var sModuleName = sClassName.replace(/\./g, "/");
			sap.ui.define(sModuleName, [
				"sap/ui/core/UIComponent"
			], function(UIComponent) {
				var metadata = {};
				if ( metadataHV !== undefined ) {
					metadata.handleValidation = metadataHV;
				}
				return UIComponent.extend(sClassName, {
					metadata: metadata
				});
			});

			var mSettings = {
				name: sComponentName
			};
			if ( instanceHV !== undefined ) {
				mSettings.handleValidation = instanceHV;
			}
			return Component.create(mSettings).then(function(oComponent) {
				this.oComponent = oComponent;
				return oComponent;
			}.bind(this));
		},
		afterEach: function() {
			this.oComponent.destroy();
		}
	});

	QUnit.test("Metadata: n/a, instance: n/a", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		return this.createComponent(undefined, undefined).then(function(oComponent) {
			sinon.assert.callCount(oRegisterObjectSpy, 0);
		});
	});

	QUnit.test("Metadata: n/a, instance: false", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		return this.createComponent(undefined, false).then(function(oComponent) {
			sinon.assert.callCount(oRegisterObjectSpy, 0);
		});
	});

	QUnit.test("Metadata: n/a, instance: true", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		return this.createComponent(undefined, true).then(function(oComponent) {
			sinon.assert.callCount(oRegisterObjectSpy, 1);
			sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, true);
		});
	});

	QUnit.test("Metadata: false, instance: false", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		return this.createComponent(false, false).then(function(oComponent) {
			sinon.assert.callCount(oRegisterObjectSpy, 1);
			sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, false);
		});
	});

	QUnit.test("Metadata: false, instance: n/a", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		return this.createComponent(false, undefined).then(function(oComponent) {
			sinon.assert.callCount(oRegisterObjectSpy, 1);
			sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, false);
		});
	});

	QUnit.test("Metadata: false, instance: true", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		return this.createComponent(false, true).then(function(oComponent) {
			sinon.assert.callCount(oRegisterObjectSpy, 1);
			sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, false);
		});
	});

	QUnit.test("Metadata: true, instance: true", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		return this.createComponent(true, true).then(function(oComponent) {
			sinon.assert.callCount(oRegisterObjectSpy, 1);
			sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, true);
		});
	});

	QUnit.test("Metadata: true, instance: n/a", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		return this.createComponent(true, undefined).then(function(oComponent) {
			sinon.assert.callCount(oRegisterObjectSpy, 1);
			sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, true);
		});
	});

	QUnit.test("Metadata: true, instance: false", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		return this.createComponent(true, false).then(function(oComponent) {
			sinon.assert.callCount(oRegisterObjectSpy, 1);
			sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, true);
		});
	});



	QUnit.module("");

	QUnit.test("Model: checkMessages", function(assert) {
		var oCheckMessagesSpy = sinon.spy(Model.prototype, "checkMessages");
		var oModel = new Model();
		var mMessages = {"foo": {"key1": "value1"}};

		oModel.mMessages = mMessages;
		oModel.setMessages(mMessages);
		assert.equal(oCheckMessagesSpy.callCount, 0, "No changes detected - Skip check messages");

		oModel.setMessages({"foo": {"key2": "value2"}});
		assert.equal(oCheckMessagesSpy.callCount, 1, "Changes detected - Check messages");

		oModel.setMessages();
		assert.equal(oCheckMessagesSpy.callCount, 2, "Changes detected - Check messages");
		assert.deepEqual(oModel.mMessages, {}, "Model messages cleared");
		oCheckMessagesSpy.restore();
	});

	QUnit.test("Model: Refresh with force update", function(assert) {
		var done = assert.async();
		var oModel = new Model();
		var oMessage = new Message({message: "myMessage", type: library.MessageType.Error});
		oModel.setMessages({"/test": oMessage});
		oModel.attachMessageChange(function(oEvent){
			assert.strictEqual(oMessage, oEvent.getParameter("oldMessages")[0]);
			done();
		});
		oModel.refresh(true);
	});

	QUnit.test("MessageManager:register/unregisterObject", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oHandlererrorSpy = sinon.spy(MessageManager.prototype, "_handleError");
		var oModel = new JSONModel(
			{
				data: {
					value: 2
				}
			}
		);
		var oInput = new Input(
			{
				value: {
					path: "/dayta/value",
					type: new Integer()
				},
				models: oModel
			}
		);
		oMessageManager.registerObject(oInput);
		oInput.setValue("abc");
		assert.equal(oHandlererrorSpy.callCount, 1, "Changes detected - _handleError");
		oInput.setValue("2");
		oMessageManager.unregisterObject(oInput);
		oInput.setValue("abc");
		assert.equal(oHandlererrorSpy.callCount, 1, "No Changes detected - _handleError");
		oHandlererrorSpy.restore();
	});

});