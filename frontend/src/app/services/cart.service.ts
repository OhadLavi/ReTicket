import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart } from '../shared/models/Cart';
import { CartItem } from '../shared/models/CartItem';
import { EventM } from '../shared/models/EventM';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart:Cart = this.getCartFromLocalStorage();
  private cartSubject: BehaviorSubject<Cart> = new BehaviorSubject(this.cart);
  constructor() { }

  addToCart(eventM:EventM):void {
    let cartItem = null;
    try {
      cartItem = this.cart.items.find(item => item.eventM.id === eventM.id);
    } catch (e) {
      this.emptyCartInLocalStorage();
    }
    finally {
      if (cartItem)
        return;
    }
    this.cart.items.push(new CartItem(eventM));
    console.log(this.cart);
    this.updateCartToLocalStorage();
  }

  removeFromCart(eventId:string):void {
    this.cart.items = this.cart.items.filter(item => item.eventM.id !== eventId);
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

  applyCoupon(discountPercentage:number) {
    //this.emptyCartFromLocalStorage();
    if (this.cart.couponApplied) return;
    this.cart.totalPrice -= Math.floor(this.cart.cartPrice * discountPercentage);
    this.cart.couponApplied = true;
    this.setCartToLocalStorage();
  }

  emptyCartFromLocalStorage() {
    localStorage.removeItem('Cart');
  }

  setCouponAppliesToFalse() {
    this.cart.couponApplied = false;
    this.setCartToLocalStorage();
  }

}
