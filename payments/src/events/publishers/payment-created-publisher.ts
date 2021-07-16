import {
	Subjects,
	Publisher,
	PaymentCreatedEvent,
} from '@kringeltickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
