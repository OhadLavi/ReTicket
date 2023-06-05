import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-ticket-grid',
  templateUrl: './ticket-grid.component.html',
  styleUrls: ['./ticket-grid.component.css']
})
export class TicketGridComponent implements OnInit, OnDestroy {
  @Input() tickets: any[] = [];
  intervalSubscription?: Subscription;

  ngOnInit() {
    // Create an Observable that will publish a value on an interval every second
    this.intervalSubscription = interval(1000).subscribe(() => {
      // Re-calculate the countdowns each second
      this.tickets.forEach(ticket => {
        ticket.countdown = this.countdown(ticket.date);
      });
    });
  }

  ngOnDestroy() {
    // Clear the interval on component destruction
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  countdown(eventDate: string): string {
    const currentTime = new Date().getTime();
    const targetTime = new Date(eventDate).getTime();
    const timeDifference = targetTime - currentTime;
  
    if (timeDifference > 0) {
      if (timeDifference < 24 * 60 * 60 * 1000) {
        // Event is today
        return 'Event Started';
      } else {
        // Event is in the future, calculate countdown
        const seconds = Math.floor((timeDifference / 1000) % 60);
        const minutes = Math.floor((timeDifference / 1000 / 60) % 60);
        const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
    } else {
      // Event has already ended
      return 'Event Ended';
    }
  }
  
}
