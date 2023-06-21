import { Component, OnInit } from '@angular/core';
import { TicketService } from 'src/app/services/ticket.service';
import { UserService } from 'src/app/services/user.service';

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

  constructor(private ticketService: TicketService, private userService:UserService) { }

  ngOnInit(): void {
    this.allTickets = [];
    document.documentElement.scrollTop = 0;
    this.generateFakeData();
    this.fetchTickets();
  }

  fetchTickets(): void {
    this.ticketService.fetchUserTickets(this.userService.currentUser.id)
      .subscribe(response => {
        this.soldTickets = response.sellingTickets.filter((ticket: any) => ticket.ticketDetails.isSold === true);
        this.boughtTickets = response.boughtTickets;
        this.sellingTickets = response.sellingTickets.filter((ticket: any) => ticket.ticketDetails.isSold === false);
        this.allTickets = [...this.soldTickets, ...this.boughtTickets, ...this.sellingTickets];
      });
  }  

  generateFakeData(): void {
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  
    const sellers = ["me", "others"]; // Array of possible ticket sellers
  
    for (let i = 1; i <= 6; i++) {
      let eventDate: Date;
  
      const randomNumber = Math.random();
      if (randomNumber < 0.33) {
        eventDate = new Date(today.getTime() - Math.random() * (today.getTime() - nextYear.getTime()));
      } else if (randomNumber < 0.66) {
        eventDate = today;
      } else {
        eventDate = new Date(today.getTime() + Math.random() * (nextYear.getTime() - today.getTime()));
      }
  
      let status: string;
      let seller: string;
  
      if (Math.random() < 0.5) {
        status = 'Bought';
        seller = 'others';
      } else {
        status = 'Sold';
        seller = 'me';
      }
  
      const ticket = {
        id: i,
        eventName: `Event ${i}`,
        date: eventDate.toISOString(),
        location: `Location ${i}`,
        price: Math.floor(Math.random() * 100),
        numberOfTickets: Math.floor(Math.random() * 10),
        image: `https://via.placeholder.com/200x200?text=Event+${i}`,
        status: status,
        ticketSeller: seller
      };
  
      this.allTickets.push(ticket);
    }
  }

}
