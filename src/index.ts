import { Page, expect } from '@playwright/test';

import hljs from 'highlight.js';
import { validateSchema as validateSchemaCore } from 'core-ajv-schema-validator'

interface ValidationResult {
    errors: any[] | null;
    dataMismatches: object;
    issueStyles: {
        iconPropertyError: string;
        iconPropertyMissing: string;
    };
}

// ------------------------------------
// MESSAGE ICONS
// ------------------------------------

const iconPassed = '✔️'
const iconFailed = '❌'
const iconMoreErrors = '➕'

const issueStylesOverride = {
    iconPropertyError: '😱',
    colorPropertyError: '#ee930a',
    iconPropertyMissing: '😡',
    colorPropertyMissing: '#c10000'
}

const warningDisableSchemaValidation = `⚠️ API SCHEMA VALIDATION DISABLED ⚠️`

const msgDisableSchemaValidation = '- The Cypress environment variable "disableSchemaValidation" has been set to true.'
const errorNoValidApiResponse = 'The element chained to the cy.validateSchema() command is expected to be an API response!'

const passResponseBodyAgainstSchema = `${iconPassed}   PASSED - THE RESPONSE BODY IS VALID AGAINST THE SCHEMA!`
const errorResponseBodyAgainstSchema = `${iconFailed}   FAILED - THE RESPONSE BODY IS NOT VALID AGAINST THE SCHEMA!`



// **********************************************************************
// PUBLIC API
// **********************************************************************

/**
 *
 */
export const validateSchema = async (fixtures: object, data: any, schema: any, path?: object): Promise<object> => {
    const { page } = fixtures as { page: Page | undefined }

    const validationResult = validateSchemaCore(data, schema, path) as ValidationResult
    let { errors, dataMismatches, issueStyles } = validationResult

    dataMismatches = _replaceIcons(validationResult.dataMismatches, issueStyles)

    if (!errors) {
        console.log(passResponseBodyAgainstSchema)
        expect(errors).toBeNull()
    } else {
        // Report the issues in the console
        console.log(errorResponseBodyAgainstSchema)
        console.log('Number of schema errors: ', errors.length)
        console.log('Data mismatches:\n', dataMismatches)
        console.log('AJV errors:\n', errors)

        // Report the issues in the PW UI
        if (page) {
            const html = transformDataToHtml(dataMismatches)
            await page.setContent(html)
        }

        expect(errors).toBeNull()
    }

    return { errors, dataMismatches }
};

// **********************************************************************
// PRIVATE FUNCTIONS
// **********************************************************************

/**
 * Recursively replaces specific icon properties in the provided data structure with overrides
 * based on the given issueStyles object. Supports strings, arrays, and objects.

 */
const _replaceIcons = (data: any, { iconPropertyError, iconPropertyMissing }: { iconPropertyError: string, iconPropertyMissing: string }): any => {
    if (typeof data === 'string') {
        return data
            .replace(new RegExp(iconPropertyError, 'g'), issueStylesOverride.iconPropertyError)
            .replace(new RegExp(iconPropertyMissing, 'g'), issueStylesOverride.iconPropertyMissing)
    } else if (Array.isArray(data)) {
        return data.map(item => _replaceIcons(item, { iconPropertyError, iconPropertyMissing }))
    } else if (typeof data === 'object' && data !== null) {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, _replaceIcons(value, { iconPropertyError, iconPropertyMissing })])
        );
    }
    return data;
};

const transformDataToHtml = (jsonObject: object) => {
    const { iconPropertyError, colorPropertyError, iconPropertyMissing, colorPropertyMissing } = issueStylesOverride

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

