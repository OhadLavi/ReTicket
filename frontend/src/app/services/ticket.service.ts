import { HttpClient } from '@angular/common/http';
import { URLS } from '../shared/constants/urls';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  constructor(private http: HttpClient) { }

  fetchUserTickets(userId: string): Observable<any> {
    return this.http.get<any>(URLS.TICKET.GET_USER_TICKETS_URL(userId));
  }

  deleteTicket(ticketId: string): Observable<any> {
    return this.http.delete<any>(URLS.TICKET.GET_TICKET_DELETE_URL(ticketId));
  }
  
}
