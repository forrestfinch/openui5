/*!
 * ${copyright}
 */

// Provides class sap.ui.core.FocusHandler
sap.ui.define([
	'../base/Object',
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "control"
	"sap/ui/dom/jquery/control"
],
	function(BaseObject, Log, jQuery) {
	"use strict";




		/**
		 * Constructs an instance of an sap.ui.core.FocusHandler.
		 * Keeps track of the focused element.
		 *
		 * @class Keeps track of the focused element.
		 * @param {Element} oRootRef e.g. document.body
		 * @param {sap.ui.core.Core} oCore Reference to the Core implementation
		 * @alias sap.ui.core.FocusHandler
		 * @extends sap.ui.base.Object
		 * @private
		 */
		var FocusHandler = BaseObject.extend("sap.ui.core.FocusHandler", /** @lends sap.ui.core.FocusHandler.prototype */ {
			constructor : function(oRootRef, oCore) {
				BaseObject.apply(this);

				this.oCore = oCore;

				// keep track of element currently in focus
				this.oCurrent = null;
				// keep track of the element previously had the focus
				this.oLast = null;
				// buffer the focus/blur events for correct order
				this.aEventQueue = [];
				// keep track of last focused element
				this.oLastFocusedControlInfo = null;
				// keep track of focused element which is using Renderer.apiVersion=2
				this.oPatchingControlFocusInfo = null;

				this.fnEventHandler = this.onEvent.bind(this);

				// initialize event handling
				oRootRef.addEventListener("focus", this.fnEventHandler, true);
				oRootRef.addEventListener("blur", this.fnEventHandler, true);
				Log.debug("FocusHandler setup on Root " + oRootRef.type + (oRootRef.id ? ": " + oRootRef.id : ""), null, "sap.ui.core.FocusHandler");
			}
		});

		/**
		 * Returns the Id of the control/element currently in focus.
		 * @return {string} the Id of the control/element currently in focus.
		 * @public
		 */
		FocusHandler.prototype.getCurrentFocusedControlId = function(){
			var aCtrls = null;
			try {
				var $Act = jQuery(document.activeElement);
				if ($Act.is(":focus")) {
					aCtrls = $Act.control();
				}
			} catch (err) {
				//escape eslint check for empty block
			}
			return aCtrls && aCtrls.length > 0 ? aCtrls[0].getId() : null;
		};

		/**
		 * Returns the focus info of the current focused control or the control with the given id, if exists.
		 *
		 * @see sap.ui.core.FocusHandler#restoreFocus
		 * @see sap.ui.core.FocusHandler#getCurrentFocusedControlId
		 * @param {string} [sControlId] the id of the control. If not given the id of the current focused control (if exists) is used
		 * @return {object} the focus info of the current focused control or the control with the given id, if exists.
		 * @private
		 */
		FocusHandler.prototype.getControlFocusInfo = function(sControlId){
			sControlId = sControlId || this.getCurrentFocusedControlId();

			if (!sControlId) {
				return null;
			}

			var oControl = this.oCore && this.oCore.byId(sControlId);
			if (oControl) {
				return {
					id : sControlId,
					control : oControl,
					info : oControl.getFocusInfo(),
					type : oControl.getMetadata().getName(),
					focusref : oControl.getFocusDomRef()
				};
			}
			return null;
		};

		/**
		 * Stores the focus info of the current focused control which is using Renderer.apiVersion=2
		 *
		 * @see sap.ui.core.FocusHandler#restoreFocus
		 * @see sap.ui.core.FocusHandler#getControlFocusInfo
		 * @param {HTMLElement} oDomRef The DOM reference of the control where the rendering is happening
		 * @private
		 */
		FocusHandler.prototype.storePatchingControlFocusInfo = function(oDomRef) {
			var oActiveElement = document.activeElement;
			if (!oActiveElement || !oDomRef.contains(oActiveElement)) {
				this.oPatchingControlFocusInfo = null;
			} else {
				this.oPatchingControlFocusInfo = this.getControlFocusInfo();
				if (this.oPatchingControlFocusInfo) {
					this.oPatchingControlFocusInfo.patching = true;
				}
			}
		};

		/**
		 * Returns the focus info of the last focused control which is using Renderer.apiVersion=2
		 *
		 * @see sap.ui.core.FocusHandler#storePatchingControlFocusInfo
		 * @private
		 */
		FocusHandler.prototype.getPatchingControlFocusInfo = function() {
			return this.oPatchingControlFocusInfo;
		};

		/**
		 * If the given control is the last known focused control, the stored focusInfo is updated.
		 *
		 * @see sap.ui.core.FocusHandler#restoreFocus
		 * @see sap.ui.core.FocusHandler#getControlFocusInfo
		 * @param {string} oControl the control
		 * @private
		 */
		FocusHandler.prototype.updateControlFocusInfo = function(oControl){
			if (oControl && this.oLastFocusedControlInfo && this.oLastFocusedControlInfo.control === oControl) {
				var sControlId = oControl.getId();
				this.oLastFocusedControlInfo = this.getControlFocusInfo(sControlId);
				Log.debug("Update focus info of control " + sControlId, null, "sap.ui.core.FocusHandler");
			}
		};

		/**
		 * Restores the focus to the last known focused control or to the given focusInfo, if possible.
		 *
		 * @see sap.ui.core.FocusHandler#getControlFocusInfo
		 * @param {object} [oControlFocusInfo] the focus info previously received from getControlFocusInfo
		 * @private
		 */
		FocusHandler.prototype.restoreFocus = function(oControlFocusInfo){
			var oInfo = oControlFocusInfo || this.oLastFocusedControlInfo;

			if (!oInfo) {
				return;
			}

			var oControl = this.oCore && this.oCore.byId(oInfo.id);
			var oFocusRef = oInfo.focusref;
			if (oControl
				&& oInfo.info
				&& oControl.getMetadata().getName() == oInfo.type
				&& (oInfo.patching
					|| (oControl.getFocusDomRef() != oFocusRef
						&& (oControlFocusInfo || /*!oControlFocusInfo &&*/ oControl !== oInfo.control)))) {
				Log.debug("Apply focus info of control " + oInfo.id, null, "sap.ui.core.FocusHandler");
				oInfo.control = oControl;
				this.oLastFocusedControlInfo = oInfo;
				// Do not store dom patch info in the last focused control info
				delete this.oLastFocusedControlInfo.patching;
				oControl.applyFocusInfo(oInfo.info);
			} else {
				Log.debug("Apply focus info of control " + oInfo.id + " not possible", null, "sap.ui.core.FocusHandler");
			}
		};

		/**
		 * Destroy method of the Focus Handler.
		 * It unregisters the event handlers.
		 *
		 * @param {jQuery.Event} event the event that initiated the destruction of the FocusHandler
		 * @private
		 */
		FocusHandler.prototype.destroy = function(event) {
			var oRootRef = event.data.oRootRef;
			if (oRootRef) {
				oRootRef.removeEventListener("focus", this.fnEventHandler, true);
				oRootRef.removeEventListener("blur", this.fnEventHandler, true);
			}
			this.oCore = null;
		};

		/**
		 * Handles the focus/blur events.
		 *
		 * @param {FocusEvent} oBrowserEvent Native browser focus/blur event object
		 * @private
		 */
		FocusHandler.prototype.onEvent = function(oBrowserEvent){
			var oEvent = jQuery.event.fix(oBrowserEvent);

			Log.debug("Event " + oEvent.type + " reached Focus Handler (target: " + oEvent.target + (oEvent.target ? oEvent.target.id : "") + ")", null, "sap.ui.core.FocusHandler");

			var type = (oEvent.type == "focus" || oEvent.type == "focusin") ? "focus" : "blur";
			this.aEventQueue.push({type:type, controlId: getControlIdForDOM(oEvent.target)});
			if (this.aEventQueue.length == 1) {
				this.processEvent();
			}
		};

		/**
		 * Processes the focus/blur events in the event queue.
		 *
		 * @private
		 */
		FocusHandler.prototype.processEvent = function(){
			var oEvent = this.aEventQueue[0];
			if (!oEvent) {
				return;
			}
			try {
				if (oEvent.type == "focus") {
					this.onfocusEvent(oEvent.controlId);
				} else if (oEvent.type == "blur") {
					this.onblurEvent(oEvent.controlId);
				}
			} finally { //Ensure that queue is processed until it is empty!
				this.aEventQueue.shift();
				if (this.aEventQueue.length > 0) {
					this.processEvent();
				}
			}
		};

		/**
		 * Processes the focus event taken from the event queue.
		 *
		 * @param {string} sControlId Id of the event related control
		 * @private
		 */
		FocusHandler.prototype.onfocusEvent = function(sControlId){
			var oControl = this.oCore && this.oCore.byId(sControlId);
			if (oControl) {
				this.oLastFocusedControlInfo = this.getControlFocusInfo(sControlId);
				Log.debug("Store focus info of control " + sControlId, null, "sap.ui.core.FocusHandler");
			}

			this.oCurrent = sControlId;
			if (!this.oLast) {
				// No last active element to be left...
				return;
			}

			if (this.oLast != this.oCurrent) {
				// if same control is focused again (e.g. while re-rendering) no focusleave is needed
				triggerFocusleave(this.oLast, sControlId, this.oCore);
			}

			this.oLast = null;
		};

		/**
		 * Processes the blur event taken from the event queue.
		 *
		 * @param {string} sControlId Id of the event related control
		 * @private
		 */
		FocusHandler.prototype.onblurEvent = function(sControlId){
			if (!this.oCurrent) {
				// No current Item, so nothing to lose focus...
				return;
			}
			this.oLast = sControlId;

			this.oCurrent = null;
			setTimeout(this["checkForLostFocus"].bind(this), 0);
		};

		/**
		 * Checks for lost focus and provides events in case of losing the focus.
		 * Called in delayed manner from {@link sap.ui.core.FocusHandler#onblurEvent}.
		 *
		 * @private
		 */
		FocusHandler.prototype.checkForLostFocus = function(){
			if (this.oCurrent == null && this.oLast != null) {
				triggerFocusleave(this.oLast, null, this.oCore);
			}
			this.oLast = null;
		};


		//***********************************************************
		// Utility / convenience
		//***********************************************************

		/**
		 * Returns the id of the control/element to which the given DOM
		 * reference belongs to or <code>null</code> if no such
		 * control/element exists.
		 *
		 * @param {Element} oDOM the DOM reference
		 * @returns {string} Id of the control or null
		 * @private
		 */
		var getControlIdForDOM = function(oDOM){
			var sId = jQuery(oDOM).closest("[data-sap-ui]").attr("id");
			if (sId) {
				return sId;
			}
			return null;
		};

		/**
		 * Calls the onsapfocusleave function on the control with id sControlId
		 * with the information about the given related control.
		 *
		 * @param {string} sControlId
		 * @param {string} sRelatedControlId
		 * @private
		 */
		var triggerFocusleave = function(sControlId, sRelatedControlId, oCore){
			var oControl = sControlId ? oCore && oCore.byId(sControlId) : null;
			if (oControl) {
				var oRelatedControl = sRelatedControlId ? oCore.byId(sRelatedControlId) : null;
				var oEvent = jQuery.Event("sapfocusleave");
				oEvent.target = oControl.getDomRef();
				oEvent.relatedControlId = oRelatedControl ? oRelatedControl.getId() : null;
				oEvent.relatedControlFocusInfo = oRelatedControl ? oRelatedControl.getFocusInfo() : null;
				//TODO: Cleanup the popup! The following is shit
				var oControlUIArea = oControl.getUIArea();
				var oUiArea = null;
				if (oControlUIArea) {
					oUiArea = oCore.getUIArea(oControlUIArea.getId());
				} else {
					var oPopupUIAreaDomRef = oCore.getStaticAreaRef();
					if (oPopupUIAreaDomRef.contains(oEvent.target)) {
						oUiArea = oCore.getUIArea(oPopupUIAreaDomRef.id);
					}
				}
				if (oUiArea) {
					oUiArea._handleEvent(oEvent);
				}
			}
		};

	return FocusHandler;

});