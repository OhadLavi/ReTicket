import { CartItem } from "./CartItem";

export class Cart {
    items:CartItem[] = [];
    totalPrice:number = 0;
    cartPrice:number = 0;
    totalCount:number = 0;
    couponApplied:boolean = false;
}