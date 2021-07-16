import request from 'supertest';
import { app } from '../../app';
import getCookie from './cookie-test';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@kringeltickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

//jest.mock('../../stripe.ts');

it('returns a 404 when purchasing an order that does not exist', async () => {
	const cookie = getCookie();
	await request(app)
		.post('/api/payments')
		.set('Cookie', cookie)
		.send({
			token: 'asdasdasd',
			orderId: mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		userId: mongoose.Types.ObjectId().toHexString(),
		price: 20,
		status: OrderStatus.Created,
	});
	await order.save();

	const cookie = getCookie();
	await request(app)
		.post('/api/payments')
		.set('Cookie', cookie)
		.send({
			token: 'asdasdasd',
			orderId: order.id,
		})
		.expect(401);
});

// it('returns a 400 when purchasing a cancelled order', async () => {
// 	const userId = mongoose.Types.ObjectId().toHexString();

// 	const order = Order.build({
// 		id: mongoose.Types.ObjectId().toHexString(),
// 		version: 0,
// 		userId,
// 		price: 20,
// 		status: OrderStatus.Cancelled,
// 	});
// 	await order.save();

// 	const cookie = getCookie();
// 	await request(app)
// 		.post('/api/payments')
// 		.set('Cookie', cookie)
// 		.send({
// 			orderId: order.id,
// 			token: 'asdasd',
// 		})
// 		.expect(400);
// });

// it('returns a 201 with valid inputs', async () => {
// 	const userId = mongoose.Types.ObjectId().toHexString();
// 	const price = Math.floor(Math.random() * 100000);

// 	const order = Order.build({
// 		id: mongoose.Types.ObjectId().toHexString(),
// 		version: 0,
// 		userId,
// 		price: 20,
// 		status: OrderStatus.Created,
// 	});
// 	await order.save();

// 	const cookie = getCookie(userId);
// 	await request(app)
// 		.post('api/payments')
// 		.set('Cookie', cookie)
// 		.send({
// 			token: 'tok_visa',
// 			orderId: order.id,
// 		})
// 		.expect(201);

// 	const stripeCharges = await stripe.charges.list();
// 	const stripeCharge = stripeCharges.data.find(charge => {
// 		return charge.amount === price * 100;
// 	});

// 	expect(stripeCharge).toBeDefined();
// 	expect(stripeCharge!.currency).toEqual('usd');

// 	const payment = await Payment.findOne({
// 		orderId: order.id,
// 		stripeId: stripeCharge!.id,
// 	});

// 	expect(payment).not.toBeNull();

// 	// const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
// 	// expect(chargeOptions.source).toEqual('tok_visa');
// 	// expect(chargeOptions.amount).toEqual(20 * 100);
// 	// expect(chargeOptions.currency).toEqual('usd');
// });
