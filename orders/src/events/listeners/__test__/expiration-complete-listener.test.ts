import { Message } from 'node-nats-streaming';
import { OrderStatus, ExpirationCompleteEvent } from '@kringeltickets/common';
import mongoose from 'mongoose';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

const setup = async () => {
	// create an instance of the listener
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	// create a fake data event
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 100,
	});
	await ticket.save();

	const order = Order.build({
		status: OrderStatus.Created,
		userId: 'asdasd',
		expiresAt: new Date(),
		ticket,
	});
	await order.save();

	// create a fake message object
	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id,
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg, order, ticket };
};

it('updates the order status to cancelled', async () => {
	const { listener, data, msg, order } = await setup();

	await listener.onMessage(data, msg);

	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
	const { listener, data, msg, order } = await setup();

	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const eventData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);
	expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
	const { listener, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});
