import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  allTickets: any;
  boughtTickets: any = [];
  soldTickets: any = [];

  constructor() { }

  ngOnInit(): void {
    this.allTickets = [];
    // When the user clicks on the button, scroll to the top of the document
    document.documentElement.scrollTop = 0;
    this.generateFakeData();
    // Fetch Data
    this.fetchTickets();
  }

  fetchTickets(): void {
    console.log(this.allTickets);
    // Fetch all tickets
    // this.allTickets = []; // Replace with your API call to fetch all tickets

    // Filter sold tickets
    this.soldTickets = this.allTickets.filter((ticket: any) => ticket.status === 'Sold');

    // Filter bought tickets
    this.boughtTickets = this.allTickets.filter((ticket: any) => ticket.status === 'Bought');
  }

  generateFakeData(): void {
    // Generate fake data for allTickets
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  
    const sellers = ["me", "others"]; // Array of possible ticket sellers
  
    for (let i = 1; i <= 6; i++) {
      let eventDate: Date;
  
      const randomNumber = Math.random();
      if (randomNumber < 0.33) {
        // Set eventDate to a random date earlier than today
        eventDate = new Date(today.getTime() - Math.random() * (today.getTime() - nextYear.getTime()));
      } else if (randomNumber < 0.66) {
        // Set eventDate to today
        eventDate = today;
      } else {
        // Set eventDate to a random date between today and nextYear
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
        ticketSeller: seller // Add ticketSeller property with random value
      };
  
      this.allTickets.push(ticket);
    }
  }
  
  

}
