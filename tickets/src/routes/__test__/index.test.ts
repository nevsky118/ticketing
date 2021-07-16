import getCookie from './cookie-test';
import request from 'supertest';
import { app } from '../../app';

const cookie = getCookie();

const createTicket = () => {
	return request(app).post('/api/tickets').set('Cookie', cookie).send({
		title: 'asldkf',
		price: 20,
	});
};

it('can fetch a list of tickets', async () => {
	await createTicket();
	await createTicket();
	await createTicket();

	const response = await request(app).get('/api/tickets').send().expect(200);

	expect(response.body.length).toEqual(3);
});
