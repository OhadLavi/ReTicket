import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { SharedService } from 'src/app/services/shared.service';
import { Order } from 'src/app/shared/models/Order';

declare var paypal: any;

@Component({
  selector: 'paypal-button',
  templateUrl: './paypal-button.component.html',
  styleUrls: ['./paypal-button.component.css']
})
export class PaypalButtonComponent implements OnInit {
  @Input()
  order!:Order;

  @ViewChild('paypal', {static: true})
  paypalElement!:ElementRef;

  constructor(private sharedService: SharedService,
              private orderService: OrderService,
              private cartService: CartService,
              private router:Router) { }

  ngOnInit(): void {
    const self = this;
    paypal
    .Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: self.order.totalPrice,
              },
            },
          ],
        });
      },

      onApprove: async (data: any, actions: any) => {
        const payment = await actions.order.capture();
        this.order.paymentId = payment.id;
        self.orderService.pay(this.order).subscribe(
          {
            next: (response: any) => {
              console.log(response);
              const orderId = response.body.orderId;
              const fileData = response.body.fileData;
              const fileName = response.body.fileName;
              this.sharedService.setOrderData({ orderId, fileData, fileName });
              console.log('/track/' + orderId);     
              this.cartService.clearCart();
              this.router.navigateByUrl('/track/' + orderId);
            },
            error: (error) => {
              console.log(error);
            }
          }
        );
      },
      onError: (err: any) => {
        console.log(err);
      },
    })
    .render(this.paypalElement.nativeElement);

  }
}
