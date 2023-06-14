import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketUploadService } from 'src/app/services/ticket-upload.service';
import { UserService } from 'src/app/services/user.service';
import { Ticket } from 'src/app/shared/interfaces/ITicket';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-sell-ticket',
  templateUrl: './sell-ticket.component.html',
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(100)
      ])
    ])
  ]
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
  originalPrice: number = 0;

  constructor(private ticketUploadService: TicketUploadService, private userSrvice:UserService, private router: Router) { }

  ngOnInit() {
    setTimeout(() => {
      this.isEventDatePassedFlag = false; // Hide the error box after 5 seconds
    }, 15000);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files;
    if (file) {
      this.isLoading = true;
      this.errorMessage = '';
      for (let i = 0; i < file.length; i++) {
        this.ticketUploadService.uploadTicket(file[i]).subscribe({
          next: (response: any) => {
            const ticketResults = response.ticketResults.tickets;
            for (let i = 0; i < ticketResults.length; i++) {
              const ticketResult = ticketResults[i];
              if (this.isEventDatePassed(ticketResult.eventDate)) {
                this.isEventDatePassedFlag = true;
              } else if (!ticketResult.valid) {
                this.errorMessage = ticketResult.errorMessage;
              } else {
                this.fileUploaded = true;
                ticketResult.eventDate = new Date(ticketResult.eventDate).toISOString().split('T')[0];
                this.tickets.push({
                  ...ticketResult, 
                  form: new FormGroup({
                    'ticketPrice': new FormControl(
                      ticketResult.price, 
                      [Validators.required, Validators.min(1), Validators.max(ticketResult.price)]
                    )
                  })
                });
                this.isLoading = false;
              }
            }
          },
          error: error => {
            this.isLoading = false;
            this.errorMessage = error.error.error;
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

checkTicketPrice(ticket: Ticket) {
  if (+ticket.price > this.originalPrice) {
    this.errorMessage = 'Updated price cannot be more than the original price.';
  } else {
    this.errorMessage = '';
  }
}



}
