import { expect } from '@playwright/test';
import { axiosApi, test } from 'pw-api-plugin';

import { validateSchema } from '../src/index';

// Swagger 2.0 Schema Document for the API under test
import petStoreSwaggerErrors from '../tests-data/schemas/petstore-swagger-errors.json';

test.describe('Petstore API', () => {

    const baseUrl = 'https://petstore.swagger.io/v2';

    test('Should validate schema of POST "/store/order" endpoint ', async ({ request, page }) => {

        const responseGet = await axiosApi.get({ page }, `${baseUrl}/pet/findByStatus?status=pending`,
            {
                headers: { 'Content-Type': 'application/json' }
            }
        )

        expect(responseGet.status).toBe(200)
        const responseBodyGet = await responseGet.data

        await validateSchema({ page }, responseBodyGet, petStoreSwaggerErrors, { endpoint: '/pet/findByStatus', method: 'get', status: 200 });
 
    })
})
