import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../shared/appointment.service';
import { Appointment } from 'src/app/shared/appointment';


@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent  {

  appointmentForm: FormGroup;
  @Output() appointmentAdded = new EventEmitter<Appointment>();

  constructor(private fb: FormBuilder, private appointmentService: AppointmentService) {
    this.buildForm()
  }

  buildForm(){
    this.appointmentForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  onSave() {
    if (this.appointmentForm.valid) {
      const newAppointment: Appointment = this.appointmentForm.value;
      newAppointment.id = Math.random().toString(36).substr(2, 9); // Generate a random ID
      this.appointmentAdded.emit(newAppointment);
    }
  }

  onClose() {
    this.appointmentAdded.emit(null);
  }

}
