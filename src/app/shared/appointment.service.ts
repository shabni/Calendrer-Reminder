import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Appointment } from './appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  appointments$ = this.appointmentsSubject.asObservable();

  addAppointment(appointment: Appointment) {
    const currentAppointments = this.appointmentsSubject.value;
    this.appointmentsSubject.next([...currentAppointments, appointment]);
  }

  deleteAppointment(id: string) {
    const currentAppointments = this.appointmentsSubject.value.filter(appointment => appointment.id !== id);
    this.appointmentsSubject.next(currentAppointments);
  }

  updateAppointment(updatedAppointment: Appointment) {
    const currentAppointments = this.appointmentsSubject.value.map(appointment =>
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    );
    this.appointmentsSubject.next(currentAppointments);
  }

  updateAppointments(appointments: Appointment[]) {
    this.appointmentsSubject.next(appointments);
  }
}