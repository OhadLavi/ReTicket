import { Component, Input, OnInit } from '@angular/core';
import { TicketService } from 'src/app/services/ticket.service';
import { Ticket } from 'src/app/shared/interfaces/ITicket';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket-in-market',
  templateUrl: './ticket-in-market.component.html',
  styleUrls: ['./ticket-in-market.component.css']
})
export class TicketInMarketComponent implements OnInit {
  tickets: Ticket[] = [];

  constructor(private ticketService: TicketService, private router: Router) { }

  ngOnInit(): void {
    this.tickets = this.ticketService.getTickets();

    if (this.tickets.length === 0) { // If there are no tickets, redirect to home page
      this.router.navigateByUrl('/');
    }
  }
  
}