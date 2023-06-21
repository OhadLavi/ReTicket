import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DeleteTicketDialogData {
  ticketId: string;
}

@Component({
  selector: 'app-ticket-delete-dialog',
  templateUrl: './ticket-delete-dialog.component.html',
  styleUrls: ['./ticket-delete-dialog.component.css']
})
export class TicketDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TicketDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteTicketDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.dialogRef.close({ticketId: this.data.ticketId, action: 'delete'});
  }
}