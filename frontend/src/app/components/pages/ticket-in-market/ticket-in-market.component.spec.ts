import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketInMarketComponent } from './ticket-in-market.component';

describe('TicketInMarketComponent', () => {
  let component: TicketInMarketComponent;
  let fixture: ComponentFixture<TicketInMarketComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicketInMarketComponent]
    });
    fixture = TestBed.createComponent(TicketInMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
