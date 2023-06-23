import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { URLS } from '../shared/constants/urls';
import { Notification } from '../shared/models/Notification';
import { EventM } from '../shared/models/EventM';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private orderData: any;
  private notificationsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public notifications$: Observable<any[]> = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) { }

  setOrderData(data: any): void {
    const binaryString = window.atob(data.fileData);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    data.fileData = bytes.buffer;
    this.orderData = data;
  }
  
  getOrderData(): any {
    return this.orderData;
  }

  fetchNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(URLS.NOTIFICATION.GET_NOTIFICATIONS_URL);
  }  

  fetchFavorites(): Observable<EventM[]> {
    return this.http.get<any>(URLS.EVENT.GET_FAVORITES_EVENTS_URL);
  }

  markNotificationsAsRead(): Observable<any> {
    return this.http.put(URLS.NOTIFICATION.GET_MARK_AS_READ_URL, {});
  }
  
}
