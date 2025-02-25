sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "mileage";
	const pathData = "M48 32h256q14 0 23 9t9 23v160q0 13-9 22.5t-23 9.5v32h-32v-64h32V64H48v160h32v224h192v-64h32v64q0 13-9 22.5t-23 9.5H80q-14 0-23-9.5T48 448V256q-14 0-23-9.5T16 224V64q0-14 9-23t23-9zm224 304q0-16 19-16h54q31 0 43 16t12 39v28q0 19 14 19 18 0 18-19V239l-16-6-17-94 33-27-32-68 22-12 52 100 22 117-32 7v147q0 23-13 37t-36 14-35-14.5-12-37.5v-28q0-9-7-16t-16-7h-54q-19 0-19-15zM96 96h160q16 0 16 16v64q0 6-4.5 11t-11.5 5H96q-7 0-11.5-5T80 176v-64q0-16 16-16zm340 97q4 13 14 13 1 0 2 .5l1 .5q1 0 2-1 7-2 8-5t1-8v-5l-5-29q-3-11-14-11-14 0-14 13zm-320 63h128l-74 64h-54v-64z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV5 = { pathData };

	return pathDataV5;

});
