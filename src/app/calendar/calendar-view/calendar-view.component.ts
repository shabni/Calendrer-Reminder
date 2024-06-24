import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../shared/appointment.service';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { Appointment } from '../../shared/appointment';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss']
})
export class CalendarViewComponent implements OnInit {
  appointments: Appointment[] = [];
  selectedDate: Date = new Date();
  calendarDates: Date[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.appointmentService.appointments$.subscribe(appointments => {
      this.appointments = appointments;
      this.generateCalendarDates();
    });
  }

  openAppointmentForm() {
    const dialogRef = this.dialog.open(AppointmentFormComponent);

    dialogRef.componentInstance.appointmentAdded.subscribe((appointment: Appointment) => {
      if (appointment) {
        this.appointmentService.addAppointment(appointment);
      }
      dialogRef.close();
    });
  }

  editAppointment(appointment: Appointment) {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      data: appointment
    });

    dialogRef.componentInstance.appointmentAdded.subscribe((updatedAppointment: Appointment) => {
      if (updatedAppointment) {
        this.appointmentService.updateAppointment(updatedAppointment);
      }
      dialogRef.close();
    });
  }

  getAppointmentsOnDate(date: Date): Appointment[] {
    const dateString = date.toISOString().slice(0, 10); // Get YYYY-MM-DD format
    return this.appointments.filter(appointment => appointment.date.toISOString().slice(0, 10) === dateString);
  }

  dateSelected(date: Date) {
    this.selectedDate = date;
    this.generateCalendarDates();
  }

  generateCalendarDates() {
    if (!this.selectedDate) {
      return;
    }

    const start = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
    const end = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0);

    this.calendarDates = this.getDaysArray(start, end);
  }

  getDaysArray(start: Date, end: Date): Date[] {
    const arr = [];
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      arr.push(new Date(dt));
    }
    return arr;
  }

  dateClass(): MatCalendarCellCssClasses {
    return (date: Date): MatCalendarCellCssClasses => {
      const appointments = this.getAppointmentsOnDate(date);
      if (appointments.length > 0) {
        return 'has-appointment';
      } else {
        return '';
      }
    };
  }

  previousMonth() {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() - 1, 1);
    this.generateCalendarDates();
  }

  nextMonth() {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 1);
    this.generateCalendarDates();
  }

  onDragEnded(event: CdkDragEnd<any>, appointment) {
    const appointmentToMove: Appointment = event.source.data;

    const previousDateIndex = this.calendarDates.findIndex(d => d.toDateString() === appointmentToMove.date.toDateString());
    const dropTargetDateIndex = this.calendarDates.findIndex(d => event.source.dropContainer.id === d.toDateString());

    if (dropTargetDateIndex !== -1) {
      const newDate: Date = this.calendarDates[dropTargetDateIndex - 1];

      if (previousDateIndex !== dropTargetDateIndex) {
        appointmentToMove.date = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      }
      this.appointmentService.updateAppointment(appointmentToMove);
    }
  }

  getConnectedDropLists(date: Date): string[] {
    return this.calendarDates.map(d => d.toDateString());
  }
}
