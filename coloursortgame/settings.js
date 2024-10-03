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
        if (type === "submit") {
            continue;
        }
        if (!(type === "text" || type === "number")) {
            console.error(`skipping input ${type}-${name} because only text and numbers are supported`);
            continue;
        }
        let value = params.get(name);
        if (value === null) {
            value = defaultValue;
        }
        else {
            input.value = value;
        }
        if (type === "number") {
            result[name] = parseFloat(value);
        }
        else {
            result[name] = value;
        }
    }
    return result;
}
export const gameSettings = initSettings(document.getElementById('settingsForm'));
