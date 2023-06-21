import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { interval, Subscription } from 'rxjs';
import { NgToastService } from 'ng-angular-popup';
import { TicketService } from 'src/app/services/ticket.service';
import { UserService } from 'src/app/services/user.service';
import { TicketDeleteDialogComponent } from '../ticket-delete-dialog/ticket-delete-dialog.component';
import { TicketEditDialogComponent } from '../ticket-edit-dialog/ticket-edit-dialog.component';

@Component({
  selector: 'app-ticket-grid',
  templateUrl: './ticket-grid.component.html',
  styleUrls: ['./ticket-grid.component.css']
})
export class TicketGridComponent implements OnInit, OnDestroy {
  userId: String = '';
  constructor(private sanitizer: DomSanitizer, private userService:UserService, private ticketService: TicketService, private toast: NgToastService, private dialog: MatDialog) {
    this.userId = this.userService.currentUser.id;
  }
  
  @Input() tickets: any[] = [];
  @Output() ticketDeleted = new EventEmitter<string>();

  intervalSubscription?: Subscription;

  ngOnInit() {
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.tickets.forEach(ticket => {
        ticket.countdown = this.countdown(ticket.event.date);
      });
    });
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  openFile(file: string): void {
    const byteCharacters = atob(file);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(fileBlob);
    const printWindow = window.open(url);
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }
  
  countdown(eventDate: string): string {
    const currentTime = new Date().getTime();
    const targetTime = new Date(eventDate).getTime();
    const timeDifference = targetTime - currentTime;
    if (timeDifference > 0) {
      if (timeDifference < 24 * 60 * 60 * 1000) {
        return 'Event Started';
      } else {
        const seconds = Math.floor((timeDifference / 1000) % 60);
        const minutes = Math.floor((timeDifference / 1000 / 60) % 60);
        const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
    } else {
      return 'Event Ended';
    }
  }

  deleteTicket(ticketId: string, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(TicketDeleteDialogComponent, {
      width: 'auto',
      data: {ticketId: ticketId}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'delete') {
          this.ticketService.deleteTicket(ticketId).subscribe(
            response => {
              this.ticketDeleted.emit(ticketId);
              this.toast.success({detail:"SUCCESS",summary:'Ticket successfully deleted.', sticky: false, duration: 3000, type: 'success'});
            },
            error => {
              this.toast.error({detail:"ERROR",summary: 'An error occurred. Please try again later.', sticky: false, duration: 10000, type: 'error'});
            }
          );
      }    
    });
  }

  updateTicketPrice(ticketId: string, currentPrice: number): void {
    const dialogRef = this.dialog.open(TicketEditDialogComponent, {
      width: 'auto',
      data: {price: currentPrice}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'confirm') {
        const newPrice = result.price;
        this.ticketService.updateTicketPrice(ticketId, newPrice).subscribe(
          response => {
            this.toast.success({detail:"SUCCESS", summary:'Ticket price successfully updated.', sticky: false, duration: 3000, type: 'success'});
          },
          error => {
            this.toast.error({detail:"ERROR", summary: 'An error occurred. Please try again later.', sticky: false, duration: 10000, type: 'error'});
          }
        );
      }    
    });
  }
  
}