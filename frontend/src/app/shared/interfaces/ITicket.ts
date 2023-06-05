export interface Ticket {
    id: string;
    eventDate: string;
    location: string;
    price: number;
    isSold: boolean;
    seller: string;
    fileName: string;
    description?: string;
}