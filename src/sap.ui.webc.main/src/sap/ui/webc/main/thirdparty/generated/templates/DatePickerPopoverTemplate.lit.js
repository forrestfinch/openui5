sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-responsive-popover", tags, suffix)} id="${litRender.ifDefined(context._id)}-responsive-popover" allow-target-overlap stay-open-on-scroll placement-type="Bottom" horizontal-align="Left" ?disable-scrolling="${context._isIE}" hide-arrow no-padding ?_hide-header=${litRender.ifDefined(context._shouldHideHeader)} @keydown="${context._onkeydown}" @ui5-after-close="${litRender.ifDefined(context.onResponsivePopoverAfterClose)}">${ context.showHeader ? block1(context, tags, suffix) : undefined }<${litRender.scopeTag("ui5-calendar", tags, suffix)} id="${litRender.ifDefined(context._id)}-calendar" primary-calendar-type="${litRender.ifDefined(context._primaryCalendarType)}" secondary-calendar-type="${litRender.ifDefined(context.secondaryCalendarType)}" format-pattern="${litRender.ifDefined(context._formatPattern)}" timestamp="${litRender.ifDefined(context._calendarTimestamp)}" .selectionMode="${litRender.ifDefined(context._calendarSelectionMode)}" .minDate="${litRender.ifDefined(context.minDate)}" .maxDate="${litRender.ifDefined(context.maxDate)}" @ui5-selected-dates-change="${litRender.ifDefined(context.onSelectedDatesChange)}" @ui5-show-month-press="${litRender.ifDefined(context.onHeaderShowMonthPress)}" @ui5-show-year-press="${litRender.ifDefined(context.onHeaderShowYearPress)}" ?hide-week-numbers="${context.hideWeekNumbers}" ._currentPicker="${litRender.ifDefined(context._calendarCurrentPicker)}">${ litRender.repeat(context._calendarSelectedDates, (item, index) => item._id || index, (item, index) => block2(item, index, context, tags, suffix)) }</${litRender.scopeTag("ui5-calendar", tags, suffix)}>${ context.showFooter ? block3() : undefined }</${litRender.scopeTag("ui5-responsive-popover", tags, suffix)}> `;
	const block1 = (context, tags, suffix) => litRender.html`<div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${litRender.ifDefined(context._headerTitleText)}</span><${litRender.scopeTag("ui5-button", tags, suffix)} class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${context.closePicker}"></${litRender.scopeTag("ui5-button", tags, suffix)}></div></div>`;
	const block2 = (item, index, context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-date", tags, suffix)} value="${litRender.ifDefined(item)}"></${litRender.scopeTag("ui5-date", tags, suffix)}>`;
	const block3 = (context, tags, suffix) => litRender.html``;

	return block0;

});
