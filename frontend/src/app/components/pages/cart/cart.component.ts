import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { CartService } from 'src/app/services/cart.service';
import { Cart } from 'src/app/shared/models/Cart';
import { CartItem } from 'src/app/shared/models/CartItem';

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

  constructor(private cartService:CartService, private formBuilder: UntypedFormBuilder) {
  }

  ngOnInit(): void {
    this.couponForm = this.formBuilder.group({
      couponCode: ['']
    });

    this.cartService.getCartObservable().subscribe(cart => {
      this.cart = cart;
      this.discountedPrice = this.cartService.getCart().cartPrice - this.cartService.getCart().totalPrice;
    });
  }

  removeFromCart(cartItem:CartItem) {
    this.cartService.removeFromCart(cartItem.ticket.id);
  }

  changeQuantity(cartItem:CartItem, quantityInString:string) {
    this.cartService.changeQuantity(cartItem.eventM.id, parseInt(quantityInString));
  }

  applyCoupon() {
    if (this.couponForm.value.couponCode === 'b') {
      this.cartService.applyCoupon(this.discountPercentage);
      this.cart = this.cartService.getCart();
      this.discountedPrice = this.cartService.getCart().cartPrice - this.cartService.getCart().totalPrice;
      this.couponForm.get('couponCode')?.reset();
    }
  }

}
