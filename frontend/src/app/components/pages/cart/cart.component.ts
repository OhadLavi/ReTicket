import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { Cart } from 'src/app/shared/models/Cart';
import { CartItem } from 'src/app/shared/models/CartItem';
import { MatDialog } from '@angular/material/dialog';
import { RemoveCartItemDialogComponent } from '../../partials/remove-cart-item-dialog/remove-cart-item-dialog.component';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit{
  cart!: Cart;
  selectedQuantity: number = 0;
  couponCode: string = '';
  discountPercentage: number = 0.25; // 5% discount
  couponForm!: UntypedFormGroup;
  discountedPrice: number = 0;
  returnUrl: string | null = null;
  
  constructor(private cartService:CartService,
     private formBuilder: UntypedFormBuilder,
      private location: Location, 
      private router: Router,
      private activatedRoute: ActivatedRoute,
      public dialog: MatDialog,
      private toast: NgToastService) {
  }

  ngOnInit(): void {
    this.couponForm = this.formBuilder.group({
      couponCode: ['']
    });

    // Get the cart from the cart service
    this.cartService.getCartObservable().subscribe(cart => {
      this.cart = cart;
      this.discountedPrice = this.cartService.getCart().cartPrice - this.cartService.getCart().totalPrice;
    });

    this.returnUrl = this.activatedRoute.snapshot.queryParams.returnUrl;
  }

  // Removes the cart item from the cart
  removeFromCart(cartItem:CartItem) {
    this.cartService.removeFromCart(cartItem.ticket.id);
  }

  // Changes the quantity of the cart item
  changeQuantity(cartItem:CartItem, quantity:number, availableTickets:number = Infinity) {
    if (quantity === 0) {
      this.openRemoveDialog(cartItem);
    } else if (quantity > availableTickets) {
      this.toast.error({detail:"ERROR",summary:'Not enough tickets available', sticky: false, duration: 5000, type: 'error'});
      return;
    } else {
      this.cartService.updateCartItemQuantity(cartItem.eventM, quantity);
    }
    if(cartItem.quantity === 0){
      cartItem.quantity = 1;
    }
  }
  
  // Opens the remove cart item dialog
  openRemoveDialog(cartItem:CartItem): void {
    const dialogRef = this.dialog.open(RemoveCartItemDialogComponent, {
      width: 'auto',
      data: {cartItem: cartItem}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'remove') {
        this.cartService.removeFromCart(cartItem.ticket.id);
        this.toast.success({detail:"SUCCESS",summary:'Ticket removed from the cart', sticky: false, duration: 3000, type: 'success'});
      } else {
        cartItem.quantity = 1;
      }
    });
  }

  // Apply coupon code
  applyCoupon() {
    if (this.couponForm.value.couponCode === 'Braude') {
      this.cartService.applyCoupon(this.discountPercentage);
      this.cart = this.cartService.getCart();
      this.discountedPrice = this.cartService.getCart().cartPrice - this.cartService.getCart().totalPrice;
      this.couponForm.get('couponCode')?.reset();
      this.toast.success({detail:"SUCCESS",summary:'Coupon applied', sticky: false, duration: 3000, type: 'success'});
    }
    else {
      this.toast.error({detail:"ERROR",summary:'Invalid coupon code', sticky: false, duration: 5000, type: 'error'});
    }
  }

  goBack(): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.location.back();
    }
  }

}
