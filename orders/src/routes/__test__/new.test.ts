import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import getCookie from './cookie-test';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

const cookie = getCookie();

it('returns an error if the ticket does not exist', async () => {
	const ticketId = mongoose.Types.ObjectId();

	await request(app)
		.post('/api/orders')
		.set('Cookie', cookie)
		.send({ ticketId })
		.expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});
	await ticket.save();
	const order = Order.build({
		ticket,
		userId: 'asdasdasd',
		status: OrderStatus.Created,
		expiresAt: new Date(),
	});
	await order.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', cookie)
		.send({ ticketId: ticket.id })
		.expect(400);
});

it('reserves a ticket', async () => {
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', cookie)
		.send({ ticketId: ticket.id })
		.expect(201);
});

it('emit an order created event', async () => {
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', cookie)
		.send({ ticketId: ticket.id })
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
