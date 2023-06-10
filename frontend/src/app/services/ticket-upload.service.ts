import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ticket } from '../shared/interfaces/ITicket';
import { URLS } from '../shared/constants/urls';

@Injectable({
  providedIn: 'root'
})
export class TicketUploadService {

  constructor(private http: HttpClient) { }

  uploadTicket(file: File): Observable<Ticket> {
    const formData = new FormData();
    formData.append('file', file);
    console.log(formData);
    return this.http.post<Ticket>(URLS.TICKET.GET_TICKET_UPLOAD_URL, formData);
  }

  submitTicketInfo(ticketInfo: { tickets: Ticket[], sellerId: string }): Observable<Ticket[]> {
    return this.http.post<Ticket[]>(URLS.TICKET.GET_TICKET_SUBMIT_URL, ticketInfo);
  }

  downloadTicket(fileId: string): Observable<Blob> {
    console.log(`${URLS.TICKET.GET_TICKET_DOWNLOAD_URL}/${fileId}`);
    return this.http.get(URLS.TICKET.GET_TICKET_DOWNLOAD_URL(fileId.toString()), { responseType: 'blob' });
  }
  
  
}
