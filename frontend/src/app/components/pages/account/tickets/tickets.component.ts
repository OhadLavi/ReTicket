import { Component, OnInit } from '@angular/core';
import { TicketService } from 'src/app/services/ticket.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/app/shared/constants/environments'

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  allTickets: any;
  boughtTickets: any = [];
  soldTickets: any = [];
  sellingTickets: any = [];
  private exchangeRate = environment.exchangeRate;
  
  constructor(private ticketService: TicketService, private userService:UserService) { }

  ngOnInit(): void {
    this.allTickets = [];
    document.documentElement.scrollTop = 0;
    this.fetchTickets();
  }

  fetchTickets(): void {
    this.ticketService.fetchUserTickets()
      .subscribe(response => {
        this.soldTickets = response.sellingTickets.filter((ticket: any) => ticket.ticketDetails.isSold === true);
        this.boughtTickets = response.boughtTickets;
        this.sellingTickets = response.sellingTickets.filter((ticket: any) => ticket.ticketDetails.isSold === false);
        this.allTickets = [...this.soldTickets, ...this.boughtTickets, ...this.sellingTickets];
        // this.allTickets = this.allTickets.map((ticket: any) => {
        //   ticket.ticketDetails.price = this.convertPrice(ticket.ticketDetails);
        //   return ticket;
        // });
      });
  }   

  convertPrice(ticket: any): number {
    if (ticket && 'price' in ticket && this.exchangeRate) {
      return (Math.round(ticket.price / this.exchangeRate * 100) / 100);
    }
    return 0;
  }
  
  
}
