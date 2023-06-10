export interface Ticket {
    eventId: string;
    eventDate: string;
    location: string;
    price: number;
    isSold: boolean;
    seller: string;
    buyer?: string;
    fileIds: string;
    description?: string;
}