import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellTicketComponent } from './sell-ticket.component';

describe('SellTicketComponent', () => {
  let component: SellTicketComponent;
  let fixture: ComponentFixture<SellTicketComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SellTicketComponent]
    });
    fixture = TestBed.createComponent(SellTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
