import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { EventService } from 'src/app/services/event.service';
import { EventM } from 'src/app/shared/models/EventM';

@Component({
  selector: 'app-event-page',
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.css']
})
export class EventPageComponent implements OnInit {
  map: any;
  eventm! : EventM;
  isFavorite: boolean = false;
  ticketAlert: boolean = false;
  isPortrait: boolean = false;
  selectedTab: string = 'tickets';

  constructor(
    activatedRoute: ActivatedRoute, 
    eventService: EventService, 
    private cartService: CartService, 
    private router: Router) {
    activatedRoute.params.subscribe(params => {
      if(params.id) {
        eventService.getEventById(params.id).subscribe(serverEvent => {
          this.eventm = serverEvent;
          if(this.eventm) { 
            this.checkImageDimensions(this.eventm.image);
          }
        });
      }
    });
  }

  checkImageDimensions(imgSrc: string) {
    console.log("hi");
    const img = new Image();
    img.onload = () => {
      this.isPortrait = img.height > img.width;
    };
    img.src = imgSrc;
  }

ngOnInit(): void {

}

  sellTicket() {
    // Your sellTicket logic here
  }

  buyTicket() {
    this.cartService.addToCart(this.eventm);
    //this.router.navigate(['/cart']);
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite; // Toggle the favorite state
  }

  toggleAlert() {
    this.ticketAlert = !this.ticketAlert; // Toggle the ticket alert state
  }
}