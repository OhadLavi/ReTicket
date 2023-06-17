export interface Ticket {
    id: string;
    eventId: string;
    eventDate: string;
    location: string;
    venue: string;
    price: number;
    isSold: boolean;
    seller: string;
    buyer?: string;
    fileIds: string;
    description?: string;
}