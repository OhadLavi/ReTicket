import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { interval, Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-ticket-grid',
  templateUrl: './ticket-grid.component.html',
  styleUrls: ['./ticket-grid.component.css']
})
export class TicketGridComponent implements OnInit, OnDestroy {
  userId: String = '';
  constructor(private sanitizer: DomSanitizer, private userService:UserService) {
    this.userId = this.userService.currentUser.id;
    console.log("here");
    console.log(this.userId);
   }
  
  @Input() tickets: any[] = [];
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
  
}
