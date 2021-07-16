import {
	Publisher,
	Subjects,
	TicketUpdatedEvent,
} from '@kringeltickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}
