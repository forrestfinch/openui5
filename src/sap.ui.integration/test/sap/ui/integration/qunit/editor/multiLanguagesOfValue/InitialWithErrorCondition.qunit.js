/* eslint-disable no-loop-func */
/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../ContextHost",
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
], function (
	merge,
	x,
	Editor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	Core,
	QUnitUtils,
	KeyCodes
) {
	"use strict";

	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	function createEditor(sLanguage, oDesigtime) {
		Core.getConfiguration().setLanguage(sLanguage);
		var oEditor = new Editor({
			designtime: oDesigtime
		});
		var oContent = document.getElementById("content");
		if (!oContent) {
			oContent = document.createElement("div");
			oContent.style.position = "absolute";
			oContent.style.top = "200px";
			oContent.style.background = "white";

			oContent.setAttribute("id", "content");
			document.body.appendChild(oContent);
			document.body.style.zIndex = 1000;
		}
		oEditor.placeAt(oContent);
		return oEditor;
	}

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}

	}
	var _oManifestWithi18nOriginFileOnly = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18nTransOriOnly/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/multiLanguage",
			"type": "List",
			"configuration": {
				"parameters": {
					"string1": {
						"value": "{{string1}}"
					},
					"string2": {
						"value": "String 2"
					},
					"string3": {
						"value": "String 3"
					},
					"string4": {
						"value": "{i18n>string4}"
					},
					"integer": {
						"value": 1
					},
					"number": {
						"value": 3
					}
				}
			}
		}
	};
	var _oManifestWithouti18n = {
		"sap.app": {
			"id": "test.sample"
		},
		"sap.card": {
			"designtime": "designtime/multiLanguage",
			"type": "List",
			"configuration": {
				"parameters": {
					"string1": {
						"value": "{{string1}}"
					},
					"string2": {
						"value": "String 2"
					},
					"string3": {
						"value": "String 3"
					},
					"string4": {
						"value": "{i18n>string4}"
					},
					"integer": {
						"value": 1
					},
					"number": {
						"value": 3
					}
				}
			}
		}
	};
	var _aCheckedLanguages = [
		{
			"key": "en",
			"description": "English"
		},
		{
			"key": "en-GB",
			"description": "English UK"
		},
		{
			"key": "es-MX",
			"description": "Español de México"
		},
		{
			"key": "fr",
			"description": "Français"
		},
		{
			"key": "fr-CA",
			"description": "Français (Canada)"
		},
		{
			"key": "zh-CN",
			"description": "简体中文"
		}
	];

	QUnit.module("Check the manifest without i18n property", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("Admin mode", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setMode("admin");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifestWithouti18n
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = that.oEditor.getAggregation("_formContent")[9];
					var oField5 = that.oEditor.getAggregation("_formContent")[10];
					var oLabel6 = that.oEditor.getAggregation("_formContent")[11];
					var oField6 = that.oEditor.getAggregation("_formContent")[12];
					wait().then(function () {
						assert.ok(oLabel1.getText() === "string1label", "Label1: string1label - " + oLabel1.getText());
						assert.ok(oField1.getAggregation("_field").getValue() === "string1", "oField1: string1");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.ok(oLabel2.getText() === "string2label", "Label2: string2label");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2", "oField2: String 2");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.ok(oLabel3.getText() === "string3label", "Label3: string3label");
						assert.ok(oField3.getAggregation("_field").getValue() === "String 3", "oField1: String 3");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.ok(oLabel4.getText() === "string4label", "Label4: string4label");
						assert.ok(oField4.getAggregation("_field").getValue() === "string4", "oField1: string4");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");
						assert.ok(oLabel5.getText() === "integer", "Label5: integer");
						assert.ok(oField5.getAggregation("_field").isA("sap.m.Input"), "oField5: Input control");
						assert.ok(oField5.getAggregation("_field").getValue() === "1", "oField5: 1");
						assert.ok(oField5.getAggregation("_field").getAggregation("_endIcon") === null, "oField5: No Input value help icon");
						assert.ok(oLabel6.getText() === "number", "Label6: number");
						assert.ok(oField6.getAggregation("_field").isA("sap.m.Input"), "oField6: Input control");
						assert.ok(oField6.getAggregation("_field").getValue() === "3", "oField6: 3");
						assert.ok(oField6.getAggregation("_field").getAggregation("_endIcon") === null, "oField6: No Input value help icon");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						wait().then(function () {
							var oTranslationPopover1 = oField1.getAggregation("_field")._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.ok(aHeaderItems1[0].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.ok(aHeaderItems1[1].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.ok(aHeaderItems1[2].getItems()[0].getText() === "English", "oTranslationPopover1 Header: English");
							assert.ok(aHeaderItems1[2].getItems()[1].getValue() === "string1", "oTranslationPopover1 Header: string1");
							assert.ok(aHeaderItems1[2].getItems()[1].getEditable() === false, "oTranslationPopover1 Header: Editable false");
							assert.ok(aHeaderItems1[3].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.ok(oLanguageItems1.length === 49, "oTranslationPopover1 Content: length");
							assert.ok(oLanguageItems1[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover1 Content: item 0");
							for (var i = 1; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = "string1";
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.ok(oValueHelpIcon2 === null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "oField3: Input value help icon src");
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
							wait().then(function () {
								var oTranslationPopover3 = oField3.getAggregation("_field")._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.ok(aHeaderItems3[2].getItems()[1].getValue() === "String 3", "oTranslationPopover3 Header: String 3");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 49, "oTranslationPopover3 Content: length");
								assert.ok(oLanguageItems3[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover3 Content: item 0");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === "String 3", "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: String 3");
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.ok(oValueHelpIcon4.getSrc() === "sap-icon://translate", "oField4: Input value help icon src");
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
								wait().then(function () {
									var oTranslationPopover4 = oField4.getAggregation("_field")._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.ok(aHeaderItems4[2].getItems()[1].getValue() === "string4", "oTranslationPopover4 Header: string4");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.ok(oLanguageItems4.length === 49, "oTranslationPopover4 Content: length");
									assert.ok(oLanguageItems4[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover4 Content: item 0");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = "string4";
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();

								}).then(function () {
									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("Content mode", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifestWithouti18n
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = that.oEditor.getAggregation("_formContent")[9];
					var oField5 = that.oEditor.getAggregation("_formContent")[10];
					var oLabel6 = that.oEditor.getAggregation("_formContent")[11];
					var oField6 = that.oEditor.getAggregation("_formContent")[12];
					wait().then(function () {
						assert.ok(oLabel1.getText() === "string1label", "Label1: string1label");
						assert.ok(oField1.getAggregation("_field").getValue() === "string1", "oField1: string1");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.ok(oLabel2.getText() === "string2label", "Label2: string2label");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2", "oField2: String 2");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.ok(oLabel3.getText() === "string3label", "Label3: string3label");
						assert.ok(oField3.getAggregation("_field").getValue() === "String 3", "oField1: String 3");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.ok(oLabel4.getText() === "string4label", "Label4: string4label");
						assert.ok(oField4.getAggregation("_field").getValue() === "string4", "oField1: string4");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");
						assert.ok(oLabel5.getText() === "integer", "Label5: integer");
						assert.ok(oField5.getAggregation("_field").isA("sap.m.Input"), "oField5: Input control");
						assert.ok(oField5.getAggregation("_field").getValue() === "1", "oField5: 1");
						assert.ok(oField5.getAggregation("_field").getAggregation("_endIcon") === null, "oField5: No Input value help icon");
						assert.ok(oLabel6.getText() === "number", "Label6: number");
						assert.ok(oField6.getAggregation("_field").isA("sap.m.Input"), "oField6: Input control");
						assert.ok(oField6.getAggregation("_field").getValue() === "3", "oField6: 3");
						assert.ok(oField6.getAggregation("_field").getAggregation("_endIcon") === null, "oField6: No Input value help icon");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						wait().then(function () {
							var oTranslationPopover1 = oField1.getAggregation("_field")._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.ok(aHeaderItems1[0].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.ok(aHeaderItems1[1].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.ok(aHeaderItems1[2].getItems()[0].getText() === "English", "oTranslationPopover1 Header: English");
							assert.ok(aHeaderItems1[2].getItems()[1].getValue() === "string1", "oTranslationPopover1 Header: string1");
							assert.ok(aHeaderItems1[2].getItems()[1].getEditable() === false, "oTranslationPopover1 Header: Editable false");
							assert.ok(aHeaderItems1[3].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.ok(oLanguageItems1.length === 49, "oTranslationPopover1 Content: length");
							assert.ok(oLanguageItems1[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover1 Content: item 0");
							for (var i = 1; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = "string1";
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.ok(oValueHelpIcon2 === null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "oField3: Input value help icon src");
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
							wait().then(function () {
								var oTranslationPopover3 = oField3.getAggregation("_field")._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.ok(aHeaderItems3[2].getItems()[1].getValue() === "String 3", "oTranslationPopover3 Header: String 3");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 49, "oTranslationPopover3 Content: length");
								assert.ok(oLanguageItems3[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover3 Content: item 0");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === "String 3", "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: String 3");
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.ok(oValueHelpIcon4.getSrc() === "sap-icon://translate", "oField4: Input value help icon src");
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
								wait().then(function () {
									var oTranslationPopover4 = oField4.getAggregation("_field")._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.ok(aHeaderItems4[2].getItems()[1].getValue() === "string4", "oTranslationPopover4 Header: string4");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.ok(oLanguageItems4.length === 49, "oTranslationPopover4 Content: length");
									assert.ok(oLanguageItems4[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover4 Content: item 0");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = "string4";
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();

								}).then(function () {
									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("All mode", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setMode("all");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifestWithouti18n
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = that.oEditor.getAggregation("_formContent")[9];
					var oField5 = that.oEditor.getAggregation("_formContent")[10];
					var oLabel6 = that.oEditor.getAggregation("_formContent")[11];
					var oField6 = that.oEditor.getAggregation("_formContent")[12];
					wait().then(function () {
						assert.ok(oLabel1.getText() === "string1label", "Label1: string1label");
						assert.ok(oField1.getAggregation("_field").getValue() === "string1", "oField1: string1");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.ok(oLabel2.getText() === "string2label", "Label2: string2label");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2", "oField2: String 2");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.ok(oLabel3.getText() === "string3label", "Label3: string3label");
						assert.ok(oField3.getAggregation("_field").getValue() === "String 3", "oField1: String 3");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.ok(oLabel4.getText() === "string4label", "Label4: string4label");
						assert.ok(oField4.getAggregation("_field").getValue() === "string4", "oField1: string4");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");
						assert.ok(oLabel5.getText() === "integer", "Label5: integer");
						assert.ok(oField5.getAggregation("_field").isA("sap.m.Input"), "oField5: Input control");
						assert.ok(oField5.getAggregation("_field").getValue() === "1", "oField5: 1");
						assert.ok(oField5.getAggregation("_field").getAggregation("_endIcon") === null, "oField5: No Input value help icon");
						assert.ok(oLabel6.getText() === "number", "Label6: number");
						assert.ok(oField6.getAggregation("_field").isA("sap.m.Input"), "oField6: Input control");
						assert.ok(oField6.getAggregation("_field").getValue() === "3", "oField6: 3");
						assert.ok(oField6.getAggregation("_field").getAggregation("_endIcon") === null, "oField6: No Input value help icon");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						wait().then(function () {
							var oTranslationPopover1 = oField1.getAggregation("_field")._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.ok(aHeaderItems1[0].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.ok(aHeaderItems1[1].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.ok(aHeaderItems1[2].getItems()[0].getText() === "English", "oTranslationPopover1 Header: English");
							assert.ok(aHeaderItems1[2].getItems()[1].getValue() === "string1", "oTranslationPopover1 Header: string1");
							assert.ok(aHeaderItems1[2].getItems()[1].getEditable() === false, "oTranslationPopover1 Header: Editable false");
							assert.ok(aHeaderItems1[3].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.ok(oLanguageItems1.length === 49, "oTranslationPopover1 Content: length");
							assert.ok(oLanguageItems1[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover1 Content: item 0");
							for (var i = 1; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = "string1";
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.ok(oValueHelpIcon2 === null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "oField3: Input value help icon src");
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
							wait().then(function () {
								var oTranslationPopover3 = oField3.getAggregation("_field")._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.ok(aHeaderItems3[2].getItems()[1].getValue() === "String 3", "oTranslationPopover3 Header: String 3");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 49, "oTranslationPopover3 Content: length");
								assert.ok(oLanguageItems3[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover3 Content: item 0");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === "String 3", "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: String 3");
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.ok(oValueHelpIcon4.getSrc() === "sap-icon://translate", "oField4: Input value help icon src");
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
								wait().then(function () {
									var oTranslationPopover4 = oField4.getAggregation("_field")._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.ok(aHeaderItems4[2].getItems()[1].getValue() === "string4", "oTranslationPopover4 Header: string4");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.ok(oLanguageItems4.length === 49, "oTranslationPopover4 Content: length");
									assert.ok(oLanguageItems4[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover4 Content: item 0");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = "string4";
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();

								}).then(function () {
									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		_aCheckedLanguages.forEach(function(oCoreLanguage) {
			var sCoreLanguageKey = oCoreLanguage.key;
			_aCheckedLanguages.forEach(function(oEditorLanguage) {
				var sEditorLanguageKey = oEditorLanguage.key;
				var sCaseTitle = "Core: " + sCoreLanguageKey + ", Editor: " + sEditorLanguageKey;
				QUnit.test(sCaseTitle, function (assert) {
					var that = this;
					//Fallback language
					return new Promise(function (resolve, reject) {
						that.oEditor = createEditor(sCoreLanguageKey);
						that.oEditor.setMode("translation");
						that.oEditor.setLanguage(sEditorLanguageKey);
						that.oEditor.setAllowSettings(true);
						that.oEditor.setAllowDynamicValues(true);
						that.oEditor.setJson({
							baseUrl: sBaseUrl,
							host: "contexthost",
							manifest: _oManifestWithouti18n
						});
						that.oEditor.attachReady(function () {
							assert.ok(that.oEditor.isReady(), "Editor is ready");
							var oField1Ori = that.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = that.oEditor.getAggregation("_formContent")[4];
							var oField3Ori = that.oEditor.getAggregation("_formContent")[6];
							var oField3Trans = that.oEditor.getAggregation("_formContent")[7];
							var oField4Ori = that.oEditor.getAggregation("_formContent")[9];
							var oField4Trans = that.oEditor.getAggregation("_formContent")[10];
							wait().then(function () {
								assert.ok(oField1Ori.getAggregation("_field").getText() === "string1", "Field1Ori: string1");
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								assert.ok(oField1Trans.getAggregation("_field").getValue() === "string1", "Field1Trans: string1");
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.ok(oField1Trans.getAggregation("_field").getAggregation("_endIcon") === null, "Field1Trans: No Input value help icon");
								assert.ok(oField3Ori.getAggregation("_field").getText() === "String 3", "Field3Ori: String 3");
								assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
								assert.ok(oField3Trans.getAggregation("_field").getValue() === "String 3", "Field3Trans: String 3");
								assert.ok(oField3Trans.getAggregation("_field").isA("sap.m.Input"), "Field3Trans: Input control");
								assert.ok(oField3Trans.getAggregation("_field").getAggregation("_endIcon") === null, "Field3Trans: No Input value help icon");
								assert.ok(oField4Ori.getAggregation("_field").getText() === "string4", "Field4Ori: string4");
								assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
								assert.ok(oField4Trans.getAggregation("_field").getValue() === "string4", "Field4Trans: string4");
								assert.ok(oField4Trans.getAggregation("_field").isA("sap.m.Input"), "Field4Trans: Input control");
								assert.ok(oField4Trans.getAggregation("_field").getAggregation("_endIcon") === null, "Field4Trans: No Input value help icon");
							}).then(function () {
								destroyEditor(that.oEditor);
								resolve();
							});
						});
					});
				});
			});
		});
	});

	QUnit.module("Check the i18n folder only have the original i18n.properties file", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("Admin mode", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setMode("admin");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifestWithi18nOriginFileOnly
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = that.oEditor.getAggregation("_formContent")[9];
					var oField5 = that.oEditor.getAggregation("_formContent")[10];
					var oLabel6 = that.oEditor.getAggregation("_formContent")[11];
					var oField6 = that.oEditor.getAggregation("_formContent")[12];
					wait().then(function () {
						assert.ok(oLabel1.getText() === "Label 1 NOLANG", "Label1: Label 1 NOLANG");
						assert.ok(oField1.getAggregation("_field").getValue() === "String 1 NOLANG", "oField1: String 1 NOLANG");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.ok(oLabel2.getText() === "Label 2 NOLANG", "Label2: Label 2 NOLANG");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2", "oField2: String 2");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.ok(oLabel3.getText() === "Label 3 NOLANG", "Label3: Label 3 NOLANG");
						assert.ok(oField3.getAggregation("_field").getValue() === "String 3", "oField1: String 3");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.ok(oLabel4.getText() === "Label 4 NOLANG", "Label4: Label 4 NOLANG");
						assert.ok(oField4.getAggregation("_field").getValue() === "String 4 NOLANG", "oField1: String 4 NOLANG");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");
						assert.ok(oLabel5.getText() === "integer", "Label5: integer");
						assert.ok(oField5.getAggregation("_field").isA("sap.m.Input"), "oField5: Input control");
						assert.ok(oField5.getAggregation("_field").getValue() === "1", "oField5: 1");
						assert.ok(oField5.getAggregation("_field").getAggregation("_endIcon") === null, "oField5: No Input value help icon");
						assert.ok(oLabel6.getText() === "number", "Label6: number");
						assert.ok(oField6.getAggregation("_field").isA("sap.m.Input"), "oField6: Input control");
						assert.ok(oField6.getAggregation("_field").getValue() === "3", "oField6: 3");
						assert.ok(oField6.getAggregation("_field").getAggregation("_endIcon") === null, "oField6: No Input value help icon");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						wait().then(function () {
							var oTranslationPopover1 = oField1.getAggregation("_field")._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.ok(aHeaderItems1[0].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.ok(aHeaderItems1[1].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.ok(aHeaderItems1[2].getItems()[0].getText() === "English", "oTranslationPopover1 Header: English");
							assert.ok(aHeaderItems1[2].getItems()[1].getValue() === "String 1 NOLANG", "oTranslationPopover1 Header: String 1 NOLANG");
							assert.ok(aHeaderItems1[2].getItems()[1].getEditable() === false, "oTranslationPopover1 Header: Editable false");
							assert.ok(aHeaderItems1[3].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.ok(oLanguageItems1.length === 49, "oTranslationPopover1 Content: length");
							assert.ok(oLanguageItems1[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover1 Content: item 0");
							for (var i = 1; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = "String 1 NOLANG";
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.ok(oValueHelpIcon2 === null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "oField3: Input value help icon src");
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
							wait().then(function () {
								var oTranslationPopover3 = oField3.getAggregation("_field")._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.ok(aHeaderItems3[2].getItems()[1].getValue() === "String 3", "oTranslationPopover3 Header: String 3");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 49, "oTranslationPopover3 Content: length");
								assert.ok(oLanguageItems3[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover3 Content: item 0");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === "String 3", "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: String 3");
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.ok(oValueHelpIcon4.getSrc() === "sap-icon://translate", "oField4: Input value help icon src");
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
								wait().then(function () {
									var oTranslationPopover4 = oField4.getAggregation("_field")._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.ok(aHeaderItems4[2].getItems()[1].getValue() === "String 4 NOLANG", "oTranslationPopover4 Header: String 4 NOLANG");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.ok(oLanguageItems4.length === 49, "oTranslationPopover4 Content: length");
									assert.ok(oLanguageItems4[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover4 Content: item 0");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = "String 4 NOLANG";
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();

								}).then(function () {
									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("Content mode", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifestWithi18nOriginFileOnly
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = that.oEditor.getAggregation("_formContent")[9];
					var oField5 = that.oEditor.getAggregation("_formContent")[10];
					var oLabel6 = that.oEditor.getAggregation("_formContent")[11];
					var oField6 = that.oEditor.getAggregation("_formContent")[12];
					wait().then(function () {
						assert.ok(oLabel1.getText() === "Label 1 NOLANG", "Label1: Label 1 NOLANG");
						assert.ok(oField1.getAggregation("_field").getValue() === "String 1 NOLANG", "oField1: String 1 NOLANG");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.ok(oLabel2.getText() === "Label 2 NOLANG", "Label2: Label 2 NOLANG");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2", "oField2: String 2");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.ok(oLabel3.getText() === "Label 3 NOLANG", "Label3: Label 3 NOLANG");
						assert.ok(oField3.getAggregation("_field").getValue() === "String 3", "oField1: String 3");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.ok(oLabel4.getText() === "Label 4 NOLANG", "Label4: Label 4 NOLANG");
						assert.ok(oField4.getAggregation("_field").getValue() === "String 4 NOLANG", "oField1: String 4 NOLANG");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");
						assert.ok(oLabel5.getText() === "integer", "Label5: integer");
						assert.ok(oField5.getAggregation("_field").isA("sap.m.Input"), "oField5: Input control");
						assert.ok(oField5.getAggregation("_field").getValue() === "1", "oField5: 1");
						assert.ok(oField5.getAggregation("_field").getAggregation("_endIcon") === null, "oField5: No Input value help icon");
						assert.ok(oLabel6.getText() === "number", "Label6: number");
						assert.ok(oField6.getAggregation("_field").isA("sap.m.Input"), "oField6: Input control");
						assert.ok(oField6.getAggregation("_field").getValue() === "3", "oField6: 3");
						assert.ok(oField6.getAggregation("_field").getAggregation("_endIcon") === null, "oField6: No Input value help icon");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						wait().then(function () {
							var oTranslationPopover1 = oField1.getAggregation("_field")._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.ok(aHeaderItems1[0].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.ok(aHeaderItems1[1].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.ok(aHeaderItems1[2].getItems()[0].getText() === "English", "oTranslationPopover1 Header: English");
							assert.ok(aHeaderItems1[2].getItems()[1].getValue() === "String 1 NOLANG", "oTranslationPopover1 Header: String 1 NOLANG");
							assert.ok(aHeaderItems1[2].getItems()[1].getEditable() === false, "oTranslationPopover1 Header: Editable false");
							assert.ok(aHeaderItems1[3].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.ok(oLanguageItems1.length === 49, "oTranslationPopover1 Content: length");
							assert.ok(oLanguageItems1[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover1 Content: item 0");
							for (var i = 1; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = "String 1 NOLANG";
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.ok(oValueHelpIcon2 === null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "oField3: Input value help icon src");
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
							wait().then(function () {
								var oTranslationPopover3 = oField3.getAggregation("_field")._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.ok(aHeaderItems3[2].getItems()[1].getValue() === "String 3", "oTranslationPopover3 Header: String 3");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 49, "oTranslationPopover3 Content: length");
								assert.ok(oLanguageItems3[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover3 Content: item 0");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === "String 3", "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: String 3");
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.ok(oValueHelpIcon4.getSrc() === "sap-icon://translate", "oField4: Input value help icon src");
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
								wait().then(function () {
									var oTranslationPopover4 = oField4.getAggregation("_field")._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.ok(aHeaderItems4[2].getItems()[1].getValue() === "String 4 NOLANG", "oTranslationPopover4 Header: String 4 NOLANG");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.ok(oLanguageItems4.length === 49, "oTranslationPopover4 Content: length");
									assert.ok(oLanguageItems4[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover4 Content: item 0");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = "String 4 NOLANG";
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();

								}).then(function () {
									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("All mode", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setMode("all");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifestWithi18nOriginFileOnly
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = that.oEditor.getAggregation("_formContent")[9];
					var oField5 = that.oEditor.getAggregation("_formContent")[10];
					var oLabel6 = that.oEditor.getAggregation("_formContent")[11];
					var oField6 = that.oEditor.getAggregation("_formContent")[12];
					wait().then(function () {
						assert.ok(oLabel1.getText() === "Label 1 NOLANG", "Label1: Label 1 NOLANG");
						assert.ok(oField1.getAggregation("_field").getValue() === "String 1 NOLANG", "oField1: String 1 NOLANG");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.ok(oLabel2.getText() === "Label 2 NOLANG", "Label2: Label 2 NOLANG");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2", "oField2: String 2");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.ok(oLabel3.getText() === "Label 3 NOLANG", "Label3: Label 3 NOLANG");
						assert.ok(oField3.getAggregation("_field").getValue() === "String 3", "oField1: String 3");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.ok(oLabel4.getText() === "Label 4 NOLANG", "Label4: Label 4 NOLANG");
						assert.ok(oField4.getAggregation("_field").getValue() === "String 4 NOLANG", "oField1: String 4 NOLANG");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");
						assert.ok(oLabel5.getText() === "integer", "Label5: integer");
						assert.ok(oField5.getAggregation("_field").isA("sap.m.Input"), "oField5: Input control");
						assert.ok(oField5.getAggregation("_field").getValue() === "1", "oField5: 1");
						assert.ok(oField5.getAggregation("_field").getAggregation("_endIcon") === null, "oField5: No Input value help icon");
						assert.ok(oLabel6.getText() === "number", "Label6: number");
						assert.ok(oField6.getAggregation("_field").isA("sap.m.Input"), "oField6: Input control");
						assert.ok(oField6.getAggregation("_field").getValue() === "3", "oField6: 3");
						assert.ok(oField6.getAggregation("_field").getAggregation("_endIcon") === null, "oField6: No Input value help icon");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						wait().then(function () {
							var oTranslationPopover1 = oField1.getAggregation("_field")._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.ok(aHeaderItems1[0].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.ok(aHeaderItems1[1].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.ok(aHeaderItems1[2].getItems()[0].getText() === "English", "oTranslationPopover1 Header: English");
							assert.ok(aHeaderItems1[2].getItems()[1].getValue() === "String 1 NOLANG", "oTranslationPopover1 Header: String 1 NOLANG");
							assert.ok(aHeaderItems1[2].getItems()[1].getEditable() === false, "oTranslationPopover1 Header: Editable false");
							assert.ok(aHeaderItems1[3].getText() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.ok(oLanguageItems1.length === 49, "oTranslationPopover1 Content: length");
							assert.ok(oLanguageItems1[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover1 Content: item 0");
							for (var i = 1; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = "String 1 NOLANG";
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.ok(oValueHelpIcon2 === null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "oField3: Input value help icon src");
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
							wait().then(function () {
								var oTranslationPopover3 = oField3.getAggregation("_field")._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.ok(aHeaderItems3[2].getItems()[1].getValue() === "String 3", "oTranslationPopover3 Header: String 3");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 49, "oTranslationPopover3 Content: length");
								assert.ok(oLanguageItems3[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover3 Content: item 0");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === "String 3", "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: String 3");
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.ok(oValueHelpIcon4.getSrc() === "sap-icon://translate", "oField4: Input value help icon src");
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
								wait().then(function () {
									var oTranslationPopover4 = oField4.getAggregation("_field")._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.ok(aHeaderItems4[2].getItems()[1].getValue() === "String 4 NOLANG", "oTranslationPopover4 Header: String 4 NOLANG");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.ok(oLanguageItems4.length === 49, "oTranslationPopover4 Content: length");
									assert.ok(oLanguageItems4[0].getTitle() === that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover4 Content: item 0");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = "String 4 NOLANG";
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();

								}).then(function () {
									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		_aCheckedLanguages.forEach(function(oCoreLanguage) {
			var sCoreLanguageKey = oCoreLanguage.key;
			_aCheckedLanguages.forEach(function(oEditorLanguage) {
				var sEditorLanguageKey = oEditorLanguage.key;
				var sCaseTitle = "Core: " + sCoreLanguageKey + ", Editor: " + sEditorLanguageKey;
				QUnit.test(sCaseTitle, function (assert) {
					var that = this;
					//Fallback language
					return new Promise(function (resolve, reject) {
						that.oEditor = createEditor(sCoreLanguageKey);
						that.oEditor.setMode("translation");
						that.oEditor.setLanguage(sEditorLanguageKey);
						that.oEditor.setAllowSettings(true);
						that.oEditor.setAllowDynamicValues(true);
						that.oEditor.setJson({
							baseUrl: sBaseUrl,
							host: "contexthost",
							manifest: _oManifestWithi18nOriginFileOnly
						});
						that.oEditor.attachReady(function () {
							assert.ok(that.oEditor.isReady(), "Editor is ready");
							var oField1Ori = that.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = that.oEditor.getAggregation("_formContent")[4];
							var oField3Ori = that.oEditor.getAggregation("_formContent")[6];
							var oField3Trans = that.oEditor.getAggregation("_formContent")[7];
							var oField4Ori = that.oEditor.getAggregation("_formContent")[9];
							var oField4Trans = that.oEditor.getAggregation("_formContent")[10];
							wait().then(function () {
								assert.ok(oField1Ori.getAggregation("_field").getText() === "String 1 NOLANG", "Field1Ori: String 1 NOLANG");
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								assert.ok(oField1Trans.getAggregation("_field").getValue() === "String 1 NOLANG", "Field1Trans: String 1 NOLANG");
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.ok(oField1Trans.getAggregation("_field").getAggregation("_endIcon") === null, "Field1Trans: No Input value help icon");
								assert.ok(oField3Ori.getAggregation("_field").getText() === "String 3", "Field3Ori: String 3");
								assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
								assert.ok(oField3Trans.getAggregation("_field").getValue() === "String 3", "Field3Trans: String 3");
								assert.ok(oField3Trans.getAggregation("_field").isA("sap.m.Input"), "Field3Trans: Input control");
								assert.ok(oField3Trans.getAggregation("_field").getAggregation("_endIcon") === null, "Field3Trans: No Input value help icon");
								assert.ok(oField4Ori.getAggregation("_field").getText() === "String 4 NOLANG", "Field4Ori: String 4 NOLANG");
								assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
								assert.ok(oField4Trans.getAggregation("_field").getValue() === "String 4 NOLANG", "Field4Trans: String 4 NOLANG");
								assert.ok(oField4Trans.getAggregation("_field").isA("sap.m.Input"), "Field4Trans: Input control");
								assert.ok(oField4Trans.getAggregation("_field").getAggregation("_endIcon") === null, "Field4Trans: No Input value help icon");
							}).then(function () {
								destroyEditor(that.oEditor);
								resolve();
							});
						});
					});
				});
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
