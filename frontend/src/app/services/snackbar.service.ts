import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  showSnackbar(message: string, type: string, position: 'top' | 'bottom' = 'bottom'): void {
    const config: MatSnackBarConfig = {
      duration: 6000,
      panelClass: [type],
      verticalPosition: position,
    };

    this.snackBar.open(message, 'Close', config);
  }
}
