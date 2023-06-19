import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProfileComponent } from './profile/profile.component';
import { TicketsComponent } from './tickets/tickets.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { DefaultButtonComponent } from '../../partials/default-button/default-button.component';
import {MatIconModule } from '@angular/material/icon';
import { FavoritesComponent } from './favorites/favorites.component';

@NgModule({
  declarations: [
    ProfileComponent,
    TicketsComponent,
    NotificationsComponent,
    FavoritesComponent
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbNavModule,
    NgbTooltipModule,
    MatIconModule
  ]
})
export class AccountModule {

  constructor() {} 

}
