/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/Device', 'sap/base/Log', "sap/ui/thirdparty/jquery"], function(Device, Log, jQuery) {
	"use strict";

	/**
	 * @namespace
	 * @since 1.58
	 * @alias module:sap/ui/util/Mobile
	 * @public
	 */
	var Mobile = {};

	var _bInitTriggered = false;

	/**
	 * Does some basic modifications to the HTML page that make it more suitable for mobile apps.
	 * Only the first call to this method is executed, subsequent calls are ignored. Note that this method is also
	 * called by the constructor of toplevel controls like sap.m.App, sap.m.SplitApp and sap.m.Shell. Exception: if
	 * <code>homeIcon</code> or <code>mobileWebAppCapable</code> were not set, subsequent calls have the chance to set them.
	 *
	 * The "options" parameter configures what exactly should be done.
	 *
	 * It can have the following properties:
	 * <ul>
	 * <li>viewport: whether to set the viewport in a way that disables zooming (default: true)</li>
	 * <li>statusBar: the iOS status bar color, "default", "black" or "black-translucent" (default: "default")</li>
	 * <li>hideBrowser: whether the browser UI should be hidden as far as possible to make the app feel more native
	 * (default: true)</li>
	 * <li>preventScroll: whether native scrolling should be disabled in order to prevent the "rubber-band" effect
	 * where the whole window is moved (default: true)</li>
	 * <li>preventPhoneNumberDetection: whether Safari Mobile should be prevented from transforming any numbers
	 * that look like phone numbers into clickable links; this should be left as "true", otherwise it might break
	 * controls because Safari actually changes the DOM. This only affects all page content which is created after
	 * init() is called.</li>
	 * <li>rootId: the ID of the root element that should be made fullscreen; only used when hideBrowser is set
	 * (default: the document.body)</li>
	 * <li>useFullScreenHeight: a boolean that defines whether the height of the html root element should be set to
	 * 100%, which is required for other elements to cover the full height (default: true)</li>
	 * <li>homeIcon: deprecated since 1.12, use sap/ui/util/Mobile.setIcons instead.
	 * </ul>
	 *
	 * @param {object}  [options] configures what exactly should be done
	 * @param {boolean} [options.viewport=true] whether to set the viewport in a way that disables zooming
	 * @param {string}  [options.statusBar='default'] the iOS status bar color, "default", "black" or
	 *     "black-translucent"
	 * @param {boolean} [options.hideBrowser=true] whether the browser UI should be hidden as far as possible to
	 *     make the app feel more native
	 * @param {boolean} [options.preventScroll=true] whether native scrolling should be disabled in order to
	 *     prevent the "rubber-band" effect where the whole window is moved
	 * @param {boolean} [options.preventPhoneNumberDetection=true] whether Safari mobile should be prevented from
	 *     transforming any numbers that look like phone numbers into clickable links
	 * @param {string}  [options.rootId] the ID of the root element that should be made fullscreen; only used when
	 *     hideBrowser is set. If not set, the body is used
	 * @param {boolean} [options.useFullScreenHeight=true] whether the height of the html root element should be
	 *     set to 100%, which is required for other elements to cover the full height
	 * @param {string}  [options.homeIcon=undefined] deprecated since 1.12, use sap/ui/util/Mobile.setIcons instead.
	 * @param {boolean} [options.homeIconPrecomposed=false] deprecated since 1.12, use sap/ui/util/Mobile.setIcons instead.
	 * @param {boolean} [options.mobileWebAppCapable=true] whether the Application will be loaded in full screen
	 *     mode after added to home screen on mobile devices. The default value for this property only enables the
	 *     full screen mode when runs on iOS device.
	 *
	 * @function
	 * @static
	 * @public
	 */
	Mobile.init = function(options) {
		var $head = jQuery("head");

		if (!_bInitTriggered) { // only one initialization per HTML page
			_bInitTriggered = true;

			options = jQuery.extend({}, { // merge in the default values
				viewport: true,
				statusBar: "default",
				hideBrowser: true,
				preventScroll: true,
				preventPhoneNumberDetection: true,
				useFullScreenHeight: true,
				homeIconPrecomposed: false,
				mobileWebAppCapable: "default"
			}, options);

			// en-/disable automatic link generation for phone numbers
			if (options.preventPhoneNumberDetection) {
				// iOS specific meta tag
				$head.append(jQuery('<meta name="format-detection" content="telephone=no">')); // this only works
																							   // for all DOM
																							   // created
																							   // afterwards
			}

			// initialize viewport
			if (options.viewport) {
				var sMeta;
				var iInnerHeightBefore = Device.resize.height;
				var iInnerWidthBefore = Device.resize.width;

				sMeta = "width=device-width, initial-scale=1.0";

				// Setting maximum-scale=1.0 and user-scalable=no has effect to the manual zoom (user can pinch zoom the
				// UI) and auto zoom (browser zooms in the UI automatically under some circumtances, for example when an
				// input gets the focus and the font-size of the input is less than 16px on iOS) functionalities on the
				// mobile platform, but there's some difference between the mobile platforms:
				//  * iOS: This does not disable manual zoom in Safari and it only disables the auto zoom function. In
				//  Chrome browser on iOS, it does disable the manual zoom but since Chrome on iOS isn't in the support
				//  matrix, we can ignore this.
				//  * other mobile platform: it does disable the manual zoom option but there's no auto zoom function.
				//  So we need to remove the maximum-scale=1.0:
				//
				//  Therefore we need to add the additional settings (maximum-scale and user-scalable) only for iOS
				//  platform
				if (Device.os.ios) {
					sMeta += ", maximum-scale=1.0, user-scalable=no";
				}

				$head.append(jQuery('<meta name="viewport" content="' + sMeta + '">'));

				// Update Device API resize info, which is necessary in some scenarios after setting the viewport info
				if ((iInnerHeightBefore !== window.innerHeight || iInnerWidthBefore !== window.innerWidth) && Device.resize._update){
					Device.resize._update();
				}
			}

			if (options.useFullScreenHeight) {
				jQuery(function() {
					document.documentElement.style.height = "100%"; // set html root tag to 100% height
				});
			}

			if (options.preventScroll && (Device.os.ios || (Device.os.mac && Device.browser.mobile))) {
				jQuery(function() {
					document.documentElement.style.position = "fixed";
					document.documentElement.style.overflow = "hidden";
					document.documentElement.style.height = "100%";
					document.documentElement.style.width = "100%";
				});
			}
		}

		if (options) {
			if (options.homeIcon) {
				var oIcons;

				if (typeof options.homeIcon === "string") {
					oIcons = {
						phone: options.homeIcon,
						favicon: options.homeIcon
					};
				} else {
					oIcons = jQuery.extend({}, options.homeIcon);
					oIcons.phone = options.homeIcon.phone || options.homeIcon.icon || oIcons.favicon;
					oIcons.favicon = oIcons.favicon || options.homeIcon.icon || options.homeIcon.phone;
					oIcons.icon = undefined;
				}

				oIcons.precomposed = options.homeIconPrecomposed || oIcons.precomposed;
				Mobile.setIcons(oIcons);
			}

			if (options.hasOwnProperty("mobileWebAppCapable")) {
				Mobile.setWebAppCapable(options.mobileWebAppCapable, options.statusBar);
			}
		}
	};

	/**
	 * Sets the bookmark icon for desktop browsers and the icon to be displayed on the home screen of iOS devices
	 * after the user does "add to home screen".
	 *
	 * Only call this method once and call it early when the page is loading: browsers behave differently when the
	 * favicon is modified while the page is alive. Some update the displayed icon inside the browser but use an
	 * old icon for bookmarks. When a favicon is given, any other existing favicon in the document will be removed.
	 * When at least one home icon is given, all existing home icons will be removed and new home icon tags for all
	 * four resolutions will be created.
	 *
	 * The home icons must be in PNG format and given in different sizes for iPad/iPhone with and without retina
	 * display. The favicon is used in the browser and for desktop shortcuts and should optimally be in ICO format:
	 * ICO files can contain different image sizes for different usage locations. E.g. a 16x16px version is used
	 * inside browsers.
	 *
	 * All icons are given in an an object holding icon URLs and other settings. The properties of this object are:
	 * <ul>
	 * <li>phone: a 60x60 pixel version for non-retina iPhones</li>
	 * <li>tablet: a 76x76 pixel version for non-retina iPads</li>
	 * <li>phone@2: a 120x120 pixel version for retina iPhones</li>
	 * <li>tablet@2: a 152x152 pixel version for retina iPads</li>
	 * <li>precomposed: whether the home icons already have some glare effect (otherwise iOS will add it) (default:
	 * false)</li>
	 * <li>favicon: the ICO file to be used inside the browser and for desktop shortcuts</li>
	 * </ul>
	 *
	 * One example is:
	 * <pre>
	 * {
	 *    'phone':'phone-icon_60x60.png',
	 *    'phone@2':'phone-retina_120x120.png',
	 *    'tablet':'tablet-icon_76x76.png',
	 *    'tablet@2':'tablet-retina_152x152.png',
	 *    'precomposed':true,
	 *    'favicon':'desktop.ico'
	 * }
	 * </pre>
	 * If one of the sizes is not given, the largest available alternative image will be used instead for this
	 * size.
	 * On Android these icons may or may not be used by the device. Apparently chances can be improved by using
	 * icons with glare effect, so the "precomposed" property can be set to "true". Some Android devices may also
	 * use the favicon for bookmarks instead of the home icons.</li>
	 *
	 * @param {object} oIcons
	 * @function
	 * @static
	 * @public
	 */
	Mobile.setIcons = function(oIcons) {

		if (!oIcons || (typeof oIcons !== "object")) {
			Log.warning("Call to sap/ui/util/Mobile.setIcons() has been ignored because there were no icons given or the argument was not an object.");
			return;
		}

		var $head = jQuery("head"),
			precomposed = oIcons.precomposed ? "-precomposed" : "",
			getBestFallback = function(res) {
				return oIcons[res] || oIcons['tablet@2'] || oIcons['phone@2'] || oIcons['phone'] || oIcons['tablet']; // fallback logic
			},
			mSizes = {
				"phone": "",
				"tablet": "76x76",
				"phone@2": "120x120",
				"tablet@2": "152x152"
			};

		// desktop icon
		if (oIcons["favicon"]) {
			// remove any other favicons
			var $fav = $head.find("[rel=icon]");
			$fav.each(function() {
				if (this.rel === "icon") {
					jQuery(this).remove();
				}
			});

			// create favicon
			$head.append(jQuery('<link rel="icon" href="' + oIcons["favicon"] + '">'));
		}

		// mobile home screen icons
		if (getBestFallback("phone")) {

			// if any home icon is given remove old ones
			$head.find("[rel=apple-touch-icon]").remove();
			$head.find("[rel=apple-touch-icon-precomposed]").remove();
		}

		for (var platform in mSizes) {
			oIcons[platform] = oIcons[platform] || getBestFallback(platform);
			if (oIcons[platform]) {
				var size = mSizes[platform];
				$head.append(jQuery('<link rel="apple-touch-icon' + precomposed + '" ' + (size ? 'sizes="' + size + '"' : "") + ' href="' + oIcons[platform] + '">'));
			}
		}
	};

	/**
	 * Sets the "apple-mobile-web-app-capable" and "mobile-web-app-capable" meta information which defines whether
	 * the application is loaded in full screen mode (browser address bar and toolbar are hidden) after the user
	 * does "add to home screen" on mobile devices. Currently this meta tag is only supported by iOS Safari and
	 * mobile Chrome from version 31.
	 *
	 * If the application opens new tabs because of attachments, url and so on, setting this to false will let the
	 * user be able to go from the new tab back to the application tab after the application is added to home
	 * screen.
	 *
	 * Note: this function only has effect when the application runs on iOS Safari and mobile Chrome from version
	 * 31.
	 *
	 * @param {boolean} bValue whether the Application will be loaded in full screen mode after added to home
	 *     screen from iOS Safari or mobile Chrome from version 31.
	 * @function
	 * @static
	 * @public
	 */
	Mobile.setWebAppCapable = function(bValue, sAppleStatusBarStyle) {
		if (!Device.system.tablet && !Device.system.phone) {
			return;
		}

		var $Head = jQuery("head"),
			aPrefixes = ["", "apple"],
			sNameBase = "mobile-web-app-capable",
			sContent = bValue ? "yes" : "no",
			i, sName, $WebAppMeta;

		for (i = 0; i < aPrefixes.length; i++) {
			sName = aPrefixes[i] ? (aPrefixes[i] + "-" + sNameBase) : sNameBase;
			$WebAppMeta = $Head.children('meta[name="' + sName + '"]');
			if ($WebAppMeta.length) {
				$WebAppMeta.attr("content", sContent);
			} else {
				$Head.append(jQuery('<meta name="' + sName + '" content="' + sContent + '">'));
				if (aPrefixes[i] === "apple") {
					// iOS specific meta tag should be added only first time the corresponding apple-mobile-web-app-capable is added
					$Head.append(jQuery('<meta name="apple-mobile-web-app-status-bar-style" content="' + (sAppleStatusBarStyle ? sAppleStatusBarStyle : 'default') + '">'));
				}
			}
		}
	};

	return Mobile;
});
