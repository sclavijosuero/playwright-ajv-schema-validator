import { Page, expect, test } from '@playwright/test';

import hljs from 'highlight.js';
import { validateSchema as validateSchemaCore } from 'core-ajv-schema-validator'

// Obtain the version of highlight.js from package.json
import * as packageJSON from '../package.json'
const hljsVersion: string = packageJSON['dependencies']['highlight.js'].replace(/[\^~]/g, '');

//npx playwright test --ui
//$env:DISABLE_SCHEMA_VALIDATION="false"; npx playwright test --ui
//$env:DISABLE_SCHEMA_VALIDATION="true"; npx playwright test --ui


export interface IssuesStyles {
    iconPropertyError?: string;
    colorPropertyError?: string;
    iconPropertyMissing?: string;
    colorPropertyMissing?: string;

}
export interface ValidationResult {
    errors: any[] | null;
    dataMismatches: object;
}


// ------------------------------------
// MESSAGE ICONS
// ------------------------------------

const iconPassed = '✔️'
const iconFailed = '❌'
const iconMoreErrors = '➕'

const issuesStylesDefault: IssuesStyles = {
    iconPropertyError: '⚠️',
    colorPropertyError: '#ee930a',
    iconPropertyMissing: '❌',
    colorPropertyMissing: '#c10000'
}

const warningDisableSchemaValidation = `⚠️ API SCHEMA VALIDATION DISABLED ⚠️`
const passResponseBodyAgainstSchema = `${iconPassed}   PASSED - THE RESPONSE BODY IS VALID AGAINST THE SCHEMA!`
const errorResponseBodyAgainstSchema = `${iconFailed}   FAILED - THE RESPONSE BODY IS NOT VALID AGAINST THE SCHEMA!`

const msgDisableSchemaValidation = 'The Playwright environment variable "DISABLE_SCHEMA_VALIDATION" has been set to true.'


// **********************************************************************
// PUBLIC API
// **********************************************************************

/**
 * Validates the response body against a given schema. Note that the function already asserts the validity of the schema, so there is no need to add additional assertions on the results.
 *
 * @param {object} fixtures - An object containing test fixtures, such as the page object: `{ page }`.
 * @param {object} data - The JSON data to validate against the schema.
 * @param {any} schema - The schema to validate against. Supported formats are plain JSON schema, Swagger, and OpenAPI documents. See https://ajv.js.org/json-schema.html for more information.
 * @param {object} [path] - The path object to the schema definition in a Swagger or OpenAPI document. Not required if the schema is a plain JSON schema.
 * @param {string} [path.endpoint] - The endpoint path. Required if the schema is a Swagger or OpenAPI document.
 * @param {string} [path.method="GET"] - The HTTP method (e.g., "GET", "POST") of the API request. Defaults to "GET".
 * @param {number} [path.status=200] - The expected status code of the API response. Defaults to 200.
 * @param {object} [issuesStyles] - Optional object with an override of the default icons and HEX colors used to flag the schema issues.
 * @param {string} [issuesStyles.iconPropertyError] - Custom icon to flag property errors.
 * @param {string} [issuesStyles.colorPropertyError] - Custom HEX color to flag property errors.
 * @param {string} [issuesStyles.iconPropertyMissing] - Custom icon to indicate missing properties.
 * @param {string} [issuesStyles.colorPropertyMissing] - Custom HEX color to indicate missing properties.
 *
 * @returns {Promise<object>} A Promise resolving to an object containing validation results:
 * - `errors`: An array of validation errors as provided by Ajv, or `null` if validation passes.
 * - `dataMismatches`: The original response data with all schema mismatches flagged directly.
 *
 * @example
 * // Example usage of validateSchema:
 * const validationResult = await validateSchema( { page }, responseData,
 *   schemaDoc, { endpoint: '/api/resource', method: 'POST', status: 201 },
 *   { iconPropertyError: '☣️', colorPropertyMissing: '#8B8000', iconPropertyError: '⛔', colorPropertyMissing: '#FF0000' }
 * );
 * console.log(validationResult.errors, validationResult.dataMismatches);
 */
