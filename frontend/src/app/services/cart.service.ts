import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Cart } from '../shared/models/Cart';
import { CartItem } from '../shared/models/CartItem';
import { EventM } from '../shared/models/EventM';
import { EventService } from './event.service';
import { environment } from 'src/app/shared/constants/environments'

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart:Cart = this.getCartFromLocalStorage();
  private cartSubject: BehaviorSubject<Cart> = new BehaviorSubject(this.cart);
  constructor(private eventService:EventService) { }
  private exchangeRate = environment.exchangeRate;

  // Get cart quantity 
  getQuantityInCart(eventId: string): number {
    return this.cart.items.reduce((total, item) => {
      return item.eventM.id === eventId ? total + item.quantity : total;
    }, 0);
  }

  // Get cart quantity for event
  getTotalQuantityForEvent(eventId: string): number {
    let cartItem = this.cart.items.find(item => item.eventM.id === eventId);
    return cartItem ? cartItem.quantity : 0;
  }

  // Update cart to local storage
  updateCartItemQuantity(eventM: any, newQuantity: number): Observable<Cart> {
    let existingCartItem = this.cart.items.find(item => item.eventM.id === eventM.id);
  
    if (existingCartItem) {
      let oldQuantity = existingCartItem.quantity;
      let additionalQuantity = newQuantity - oldQuantity;

      if (newQuantity > existingCartItem.eventM.availableTickets) {
        return of(this.cart);
      }

      // If the quantity is greater than 0, add to cart
      if (additionalQuantity > 0) {
        this.addToCart(eventM, additionalQuantity);
      } else if (additionalQuantity < 0) {
        existingCartItem.quantity = newQuantity;
        existingCartItem.price = (Math.round(existingCartItem.ticket.price / this.exchangeRate * 100) / 100) * newQuantity; // Update price
        this.updateCartToLocalStorage();
      }
    } else {
      return of(this.cart);
    }
    return of(this.cart);
  }

  // Add to cart 
  addToCart(eventM:EventM, quantity:number):void {
    this.eventService.findTickets(eventM.id, quantity).subscribe(tickets => {
      let existingCartItem = this.cart.items.find(item => item.eventM.id === eventM.id);
      
      // If the item already exists in the cart, update the quantity and price
      if (existingCartItem) {
        for (let ticket of tickets) {
          existingCartItem.quantity += 1;
          existingCartItem.price += (Math.round(ticket.price / this.exchangeRate * 100) / 100);
        }
      } else { // If the item does not exist in the cart, add it
        let cartItem = new CartItem(eventM, tickets[0]);
        for (let i = 1; i < tickets.length; i++) {
          let ticket = tickets[i];
          cartItem.quantity += 1;
          cartItem.price += (Math.round(ticket.price / this.exchangeRate * 100) / 100); // Update price
        }
        this.cart.items.push(cartItem);
      }
      this.updateCartToLocalStorage();
    });
  }
  
  // Remove from cart 
  removeFromCart(ticketId:string):void {
    this.cart.items = this.cart.items.filter(item => item.ticket.id !== ticketId);
    this.updateCartToLocalStorage();
  }

  // Change quantity 
  changeQuantity(eventId:string, quantity:number) {
    let cartItem = this.cart.items.find(item => item.eventM.id === eventId);
    if (!cartItem) return;
    cartItem.quantity = quantity;
    cartItem.price = cartItem.eventM.price * quantity;
    this.updateCartToLocalStorage();
  }

  // Clear cart
  clearCart() {
    this.cart.items = [];
    this.updateCartToLocalStorage();
  }

  // Get cart observable
  getCartObservable():Observable<Cart> {
    return this.cartSubject.asObservable();
  }

  // Get cart
  getCart(): Cart {
    return this.cartSubject.value;
  }

  // Update cart to local storage
  private updateCartToLocalStorage():void {
    this.cart.cartPrice = this.cart.items.reduce((total, item) => total + item.price, 0); 
    this.cart.totalPrice = this.cart.cartPrice;
    this.cart.totalCount = this.cart.items.reduce((total, item) => total + item.quantity, 0);
    this.setCartToLocalStorage();
  }

  // Set cart to local storage
  private setCartToLocalStorage():void {
    localStorage.setItem('Cart', JSON.stringify(this.cart));
    this.cartSubject.next(this.cart);
  }

  // Get cart from local storage
  private getCartFromLocalStorage():Cart {
    let cart = localStorage.getItem('Cart');
    return cart ? { ...JSON.parse(cart), couponApplied: JSON.parse(cart).cartPrice !== JSON.parse(cart).totalPrice } : new Cart();
  }

  // Empty cart from local storage
  emptyCartFromLocalStorage() {
    localStorage.removeItem('Cart');
  }

  // Apply coupon
  setCouponAppliesToFalse() {
    this.cart.couponApplied = false;
    this.setCartToLocalStorage();
  }

  // Apply coupon
  applyCoupon(discountPercentage:number) {
    if (this.cart.couponApplied) return;
    this.cart.totalPrice -= Math.floor(this.cart.cartPrice * discountPercentage);
    this.cart.couponApplied = true;
    this.setCartToLocalStorage();
  }

}
