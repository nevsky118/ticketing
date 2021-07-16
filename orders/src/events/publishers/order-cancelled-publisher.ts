import {
	Publisher,
	OrderCancelledEvent,
	Subjects,
} from '@kringeltickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}
