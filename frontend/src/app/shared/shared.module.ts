import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbCollapseModule, NgbNavModule, NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//component
// import { HeaderComponent } from './header/header.component';
// import { FooterComponent } from './footer/footer.component';
// import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
// import { MailfooterComponent } from './mailfooter/mailfooter.component';
// import { AccountBreadcrumbsComponent } from './account-breadcrumbs/account-breadcrumbs.component';
import { AccountSidemenuComponent } from './account-sidemenu/account-sidemenu.component';
import { DefaultButtonComponent } from '../components/partials/default-button/default-button.component';
import { TicketGridComponent } from '../components/partials/ticket-grid/ticket-grid.component';

@NgModule({
  declarations: [
    // HeaderComponent,
    // FooterComponent,
    // BreadcrumbsComponent,
    // MailfooterComponent,
    // AccountBreadcrumbsComponent,
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
    // NgxUsefulSwiperModule,
    // ScrollToModule.forRoot()
  ],
  exports: [
    // HeaderComponent,
    // FooterComponent,
    // BreadcrumbsComponent,
    // MailfooterComponent,
    // AccountBreadcrumbsComponent,
    AccountSidemenuComponent,
    DefaultButtonComponent,
    TicketGridComponent
  ]
})

export class SharedModule { }
