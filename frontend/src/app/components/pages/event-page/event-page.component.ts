import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';
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
  isInWaitingList!: boolean;
  selectedTab: string = 'tickets';

  constructor(
    activatedRoute: ActivatedRoute, 
    private eventService: EventService, 
    private userService: UserService,
    private cartService: CartService, 
    private router: Router) {
    activatedRoute.params.subscribe(params => {
      if(params.id) {
        eventService.getEventById(params.id).subscribe(serverEvent => {
          this.eventm = serverEvent;
          if(this.eventm) { 
            this.checkImageDimensions(this.eventm.image);
            console.log("test");
            this.eventService.checkUserInWaitingList(this.eventm.id, this.userService.currentUser.id)
            .subscribe((isInWaitingList: boolean) => {
              this.isInWaitingList = isInWaitingList;
            });
            this.eventService.isEventFavorite(this.eventm.id).subscribe(result => {
              this.isFavorite = result.isFavorite;
            });
          }
        });
      }
    });
  }

  checkImageDimensions(imgSrc: string) {
    const img = new Image();
    img.onload = () => {
      this.isPortrait = img.height >= img.width || img.width >= img.height;
    };
    img.src = imgSrc;
  }

  ngOnInit() {

  }  
  
  sellTicket() {
    this.router.navigate(['/sellTicket']);
  }

  buyTicket(quantity: number) {
    if (this.userService.isAuth()) {
      this.cartService.addToCart(this.eventm, quantity);
    } else {
      this.router.navigate(['/login']);
    }
  }  

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    if (this.isFavorite) {
      this.eventService.favoriteEvent(this.eventm.id).subscribe(
        response => {
          this.eventm.numberOfLikes = response.numberOfLikes;
        }, error => {});
    } else {
      this.eventService.unfavoriteEvent(this.eventm.id).subscribe(
        response => {
          this.eventm.numberOfLikes = response.numberOfLikes;
        }, error => {});
    }
  }
  
  toggleWaitingList() {
    this.isInWaitingList = !this.isInWaitingList;
    console.log(this.isInWaitingList);
    if (this.isInWaitingList) {
      this.eventService.addToWaitingList(this.eventm.id, this.userService.currentUser.id)
      .subscribe({
        next: (response) => console.log('Added to waiting list', response),
        error: (err) => console.error('Error adding to waiting list', err),
      });
    } else {
      this.eventService.removeFromWaitingList(this.eventm.id, this.userService.currentUser.id)
        .subscribe(() => console.log('Removed from waiting list'));
    }
  }  

}