import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart } from '../shared/models/Cart';
import { CartItem } from '../shared/models/CartItem';
import { EventM } from '../shared/models/EventM';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart:Cart = this.getCartFromLocalStorage();
  private cartSubject: BehaviorSubject<Cart> = new BehaviorSubject(this.cart);
  constructor(private eventService:EventService) { }
  exchangeRate = 3.5;

  getQuantityInCart(eventId: string): number {
    return this.cart.items.reduce((total, item) => {
      return item.eventM.id === eventId ? total + item.quantity : total;
    }, 0);
  }

  getTotalQuantityForEvent(eventId: string): number {
    let cartItem = this.cart.items.find(item => item.eventM.id === eventId);
    return cartItem ? cartItem.quantity : 0;
  }

  addToCart(eventM:EventM, quantity:number):void {
    this.eventService.findTickets(eventM.id, quantity).subscribe(tickets => {
      for (let ticket of tickets) {
        let existingCartItem = this.cart.items.find(item => item.eventM.id === eventM.id && item.ticket.id === ticket.id);
        if (existingCartItem) {
          existingCartItem.quantity += 1;
          existingCartItem.price += (Math.round(ticket.price / this.exchangeRate * 100) / 100);
        } else {
          let cartItem = new CartItem(eventM, ticket);
          this.cart.items.push(cartItem);
        }
      }
      this.updateCartToLocalStorage();
    });
  }
  
  
  removeFromCart(ticketId:string):void {
    this.cart.items = this.cart.items.filter(item => item.ticket.id !== ticketId);
    this.updateCartToLocalStorage();
  }

  changeQuantity(eventId:string, quantity:number) {
    let cartItem = this.cart.items.find(item => item.eventM.id === eventId);
    if (!cartItem) return;
    cartItem.quantity = quantity;
    cartItem.price = cartItem.eventM.price * quantity;
    this.updateCartToLocalStorage();
  }

  clearCart() {
    this.cart.items = [];
    this.updateCartToLocalStorage();
  }

  getCartObservable():Observable<Cart> {
    return this.cartSubject.asObservable();
  }

  getCart(): Cart {
    return this.cartSubject.value;
  }

  private updateCartToLocalStorage():void {
    this.cart.cartPrice = this.cart.items.reduce((total, item) => total + item.price, 0); 
    this.cart.totalPrice = this.cart.cartPrice;
    this.cart.totalCount = this.cart.items.reduce((total, item) => total + item.quantity, 0);
    this.setCartToLocalStorage();
  }

  private setCartToLocalStorage():void {
    localStorage.setItem('Cart', JSON.stringify(this.cart));
    this.cartSubject.next(this.cart);
  }

  private emptyCartInLocalStorage():void {
    localStorage.removeItem('Cart');
    this.cartSubject.next(new Cart());
  }

  private getCartFromLocalStorage():Cart {
    let cart = localStorage.getItem('Cart');
    return cart ? { ...JSON.parse(cart), couponApplied: JSON.parse(cart).cartPrice !== JSON.parse(cart).totalPrice } : new Cart();
  }

  emptyCartFromLocalStorage() {
    localStorage.removeItem('Cart');
  }

  setCouponAppliesToFalse() {
    this.cart.couponApplied = false;
    this.setCartToLocalStorage();
  }

  applyCoupon(discountPercentage:number) {
    //this.emptyCartFromLocalStorage();
    if (this.cart.couponApplied) return;
    this.cart.totalPrice -= Math.floor(this.cart.cartPrice * discountPercentage);
    this.cart.couponApplied = true;
    this.setCartToLocalStorage();
  }

    // addToCart(eventM:EventM):void {
  //   let cartItem = null;
  //   try {
  //     cartItem = this.cart.items.find(item => item.eventM.id === eventM.id);
  //   } catch (e) {
  //     this.emptyCartInLocalStorage();
  //   }
  //   finally {
  //     if (cartItem)
  //       return;
  //   }
  //   this.cart.items.push(new CartItem(eventM));
  //   console.log(this.cart);
  //   this.updateCartToLocalStorage();
  // }


}
