import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ticket } from '../shared/interfaces/ITicket';
import { URLS } from '../shared/constants/urls';
import { TicketUpdate } from '../shared/interfaces/ITicket copy';

@Injectable({
  providedIn: 'root'
})
export class TicketUploadService {

  constructor(private http: HttpClient) { }

  // Uploads a ticket
  uploadTicket(file: File): Observable<Ticket> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Ticket>(URLS.TICKET.GET_TICKET_UPLOAD_URL, formData);
  }

  // Submits a ticket
  submitTicketInfo(ticketInfo: { tickets: TicketUpdate[], sellerId: string }): Observable<Ticket[]> {
    return this.http.post<Ticket[]>(URLS.TICKET.GET_TICKET_SUBMIT_URL, ticketInfo);
  }

  // Downloads a ticket
  downloadTicket(fileId: string): Observable<Blob> {
    return this.http.get(URLS.TICKET.GET_TICKET_DOWNLOAD_URL(fileId.toString()), { responseType: 'blob' });
  }  
  
}
