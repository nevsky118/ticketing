import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import getCookie from './cookie-test';
import { natsWrapper } from '../../nats-wrapper';

const cookie = getCookie();

it('has a route handler listening to /api/tickets for post requests', async () => {
	const response = await request(app).post('/api/tickets').send({});

	expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
	await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
	// BUild a JWT payload. { id, email }
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({});

	expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: '',
			price: 10,
		})
		.expect(400);

	await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			price: 10,
		})
		.expect(400);
});

it('returns an error if an invalid price is provided', async () => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'fghfgh',
			price: -10,
		})
		.expect(400);

	await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'asdasdasd',
		})
		.expect(400);
});

it('creates a ticket with valid inputs', async () => {
	// add in a check to make sure a ticket was saved
	let tickets = await Ticket.find({});
	expect(tickets.length).toEqual(0);

	await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'asdasda',
			price: 20,
		})
		.expect(201);

	tickets = await Ticket.find({});
	expect(tickets.length).toEqual(1);
	expect(tickets[0].price).toEqual(20);
});

it('publishes an event', async () => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'asdasda',
			price: 20,
		})
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