export const validateSchema = async (fixtures: object, data: any, schema: any, path?: object, issuesStyles?: object): Promise<object> => {

    // Default values (when validation is disabled)
    let validationResult: ValidationResult = { errors: null, dataMismatches: data }

    if (process.env.DISABLE_SCHEMA_VALIDATION === 'true') {
        // Schema validation disabled
        console.log(`${warningDisableSchemaValidation} - ${msgDisableSchemaValidation}`)
    } else {

        const { page } = fixtures as { page: Page | undefined }

        issuesStyles = { ...issuesStylesDefault, ...issuesStyles }

        validationResult = validateSchemaCore(data, schema, path, issuesStyles) as ValidationResult
        let { errors, dataMismatches } = validationResult

        if (!errors) {
            // Schema validation passed
            await test.step(`${passResponseBodyAgainstSchema}`, async () => {
                console.log(passResponseBodyAgainstSchema)
            })
            expect(errors).toBeNull()
        } else {
            // Report the issues in the console
            await test.step(`${errorResponseBodyAgainstSchema}`, async () => {
                console.log(errorResponseBodyAgainstSchema)
                console.log('Number of schema errors: ', errors.length)
                console.log('Data mismatches:\n', dataMismatches)
                console.log('AJV errors:\n', errors)
            })

            // Report the issues in the PW UI
            if (page && process.env.LOG_API_UI !== 'false') {
                const dataHtml = _transformDataToHtml(dataMismatches, issuesStyles || issuesStylesDefault)
                const html = await _createDataHtmlPage(dataHtml)

                const pageContent = await page.evaluate(async ({ dataHtml, html }) => {
                    const documentHtml = document.documentElement?.innerHTML

                    if (documentHtml) {
                        if (documentHtml === '' || documentHtml.includes('<head></head><body></body>')) {
                            // Not using pw-api-plugin: page is empty, so set the content to the dataHtml
                            document.documentElement.innerHTML = html
                        }
                        else {
                            // Using pw-api-plugin: page is not empty, so find the response body element to replace with data mismatches
                            let resBody = document.querySelector('[data-tab-type="res-body"]:last-of-type')
                            if (resBody) {
                                resBody.innerHTML = dataHtml;
                            }
                        }
                    }

                }, { dataHtml, html })
            }

            expect(errors).toBeNull()
        }
    }

    return validationResult;
}


/**
 * Generates an HTML page string with the provided content embedded in the body.
 *
 * @param dataHtml - The HTML content to be included within the body of the generated page.
 * @returns A promise that resolves to a complete HTML page string.
 */
const _createDataHtmlPage = async (dataHtml: string) => {
    return `<html>
        <head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${hljsVersion}/styles/vs.min.css"/>
        </head>
        <body>
            ${dataHtml}
        </body>
    </html>`
}


/**
 * Transforms a JSON object into an HTML string with syntax highlighting and custom styles for specific issues.
 *
 * @param jsonObject - The JSON object to be transformed into an HTML string.
 * @param issuesStyles - An object containing style configurations for highlighting specific issues.
 * @param issuesStyles.iconPropertyError - The icon property name for errors.
 * @param issuesStyles.colorPropertyError - The color to apply to error properties.
 * @param issuesStyles.iconPropertyMissing - The icon property name for missing fields.
 * @param issuesStyles.colorPropertyMissing - The color to apply to missing fields.
 * @returns An HTML string with syntax-highlighted JSON and custom styles applied to specific issues.
 */
const _transformDataToHtml = (jsonObject: object, issuesStyles: IssuesStyles) => {
    const { iconPropertyError, colorPropertyError, iconPropertyMissing, colorPropertyMissing } = issuesStyles

    const fontStyles = `font-weight: bold; font-size: 1.3em;`
    let jsonString = JSON.stringify(jsonObject, null, 4)

    let json = hljs.highlight(jsonString, {
        language: 'json',
    }).value

    const regexpError = RegExp(`>&quot;${iconPropertyError}`, 'g')
    json = json.replace(regexpError, (match) => {
        return ` style="${fontStyles} color: ${colorPropertyError};"${match}`
    });

    const regexpMissing = RegExp(`>&quot;${iconPropertyMissing}`, 'g')
    json = json.replace(regexpMissing, (match) => {
        return ` style="${fontStyles}; color: ${colorPropertyMissing};"${match}`
    });

    return `<pre class="hljs">${json}</pre>`
};

