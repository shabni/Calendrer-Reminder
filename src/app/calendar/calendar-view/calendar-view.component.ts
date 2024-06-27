import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../shared/appointment.service';
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
  isDayView: boolean = true; 
  hoursOfDay: number[] = Array.from({ length: 24 }, (_, i) => i)

  draggedAppointment: Appointment | null = null;

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

  deleteAppointment(id: number, event: Event) {
    event.stopPropagation();
    this.appointmentService.deleteAppointment(id);
  }

  getAppointmentsOnDate(date: Date): Appointment[] {
    const dateString = date.toISOString().slice(0, 10);
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

  previousDay() {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate() - 1);
    this.generateCalendarDates();
  }

  nextDay() {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate() + 1);
    this.generateCalendarDates();
  }

onMouseUp( i:number) {

  if (this.draggedAppointment && this.calendarDates[i]) {
    const newDate = this.calendarDates[i];
    
    this.draggedAppointment.date = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        this.draggedAppointment.date.getHours(),
        this.draggedAppointment.date.getMinutes(),
        this.draggedAppointment.date.getSeconds()
    );

    this.appointmentService.updateAppointment(this.draggedAppointment);
  }

  this.draggedAppointment = null;

}

  getConnectedDropLists(date: Date): string[] {
    return this.calendarDates.map(d => d.toDateString());
  }

  onDragStarted(appointment: Appointment) {

    this.draggedAppointment = appointment;
  }

  toggleView() {
    this.isDayView = !this.isDayView;
  }

  
  
  getAppointmentsOnHour(hour: number, date: Date): Appointment[] {
    const appointmentsOnHour = this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const appointmentTime = appointment.time.split(':');
      const appointmentHour = parseInt(appointmentTime[0], 10);
      const appointmentMinute = parseInt(appointmentTime[1], 10);
  
      return appointmentHour === hour &&
             appointmentMinute >= 0 && appointmentMinute < 60 &&
             appointmentDate.getDate() === date.getDate() &&
             appointmentDate.getMonth() === date.getMonth() &&
             appointmentDate.getFullYear() === date.getFullYear();
    });
    return appointmentsOnHour;
  }
  
  
  onMouseUpHourBar(i: number) {
 
    if (this.draggedAppointment) {
      const draggedDate = new Date(this.draggedAppointment.date);
      let appointmentTime: string;

      const currentMinutes = this.draggedAppointment.time.split(':')[1];

    if (this.hoursOfDay[i] < 10) {
      appointmentTime = `0${this.hoursOfDay[i]}:${currentMinutes}`;
    } else {
      appointmentTime = `${this.hoursOfDay[i]}:${currentMinutes}`;
    }
      const newDate = new Date(
        draggedDate.getFullYear(),
        draggedDate.getMonth(),
        draggedDate.getDate(),
        parseInt(appointmentTime.split(':')[0]), 
        parseInt(appointmentTime.split(':')[1]),0 
      );

      this.draggedAppointment.time = `${appointmentTime}`;
      this.draggedAppointment.date = newDate;
      this.appointmentService.updateAppointment(this.draggedAppointment);
    }
  
    this.draggedAppointment = null;
  }
}
