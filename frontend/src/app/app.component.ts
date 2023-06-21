import { Component, HostBinding } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { FormControl } from '@angular/forms';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @HostBinding('class') className = '';
  toggleControl = new FormControl(false);
  title = 'Reticket';

  tabs: {title:string, link:string}[] = [
    {title: 'Profile', link: '/profile'},
    {title: 'Tickets', link: '/tickets'}
  ];

  constructor(private overlay: OverlayContainer, private userService: UserService) { }

  ngOnInit(): void {
    const darkModeOn = this.userService.getThemePreference();
    this.toggleControl.setValue(darkModeOn);
    const darkClassName = 'darkMode';
    if (darkModeOn) {
      this.className = darkClassName;
      this.overlay.getContainerElement().classList.add(darkClassName);
    } else {
      this.className = '';
      this.overlay.getContainerElement().classList.remove(darkClassName);
    }
    
    this.toggleControl.valueChanges.subscribe((darkMode) => {
      this.className = darkMode ? darkClassName : '';
      if (darkMode) {
        this.overlay.getContainerElement().classList.add(darkClassName);
        this.userService.setThemePreference(darkMode);
      } else {
        this.overlay.getContainerElement().classList.remove(darkClassName);
        if (darkMode === false) this.userService.setThemePreference(darkMode);
      }     
    });
  }

}
