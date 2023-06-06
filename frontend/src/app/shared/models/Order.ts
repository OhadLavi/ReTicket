import { CartItem } from "./CartItem";

export class Order {
    id!: number;
    items!: CartItem[];
    userId!: string;
    name!: string;
    email!: string;
    paymentId!: string;
    createdAt!: Date;
    totalPrice!: number;
    orderStatus!: string;
}