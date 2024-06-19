import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appointment } from './appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSubject: BehaviorSubject<Appointment[]> = new BehaviorSubject<Appointment[]>([]);
  public appointments$: Observable<Appointment[]> = this.appointmentsSubject.asObservable();

  constructor() {

    const initialAppointments: Appointment[] = [];
    this.appointmentsSubject.next(initialAppointments);
  }

  private getNextId(): number {
    const currentAppointments = this.appointmentsSubject.value;
    return currentAppointments.length > 0 ? Math.max(...currentAppointments.map(a => a.id)) + 1 : 1;
  }

  addAppointment(appointment: Appointment): void {
    appointment.id = this.getNextId();
    const currentAppointments = this.appointmentsSubject.value;
    this.appointmentsSubject.next([...currentAppointments, appointment]);
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const currentAppointments = this.appointmentsSubject.value.map(appointment =>
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    );
    this.appointmentsSubject.next(currentAppointments);
  }

  deleteAppointment(id: number): void {
    const currentAppointments = this.appointmentsSubject.value.filter(appointment => appointment.id !== id);
    this.appointmentsSubject.next(currentAppointments);
  }

  updateAppointments(appointments: Appointment[]): void {
    this.appointmentsSubject.next(appointments);
  }

  hasAppointmentOnDate(date: string): boolean {
    const appointments = this.appointmentsSubject.value;
    return appointments.some(appointment => appointment.date.toISOString().slice(0, 10) === date);
  }
}