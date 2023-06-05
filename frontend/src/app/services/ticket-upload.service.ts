import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; // Import Observable
import { Ticket } from '../shared/interfaces/ITicket'; // Import your Ticket interface
import { URLS } from '../shared/constants/urls';

@Injectable({
  providedIn: 'root'
})
export class TicketUploadService {

  constructor(private http: HttpClient) { }

  uploadTicket(file: File): Observable<Ticket> { // Added return type
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Ticket>(URLS.TICKET.GET_TICKET_UPLOAD_URL, formData); // Indicate expected return type
  }

  submitTicketInfo(ticketInfo: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(URLS.TICKET.GET_TICKET_SUBMIT_URL, ticketInfo);
  }
  
}
