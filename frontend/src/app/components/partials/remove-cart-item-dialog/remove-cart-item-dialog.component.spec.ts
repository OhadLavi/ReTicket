import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveCartItemDialogComponent } from './remove-cart-item-dialog.component';

describe('RemoveCartItemDialogComponent', () => {
  let component: RemoveCartItemDialogComponent;
  let fixture: ComponentFixture<RemoveCartItemDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemoveCartItemDialogComponent]
    });
    fixture = TestBed.createComponent(RemoveCartItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
