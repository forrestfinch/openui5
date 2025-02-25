/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/MultiInput",
	"sap/m/Token",
	"sap/ui/core/Core",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/core/ListItem",
	"sap/base/util/ObjectPath",
	"sap/base/util/deepEqual"
], function (
	Control,
	MultiInput,
	Token,
	Core,
	BindingHelper,
	ListItem,
	ObjectPath,
	deepEqual
) {
	"use strict";

	var sBuildInViz = "sap/ui/integration/editor/fields/viz";

	/**
	 * @class
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.editor.fields.BaseField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 * @experimental since 1.83.0
	 */
	var BaseField = Control.extend("sap.ui.integration.editor.fields.BaseField", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				configuration: {
					type: "object"
				},
				specialButton: {
					type: "object"
				},
				mode: {
					type: "string"
				},
				host: {
					type: "object"
				},
				visible: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				_field: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				_dynamicField: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				_messageIcon: {
					type: "sap.ui.core.Icon",
					multiple: false,
					visibility: "hidden"
				},
				_messageStrip: {
					type: "sap.m.MessageStrip",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				afterInit: {}
			}
		},
		renderer: function (oRm, oControl) {
			var oField = oControl.getAggregation("_field"),
				oDynamicField = oControl._getDynamicField();
			oRm.openStart("div");
			oRm.addClass("sapUiIntegrationEditorItemField");
			if (oField && oField.getWidth) {
				//oRm.addStyle("width", oField.getWidth());
			}
			if (!oControl.getVisible()) {
				oRm.addStyle("display", "none");
			}
			oRm.writeElementData(oControl);
			oRm.openEnd();
			if (oControl.getVisible()) {
				oRm.openStart("span");
				oRm.openEnd();
				oRm.openStart("span");
				oRm.addClass("sapUiIntegrationEditorEditor");
				if (oControl._hasDynamicValue()) {
					oRm.addStyle("width", "1px");
					oRm.addStyle("opacity", "0");
				} else {
					oRm.addStyle("width", "100%");
				}
				oRm.openEnd();
				oRm.renderControl(oField);
				oRm.close("span");
				oRm.close("span");
				if (oControl._hasDynamicValue()) {
					oRm.openStart("span");
					oRm.addClass("sapUiIntegrationEditorSettings");
					oRm.openEnd();
					oRm.openStart("span");
					oRm.addClass("sapUiIntegrationEditorSettingsField");
					oRm.addStyle("width", "100%");
					oRm.addStyle("opacity", "1");
					oRm.openEnd();
					oRm.renderControl(oDynamicField);
					oRm.close("span");
				}
				oRm.openStart("div");
				oRm.writeAttribute("id", oControl.getId() + "-ms");
				oRm.addStyle("height", "0");
				oRm.openEnd();
				oRm.close("div");
			}
			oRm.close("div");

		}
	});

	BaseField.prototype.init = function () {
		this._readyPromise = new Promise(function (resolve) {
			this._fieldResolver = resolve;
		}.bind(this));
	};

	BaseField.prototype.getMessagestrip = function () {
		var sMessageStripId = this.getAssociation("_messageStrip");
		return Core.byId(sMessageStripId);
	};

	BaseField.prototype.getMessageIcon = function () {
		var sMessageIconId = this.getAssociation("_messageIcon");
		return Core.byId(sMessageIconId);
	};

	BaseField.prototype._removeValidationMessage = function () {
		var oField = this.control,
		    oMessageIcon = oField.getParent().getMessageIcon();
		if (oMessageIcon) {
			oMessageIcon.setVisible(false);
		}
		if (oField.getEnabled()) {
			oField.setEnabled(false);
		}
	};

	BaseField.prototype.getResourceBundle = function() {
		return this.getModel("i18n").getResourceBundle();
	};

	BaseField.prototype.setConfiguration = function (oConfig, bSuppress) {
		if (oConfig !== this.getConfiguration()) {
			//sanitize configuration
			this._sanitizeValidationSettings(oConfig);
			this.setProperty("configuration", oConfig, bSuppress);
			if (oConfig) {
				//async to ensure all settings that are applied sync are processed.
				Promise.resolve().then(function () {
					this.initEditor(oConfig);
				}.bind(this));

			}
		}
		return this;
	};

	BaseField.prototype._sanitizeValidationSettings = function (oConfig) {
		oConfig.validations = oConfig.validations || [];
		if (oConfig.validation && oConfig.validations && Array.isArray(oConfig.validations)) {
			oConfig.validations.push(oConfig.validation);
			delete oConfig.validation;
		}
		if (oConfig.validation && !oConfig.validations) {
			oConfig.validations = [oConfig.validation];
			delete oConfig.validation;
		}
		if (oConfig.required) {
			oConfig.validations.unshift({
				"required": true,
				"type": "error"
			});
		}
	};

	BaseField.prototype._triggerValidation = function (value) {
		if (deepEqual(value, this._preChangedValue) && this._messageFrom === "validation") {
			return;
		}
		this._preChangedValue = value;
		var oConfig = this.getConfiguration();
		//check if trigger validation
		var doValidation = false;
		if (oConfig.required) {
			doValidation = true;
		} else if (oConfig.type === "string" && value) {
			doValidation = true;
		} else if ((oConfig.type === "integer" || oConfig.type === "number") && !isNaN(value)) {
			//the value passed in is "" when empty the field
			if (value !== "") {
				doValidation = true;
			}
		} else if (oConfig.type === "boolean") {
			doValidation = true;
		} else if (oConfig.type === "string[]" && Array.isArray(value)) {
			doValidation = true;
		}
		if (oConfig.validations && Array.isArray(oConfig.validations) && doValidation) {
			for (var i = 0; i < oConfig.validations.length; i++) {
				if (!this._handleValidation(oConfig.validations[i], value)) {
					return false;
				}
			}
			this._hideValueState();
		}
		return true;
	};
	/*
		default error messages
		#XMSG: Validation Error: Does not match pattern
		EDITOR_VAL_NOMATCH=Value does not match the validation criteria

		#XMSG: Validation Error: Max length exceeded
		EDITOR_VAL_MAXLENGTH=Value exceeds the maximum length of {0}

		#XMSG: Validation Error: Min length
		EDITOR_VAL_MINLENGTH=Value needs to be minimal {0} characters

		#XMSG: Validation Error: Number required
		EDITOR_VAL_TEXTREQ=Field is required, please enter a text

		#XMSG: Validation Error: List required
		EDITOR_VAL_LISTREQ=Field is required, please select 1 item

		#XMSG: Validation Error: Number Maximum Inclusive
		EDITOR_VAL_MAX_E=Value needs to be {0} or less

		#XMSG: Validation Error: Number Minimum Inclusive
		EDITOR_VAL_MIN_E=Value needs to be {0} or greater

		#XMSG: Validation Error: Number Maximum Exclusive
		EDITOR_VAL_MAX_E=Value needs to be less than {0}

		#XMSG: Validation Error: Number Minimum Exclusive
		EDITOR_VAL_MIN_E=Value needs to be greater than {0}


		#XMSG: Validation Error: Number Multiple Of
		EDITOR_VAL_MULTIPLE=Value needs to be a multiple of {0}

		#XMSG: Validation Error: Number required
		EDITOR_VAL_NUMBERREQ=Field is required, please enter a number
	*/

	BaseField.validations = {
		string: {
			maxLength: function (v, max) {
				return v.length <= max;
			},
			maxLengthTxt: "EDITOR_VAL_MAXLENGTH",
			minLength: function (v, min) {
				return v.length >= min;
			},
			minLengthTxt: "EDITOR_VAL_MINLENGTH",
			pattern: function (v, pattern) {
				var p = new RegExp(pattern);
				return p.test(v);
			},
			patternTxt: "EDITOR_VAL_NOMATCH",
			required: function (v, b) {
				return b && !!v;
			},
			requiredTxt: "EDITOR_VAL_TEXTREQ",
			validateTxt: "EDITOR_VAL_NOMATCH"
		},
		"string[]": {
			maxLength: function (v, max) {
				return Array.isArray(v) && v.length <= max;
			},
			maxLengthTxt: "EDITOR_VAL_LISTMAXLENGTH",
			minLength: function (v, min) {
				return Array.isArray(v) && v.length >= min;
			},
			minLengthTxt: "EDITOR_VAL_LISTMINLENGTH",
			required: function (v, b) {
				return Array.isArray(v) && v.length > 0;
			},
			requiredTxt: "EDITOR_VAL_LISTREQ"
		},
		integer: {
			maximum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMaximum) {
					valSettings._txt = "maximumExclusiveTxt";
					return v < valValue;
				}
				return v <= valValue;
			},
			maximumTxt: "EDITOR_VAL_MAX",
			maximumExclusiveTxt: "EDITOR_VAL_MAX_E",
			minimum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMinimum) {
					valSettings._txt = "minimumExclusiveTxt";
					return v > valValue;
				}
				return v >= valValue;
			},
			minimumTxt: "EDITOR_VAL_MIN",
			minimumExclusiveTxt: "EDITOR_VAL_MIN_E",
			multipleOf: function (v, valValue) {
				return (v % valValue) === 0;
			},
			multipleOfTxt: "EDITOR_VAL_MULTIPLE",
			required: function (v, b) {
				return !isNaN(v) && v !== "";
			},
			requiredTxt: "EDITOR_VAL_NUMBERREQ",
			validateTxt: "EDITOR_VAL_NOMATCH"
		},
		number: {
			maximum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMaximum) {
					valSettings._txt = "maximumExclusiveTxt";
					return v < valValue;
				}
				return v <= valValue;
			},
			maximumTxt: "EDITOR_VAL_MAX",
			maximumExclusiveTxt: "EDITOR_VAL_MAX_E",
			minimum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMinimum) {
					valSettings._txt = "minimumExclusiveTxt";
					return v > valValue;
				}
				return v >= valValue;
			},
			minimumTxt: "EDITOR_VAL_MIN",
			minimumExclusiveTxt: "EDITOR_VAL_MAX_E",
			multipleOf: function (v, valValue) {
				return (v % valValue) === 0;
			},
			multipleOfTxt: "EDITOR_VAL_MULTIPLE",
			required: function (v, b) {
				return !isNaN(v) && v !== "";
			},
			requiredTxt: "EDITOR_VAL_NUMBERREQ",
			validateTxt: "EDITOR_VAL_NOMATCH"
		}
	};

	BaseField.prototype._requestData = function (oRequest) {
		var oField = this.control.getParent();
		var oConfig = oField.getConfiguration();
		var oDataProvider = oField._oDataProviderFactory.create(oRequest.data);
		oField.getModel("currentSettings").setProperty(oConfig._settingspath + "/_loading", true);
		var oPromise = oDataProvider.getData();
		return oPromise.then(function (oData) {
			oField.getModel("currentSettings").setProperty(oConfig._settingspath + "/_loading", false);
			var sPath = oRequest.data.path || "/";
			if (sPath.startsWith("/")) {
				sPath = sPath.substring(1);
			}
			if (sPath.endsWith("/")) {
				sPath = sPath.substring(0, sPath.length - 1);
			}
			var aPath = sPath.split("/");
			var oResult = ObjectPath.get(aPath, oData);
			return oResult;
		});
	};

	BaseField.prototype._handleValidation = function (oSettings, oValue) {
		var oConfig = this.getConfiguration(),
			oValidations = BaseField.validations[oConfig.type];
		var fnFailed = function(n, oData) {
			var sError;
			if (typeof oSettings.message === "function") {
				sError = oSettings.message(oValue, oConfig, oData);
			} else {
				sError = oSettings.message;
			}
			if (!sError) {
				if (oSettings._txt) {
					sError = this.getResourceBundle().getText(oValidations[oSettings._txt], [oSettings[n]]);
				} else {
					sError = this.getResourceBundle().getText(oValidations[n + "Txt"], [oSettings[n]]);
				}
			}
			this._showValueState(oSettings.type || "error", sError);
		}.bind(this);
		if (oSettings["validate"]) {
			var oContext = {
				control: this.getAggregation("_field"),
				requestData: this._requestData,
				removeValidationMessage: this._removeValidationMessage
			};
			var fnValidate = oSettings["validate"];
			Promise.resolve(fnValidate(oValue, oConfig, oContext)).then(function(result) {
				var bIsValid = result.isValid;
				if (typeof bIsValid === "undefined") {
					bIsValid = result;
				}
				var oData = result.data ? result.data : undefined;
				if (!bIsValid) {
					fnFailed("validate", oData);
					return false;
				} else {
					this._hideValueState(true, false);
					return true;
				}
			}.bind(this));
		} else {
			for (var n in oSettings) {
				if (oValidations) {
					var fn = oValidations[n];
					oSettings._txt = "";
					if (fn) {
						if (!fn(oValue, oSettings[n], oSettings)) {
							fnFailed(n);
							return false;
						}
					}
				}
			}
		}
		return true;
	};

	BaseField.prototype.onAfterRendering = function () {
		this._applyMessage();
		var oMessageStrip = this.getMessagestrip();
		if (oMessageStrip && oMessageStrip.getDomRef()) {
			oMessageStrip.getDomRef().style.opacity = "0";
		}
	};

	BaseField.prototype._applyMessage = function () {
		var oIcon = Core.byId(this.getAssociation("_messageIcon"));
		if (this.getAssociation("_messageIcon") && oIcon) {
			var oIconDomRef = oIcon.getDomRef();
			if (oIconDomRef) {
				oIconDomRef.classList.remove("error");
				oIconDomRef.classList.remove("warning");
				oIconDomRef.classList.remove("success");
				if (this._message) {
					oIconDomRef.classList.add(this._message.type);
				}
			}
		}
		// add hasError property for error handling of panel
		if (this._message && (this._message.type === "error" || this._message.type === "warning")) {
			var sErrorType = this._message.type === "error" ? "Error" : "Warning";
			this._setCurrentProperty("hasError", true);
			this._setCurrentProperty("errorType", sErrorType);
		} else {
			this._setCurrentProperty("hasError", false);
			this._setCurrentProperty("errorType", "None");
		}
	};

	BaseField.prototype._showValueState = function (sType, sMessage, bFromDataRequest) {
		var oField = this.getAggregation("_field"),
			sEnumType = sType.substring(0, 1).toUpperCase() + sType.substring(1);
		this._message = {
			"enum": sEnumType,
			"type": sType,
			"message": sMessage,
			"atControl": false
		};
		this._messageFrom = "validation";
		if (bFromDataRequest) {
			this._messageFrom = "request";
		}
		var oMessageStrip = this.getMessagestrip();
		if (oField && oField.setValueState) {
			this._message.atControl = true;
			if (oField.setShowValueStateMessage) {
				oField.setShowValueStateMessage(false);
			}
			oField.setValueState(sEnumType);
			oField.setValueStateText(sMessage);
		} else if (oMessageStrip && oMessageStrip.getVisible() && oField.getMetadata().getName() !== "sap.m.Switch") {
			this._showMessage();
		}
		this._applyMessage();
	};

	BaseField.prototype._hideValueState = function (bFromDataRequest, bTriggerValidationAgain) {
		if (!this.getParent()) {
			return;
		}
		var oMessageStrip = this.getMessagestrip();
		if (this._message) {
			if ((bFromDataRequest && this._messageFrom === "request")
				|| (!bFromDataRequest && this._messageFrom === "validation")) {
				var oField = this.getAggregation("_field");
				this._message = {
					"enum": "Success",
					"type": "success",
					"message": "Corrected",
					"atControl": this._message.atControl
				};
				this._messageFrom = "validation";
				if (bFromDataRequest) {
					this._messageFrom = "request";
				}
				if (this._messageto) {
					clearTimeout(this._messageto);
				}
				this._messageto = setTimeout(function () {
					this._messageto = null;
					this._applyMessage();
					if (!this._message && oField.setValueState) {
						oField.setValueState("None");
					}
				}.bind(this), 1500);
				this._applyMessage();
				if (oMessageStrip) {
					if (oMessageStrip.getDomRef()) {
						oMessageStrip.getDomRef().style.opacity = "0";
					}
					oMessageStrip.onAfterRendering = null;
				}
				if (oField.setValueState) {
					oField.setValueState("Success");
				}
				if (oField.setValueStateText) {
					oField.setValueStateText("");
				}
				this._message = null;
			}
			if (!this._message && bFromDataRequest && bTriggerValidationAgain) {
				//check validations
				this._triggerValidation(this.getConfiguration().value);
			}
		}
	};
	BaseField.prototype.onfocusin = function (oEvent) {
		if (oEvent && oEvent.target.classList.contains("sapMBtn")) {
			return;
		}
		this._showMessage();
	};
	BaseField.prototype.onfocusout = function (oEvent) {
		this._hideMessage();
	};

	BaseField.prototype._showMessage = function () {
		if (!this.getParent()) {
			return;
		}
		var oMessageStrip = this.getMessagestrip();
		if (this._message && oMessageStrip) {
			oMessageStrip.applySettings({
				type: this._message.enum,
				text: this._message.message
			});

			var that = this;
			oMessageStrip.onAfterRendering = function () {
				oMessageStrip.getDomRef().style.zIndex = "1";
				oMessageStrip.getDomRef().style.opacity = "1";
				that.getDomRef("ms") && that.getDomRef("ms").appendChild(oMessageStrip.getDomRef());
				var oField = that.getAggregation("_field");
				if (that._message && !that._message.atControl) {
					oMessageStrip.getDomRef().style.marginTop = "0";
					oMessageStrip.getDomRef().style.marginLeft = "0";
				}
				var width = oField.getDomRef() ? oField.getDomRef().offsetWidth - 5 : 100;
				if (width <= 100) {
					width = oField.getParent().getDomRef() ? oField.getParent().getDomRef().offsetWidth - 35 : 100;
				}
				oMessageStrip.getDomRef().style.width = width + "px";
			};
			oMessageStrip.rerender();
		}
	};

	BaseField.prototype._hideMessage = function () {
		var oMessageStrip = this.getMessagestrip();
		var oField = this.getAggregation("_field"),
			bFocusInField = oField.getDomRef() && oField.getDomRef().contains(window.document.activeElement);
		if (oMessageStrip) {
			if (!bFocusInField && oMessageStrip.getDomRef()) {
				oMessageStrip.getDomRef().style.opacity = "0";
				oMessageStrip.getDomRef().style.zIndex = "-1";
			}
			oMessageStrip.onAfterRendering = null;
		}
	};

	BaseField.prototype.initEditor = function (oConfig) {
		var oControl;
		this._settingsModel = this.getModel("currentSettings");
		this.initVisualization && this.initVisualization(oConfig);
		if (this._visualization.editor) {
			oControl = this._visualization.editor;
		} else if (this._visualization.type) {
			if (typeof this._visualization.type === "string") {
				if (this._visualization.type.indexOf("/") === -1) {
					this._visualization.type = sBuildInViz + "/" + this._visualization.type;
					this._visualization.settings = this._visualization.settings || {
						value: "{currentSettings>value}",
						editable: oConfig.editable
					};
				}
				sap.ui.require([this._visualization.type], function (f) {
					this._visualization.type = f;
					this.initEditor(oConfig);
				}.bind(this));
				return;
			}
			oControl = new this._visualization.type(this._visualization.settings || {});
		}
		if (oControl instanceof Control) {
			this.setAggregation("_field", oControl);
			if (oControl.attachChange) {
				oControl.attachChange(function (oEvent) {
					if (oEvent.mParameters.value === "") {
						// for list field, if change value === "", should validate the whole value list
						var oConfig = this.getConfiguration();
						if (oConfig.type === "string[]") {
							this._triggerValidation(oConfig.value);
						} else {
							this._triggerValidation(oEvent.getParameter("value"));
						}
					}
				}.bind(this));
			}
			/*if (oControl.attachChange) {
				oControl.attachChange(function (oEvent) {
					var value;
					if (oConfig.type === "string[]") {
						value = oConfig.value || [];
						var sText = oEvent.getParameter("value");
						var oSelectedItem = oEvent.getSource().getItemByText(sText);
						if (oSelectedItem) {
							value = value.concat([oSelectedItem.getKey()]);
						}
					} else if (oEvent.getParameters()) {
						if (oEvent.getParameters().hasOwnProperty("value")) {
							value = oEvent.getParameter("value");
						} else if (oEvent.getParameters().hasOwnProperty("state")) {
							value = oEvent.getParameter("state");
						}
					}
					this._triggerValidation(value);
				}.bind(this));
			}*/
			var oBinding = this.getModel("currentSettings").bindProperty("value", this.getBindingContext("currentSettings"));
			oBinding.attachChange(function () {
				this._triggerValidation(oConfig.value);
			}.bind(this));
			this._triggerValidation(oConfig.value);
		}
		//default is true, Card editor needs set to false for translation and page admin mode if needed
		var sMode = this.getMode();
		oConfig.allowSettings = oConfig.allowSettings || oConfig.allowSettings !== false && sMode === "admin";
		oConfig.allowDynamicValues = oConfig.allowDynamicValues || oConfig.allowDynamicValues !== false;
		oConfig._changeDynamicValues = oConfig.visible && oConfig.editable && (oConfig.allowDynamicValues || oConfig.allowSettings) && sMode !== "translation";
		if (oConfig._changeDynamicValues) {
			this._getDynamicField();
		}
		this._applySettings(oConfig);
		this.fireAfterInit();
	};

	/**
	 * Abstract, implemented by sub classes
	 */
	BaseField.prototype.initVisualization = function () {
	};

	/**
	 * Check if the value is a dynamic value
	 */
	BaseField.prototype._hasDynamicValue = function () {
		var vValue = this._getCurrentProperty("value");
		var bDynamicValue = typeof vValue === "string" && (vValue.indexOf("{context>") === 0 || vValue.indexOf("{{parameters") === 0);
		this._setCurrentProperty("_hasDynamicValue", bDynamicValue);
		return bDynamicValue;
	};

	/**
	 * Check if the _next setting is present and the inner values differ from the default values
	 */
	BaseField.prototype._hasSettings = function () {
		var oConfig = this.getConfiguration();
		if (oConfig._next) {
			var bVisibleDefault = oConfig.hasOwnProperty("visibleToUser") ? oConfig.visibleToUser : true;
			var bEditableDefault = oConfig.hasOwnProperty("editableToUser") ? oConfig.editableToUser : true;
			var bEditable = oConfig._next.visible === false ? false : oConfig._next.editable;
			var bAllowDynamicValuesDefault = oConfig.hasOwnProperty("allowDynamicValues") ? oConfig.allowDynamicValues : true;
			oConfig._hasSettings = (
				oConfig._next.visible === !bVisibleDefault ||
				bEditable === !bEditableDefault ||
				oConfig._next.allowDynamicValues === !bAllowDynamicValuesDefault
			);
		} else {
			oConfig._hasSettings = false;
			if (oConfig.hasOwnProperty("editableToUser") || oConfig.hasOwnProperty("visibleToUser")) {
				oConfig._next = {};
			}
			if (oConfig.hasOwnProperty("editableToUser")) {
				oConfig._next.editable = oConfig.editableToUser;
			}
			if (oConfig.hasOwnProperty("visibleToUser")) {
				oConfig._next.visible = oConfig.visibleToUser;
			}
		}
		return oConfig._hasSettings;
	};

	BaseField.prototype._getDynamicField = function () {
		var oField = this.getAggregation("_dynamicField");
		if (!oField) {
			var oField = new MultiInput({
				showValueHelp: false
			});
			this.setAggregation("_dynamicField", oField);
		}
		return oField;
	};

	BaseField.prototype._hideDynamicField = function () {
		var oDynamicField = this._getDynamicField(),
			oField = this.getAggregation("_field");
		if (oDynamicField.getDomRef()) {
			var oStyle = oDynamicField.getDomRef().parentNode.style;
			oStyle.width = "1px";
			oStyle.opacity = 0;
			oStyle = oField.getDomRef().parentNode.style;
			oField.getDomRef().style.visibility = "visible";
			oStyle.width = "100%";
			oStyle.opacity = 1;
		}
	};

	BaseField.prototype._showDynamicField = function () {
		var oDynamicField = this._getDynamicField(),
			oField = this.getAggregation("_field");
		if (oDynamicField.getDomRef()) {
			var oStyle = oDynamicField.getDomRef().parentNode.style;
			oStyle.width = "100%";
			oStyle.opacity = 1;
			oStyle = oField.getDomRef().parentNode.style;
			oField.getDomRef().style.visibility = "hidden";
			oStyle.width = "1px";
			oStyle.opacity = 0;
		}
	};

	BaseField.prototype._setCurrentProperty = function (sProperty, vValue) {
		//avoid fire binding changes in the model
		if (this._getCurrentProperty(sProperty) !== vValue) {
			this.getModel("currentSettings").setProperty(sProperty, vValue, this.getBindingContext("currentSettings"));
		}
	};

	BaseField.prototype._getCurrentProperty = function (sProperty) {
		return this.getModel("currentSettings").getProperty(sProperty, this.getBindingContext("currentSettings"));
	};

	BaseField.prototype._applySettings = function (oData) {
		var oDynamicField = this._getDynamicField(),
			o = this.getModel("contextflat")._getValueObject(oData.value);
		oDynamicField.removeAllTokens();
		if (!this._getCurrentProperty("_changeDynamicValues")) {
			oDynamicField.setEnabled(false);
		}
		if (o && o.path !== "empty") {
			if (o.object.value && o.object.value.indexOf("{{") == 0) {
				this._setCurrentProperty("value", o.object.value);
			} else {
				this._setCurrentProperty("value", o.value);
			}

			oDynamicField.addToken(new Token({
				text: o.object.label,
				"delete": function () {
					this._setCurrentProperty("value", "");
					if (!this._hasDynamicValue()) {
						this._hideDynamicField();
					}
					this._applyButtonStyles();
					window.setTimeout(function () {
						//this closes a popup that might be still open.
						this.getAggregation("_field").focus();
					}.bind(this), 100);
				}.bind(this)
			}));
		} else {
			this._setCurrentProperty("value", oData.value);
			this._setCurrentProperty("_changed", oData._changed);
			this._hideDynamicField();
		}
		//apply settings
		this._setCurrentProperty("_next", oData._next);
		this._applyButtonStyles();
		if (!this._hasDynamicValue()) {
			this._hideDynamicField();
		} else {
			this._showDynamicField();
		}
		this._fieldResolver && this._fieldResolver();
		this._fieldResolver = null;
	};

	BaseField.prototype._cancelSettings = function () {
		this._applyButtonStyles();
		if (!this._hasDynamicValue()) {
			this._hideDynamicField();
		}
	};

	BaseField.prototype._applyButtonStyles = function () {
		if (!this._settingsButton) {
			return;
		}
		if (!this._hasDynamicValue()) {
			this._settingsButton.removeStyleClass("dynamicvalue");
		} else {
			this._settingsButton.addStyleClass("dynamicvalue");
		}
		if (!this._hasSettings()) {
			this._settingsButton.removeStyleClass("settings");
		} else {
			this._settingsButton.addStyleClass("settings");
		}
	};

	//check if need to filter backend by input, used for ComoboBox in StringField and MultiComboBox in ListField
	BaseField.prototype.isFilterBackend = function () {
		var oConfig = this.getConfiguration();
		var bIsFilterBackend = false;
		if (oConfig && oConfig.values && oConfig.values.data) {
			if (oConfig.values.data.request && oConfig.values.data.request.parameters && oConfig.values.data.request.parameters.$filter && oConfig.values.data.request.parameters.$filter.indexOf("{currentSettings>suggestValue}") > -1) {
				//if contains a '$filter' parameter with key word '{currentSettings>suggestValue}' in the values.data.request.parameters
				bIsFilterBackend = true;
			} else if (oConfig.values.data.request && oConfig.values.data.request.url && oConfig.values.data.request.url.indexOf("{currentSettings>suggestValue}") > -1) {
				//if contains a '$filter' parameter with key word '{currentSettings>suggestValue}' in the values.data.request.url
				bIsFilterBackend = true;
			}
		}
		return  bIsFilterBackend;
	};

	BaseField.prototype.formatListItem = function (vItems) {
		var oItem = new ListItem();
		for (var key in vItems) {
			oItem.bindProperty(key, BindingHelper.createBindingInfos(vItems[key]));
		}
		return oItem;
	};

	return BaseField;
});
