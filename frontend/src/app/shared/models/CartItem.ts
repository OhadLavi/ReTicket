import { EventM } from "./EventM";

export class CartItem {
    constructor(public eventM:EventM) { }
    quantity:number = 1;
    price: number = this.eventM.price;
}