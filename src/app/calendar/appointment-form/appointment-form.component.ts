import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../shared/appointment.service';
import { v4 as uuidv4 } from 'uuid';
import { Appointment } from 'src/app/shared/appointment';


@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent  {

  appointmentForm: FormGroup;

  constructor(private fb: FormBuilder, private appointmentService: AppointmentService) {
    this.buildForm()
  }

  buildForm(){
    this.appointmentForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      const appointment: Appointment = {
        id: uuidv4(),
        title: this.appointmentForm.value.title,
        date: new Date(this.appointmentForm.value.date)
      };
      this.appointmentService.addAppointment(appointment);
      this.appointmentForm.reset();
    }
  }

}
