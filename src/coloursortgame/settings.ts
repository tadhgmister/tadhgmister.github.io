// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

import { SerializedState } from "./v2";

/**
   gets the state manager to compute the child states one level down when visiting a state, meaning you get warned if a move will immidiately lead to a dead state even if you can't tell because of shroud
   TODO make this UI configurable
 */
export const COMPUTE_CHILDREN_ON_VISIT = false;

function isInputElement(element: Element): element is HTMLInputElement {
    return element.tagName === "INPUT";
}

/**
 * intended for a webpage with settings controlled by url parameters that can be set by a form present on the page.
 * this takes the form and the url parameters and sets the default values in the form to be the values set by the url
 * and constructs an object with all the parameters set in the url plus the defaults for inputs not specified in url
 * which is returned
 * note that the generic argument must match the actual page, there is no way to statically check the types match up from a form written into 
 * an html page.
 * Also note that only some input types are supported based on my own needs
 * @param form html form to parse/update
 * @param urlParams argument to URLSearchParams, string or record containing parameters
 * @returns object containing parameters extracted from search query or defaults from the form
 */
export function initSettings<T>(form: HTMLFormElement, urlParams: ConstructorParameters<typeof URLSearchParams>[0] = window.location.search) {
    const result: Record<string, string|number|boolean> = {};
    const params = new URLSearchParams(urlParams);
    // Iterate over each input field in the form
    for (const input of form.elements) {
        if (!isInputElement(input)) {  // Only deal with input elements
            continue;
        }
        const {name, value:defaultValue, type} = input
        if(type === "submit" || type === "reset"){
            continue; // don't need to do anything with submit or reset
        }
        let value = params.get(name);
        if(type === "radio"){
            alert("there is a radio button present in the settings form and that is not supported");
            continue;
        }else if (type === "checkbox"){
            // note that because of how submit works we really can't make the default to be checked
            if(input.checked){
                console.error("checkbox is checked before running the parse settings, setting from url is ignored and default of true will always be used");
                result[name] = true;
            } else{
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
        if(type === "number"){
            result[name] = parseFloat(value);
        } else {
            if(type !== "text"){
                console.error("unrecognized input type:", type, "treating as text")
            }
            result[name] = value;
        }
    }
    // for any remaining values in params store it into result as well.
    // note that repeated values probably won't work correctly, this would likely just store the first value then skip the rest as it is already present in result
    for(const [k,v] of params.entries()){
        if(k in result){
            continue;
        }
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
    /** not present in form but may be specified, serialized level state to load */
    levelCode?: SerializedState;
}
export const gameSettings: GameSettings = initSettings<GameSettings>(document.getElementById('settingsForm') as HTMLFormElement);

// @license-end
