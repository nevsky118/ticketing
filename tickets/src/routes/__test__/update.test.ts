import request from 'supertest';
import { app } from '../../app';
import getCookie from './cookie-test';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the provided id does not exist', async () => {
	const id = mongoose.Types.ObjectId().toHexString();

	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', getCookie())
		.send({
			title: 'title_test',
			price: 20,
		})
		.expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
	const id = mongoose.Types.ObjectId().toHexString();

	await request(app)
		.put(`/api/tickets/${id}`)
		.send({
			title: 'title_test',
			price: 20,
		})
		.expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
	const response = await request(app)
		.post('/api/tickets/')
		.set('Cookie', getCookie())
		.send({
			title: 'title_test',
			price: 20,
		});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', getCookie())
		.send({
			title: 'testtitle',
			price: 1000,
		})
		.expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
	const cookie = getCookie();

	const response = await request(app)
		.post('/api/tickets/')
		.set('Cookie', cookie)
		.send({
			title: 'title_test',
			price: 20,
		});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: '',
			price: 1000,
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'asgasgasg',
			price: -10,
		})
		.expect(400);
});

it('updates a ticket provided valid inputs', async () => {
	const cookie = getCookie();

	const response = await request(app)
		.post('/api/tickets/')
		.set('Cookie', cookie)
		.send({
			title: 'title_test',
			price: 20,
		});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'updatedTitle',
			price: 1000,
		})
		.expect(200);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send();

	expect(ticketResponse.body.title).toEqual('updatedTitle');
	expect(ticketResponse.body.price).toEqual(1000);
});

it('publishes an event', async () => {
	const cookie = getCookie();

	const response = await request(app)
		.post('/api/tickets/')
		.set('Cookie', cookie)
		.send({
			title: 'title_test',
			price: 20,
		});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'updatedTitle',
			price: 1000,
		})
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
	const cookie = getCookie();

	const response = await request(app)
		.post('/api/tickets/')
		.set('Cookie', cookie)
		.send({
			title: 'title_test',
			price: 20,
		});

	const ticket = await Ticket.findById(response.body.id);
	ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
	await ticket!.save();

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'updatedTitle',
			price: 1000,
		})
		.expect(400);
});
