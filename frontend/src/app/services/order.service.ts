import { Injectable } from '@angular/core';
import { Order } from '../shared/models/Order';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URLS } from '../shared/constants/urls';
import { CartItem } from '../shared/models/CartItem';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  create(order:Order){
    const sanitizedItems = order.items.map(itemData => {
      const item = new CartItem(itemData.eventM);
      item.quantity = itemData.quantity;
      return item.sanitize();
  });
  
  const sanitizedOrder = {
      ...order,
      items: sanitizedItems
  };
  
  return this.http.post<Order>(URLS.ORDER.GET_ORDER_CREATE_URL, sanitizedOrder);
  
    //return this.http.post<Order>(URLS.ORDER.GET_ORDER_CREATE_URL, order);
  }

  getNewOrder():Observable<Order>{
    return this.http.get<Order>(URLS.ORDER.GET_ORDER_NEW_URL);
  }

  pay(order:Order):Observable<string>{
    return this.http.post<string>(URLS.ORDER.GET_ORDER_PAY_URL, order);
  }

  trackOrderById(id:number): Observable<Order>{
    return this.http.get<Order>(URLS.ORDER.GET_ORDER_TRACK_URL(id.toString()));
  }

}