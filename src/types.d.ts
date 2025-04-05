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
 */

export declare function validateSchema(
    fixtures: object,
    data: any,
    schema: any,
    path?: object,
    issuesStyles?: object
): Promise<object>