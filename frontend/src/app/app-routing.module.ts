import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { LoginComponent } from './components/partials/login/login.component';
import { RegisterComponent } from './components/partials/register/register.component';
import { CartComponent } from './components/pages/cart/cart.component';
import { CheckoutComponent } from './components/pages/checkout/checkout.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { EventPageComponent } from './components/pages/event-page/event-page.component';
import { ProfileComponent } from './components/pages/account/profile/profile.component';
import { TicketsComponent } from './components/pages/account/tickets/tickets.component';
import { AccountModule } from './components/pages/account/account.module';
import { SellTicketComponent } from './components/pages/sell-ticket/sell-ticket.component';
import { TicketInMarketComponent } from './components/pages/ticket-in-market/ticket-in-market.component';
import { OrderTrackComponent } from './components/pages/order-track/order-track.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'track/:orderId' , component: OrderTrackComponent, canActivate: [AuthGuard] },
  { path: 'event/:id', component: EventPageComponent },
  { path: 'account', loadChildren: () => import('./components/pages/account/account.module').then(m => m.AccountModule), canActivate: [AuthGuard] },
  { path: 'sellTicket', component: SellTicketComponent},
  { path: 'ticketInMarket', component: TicketInMarketComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
