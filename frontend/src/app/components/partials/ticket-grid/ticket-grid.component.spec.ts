import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketGridComponent } from './ticket-grid.component';

describe('TicketGridComponent', () => {
  let component: TicketGridComponent;
  let fixture: ComponentFixture<TicketGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicketGridComponent]
    });
    fixture = TestBed.createComponent(TicketGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
