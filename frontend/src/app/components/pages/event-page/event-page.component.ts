import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';
import { EventM } from 'src/app/shared/models/EventM';
import { TicketQuantityDialogComponent } from '../../partials/ticket-quantity-dialog/ticket-quantity-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NgToastService } from 'ng-angular-popup';

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
  isAuth: boolean = false;
  private geocoder = new google.maps.Geocoder();
  markerPosition!: google.maps.LatLngLiteral;
  center = {lat: 40, lng: -20};
  zoom = 15;
  ticketQuantity: number = 1;
  totalQuantityInCart!: number;

  constructor(
    activatedRoute: ActivatedRoute, 
    private eventService: EventService, 
    private userService: UserService,
    private cartService: CartService, 
    private router: Router,
    public dialog: MatDialog,
    private toast: NgToastService) {
    activatedRoute.params.subscribe(params => {
      if(params.id) {
        eventService.getEventById(params.id).subscribe(serverEvent => {
          this.eventm = serverEvent;
          if(this.eventm) { 
            this.totalQuantityInCart = this.cartService.getQuantityInCart(this.eventm.id);
            this.geocodeAddress(this.eventm.location + ', ' + this.eventm.venue); // Get the coordinates of the event
            this.checkImageDimensions(this.eventm.image); // Check if the image is portrait or landscape

            // Check if the user is authenticated
            if (this.userService.isAuth()) {
              this.isAuth = true;
              // Check if the user is in the waiting list
              this.eventService.checkUserInWaitingList(this.eventm.id)
              .subscribe((isInWaitingList: boolean) => {
                this.isInWaitingList = isInWaitingList;
              });
              this.eventService.isEventFavorite(this.eventm.id).subscribe(result => {
                this.isFavorite = result.isFavorite;
              });
            }
          }
        });
      }
    });
  }

  // Get the coordinates of the event
  geocodeAddress(address: string) {
    this.geocoder.geocode({ 'address': address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        this.center = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        this.markerPosition = this.center;
      }
    });
  }

  // Check if the image is portrait or landscape and set the isPortrait variable
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

  // Buy a ticket based on the quantity selected
  buyTicket() {
    if (this.userService.isAuth()) {
      if (this.totalQuantityInCart < this.eventm.availableTickets) {
        if (this.eventm.availableTickets === 1) {
          this.cartService.addToCart(this.eventm, 1);
          this.totalQuantityInCart++;
        } else {
          this.openDialog();
        }
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
  
  // Open the dialog to select the quantity of tickets to buy
  openDialog(): void {
    const dialogRef = this.dialog.open(TicketQuantityDialogComponent, {
      width: 'auto',
      data: {quantity: this.ticketQuantity, availableTickets: this.eventm.availableTickets}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'continueBrowsing') {
        this.ticketQuantity = result.quantity;
        this.cartService.addToCart(this.eventm, this.ticketQuantity);
        this.totalQuantityInCart += this.ticketQuantity;

        this.toast.success({detail:"SUCCESS",summary:'You added tickets to your cart', sticky: false, duration: 3000, type: 'success'});
      }
      else if (result?.action === 'proceedToCart') {
        this.ticketQuantity = result.quantity;
        this.cartService.addToCart(this.eventm, this.ticketQuantity);
        this.totalQuantityInCart += this.ticketQuantity;
        this.router.navigate(['/cart']);
      }
    });
  }

  // Toggle the favorite status of the event
  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    if (this.isFavorite) {
      this.eventService.favoriteEvent(this.eventm.id).subscribe(
        response => {
          this.eventm.numberOfLikes = response.numberOfLikes;
        }, error => {
          this.toast.error({detail:"ERROR",summary:'You need to be logged in to favorite an event', sticky: false, duration: 3000, type: 'error'});
        });
    } else {
      this.eventService.unfavoriteEvent(this.eventm.id).subscribe(
        response => {
          this.eventm.numberOfLikes = response.numberOfLikes;
        }, error => {
          this.toast.error({detail:"ERROR",summary:'You need to be logged in to favorite an event', sticky: false, duration: 3000, type: 'error'});
        });
    }
  }
  
  // Toggle the waiting list status of the event
  toggleWaitingList() {
    this.isInWaitingList = !this.isInWaitingList;
    if (this.isInWaitingList) {
      this.eventService.addToWaitingList(this.eventm.id)
      .subscribe({
        next: (response) => {
          this.toast.success({detail:"SUCCESS",summary:'Added to waiting list', sticky: false, duration: 3000, type: 'success'});
        },
        error: (err) => {
          this.toast.error({detail:"ERROR",summary:'Error adding to waiting list', sticky: false, duration: 3000, type: 'error'});
        },
      });
    } else {
      this.eventService.removeFromWaitingList(this.eventm.id)
        .subscribe({
          next: () => {
            this.toast.success({detail:"SUCCESS",summary:'Removed from waiting list', sticky: false, duration: 3000, type: 'success'});
          },
          error: (err) => {
            this.toast.error({detail:"ERROR",summary:'Error removing from waiting list', sticky: false, duration: 3000, type: 'error'});
          },
        });
    }
  }  

}