import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketQuantityDialogComponent } from './ticket-quantity-dialog.component';

describe('TicketQuantityDialogComponent', () => {
  let component: TicketQuantityDialogComponent;
  let fixture: ComponentFixture<TicketQuantityDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicketQuantityDialogComponent]
    });
    fixture = TestBed.createComponent(TicketQuantityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
