import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSidemenuComponent } from './account-sidemenu.component';

describe('AccountSidemenuComponent', () => {
  let component: AccountSidemenuComponent;
  let fixture: ComponentFixture<AccountSidemenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountSidemenuComponent]
    });
    fixture = TestBed.createComponent(AccountSidemenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
