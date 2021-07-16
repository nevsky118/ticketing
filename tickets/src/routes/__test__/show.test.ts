import request from 'supertest';
import { app } from '../../app';
import getCookie from './cookie-test';
import mongoose from 'mongoose';

const cookie = getCookie();

it('returns a 404 if the ticket is not found', async () => {
	const id = mongoose.Types.ObjectId().toHexString();
	const response = await request(app)
		.get(`/api/tickets/${id}`)
		.send()
		.expect(404);
});

it('returns the ticket if the ticket is found', async () => {
	const title = 'concert';
	const price = 20;

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title,
			price,
		})
		.expect(201);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send()
		.expect(200);

	expect(ticketResponse.body.title).toEqual(title);
	expect(ticketResponse.body.price).toEqual(price);
});
