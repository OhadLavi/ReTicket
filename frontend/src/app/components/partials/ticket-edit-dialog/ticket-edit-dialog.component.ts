import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-ticket-edit-dialog',
  templateUrl: './ticket-edit-dialog.component.html',
  styleUrls: ['./ticket-edit-dialog.component.css']
})
export class TicketEditDialogComponent {
  priceForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TicketEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentPrice: number, originalPrice: number }
  ) {
    this.priceForm = new FormGroup({
      price: new FormControl(data.currentPrice, [
        Validators.required,
        Validators.min(0),
        Validators.max(data.originalPrice)
      ])
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.priceForm.valid) {
      this.dialogRef.close({ price: this.priceForm.value.price, action: 'confirm' });
    }
  }
}
