function isInputElement(element) {
    return element.tagName === "INPUT";
}
/**
 * intended for a webpage with settings controlled by url parameters that can be set by a form present on the page.
 * this takes the form and the url parameters and sets the default values in the form to be the values set by the url
 * and constructs an object with all the parameters set in the url plus the defaults for inputs not specified in url
 * which is returned
 * note that the generic argument must match the actual page, there is no way to statically check the types match up from a form written into
 * an html page.
 * Also note that only number and text inputs are supported.
 * @param form html form to parse/update
 * @param urlParams argument to URLSearchParams, string or record containing parameters
 * @returns object containing parameters extracted from search query or defaults from the form
 */
export function initSettings(form, urlParams = window.location.search) {
    const result = {};
    const params = new URLSearchParams(urlParams);
    // Iterate over each input field in the form
    for (const input of form.elements) {
        if (!isInputElement(input)) { // Only deal with input elements
            continue;
        }
        const { name, value: defaultValue, type } = input;
        if (type === "submit" || type === "reset") {
            continue; // don't need to do anything with submit or reset
        }
        let value = params.get(name);
        if (type === "radio") {
            alert("there is a radio button present in the settings html and that is not supported");
            continue;
        }
        else if (type === "checkbox") {
            // note that because of how submit works we really can't make the default to be checked
            if (input.checked) {
                // it is theoretically possible for a user to check a box before this script finishes running but it is unlikely
                // this is primarily intended for the developer
                alert("checkbox is checked before running the parse settings, checkboxes cannot default to checked with this implementation");
            }
            // when the value is specified in url use `true` for both the data and initial state
            result[name] = input.checked = (value !== null);
            continue;
        }
        else if (value === null) {
            // for other types (text, number, email, etc) use the value specified in the input when it isn't specified on the url
            value = defaultValue;
        }
        else {
            // for all but radio or checkbox if the value is specified in url make it the value visible on the input
            // this means the form will reflect the state that was just submitted which makes it easier to make a few edits
            // and a reset input will still set everything back to default values 
            input.value = value;
        }
        if (type === "number") {
            result[name] = parseFloat(value);
        }
        else {
            if (type !== "text") {
                console.error("unrecognized input type:", type, "treating as text");
            }
            result[name] = value;
        }
    }
    return result;
}
export const gameSettings = initSettings(document.getElementById('settingsForm'));