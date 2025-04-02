import { expect, test } from '@playwright/test';

import { validateSchema } from '../src/index';

import plainJsonSchema from '../tests-data/schemas/plainjson-schema.json';

import mockDataPass from '../tests-data/mock-data-plainjson/pass.json';
import mockDataFail from '../tests-data/mock-data-plainjson/fail.json';


test.describe('Suite Plain JSON Schema', async () => {

    test(`Test Plain JSON Schema - Mock Data Pass`, async ({ page }) => {
        await validateSchema({ page }, mockDataPass, plainJsonSchema);
        expect(mockDataPass.length).toBe(3)
    })

    test(`Test Plain JSON Schema - Mock Data Fail`, async ({ page }) => {
        await validateSchema({ page }, mockDataFail, plainJsonSchema);
        expect(mockDataPass.length).toBe(3)
    })

    test(`Test Plain JSON Schema - Mock Data Pass and Fail (2 validations)`, async ({ page }) => {
        await validateSchema({ page }, mockDataPass, plainJsonSchema);
        expect(mockDataPass.length).toBe(3)

        await validateSchema({ page }, mockDataFail, plainJsonSchema);
        expect(mockDataPass.length).toBe(3)
    })

})