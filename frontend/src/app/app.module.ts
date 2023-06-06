import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './components/partials/header/header.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { AuthInterceptor } from './auth/auth.interceptor';
import { LoginComponent } from './components/partials/login/login.component';
import { HomeComponent } from './components/pages/home/home.component';
import { RegisterComponent } from './components/partials/register/register.component';
import { CartComponent } from './components/pages/cart/cart.component';
import { TextInputComponent } from './components/partials/text-input/text-input.component';
// import { DefaultButtonComponent } from './components/partials/default-button/default-button.component';
import { EventPageComponent } from './components/pages/event-page/event-page.component';
import { CheckoutComponent } from './components/pages/checkout/checkout.component';
import { PaypalButtonComponent } from './components/partials/paypal-button/paypal-button.component';
import { SharedModule } from './shared/shared.module';
import { SellTicketComponent } from './components/pages/sell-ticket/sell-ticket.component';
import { TicketInMarketComponent } from './components/pages/ticket-in-market/ticket-in-market.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule} from '@angular/material/badge';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    HomeComponent,
    RegisterComponent,
    CartComponent,
    TextInputComponent,
    // DefaultButtonComponent,
    EventPageComponent,
    CheckoutComponent,
    PaypalButtonComponent,
    SellTicketComponent,
    TicketInMarketComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    SharedModule,
    MDBBootstrapModule.forRoot(),
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTabsModule,
    MatGridListModule,
    MatSidenavModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  exports: [
    MatBadgeModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
