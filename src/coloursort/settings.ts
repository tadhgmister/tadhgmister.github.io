// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

import { SerializedState } from "./v2";


function isInputElement(element: Element): element is HTMLInputElement {
    return element.tagName === "INPUT";
}
/**
 * union of possible values that initSettings can return as the value based on inputs present.
 * - 'radio' with no selection gives null
 * - 'checkbox' gives boolean
 * - 'number' and 'range' gives numbers
 * - text with no value specified can give null depending on the optional parameter
 * - everything else is treated as a string.
 */
type SupportedValueTypes =  boolean | number | string | null;

/**
 * intended for a webpage with settings controlled by url parameters that can be set by a form present on the page.
 * this takes the form and the url parameters and sets the default values in the form to be the values set by the url
 * and constructs an object with all the parameters set in the url plus the defaults for inputs not specified in url
 * which is returned
 * note that the generic argument must match the actual page, there is no way to statically check the types match up from a form written into 
 * an html page.
 *
 * there is special handling of <input disabled type="hidden" ...>
 * if their value is specified in the query they are undisabled and set to be visible
 * this allows for hidden settings that are not submitted or visible but become such when specified in url manually
 * 
 * @param form html form to parse/update
 * @param urlParams argument to URLSearchParams, string or record containing parameters
 * @param useNullInsteadOfEmptyString when true empty string values are replaced with null in the result
 * @returns object containing parameters extracted from search query or defaults from the form
 */
export function initSettings<T extends Record<keyof T,SupportedValueTypes> = GameSettings>(
    form: HTMLFormElement =document.getElementById('settingsForm') as HTMLFormElement,
    urlParams: ConstructorParameters<typeof URLSearchParams>[0] = window.location.search,
    useNullInsteadOfEmptyString=true,
) {
    const result: Record<string, SupportedValueTypes> = {};
    const params = new URLSearchParams(urlParams);
    // Iterate over each input field in the form
    for (const input of form.elements) {
        if (!isInputElement(input)) {  // Only deal with input elements
            continue;
        }
	// extract the value initially set in html as the "defaultValue"
	// handling for radio and check boxes intentionally ignore defaultValue variable and use input.value to be clearer as it doesn't quite mean the same thing.
        const {name, value:defaultValue, type} = input
        if(name === ""){
            continue; // submit, reset, or other inputs that don't have a name are skipped.
        }
        let value = params.get(name);
	
	// special case: disabled type="hidden" would be not visible to user and also not submitted
	// so treat them as hidden options that should be enabled if their value is explicitly given, made visible and editable if specified.
	if(value !== null && value !== defaultValue && type === "hidden" && input.disabled){
	    input.disabled = false;
	    input.type = "text"; // note that doesn't update the local variable, that is still "hidden" as far as the rest of the logic goes
	} else if (value === null && input.disabled){
	    // don't touch disabled inputs that weren't specified
	    continue;
	}
	
        if(type === "radio"){
	    // we will hit multiple radio buttons on different iterations of this loop so this is a bit tricky.
	    // if it is specified on url (value is not null) then override the checked of all buttons to be consistent with the url
	    if(value !== null){
		// value is specified, update all radio buttons checked status accordingly
		input.checked = (value === input.value);
		result[name] = value; // this will run multiple times but that is fine it is set to the same value each time
	    }	
	    // if value is null (not specified via url) and this radio button is checked by default then use its value as the result
	    else if (input.checked){
		if(typeof result[name] === "string"){console.error(`radio button with name=${name} initially has ${result[name]} and ${defaultValue} checked`);}
		result[name] = defaultValue; // with this one being checked defaultValue does logically represent the default value.
	    }
	    // otherwise if we haven't seen a checked one yet ensure the key is explicitly in result so loop over the keys sees this
	    else if(!(name in result)){
		// if the default checked option is not the first then this will just get overriden,
		// otherwise if none are default this stays
		result[name] = null;
	    }
	    // don't run the rest of the logic to handle value and defaultValue as the meaning is totally different for radio.
            continue;
        }else if (type === "checkbox"){
            // submitting a form with checkbox unchecked behaves identically to not specifying a value at all
	    // so the "default" value when not specified via url must be unchecked to be useful at all
            if(input.checked){
                console.error("checkbox is checked before running the parse settings, setting from url is ignored and default of true will always be used");
                result[name] = true;
            } else if (value !== null && value !== input.value){
		// if the value in url and value on form don't match it is likely the url is wrong or came from an unexpected source
		// to be safe leave the interpreted value as false
		console.error(`input ${name} has value '${value}' from query but input should make it '${input.value}', ignoring query to be safe`);
		result[name] = false;
	    }else{
                // when the value is specified in url use `true` for both the data and initial state
                result[name] = input.checked = (value !== null);
            }
            continue;
        } else if(value === null){
            // for other types (text, number, email, etc) use the value specified in the input when it isn't specified on the url
            value = defaultValue;
        } else {
            // for all but radio or checkbox if the value is specified in url make it the value visible on the input
            // this means the form will reflect the state that was just submitted which makes it easier to make a few edits
            // and a reset input will still set everything back to default values 
            input.value = value;
            input.dispatchEvent(new Event("change")); // trigger onchange listener if it exists
        }
	// now we have value set and input matches it, now set it in the result 
        if(type === "number" || type === "range"){
	    // note this can give NaN if the value is malformed
            result[name] = parseFloat(value);
	} else if(useNullInsteadOfEmptyString && value === ""){
	    result[name] = null;
	} else {
	    // directly use string value for all other input types.
            result[name] = value;
        }
    }
    // for any remaining values in params store it into result as well.
    // note that repeated values probably won't work correctly, this would likely just store the first value then skip the rest as it is already present in result
    for(const [k,v] of params.entries()){
        if(k in result){
            continue;
        }
	console.warn("option not present in input form", k, v);
        result[k] = v;
    }
    return result as T;
}
/**
 * collection of settings in the colour sort game page, must match the inputs and names and types
 * from the form specified in the html page or everything will break.
 */
interface GameSettings {
    /** Number of Colours */
    nColors: number;
    /** Height of tubes (balls/colour) */
    ballsPerColor: number;
    /** number of extra empty tubes */
    empties: number;
    /** empty tubes are this many tiles smaller */
    emptyPenalty: number;
    /** extra empty capacity of tubes that start full */
    extraSlack: number;
    /** whether the shroud effect is disabled */
    disableFog: boolean;
    /** serialized level state to load */
    levelCode: null | SerializedState;
    /** explicit list of empty tubes, hidden setting */
    emptyList: null | string;
}
//export const gameSettings = initSettings();

// @license-end
