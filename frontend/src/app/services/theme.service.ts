import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDark = false;

  // Toggles the theme
  toggleTheme() {
    this.isDark = !this.isDark;
    const body = document.body;
    if (this.isDark) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }
}