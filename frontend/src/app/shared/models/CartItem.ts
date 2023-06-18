import { Ticket } from "../interfaces/ITicket";
import { EventM } from "./EventM";
import { environment } from 'src/app/shared/constants/environments'

export class CartItem {
    private exchangeRate = environment.exchangeRate;

    constructor(public eventM:EventM, public ticket:Ticket) {
        this.event = eventM.id;
        this.ticketId = ticket.id;
        this.price = (Math.round(ticket.price / this.exchangeRate * 100) / 100);
        this.quantity = 1;
    }

    event: string;
    ticketId: string;
    price: number;
    quantity:number;

    public sanitize() {
        return {
            event: this.event,
            ticketId: this.ticketId,
            price: this.price,
            quantity: this.quantity
        };
    }
}
