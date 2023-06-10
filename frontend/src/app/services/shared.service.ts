import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private orderData: any;

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
  
}
