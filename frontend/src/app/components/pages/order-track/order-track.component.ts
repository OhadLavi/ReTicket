import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { SharedService } from 'src/app/services/shared.service';
import { Order } from 'src/app/shared/models/Order';

@Component({
  selector: 'app-order-track',
  templateUrl: './order-track.component.html',
  styleUrls: ['./order-track.component.css']
})
export class OrderTrackComponent implements OnInit {
  order!: Order;
  fileData!: ArrayBuffer | null;
  fileName!: string;

  constructor(activatedRoute: ActivatedRoute, orderService: OrderService, private sharedService: SharedService) { 
    const params = activatedRoute.snapshot.params;
    if(!params.orderId) return;
    orderService.trackOrderById(params.orderId).subscribe(order => {
      this.order = order;
    });

    const orderData = this.sharedService.getOrderData();
    if (orderData) {
      this.fileData = orderData.fileData;
      this.fileName = orderData.fileName;
    }
  }

  ngOnInit(): void {
  }

  downloadFile(): void {
    if (this.fileData) {
      const blob = new Blob([this.fileData], {type: 'application/pdf'});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.fileName;
      link.click();
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } else {

    }
  }
  
  printFile(): void {
    if (this.fileData) {
      const blob = new Blob([this.fileData], {type: 'application/pdf'});
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url);
      printWindow?.print();
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } else {

    }
  }
  
}
