import { HttpClient } from '@angular/common/http';
import { URLS } from '../shared/constants/urls';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Ticket } from '../shared/interfaces/ITicket';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  tickets: Ticket[] = [];
  
  constructor(private http: HttpClient) { }

  // Creates a new ticket
  fetchUserTickets(): Observable<any> {
    return this.http.get<any>(URLS.TICKET.GET_USER_TICKETS_URL());
  }  

  // Deletes a ticket
  deleteTicket(ticketId: string): Observable<any> {
    return this.http.delete<any>(URLS.TICKET.GET_TICKET_DELETE_URL(ticketId));
  }

  // Updates a ticket
  updateTicketPrice(ticketId: string, newPrice: number): Observable<any> {
    return this.http.put<any>(URLS.TICKET.GET_TICKET_UPDATE_PRICE_URL(ticketId), { price: newPrice });
  }

  // Setter
  setTickets(tickets: Ticket[]) {
    this.tickets = tickets;
  }

  // Getter
  getTickets() {
    return this.tickets;
  }
  
}
