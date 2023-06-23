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

  fetchUserTickets(): Observable<any> {
    return this.http.get<any>(URLS.TICKET.GET_USER_TICKETS_URL());
  }  

  deleteTicket(ticketId: string): Observable<any> {
    return this.http.delete<any>(URLS.TICKET.GET_TICKET_DELETE_URL(ticketId));
  }

  updateTicketPrice(ticketId: string, newPrice: number): Observable<any> {
    return this.http.put<any>(URLS.TICKET.GET_TICKET_UPDATE_PRICE_URL(ticketId), { price: newPrice });
  }

  setTickets(tickets: Ticket[]) {
    this.tickets = tickets;
  }

  getTickets() {
    return this.tickets;
  }
  
}
