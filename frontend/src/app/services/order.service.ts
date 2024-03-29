import { Injectable } from '@angular/core';
import { Order } from '../shared/models/Order';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URLS } from '../shared/constants/urls';
import { CartItem } from '../shared/models/CartItem';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  // Creates a new order
  create(order:Order){
    return this.http.post<Order>(URLS.ORDER.GET_ORDER_CREATE_URL, order);
  }

  // Gets all orders
  getNewOrder():Observable<Order>{
    return this.http.get<Order>(URLS.ORDER.GET_ORDER_NEW_URL);
  }

  // Pays for an order
  pay(order:Order):Observable<HttpResponse<any>> {
    return this.http.post<any>(URLS.ORDER.GET_ORDER_PAY_URL, order, { observe: 'response' });
  }

  // Tracks an order by id
  trackOrderById(id:number): Observable<Order>{
    return this.http.get<Order>(URLS.ORDER.GET_ORDER_TRACK_URL(id.toString()));
  }

}