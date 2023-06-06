import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/shared/models/Order';

@Component({
  selector: 'app-order-track',
  templateUrl: './order-track.component.html',
  styleUrls: ['./order-track.component.css']
})
export class OrderTrackComponent implements OnInit {

  order!: Order;

  constructor(activatedRoute:ActivatedRoute, orderService:OrderService) { 
    const params = activatedRoute.snapshot.params;
    console.log(params.orderId);
    if(!params.orderId) return;
    console.log("test2");
    orderService.trackOrderById(params.orderId).subscribe(order => {
      console.log("test3");
      this.order = order;
    });
  }
  ngOnInit(): void {
  }

}
