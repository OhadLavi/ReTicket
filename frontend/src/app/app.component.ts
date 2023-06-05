import { Component, HostBinding } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { FormControl } from '@angular/forms';

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

  constructor(private overlay: OverlayContainer) { }
  ngOnInit(): void {
      this.toggleControl.valueChanges.subscribe((darkMode) => {
        const darkClassName = 'darkMode';
        this.className = darkMode ? darkClassName : '';
        if (darkMode) {
          this.overlay.getContainerElement().classList.add(darkClassName);
        } else {
          this.overlay.getContainerElement().classList.remove(darkClassName);
        }
      });
  }
}
