/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enum.SelectType
sap.ui.define(function() {
	"use strict";


	/**
	 * Enumeration of the possible selection types
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.90.1
	 * @alias sap.ui.mdc.enum.SelectType
	 */
	var SelectType = {
		/**
		 * The given condition are just set and replacing the existing ones.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Set: "Set",

		/**
		 * the given conditions are just added to the existing ones, if not already existing.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Add: "Add",

		/**
		 * The given conditions are removed.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Remove: "Remove"
	};

	return SelectType;

}, /* bExport= */ true);
