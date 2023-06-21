import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface RemoveCartItemDialogData {
  id: number;
  name: string;
}

@Component({
  selector: 'app-remove-cart-item-dialog',
  templateUrl: './remove-cart-item-dialog.component.html',
  styleUrls: ['./remove-cart-item-dialog.component.css']
})
export class RemoveCartItemDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<RemoveCartItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemoveCartItemDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onRemove(): void {
    this.dialogRef.close({id: this.data.id, action: 'remove'});
  }
}
