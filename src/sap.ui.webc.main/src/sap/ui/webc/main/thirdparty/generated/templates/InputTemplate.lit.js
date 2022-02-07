sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-input-root" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}"><div class="ui5-input-content"><input id="${litRender.ifDefined(context._id)}-inner" class="ui5-input-inner" style="${litRender.styleMap(context.styles.innerInput)}" type="${litRender.ifDefined(context.inputType)}" inner-input ?inner-input-with-icon="${context.icon.length}" ?disabled="${context.disabled}" ?readonly="${context._readonly}" .value="${litRender.ifDefined(context.value)}" placeholder="${litRender.ifDefined(context._placeholder)}" maxlength="${litRender.ifDefined(context.maxlength)}" role="${litRender.ifDefined(context.accInfo.input.role)}" aria-controls="${litRender.ifDefined(context.accInfo.input.ariaControls)}" ?aria-invalid="${context.accInfo.input.ariaInvalid}" aria-haspopup="${litRender.ifDefined(context.accInfo.input.ariaHasPopup)}" aria-describedby="${litRender.ifDefined(context.accInfo.input.ariaDescribedBy)}" aria-roledescription="${litRender.ifDefined(context.accInfo.input.ariaRoledescription)}" aria-autocomplete="${litRender.ifDefined(context.accInfo.input.ariaAutoComplete)}" aria-expanded="${litRender.ifDefined(context.accInfo.input.ariaExpanded)}" aria-label="${litRender.ifDefined(context.accInfo.input.ariaLabel)}" aria-required="${litRender.ifDefined(context.required)}" @input="${context._handleInput}" @change="${context._handleNativeInputChange}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @click=${context._click} @focusin=${context.innerFocusIn} data-sap-focus-ref step="${litRender.ifDefined(context.nativeInputAttributes.step)}" min="${litRender.ifDefined(context.nativeInputAttributes.min)}" max="${litRender.ifDefined(context.nativeInputAttributes.max)}" />${ context.readonly ? block1(context, tags, suffix) : undefined }${ context.effectiveShowClearIcon ? block2(context, tags, suffix) : undefined }${ context.icon.length ? block3() : undefined }<div class="ui5-input-value-state-icon">${litRender.unsafeHTML(context._valueStateInputIcon)}</div>${ context.showSuggestions ? block4(context) : undefined }${ context.accInfo.input.ariaDescription ? block5(context) : undefined }${ context.hasValueState ? block6(context) : undefined }</div><slot name="formSupport"></slot></div>`;
	const block1 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} class="ui5-input-readonly-icon" name="not-editable"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;
	const block2 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} @click=${context._clear} tabindex="-1" input-icon class="ui5-input-clear-icon" name="decline"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;
	const block3 = (context, tags, suffix) => litRender.html`<div class="ui5-input-icon-root"><slot name="icon"></slot></div>`;
	const block4 = (context, tags, suffix) => litRender.html`<span id="${litRender.ifDefined(context._id)}-suggestionsText" class="ui5-hidden-text">${litRender.ifDefined(context.suggestionsText)}</span><span id="${litRender.ifDefined(context._id)}-selectionText" class="ui5-hidden-text" aria-live="polite" role="status"></span><span id="${litRender.ifDefined(context._id)}-suggestionsCount" class="ui5-hidden-text" aria-live="polite">${litRender.ifDefined(context.availableSuggestionsCount)}</span>`;
	const block5 = (context, tags, suffix) => litRender.html`<span id="${litRender.ifDefined(context._id)}-descr" class="ui5-hidden-text">${litRender.ifDefined(context.accInfo.input.ariaDescription)}</span>`;
	const block6 = (context, tags, suffix) => litRender.html`<span id="${litRender.ifDefined(context._id)}-valueStateDesc" class="ui5-hidden-text">${litRender.ifDefined(context.ariaValueStateHiddenText)}</span>`;

	return block0;

});
