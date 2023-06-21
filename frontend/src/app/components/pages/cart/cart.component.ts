import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { Cart } from 'src/app/shared/models/Cart';
import { CartItem } from 'src/app/shared/models/CartItem';
import { MatDialog } from '@angular/material/dialog';
import { RemoveCartItemDialogComponent } from '../../partials/remove-cart-item-dialog/remove-cart-item-dialog.component';

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
      public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.couponForm = this.formBuilder.group({
      couponCode: ['']
    });

    this.cartService.getCartObservable().subscribe(cart => {
      this.cart = cart;
      this.discountedPrice = this.cartService.getCart().cartPrice - this.cartService.getCart().totalPrice;
    });

    this.returnUrl = this.activatedRoute.snapshot.queryParams.returnUrl;
  }

  removeFromCart(cartItem:CartItem) {
    this.cartService.removeFromCart(cartItem.ticket.id);
  }

  changeQuantity(cartItem:CartItem, quantityInString:string) {
    let newQuantity = parseInt(quantityInString);
    if (newQuantity === 0) {
      this.openRemoveDialog(cartItem);
    } else {
      this.cartService.updateCartItemQuantity(cartItem.eventM, newQuantity);
    }
    if(cartItem.quantity === 0){
      cartItem.quantity = 1;
    }
  }
  
  openRemoveDialog(cartItem:CartItem): void {
    const dialogRef = this.dialog.open(RemoveCartItemDialogComponent, {
      width: 'auto',
      data: {cartItem: cartItem}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'remove') {
        this.cartService.removeFromCart(cartItem.ticket.id);
      } else {
        cartItem.quantity = 1;
      }
    });
  }


  applyCoupon() {
    if (this.couponForm.value.couponCode === 'b') {
      this.cartService.applyCoupon(this.discountPercentage);
      this.cart = this.cartService.getCart();
      this.discountedPrice = this.cartService.getCart().cartPrice - this.cartService.getCart().totalPrice;
      this.couponForm.get('couponCode')?.reset();
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
