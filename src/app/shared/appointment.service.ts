import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appointment } from './appointment';

interface StoredAppointment {
  id: number;
  title: string;
  date: string;
  time: string;
}

function isStoredAppointment(value: unknown): value is StoredAppointment {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const appointment = value as Record<string, unknown>;
  return typeof appointment['id'] === 'number' &&
    typeof appointment['title'] === 'string' &&
    typeof appointment['date'] === 'string' && !Number.isNaN(Date.parse(appointment['date'])) &&
    typeof appointment['time'] === 'string';
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly storageKey = 'calendar-reminder-appointments';
  private appointmentsSubject: BehaviorSubject<Appointment[]> = new BehaviorSubject<Appointment[]>([]);
  public appointments$: Observable<Appointment[]> = this.appointmentsSubject.asObservable();

  constructor() {
    const storedAppointments = localStorage.getItem(this.storageKey);
    if (!storedAppointments) {
      return;
    }

    const parsedAppointments: unknown = JSON.parse(storedAppointments);
    if (!Array.isArray(parsedAppointments) || !parsedAppointments.every(isStoredAppointment)) {
      throw new Error('Saved appointments are invalid and could not be loaded.');
    }

    this.appointmentsSubject.next(parsedAppointments.map(appointment => ({
      ...appointment,
      date: new Date(appointment.date)
    })));
  }

  private getNextId(): number {
    const currentAppointments = this.appointmentsSubject.value;
    return currentAppointments.length > 0 ? Math.max(...currentAppointments.map(a => a.id)) + 1 : 1;
  }

  addAppointment(appointment: Appointment): void {
    appointment.id = this.getNextId();
    const currentAppointments = this.appointmentsSubject.value;
    this.saveAppointments([...currentAppointments, appointment]);
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const currentAppointments = this.appointmentsSubject.value.map(appointment =>
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    );
    this.saveAppointments(currentAppointments);
  }

  deleteAppointment(id: number): void {
    const currentAppointments = this.appointmentsSubject.value.filter(appointment => appointment.id !== id);
    this.saveAppointments(currentAppointments);
  }

  updateAppointments(appointments: Appointment[]): void {
    this.saveAppointments(appointments);
  }

  private saveAppointments(appointments: Appointment[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(appointments));
    this.appointmentsSubject.next(appointments);
  }

  hasAppointmentOnDate(date: string): boolean {
    const appointments = this.appointmentsSubject.value;
    return appointments.some(appointment => appointment.date.toISOString().slice(0, 10) === date);
  }
}