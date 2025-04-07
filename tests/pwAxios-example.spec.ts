import { expect } from '@playwright/test';
import { axiosApi, test } from 'pw-api-plugin';

import { validateSchema } from '../src/index';

// Swagger 2.0 Schema Document for the API under test
import petStoreSwaggerErrors from '../tests-data/schemas/petstore-swagger-errors.json';

test.describe('Petstore API', () => {

    const baseUrl = 'https://petstore.swagger.io/v2';

    test('Should validate schema of POST "/store/order" endpoint ', async ({ request, page }) => {
        
        // POST (FAIL: "status" not a valid value & "shipDate" is missing)
        const requestBody = {
            "id": 0,
            "petId": 1,
            "quantity": 11,
            "status": "unknown",
            "complete": false
        }

        const responsePost = await axiosApi.post({ page }, `${baseUrl}/store/order`, requestBody,
            {
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }
        );
        expect(responsePost.status).toBe(200)
        const responseBodyPost = await responsePost.data

        await validateSchema({ page }, responseBodyPost, petStoreSwaggerErrors, { endpoint: '/store/order', method: 'post', status: 200 });

    })
})
