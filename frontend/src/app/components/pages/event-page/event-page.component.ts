import { Component, OnInit } from '@angular/core';
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
  eventm! : EventM;
  isFavorite: boolean = false;
  
  constructor(activatedRoute:ActivatedRoute, eventService:EventService, private cartService:CartService, private router:Router) { 
    activatedRoute.params.subscribe(params => {
      if(params.id) {
        eventService.getEventById(params.id).subscribe(serverEvent => this.eventm = serverEvent);
      }
    });
  }

  ngOnInit(): void {
  }

  addToCart() {
    this.cartService.addToCart(this.eventm);
    //this.router.navigate(['/cart']);
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite; // Toggle the favorite state
  }
}