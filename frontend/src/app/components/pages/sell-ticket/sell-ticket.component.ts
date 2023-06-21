import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TicketUploadService } from 'src/app/services/ticket-upload.service';
import { UserService } from 'src/app/services/user.service';
import { Ticket } from 'src/app/shared/interfaces/ITicket';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-sell-ticket',
  templateUrl: './sell-ticket.component.html',
  styleUrls: ['./sell-ticket.component.css'],
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
  uploadedFiles: File[] = [];
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
  originalPrice: number = 0;
  ticketPriceControls: FormControl[] = [];
  ticketPriceValidators: Validators[] = [];
  uploadSuccess = false;
  containerHeight!: string;

  constructor(
    private ticketUploadService: TicketUploadService,
    private userSrvice:UserService, 
    private router: Router,
    private el: ElementRef,
    private toast: NgToastService) { }

  ngOnInit() {
    setTimeout(() => {
      this.isEventDatePassedFlag = false;
    }, 15000);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files;
    if (file) {
      let container = this.el.nativeElement.querySelector('#upload-container');
      this.containerHeight = getComputedStyle(container).height;
      this.isLoading = true;
      for (let i = 0; i < file.length; i++) {
        this.ticketUploadService.uploadTicket(file[i]).subscribe({
          next: (response: any) => {
            const ticketResults = response.ticketResults.tickets;
            for (let i = 0; i < ticketResults.length; i++) {
              const ticketResult = ticketResults[i];
              if (this.isEventDatePassed(ticketResult.eventDate)) {
                this.isEventDatePassedFlag = true;
              } else if (!ticketResult.valid) {
                this.toast.error({detail:"ERROR",summary: ticketResult.errorMessage, sticky: false, duration: 10000, type: 'error'});
              } else {
                ticketResult.eventDate = new Date(ticketResult.eventDate).toISOString().split('T')[0];
                this.tickets.push(ticketResult);
                this.ticketPriceControls.push(
                  new FormControl(
                    ticketResult.price, 
                    [Validators.required, Validators.min(1), Validators.max(ticketResult.price)]
                  )
                );
                this.ticketPriceValidators.push(
                  [Validators.required, Validators.min(1), Validators.max(ticketResult.price)]
                );
                this.isLoading = false;
                this.uploadSuccess = true;
                setTimeout(() => { this.fileUploaded = true; this.uploadSuccess = false; }, 1200);
              }
            }
          },
          error: error => {
            this.isLoading = false;
            this.toast.error({detail:"ERROR",summary: error.error.error, sticky: false, duration: 10000, type: 'error'});
          }
        });
      }
    }
  } 

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
    if (!this.uploadedFiles.length) {
      this.fileUploaded = false;
    }
  }

onSubmit() {
    this.isLoading = true; 
    const ticketInfo = { 
        tickets: this.tickets, 
        sellerId: this.userSrvice.currentUser.id
    };
    this.ticketUploadService.submitTicketInfo(ticketInfo).subscribe({
      next: (response: Ticket[]) => {
        this.isLoading = false;
        this.router.navigate(['/ticketInMarket']); 
      },
      error: error => {
        this.isLoading = false;
        this.toast.error({detail:"ERROR",summary: error.message, sticky: false, duration: 10000, type: 'error'});
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
  if (ticket.price > this.originalPrice) {
    this.toast.warning({detail:"WARN",summary: 'Updated price cannot be more than the original price.', sticky: false, duration: 10000, type: 'warning'});
  }
}

}
