import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketUploadService } from 'src/app/services/ticket-upload.service';
import { UserService } from 'src/app/services/user.service';
import { Ticket } from 'src/app/shared/interfaces/ITicket';
import { User } from 'src/app/shared/models/User';

@Component({
  selector: 'app-sell-ticket',
  templateUrl: './sell-ticket.component.html',
  styleUrls: ['./sell-ticket.component.css']
})
export class SellTicketComponent implements OnInit {
  fileUploaded = false;
  ticketPrice = 0;
  tickets: Ticket[] = [];
  location = '';
  date = '';
  id: string = '';
  title: string = '';
  seller: string = '';
  fileName: string = '';
  description: string = '';
  isLoading = false;
  isEventDatePassedFlag = false;
  errorMessage: string = '';

  constructor(private ticketUploadService: TicketUploadService, private userSrvice:UserService, private router: Router) { }

  ngOnInit() {
    setTimeout(() => {
      this.isEventDatePassedFlag = false; // Hide the error box after 5 seconds
    }, 5000);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files;
    if (file) {
      this.isLoading = true;
      for (let i = 0; i < file.length; i++) {
        this.ticketUploadService.uploadTicket(file[i]).subscribe({
          next: (response: any) => {
            const tickets = response.tickets;
            for (let i = 0; i < tickets.length; i++) {
              const ticket = tickets[i];
              if (this.isEventDatePassed(ticket.eventDate)) {
                this.isEventDatePassedFlag = true;
              } else {
                this.fileUploaded = true;
                this.tickets.push(ticket);
                console.log(this.tickets);
                this.isLoading = false;
              }
            }
          },          
          error: error => {
            console.log(error);
            this.isLoading = false;
          }
        });
      }
    }
  }

onSubmit() {
    this.isLoading = true; 
    const ticketInfo = { 
        tickets: this.tickets, 
        sellerId: this.userSrvice.currentUser.id
    };
    console.log(ticketInfo);
    this.ticketUploadService.submitTicketInfo(ticketInfo).subscribe({
      next: (response: Ticket[]) => {
        console.log(response);
        this.isLoading = false;
        this.router.navigate(['/ticketInMarket']); 
      },
      error: error => {
        console.log(error);
        this.isLoading = false;
        this.errorMessage = error.message;
      }
    });
}


resetForm() {
  this.tickets = [];
  this.fileUploaded = false;
}


isEventDatePassed(date: string): boolean {
  const today = new Date().setHours(0, 0, 0, 0);
  const selectedDate = new Date(date).setHours(0, 0, 0, 0);
  return selectedDate < today;
}

}
