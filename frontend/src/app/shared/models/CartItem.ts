import { EventM } from "./EventM";

export class CartItem {
    constructor(public eventM:EventM) {
        this.event = eventM.id;
        this.price = eventM.price;
        this.quantity = 1;
    }

    event: string;
    price: number;
    quantity:number;

    public sanitize() {
        return {
            event: this.event,
            price: this.price,
            quantity: this.quantity
        };
    }
}
