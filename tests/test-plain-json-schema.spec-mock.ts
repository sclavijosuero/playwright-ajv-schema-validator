import { expect } from '@playwright/test';
import { pwApi, test } from 'pw-api-plugin'

import { validateSchema } from '../src/index';

import plainJsonSchema from '../tests-data/schemas/plainjson-schema.json';

import mockDataPass from '../tests-data/mock-data-plainjson/pass.json';
import mockDataFail from '../tests-data/mock-data-plainjson/fail.json';

const issuesStyles = {
    iconPropertyError: '🟦',
    colorPropertyError: '#5178eb',
    iconPropertyMissing: '🟪',
    colorPropertyMissing: '#800080'
}

test.describe('Suite Plain JSON Schema', async () => {

    test(`Test Plain JSON Schema - Mock Data Pass`, async ({ page }) => {
        // Pass
        await validateSchema({ page }, mockDataPass, plainJsonSchema);
        expect(mockDataPass.length).toBe(3)
    })

    test(`Test Plain JSON Schema - Mock Data Fail - Styles override`, async ({ page }) => {
        // Fail with Styles override
        await validateSchema({ page }, mockDataFail, plainJsonSchema, undefined, issuesStyles);
        expect(mockDataPass.length).toBe(3)
    })

    test(`Test Plain JSON Schema - Mock Data Pass and Fail (2 validations)`, async ({ page }) => {
        // Pass
        await validateSchema({ page }, mockDataPass, plainJsonSchema);
        expect(mockDataPass.length).toBe(3)

        // Fail
        await validateSchema({ page }, mockDataFail, plainJsonSchema);
        expect(mockDataPass.length).toBe(3)
    })

})