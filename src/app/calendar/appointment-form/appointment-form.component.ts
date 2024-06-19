import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Appointment } from 'src/app/shared/appointment';


@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent  {
  appointmentForm: FormGroup;

  @Output() appointmentAdded = new EventEmitter<Appointment>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AppointmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Appointment
  ) {
    this.appointmentForm = this.fb.group({
      id: [this.data?.id || null],
      title: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.data) {
      this.appointmentForm.patchValue(this.data);
    }
  }

  onSave() {
    if (this.appointmentForm.valid) {
      const newAppointment: Appointment = { ...this.data, ...this.appointmentForm.value };
      this.appointmentAdded.emit(newAppointment);
    }
  }

  onClose() {
    this.appointmentAdded.emit(null);
    this.dialogRef.close();
  }
}
