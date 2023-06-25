import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { Cart } from 'src/app/shared/models/Cart';
import { Order } from 'src/app/shared/models/Order';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  order:Order = new Order();
  checkoutForm!: FormGroup;
  cart!: Cart;
  orderItemsArray: any[] = [];
  
  constructor(cartService:CartService,
    private formBuilder:FormBuilder,
    private userService:UserService,
    private orderService:OrderService
    ) {
      const cart = cartService.getCart();
      this.cart = cart;
      this.order.items = cart.items;
      this.order.totalPrice = cart.totalPrice;
     }

  ngOnInit(): void {
    let { name, email } = this.userService.currentUser;
    this.checkoutForm = this.formBuilder.group({
      name: [name, Validators.required],
      email: [email, [Validators.required, Validators.email]],
      totalPrice: [this.order.totalPrice, Validators.required]
    });

    this.createOrder();
  }

  get fc() { return this.checkoutForm.controls; }

  createOrder() {
    if (this.checkoutForm.invalid) {
      return;
    };

    this.order.name = this.fc.name.value;
    this.order.email = this.fc.email.value;
    this.order.userId = this.userService.currentUser.id;
    this.orderService.create(this.order).subscribe({
      next: (order:Order) => {
      },
      error: (err: any) => {
        console.log(err);
      }
    });

  }
  
}