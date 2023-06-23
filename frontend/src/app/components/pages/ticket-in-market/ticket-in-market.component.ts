import { Component, Input, OnInit } from '@angular/core';
import { Ticket } from 'src/app/shared/interfaces/ITicket';

@Component({
  selector: 'app-ticket-in-market',
  templateUrl: './ticket-in-market.component.html',
  styleUrls: ['./ticket-in-market.component.css']
})
export class TicketInMarketComponent implements OnInit {

  @Input() tickets: Ticket[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
