import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ticket-quantity-dialog',
  templateUrl: './ticket-quantity-dialog.component.html',
  styleUrls: ['./ticket-quantity-dialog.component.css']
})
export class TicketQuantityDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TicketQuantityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {quantity: number, availableTickets: number}
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onContinueBrowsing(): void {
    this.dialogRef.close({quantity: this.data.quantity, action: 'continueBrowsing'});
  }

  onProceedToCart(): void {
    this.dialogRef.close({quantity: this.data.quantity, action: 'proceedToCart'});
  }
}
