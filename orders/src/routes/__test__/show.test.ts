import request from 'supertest';
import { app } from '../../app';
import getCookie from './cookie-test';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('fetches the order', async () => {
	// Create a ticket
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const cookie = getCookie();

	// make a request to build an order with this ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', cookie)
		.send({ ticketId: ticket.id })
		.expect(201);

	// make request to fecth the order
	const { body: fetchOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', cookie)
		.send()
		.expect(200);

	expect(fetchOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another users order', async () => {
	// Create a ticket
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const cookie = getCookie();

	// make a request to build an order with this ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', cookie)
		.send({ ticketId: ticket.id })
		.expect(201);

	// make request to fecth the order
	await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', getCookie())
		.send()
		.expect(401);
});
