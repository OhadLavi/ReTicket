import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbCollapseModule, NgbNavModule, NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountSidemenuComponent } from './account-sidemenu/account-sidemenu.component';
import { DefaultButtonComponent } from '../components/partials/default-button/default-button.component';
import { TicketGridComponent } from '../components/partials/ticket-grid/ticket-grid.component';

@NgModule({
  declarations: [
    AccountSidemenuComponent,
    DefaultButtonComponent,
    TicketGridComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgbCollapseModule,
    NgbNavModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbTooltipModule,
  ],
  exports: [
    AccountSidemenuComponent,
    DefaultButtonComponent,
    TicketGridComponent
  ]
})

export class SharedModule { }
