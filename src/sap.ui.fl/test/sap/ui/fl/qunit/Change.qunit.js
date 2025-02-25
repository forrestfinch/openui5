/* global QUnit*/

sap.ui.define([
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/base/EventProvider",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Change,
	Layer,
	Utils,
	LayerUtils,
	Settings,
	EventProvider,
	JsControlTreeModifier,
	Control,
	DescriptorChangeTypes,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.Change", {
		beforeEach: function() {
			this.ushellStore = sap.ushell; // removes the lib for a pure OpenUI5 testing
			this.oControl = {};
			this.sUserId = "cookieMonster";
			this.oChangeDef = {
				fileName: "0815_1",
				namespace: "apps/smartFilterBar/changes/",
				projectId: "myProject",
				packageName: "$TMP",
				fileType: "variant",
				layer: Layer.VENDOR,
				changeType: "filterVariant",
				reference: "smartFilterBar",
				componentName: "smartFilterBar",
				selector: {
					id: "control1",
					idIsLocal: true
				},
				content: {something: "createNewVariant"},
				texts: {
					variantName: {
						value: "myVariantName",
						type: "myTextType"
					}
				},
				originalLanguage: "DE",
				support: {
					generator: "Dallas beta 1",
					user: this.sUserId
				},
				oDataPropertyInformation: {
					propertyName: "propertyName",
					entityType: "entityType",
					oDataServiceUri: "oDataServiceUri"
				},
				dependentSelector: {
					source: {
						id: "controlSource1",
						idIsLocal: true
					},
					target: {
						id: "controlTarget1",
						idIsLocal: true
					}
				}
			};
		},
		afterEach: function() {
			sap.ushell = this.ushellStore;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("constructor ", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.ok(oInstance);
			assert.notOk(oInstance.isCurrentProcessFinished());
		});

		QUnit.test("Shall inherit from EventProvider", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.ok(oInstance instanceof EventProvider, "Shall inherit from event provider");
		});

		QUnit.test("Change.applyState", function(assert) {
			var oChange = new Change(this.oChangeDef);
			assert.strictEqual(oChange.getProperty("applyState"), Change.applyState.INITIAL, "initially the state is INITIAL");

			oChange.setQueuedForApply();
			oChange.setQueuedForApply();
			oChange.startApplying();
			assert.strictEqual(oChange._aQueuedProcesses.length, 1, "APPLY operation only added once");
			assert.strictEqual(oChange.getProperty("applyState"), Change.applyState.APPLYING, "the applyState got changed correctly");
			assert.ok(oChange.hasApplyProcessStarted(), "the function returns the correct value");
			assert.notOk(oChange.isCurrentProcessFinished());
			assert.notOk(oChange.isQueuedForRevert());
			assert.ok(oChange.isQueuedForApply());

			oChange.markSuccessful();
			assert.strictEqual(oChange.getProperty("applyState"), Change.applyState.APPLY_SUCCESSFUL, "the applyState got changed correctly");
			assert.ok(oChange.isSuccessfullyApplied(), "the function returns the correct value");
			assert.ok(oChange.isApplyProcessFinished(), "isApplyProcessFinished returns the correct value");
			assert.ok(oChange.isCurrentProcessFinished());
			assert.notOk(oChange.isQueuedForRevert());
			assert.notOk(oChange.isQueuedForApply());

			oChange.markFailed();
			assert.strictEqual(oChange.getProperty("applyState"), Change.applyState.APPLY_FAILED, "the applyState got changed correctly");
			assert.ok(oChange.hasApplyProcessFailed(), "the function returns the correct value");
			assert.ok(oChange.isApplyProcessFinished(), "isApplyProcessFinished returns the correct value");
			assert.ok(oChange.isCurrentProcessFinished());
			assert.notOk(oChange.isQueuedForRevert());
			assert.notOk(oChange.isQueuedForApply());

			oChange.markFinished();
			assert.strictEqual(oChange.getProperty("applyState"), Change.applyState.APPLY_SUCCESSFUL, "the legacy setter is working");
			assert.ok(oChange.isCurrentProcessFinished());
			assert.notOk(oChange.isQueuedForRevert());
			assert.notOk(oChange.isQueuedForApply());

			oChange.setQueuedForRevert();
			oChange.setQueuedForRevert();
			oChange.startReverting();
			assert.strictEqual(oChange._aQueuedProcesses.length, 1, "REVERT operation only added once");
			assert.strictEqual(oChange.getProperty("applyState"), Change.applyState.REVERTING, "the applyState got changed correctly");
			assert.ok(oChange.hasRevertProcessStarted(), "the function returns the correct value");
			assert.notOk(oChange.isCurrentProcessFinished());
			assert.ok(oChange.isQueuedForRevert());
			assert.notOk(oChange.isQueuedForApply());

			oChange.markRevertFinished();
			assert.strictEqual(oChange.getProperty("applyState"), Change.applyState.REVERT_FINISHED, "the applyState got changed correctly");
			assert.ok(oChange.isRevertProcessFinished(), "the function returns the correct value");
			assert.ok(oChange.isCurrentProcessFinished());
			assert.notOk(oChange.isQueuedForRevert());
			assert.notOk(oChange.isQueuedForApply());
		});

		QUnit.test("ChangeProcessingPromise: resolve", function(assert) {
			var done = assert.async();
			var oChange = new Change(this.oChangeDef);
			var oPromise = oChange.addPromiseForApplyProcessing();
			var oPromise2 = oChange.addChangeProcessingPromise(Change.operations.REVERT);

			Promise.all([oPromise, oPromise2])
				.then(function() {
					assert.ok(true, "the function resolves");
					done();
				});

			oChange.markFinished();
			oChange.markRevertFinished();
		});

		QUnit.test("ChangeProcessingPromise: reject", function(assert) {
			var done = assert.async();
			var oChange = new Change(this.oChangeDef);
			var oPromise = oChange.addPromiseForApplyProcessing();
			var oPromise2 = oChange.addChangeProcessingPromise(Change.operations.REVERT);

			Promise.all([oPromise, oPromise2])
				.then(function() {
					assert.ok(true, "the promises were resolved");
					done();
				});

			oChange.markFinished();
			oChange.markRevertFinished();
		});

		QUnit.test("ChangeProcessingPromise: addChangeProcessingPromises when no apply/revert operation started", function(assert) {
			var done = assert.async();
			var oChange = new Change(this.oChangeDef);

			var aPromises = oChange.addChangeProcessingPromises();
			assert.equal(aPromises.length, 1, "1 promise got added");

			oChange.setQueuedForApply();
			oChange.setQueuedForRevert();
			var aPromises = oChange.addChangeProcessingPromises();
			assert.equal(aPromises.length, 3, "3 promise got added");

			Promise.all(aPromises)
				.then(function() {
					assert.ok(true, "the function resolves");
					done();
				});

			oChange.markFinished();
			oChange.markRevertFinished();
		});

		QUnit.test("ChangeProcessingPromise: addChangeProcessingPromises when apply operation started", function(assert) {
			var done = assert.async();
			var oChange = new Change(this.oChangeDef);
			oChange.setQueuedForApply();
			oChange.startApplying();
			oChange.setQueuedForRevert();

			var aPromises = oChange.addChangeProcessingPromises();
			assert.equal(aPromises.length, 2, "2 promises got added");

			Promise.all(aPromises)
				.then(function() {
					assert.ok(true, "the function resolves");
					done();
				});

			oChange.markFinished();
			oChange.markRevertFinished();
		});

		QUnit.test("Change.isVariant", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.isVariant(), true);
		});

		QUnit.test("Change.getChangeType", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getChangeType(), "filterVariant");
		});

		QUnit.test("Change.getFileType", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getFileType(), "variant");
		});

		QUnit.test("Change.getFileName", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getFileName(), "0815_1");
		});

		QUnit.test("Change.getPackage & Change.setPackage", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getPackage(), "$TMP");
			oInstance.setPackage("PACKAGE_A");
			assert.equal(oInstance.getPackage(), "PACKAGE_A");
		});

		QUnit.test("getNamespace should return the namespace of the defintion", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.strictEqual(oInstance.getNamespace(), "apps/smartFilterBar/changes/");
		});

		QUnit.test("setNamespace should set the namespace of the definition", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			oInstance.setNamespace("apps/ReferenceAppId/changes/");
			assert.strictEqual(oInstance.getNamespace(), "apps/ReferenceAppId/changes/");
		});

		QUnit.test("getProjectId should return the projectId in the definition", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.strictEqual(oInstance.getProjectId(), "myProject");
		});

		QUnit.test("setComponent should set the reference of the definition", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			oInstance.setComponent("AppVariantId");
			assert.strictEqual(oInstance.getComponent(), "AppVariantId");
		});

		QUnit.test("Change.getId", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getId(), "0815_1");
		});

		QUnit.test("Change.getContent", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.ok(oInstance.getContent());
		});

		QUnit.test("Change.setState with an incorrect value", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getState(), Change.states.NEW);
			oInstance.setState("anInvalidState");
			assert.equal(oInstance.getState(), Change.states.NEW);
		});

		QUnit.test("Change.setState to DIRTY when current state is NEW", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getState(), Change.states.NEW);
			oInstance.setState(Change.states.DIRTY);
			assert.equal(oInstance.getState(), Change.states.NEW);
		});

		QUnit.test("Change.setState to DIRTY when current state is PERSISTED", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getState(), Change.states.NEW);
			oInstance.setState(Change.states.PERSISTED);
			oInstance.setState(Change.states.DIRTY);
			assert.equal(oInstance.getState(), Change.states.DIRTY);
		});

		QUnit.test("Change.restorePreviousState after change from DIRTY to PERSISTED", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			oInstance.setState(Change.states.PERSISTED);
			oInstance.restorePreviousState();
			assert.strictEqual(
				oInstance.getState(),
				Change.states.NEW,
				"then the state is changed back to dirty"
			);
		});

		QUnit.test("Change.restorePreviousState after setting the state twice", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			oInstance.setState(Change.states.PERSISTED);
			oInstance.setState(Change.states.PERSISTED);
			oInstance.restorePreviousState();
			assert.strictEqual(
				oInstance.getState(),
				Change.states.NEW,
				"then the state is changed back to the previous distinct state"
			);
		});

		QUnit.test("Change.restorePreviousState twice", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			oInstance.setState(Change.states.PERSISTED);
			oInstance.setState(Change.states.DIRTY);
			oInstance.restorePreviousState();
			oInstance.restorePreviousState();
			assert.strictEqual(
				oInstance.getState(),
				Change.states.PERSISTED,
				"then the restore still only goes back to the previous state"
			);
		});

		QUnit.test("Change.setContent", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getState(), Change.states.NEW);
			oInstance.setContent({something: "nix"});
			assert.deepEqual(oInstance.getContent(), {something: "nix"});
			assert.equal(oInstance.getState(), Change.states.NEW);
			oInstance.setState(Change.states.PERSISTED);
			oInstance.setContent({something: "updated"});
			assert.deepEqual(oInstance.getContent(), {something: "updated"});
			assert.equal(oInstance.getState(), Change.states.DIRTY);
		});

		QUnit.test("Change.getText", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getText('variantName'), 'myVariantName');
		});

		QUnit.test("Change.setText", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			oInstance.setText('variantName', 'newText');
			assert.equal(oInstance.getText('variantName'), 'newText');
			assert.equal(oInstance.getState(), Change.states.NEW);
			oInstance.setState(Change.states.PERSISTED);
			oInstance.setText('variantName', 'myVariantName');
			assert.equal(oInstance.getState(), Change.states.DIRTY);
		});

		QUnit.test("Change.markForDeletion", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			oInstance.markForDeletion();
			assert.equal(oInstance.getState(), Change.states.DELETED);
		});

		QUnit.test("Change.set/get-Request", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			oInstance.setRequest('test');

			assert.equal(oInstance.getRequest(), 'test');
		});

		QUnit.test("Change.getLayer", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getLayer(), Layer.VENDOR);
		});

		QUnit.test("Change.getComponent", function(assert) {
			var oChange;
			var sComponent;
			oChange = new Change(this.oChangeDef);
			sComponent = oChange.getComponent();
			assert.equal(sComponent, "smartFilterBar");
		});

		QUnit.test("Change.getState", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.equal(oInstance.getState(), Change.states.NEW);
			oInstance.setState(Change.states.PERSISTED);

			oInstance.setContent({});
			assert.equal(oInstance.getState(), Change.states.DIRTY);

			oInstance.markForDeletion();
			assert.equal(oInstance.getState(), Change.states.DELETED);
		});

		QUnit.test("Change.getDefinition", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.ok(oInstance.getDefinition());
		});

		QUnit.test("createInitialFileContent", function(assert) {
			var oInfo = {
				service: "someService",
				reference: "smartFilterBar.Component",
				componentName: "smartFilterBar",
				changeType: "filterVariant",
				texts: {
					variantName: {
						type: "myTextType",
						value: "myVariantName"
					}
				},
				content: {something: "createNewVariant"},
				isVariant: true,
				packageName: "/UIF/LREP",
				namespace: "apps/smartFilterBar/adapt/oil/changes/",
				selector: {id: "control1"},
				id: "0815_1",
				dependentSelector: {
					source: {
						id: "controlSource1",
						idIsLocal: true
					},
					target: {
						id: "controlTarget1",
						idIsLocal: true
					}
				},
				oDataInformation: {
					propertyName: "propertyName",
					entityType: "entityType",
					oDataServiceUri: "oDataServiceUri"
				},
				jsOnly: true
			};

			var oCreatedFile = Change.createInitialFileContent(oInfo);

			assert.equal(oCreatedFile.reference, "smartFilterBar.Component");
			assert.equal(oCreatedFile.fileName, "0815_1");
			assert.equal(oCreatedFile.changeType, "filterVariant");
			assert.equal(oCreatedFile.fileType, "variant");
			assert.equal(oCreatedFile.namespace, "apps/smartFilterBar/adapt/oil/changes/");
			assert.equal(oCreatedFile.projectId, "smartFilterBar");
			assert.equal(oCreatedFile.packageName, "/UIF/LREP");
			assert.equal(oCreatedFile.support.generator, "Change.createInitialFileContent");
			assert.equal(oCreatedFile.appDescriptorChange, false, "the flag for descriptor changes is set to false");
			assert.deepEqual(oCreatedFile.content, {something: "createNewVariant"});
			assert.deepEqual(oCreatedFile.texts, {variantName: {value: "myVariantName", type: "myTextType"}});
			assert.deepEqual(oCreatedFile.selector, {id: "control1"});
			assert.deepEqual(oCreatedFile.dependentSelector, {source: {id: "controlSource1", idIsLocal: true}, target: {id: "controlTarget1", idIsLocal: true}});
			assert.deepEqual(oCreatedFile.oDataInformation, {propertyName: "propertyName", entityType: "entityType", oDataServiceUri: "oDataServiceUri"});
			assert.ok(oCreatedFile.jsOnly);
		});

		QUnit.test("createInitialFileContent with support command", function(assert) {
			var oInfo = {
				service: "someService",
				reference: "smartFilterBar.Component",
				componentName: "smartFilterBar",
				changeType: "filterVariant",
				texts: {
					variantName: {
						type: "myTextType",
						value: "myVariantName"
					}
				},
				content: {something: "createNewVariant"},
				isVariant: true,
				packageName: "/UIF/LREP",
				namespace: "apps/smartFilterBar/adapt/oil/changes/",
				selector: {id: "control1"},
				id: "0815_1",
				dependentSelector: {
					source: {
						id: "controlSource1",
						idIsLocal: true
					},
					target: {
						id: "controlTarget1",
						idIsLocal: true
					}
				},
				support: {
					command: "move"
				},
				oDataInformation: {
					propertyName: "propertyName",
					entityType: "entityType",
					oDataServiceUri: "oDataServiceUri"
				},
				jsOnly: true
			};

			var oCreatedFile = Change.createInitialFileContent(oInfo);
			assert.equal(oCreatedFile.support.command, "move", "Support command is set correctly");
		});

		QUnit.test("createInitialFileContent with descriptor change", function(assert) {
			var oInfo = {
				service: "someService",
				reference: "smartFilterBar.Component",
				componentName: "smartFilterBar",
				changeType: DescriptorChangeTypes.getChangeTypes()[5],
				texts: {
					variantName: {
						type: "myTextType",
						value: "myVariantName"
					}
				},
				content: {something: "createNewVariant"},
				isVariant: true,
				packageName: "/UIF/LREP",
				namespace: "apps/smartFilterBar/adapt/oil/changes/",
				selector: {id: "control1"},
				id: "0815_1",
				dependentSelector: {
					source: {
						id: "controlSource1",
						idIsLocal: true
					},
					target: {
						id: "controlTarget1",
						idIsLocal: true
					}
				},
				oDataInformation: {
					propertyName: "propertyName",
					entityType: "entityType",
					oDataServiceUri: "oDataServiceUri"
				},
				jsOnly: true
			};

			var oCreatedFile = Change.createInitialFileContent(oInfo);

			assert.equal(oCreatedFile.appDescriptorChange, true, "the flag for descriptor changes is set to true");
		});

		QUnit.test("createInitialFileContent when generator is pre-set", function(assert) {
			var oInfo = {
				changeType: "filterVariant",
				content: {},
				namespace: "apps/smartFilterBar/adapt/oil/changes/",
				generator: "RTA"
			};

			var oCreatedFile = Change.createInitialFileContent(oInfo);

			assert.equal(oCreatedFile.support.generator, "RTA");
		});

		QUnit.test("createInitialFileContent when fileType is pre-set", function(assert) {
			var oInfo = {
				changeType: "filterVariant",
				content: {},
				namespace: "apps/smartFilterBar/adapt/oil/changes/",
				fileType: "newFileType"
			};

			var oCreatedFile = Change.createInitialFileContent(oInfo);

			assert.equal(oCreatedFile.fileType, "newFileType");
		});

		QUnit.test("createInitialFileContent when project id is pre-set", function(assert) {
			var oInfo = {
				changeType: "change",
				content: {},
				namespace: "apps/smartFilterBar/adapt/oil/changes/",
				projectId: "myProject"
			};

			var oCreatedFile = Change.createInitialFileContent(oInfo);

			assert.equal(oCreatedFile.projectId, "myProject");
		});

		QUnit.test("setResponse shall set an object to the Change instance", function(assert) {
			//Arrange
			var sampleResponse = {
				fileName: "0815_1",
				fileType: "variant",
				changeType: "filterVariant",
				component: "smartFilterBar",
				content: {something: "createNewVariant"},
				selector: {id: "control1"},
				layer: Layer.VENDOR,
				conditions: {}, // obsolete property (should still be checked if these exists already in the stored object)
				context: "", // obsolete property (should still be checked if these exists already in the stored object)
				texts: {
					variantName: {
						value: "myVariantName",
						type: "myTextType"
					}
				},
				namespace: "localchange1/",
				creation: "2014-10-30T13:52:40.4754350Z",
				originalLanguage: "DE",
				support: {
					generator: "Dallas beta 1",
					user: this.sUserId
				}
			};

			var oChange = new Change(this.oChangeDef);
			assert.ok(!oChange._oDefinition.creation);
			assert.equal(oChange.getState(), Change.states.NEW);

			//Act
			oChange.setResponse(sampleResponse);

			//Assert
			assert.ok(oChange._oDefinition.creation, "2014-10-30T13:52:40.4754350Z");
			assert.equal(oChange.getState(), Change.states.PERSISTED);
		});

		QUnit.test("isChangeFromOtherSystem shall return true when settings cannot be read", function(assert) {
			var oChange = new Change(this.oChangeDef);
			oChange._oDefinition.sourceSystem = "someSystem";
			oChange._oDefinition.sourceClient = "someClient";
			var oSettings;
			sandbox.stub(Settings, "getInstanceOrUndef").returns(oSettings);
			assert.strictEqual(oChange.isChangeFromOtherSystem(), true);
		});

		QUnit.test("isChangeFromOtherSystem shall return false when in settings no system and client info is maintained", function(assert) {
			var oChange = new Change(this.oChangeDef);
			oChange._oDefinition.sourceSystem = "someSystem";
			oChange._oDefinition.sourceClient = "someClient";
			// no system and client info
			sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({isKeyUser: true}));
			assert.strictEqual(oChange.isChangeFromOtherSystem(), false);
		});

		QUnit.test("isChangeFromOtherSystem shall return false when in settings no system info is maintained", function(assert) {
			var oChange = new Change(this.oChangeDef);
			oChange._oDefinition.sourceSystem = "someSystem";
			oChange._oDefinition.sourceClient = "someClient";
			// no system info
			sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({client: "someClient"}));
			assert.strictEqual(oChange.isChangeFromOtherSystem(), false);
		});

		QUnit.test("isChangeFromOtherSystem shall return false when in settings no client info is maintained", function(assert) {
			var oChange = new Change(this.oChangeDef);
			oChange._oDefinition.sourceSystem = "someSystem";
			oChange._oDefinition.sourceClient = "someClient";
			// no client info
			sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({system: "someSystem"}));
			assert.strictEqual(oChange.isChangeFromOtherSystem(), false);
		});

		QUnit.test("isChangeFromOtherSystem shall return false when change has no source system/client info", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({system: "someSystem", client: "someClient"}));
			// change has no source system and client info
			var oChange = new Change(this.oChangeDef);
			assert.strictEqual(oChange.isChangeFromOtherSystem(), false);
			// change has source system but no source client info
			oChange = new Change(this.oChangeDef);
			oChange._oDefinition.sourceSystem = "someSystem";
			assert.strictEqual(oChange.isChangeFromOtherSystem(), false);
			// change has source client but no source system info
			oChange = new Change(this.oChangeDef);
			oChange._oDefinition.sourceClient = "someClient";
			assert.strictEqual(oChange.isChangeFromOtherSystem(), false);
		});

		QUnit.test("isChangeFromOtherSystem shall return true when there is a mismatch between system/client info in the settings and the source system/client of the change", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({system: "someSystem", client: "someClient"}));
			// mismatch between system in settings and source system of change
			var oChange = new Change(this.oChangeDef);
			oChange._oDefinition.sourceSystem = "anotherSystem";
			oChange._oDefinition.sourceClient = "someClient";
			assert.strictEqual(oChange.isChangeFromOtherSystem(), true);
			// mismatch between client in settings and source client of change
			oChange = new Change(this.oChangeDef);
			oChange._oDefinition.sourceSystem = "someSystem";
			oChange._oDefinition.sourceClient = "anotherClient";
			assert.strictEqual(oChange.isChangeFromOtherSystem(), true);
		});

		QUnit.test("isChangeFromOtherSystem shall return false when system/client info in the settings and the source system/client of the change match", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({system: "someSystem", client: "someClient"}));
			var oChange = new Change(this.oChangeDef);
			oChange._oDefinition.sourceSystem = "someSystem";
			oChange._oDefinition.sourceClient = "someClient";
			assert.strictEqual(oChange.isChangeFromOtherSystem(), false);
		});

		QUnit.test("addDependentControl raises error when alias already exists", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			assert.throws(function() {
				oInstance.addDependentControl("someId", "source", {modifier: {}});
			}, new Error("Alias " + "'source'" + " already exists in the change."), "an error was thrown");
		});

		QUnit.test("Operations add and get dependent control work with existing dependent controls in the change", function(assert) {
			var oInstance = new Change(this.oChangeDef);
			var sControlId = "control1Id";
			var oControl = new Control("control2Id");
			var aControls = [
				new Control("control3Id"),
				new Control("control4Id"),
				new Control("control5Id")
			];
			var aControlIds = ["control6Id", "control7Id", "undefined", "control1Id"]; //Control 1 duplicate. Should not be included.

			sandbox.stub(JsControlTreeModifier, "getSelector")
				.onCall(0).returns({
					id: "control1",
					idIsLocal: true
				})
				.onCall(1).returns({
					id: "control2",
					idIsLocal: true
				})
				.onCall(2).returns({
					id: "control3",
					idIsLocal: true
				})
				.onCall(3).returns({
					id: "control4",
					idIsLocal: true
				})
				.onCall(4).returns({
					id: "control5",
					idIsLocal: true
				})
				.onCall(5).returns({
					id: "control6",
					idIsLocal: true
				})
				.onCall(6).returns({
					id: "control7",
					idIsLocal: true
				})
				.onCall(7).returns({})
				.onCall(8).returns({
					id: "control1",
					idIsLocal: true
				});

			var oReturnedControl = new Control("control1Id");
			var oJsControlTreeModifierBySelectorStub = sandbox.stub(JsControlTreeModifier, "bySelector");
			oJsControlTreeModifierBySelectorStub.onCall(0).returns(oReturnedControl);

			oJsControlTreeModifierBySelectorStub.returns({});

			oInstance.addDependentControl(sControlId, "element", {modifier: JsControlTreeModifier});
			oInstance.addDependentControl(oControl, "anotherSource", {modifier: JsControlTreeModifier});
			oInstance.addDependentControl(aControls, "anotherTarget", {modifier: JsControlTreeModifier});
			oInstance.addDependentControl(aControlIds, "anotherTargetWithId", {modifier: JsControlTreeModifier});

			assert.notOk(oInstance.getOriginalSelector(), "the getter returns nothing as there is no originalSelector");

			var oDependentControl = oInstance.getDependentControl("source", {modifier: JsControlTreeModifier}, {});
			assert.equal(oDependentControl.getId(), "control1Id");

			var aDependentControls = oInstance.getDependentControl("anotherTarget", {modifier: JsControlTreeModifier}, {});
			assert.equal(aDependentControls.length, aControls.length);

			var oAppComponent = {
				createId: function (sId) {return sId + "---local";}
			};
			var aDependentIdList = oInstance.getDependentSelectorList(oAppComponent);
			assert.equal(aDependentIdList.length, 10);
			aDependentIdList = oInstance.getDependentControlSelectorList(oAppComponent);
			assert.equal(aDependentIdList.length, 9);
		});

		QUnit.test("dependent Selectors with 'originalSelector' as one of them", function(assert) {
			this.oChangeDef.dependentSelector["originalSelector"] = {
				id: "original",
				idIsLocal: false
			};
			var oControl = new Control("original");
			var oChange = new Change(this.oChangeDef);
			assert.equal(oChange.getDependentControlSelectorList().length, 0, "no controls are in the list");
			assert.equal(oChange.getDependentSelectorList().length, 1, "only the selector is in the list");
			assert.equal(oChange.getDependentSelectorList()[0].id, "control1");
			assert.equal(Object.keys(oChange.getDefinition().dependentSelector).length, 3, "there are 3 dependent selectors defined in the change");
			assert.deepEqual(oChange.getDependentControl("originalSelector", {modifier: JsControlTreeModifier}), oControl, "the 'getDependentControl' function still returns the original selector");
			assert.deepEqual(oChange.getOriginalSelector(), {id: "original", idIsLocal: false}, "the getter returns the selector");
		});

		QUnit.test("revertData", function(assert) {
			var oChange = new Change(this.oChangeDef);
			assert.notOk(oChange.hasRevertData(), "initially hasRevertData returns false");
			assert.equal(oChange.getRevertData(), null, "initially the revert data is null");

			oChange.setRevertData("revertData");
			assert.ok(oChange.hasRevertData(), "hasRevertData returns true");
			assert.equal(oChange.getRevertData(), "revertData", "getRevertData returns the correct data");

			oChange.resetRevertData();
			assert.notOk(oChange.hasRevertData(), "hasRevertData returns false");
			assert.equal(oChange.getRevertData(), null, "initially the revert data is null");

			oChange.setRevertData("");
			assert.ok(oChange.hasRevertData(), "hasRevertData returns true");
			assert.equal(oChange.getRevertData(), "", "getRevertData returns the correct data");

			oChange.resetRevertData();
			assert.throws(function () {
				oChange.setRevertData(undefined);
			}, /Change cannot be applied in XML as revert data is not available yet. Retrying in JS./,
			"'undefined' value results in an exception");
			assert.notOk(oChange.hasRevertData(), "hasRevertData returns false");
			assert.equal(oChange.getRevertData(), null, "getRevertData returns the correct data");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});