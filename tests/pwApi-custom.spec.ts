
import { expect } from '@playwright/test';
import { pwApi, test } from 'pw-api-plugin';

import { validateSchema } from '../src/index';

import petStoreSwaggerErrors from '../tests-data/schemas/petstore-swagger-errors.json';

const issuesStyles = {
    iconPropertyError: '🟦',
    colorPropertyError: '#5178eb',
    iconPropertyMissing: '🟪',
    colorPropertyMissing: '#800080'
}

test.describe('Petstore API', () => {

    const baseUrl = 'https://petstore.swagger.io/v2';

    test('Should validate schema of POST "/store/order" endpoint ', async ({ request, page }) => {

        // GET (FAIL SCHEMA VALIDATION)
        const responseGet = await pwApi.get({ request, page }, `${baseUrl}/pet/findByStatus?status=pending`,
            {
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }
        );
        expect(responseGet.status()).toBe(200)
        const responseBodyGet = await responseGet.json()
        await validateSchema({ page }, responseBodyGet, petStoreSwaggerErrors, { endpoint: '/pet/findByStatus', method: 'get', status: 200 }, issuesStyles);

    })
})
