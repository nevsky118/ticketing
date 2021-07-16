import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCancelledEvent, OrderStatus } from '@kringeltickets/common';
import mongoose from 'mongoose';

const setup = async () => {
	// create an instance of the listener
	const listener = new OrderCancelledListener(natsWrapper.client);

	// Create and save a ticket
	const orderId = mongoose.Types.ObjectId().toHexString();
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
		userId: mongoose.Types.ObjectId().toHexString(),
	});
	ticket.set({ orderId });
	await ticket.save();

	// Create the fake data event
	const data: OrderCancelledEvent['data'] = {
		id: orderId,
		version: 0,
		ticket: {
			id: ticket.id,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, msg };
};

it('updates the ticket, publishes an event, and acks the message', async () => {
	const { listener, ticket, data, msg } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.orderId).not.toBeDefined();
	expect(msg.ack).toHaveBeenCalled();
	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
