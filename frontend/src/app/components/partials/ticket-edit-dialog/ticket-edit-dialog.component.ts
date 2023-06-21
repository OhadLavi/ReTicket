import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ticket-edit-dialog',
  templateUrl: './ticket-edit-dialog.component.html',
  styleUrls: ['./ticket-edit-dialog.component.css']
})
export class TicketEditDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TicketEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {price: number}
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({price: this.data.price, action: 'confirm'});
  }
}
