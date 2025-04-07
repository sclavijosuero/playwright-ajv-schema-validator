
import { expect } from '@playwright/test';
import { pwApi, test } from 'pw-api-plugin';

import { validateSchema } from '../src/index';

import petStoreSwaggerErrors from '../tests-data/schemas/petstore-swagger-errors.json';

test.describe('Petstore API', () => {

    const baseUrl = 'https://petstore.swagger.io/v2';

    test('Should validate schema of POST "/store/order" endpoint ', async ({ request, page }) => {

        // POST 1 (PASS)
        const requestBody1 = {
            "id": 0,
            "petId": 0,
            "quantity": 0,
            "shipDate": "2024-01-01T00:57:29.231Z",
            "status": "placed",
            "complete": false
        }

        const responsePost1 = await pwApi.post({ request, page }, `${baseUrl}/store/order`,
            {
                data: requestBody1,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }
        );
        expect(responsePost1.status()).toBe(200)
        const responseBodyPost1 = await responsePost1.json()
        await validateSchema({ page }, responseBodyPost1, petStoreSwaggerErrors, { endpoint: '/store/order', method: 'post', status: 200 });

        // POST 2 (FAIL: "status" not a valid value & "shipDate" is missing)
        const requestBody2 = {
            "id": 0,
            "petId": 1,
            "quantity": 11,
            "status": "unknown",
            "complete": false
        }

        const responsePost2 = await pwApi.post({ request, page }, `${baseUrl}/store/order`,
            {
                data: requestBody2,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }
        );
        expect(responsePost2.status()).toBe(200)
        const responseBodyPost2 = await responsePost2.json()
        await validateSchema({ page }, responseBodyPost2, petStoreSwaggerErrors, { endpoint: '/store/order', method: 'post', status: 200 });

    })
})
