import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppointmentService } from '../../shared/appointment.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Appointment } from '../../shared/appointment';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss']
})
export class CalendarViewComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  selectedDate: Date = new Date();
  calendarDates: Date[] = [];
  isDayView: boolean = true; 
  hoursOfDay: number[] = Array.from({ length: 24 }, (_, i) => i)
  notificationPermission: NotificationPermission | 'unsupported' =
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;

  draggedAppointment: Appointment | null = null;
  private reminderPollSubscription?: Subscription;
  private appointmentsSubscription?: Subscription;
  private lastReminderCheck = Date.now();
  private readonly notifiedReminders = new Set<string>();
  private readonly pendingReminderMessages: string[] = [];
  private isShowingReminder = false;

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.selectedDate.setHours(0, 0, 0, 0)
  }

  ngOnInit() {
    this.appointmentsSubscription = this.appointmentService.appointments$.subscribe(appointments => {
      this.appointments = appointments;
      this.generateCalendarDates();
    });

    this.reminderPollSubscription = interval(10000).subscribe(() => this.checkReminders());
  }

  ngOnDestroy() {
    this.appointmentsSubscription?.unsubscribe();
    this.reminderPollSubscription?.unsubscribe();
  }

  async enableDesktopNotifications() {
    if (typeof Notification === 'undefined') {
      this.notificationPermission = 'unsupported';
      return;
    }

    if (!window.isSecureContext) {
      this.snackBar.open('Desktop notifications require HTTPS or localhost.', 'Dismiss', {
        duration: 6000
      });
      return;
    }

    try {
      this.notificationPermission = await Notification.requestPermission();
      if (this.notificationPermission === 'granted') {
        this.snackBar.open('Desktop notifications are enabled.', 'Dismiss', { duration: 4000 });
      } else if (this.notificationPermission === 'denied') {
        this.snackBar.open('Notifications are blocked. Allow them in your browser site settings.', 'Dismiss', {
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Could not request desktop notification permission.', error);
      this.snackBar.open('Could not enable desktop notifications.', 'Dismiss', { duration: 6000 });
    }
  }

  private checkReminders() {
    const now = Date.now();
    const dueAppointments: Appointment[] = [];

    this.appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      const [hours, minutes] = appointment.time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);
      const dueAt = appointmentDate.getTime();
      const reminderKey = `${appointment.id}:${dueAt}`;

      if (dueAt > this.lastReminderCheck && dueAt <= now && !this.notifiedReminders.has(reminderKey)) {
        this.notifiedReminders.add(reminderKey);
        dueAppointments.push(appointment);
      }
    });

    this.lastReminderCheck = now;

    if (dueAppointments.length > 0) {
      const titles = dueAppointments.map(appointment => appointment.title);
      const message = titles.length === 1
        ? `${titles[0]} is due`
        : `${titles.length} appointments are due: ${titles.join(', ')}`;
      this.notificationPermission = typeof Notification === 'undefined'
        ? 'unsupported'
        : Notification.permission;

      if (document.visibilityState !== 'visible' && this.notificationPermission === 'granted') {
        this.showDesktopNotification(message);
      } else {
        this.pendingReminderMessages.push(message);
        this.showNextReminder();
      }
    }
  }

  private showDesktopNotification(message: string) {
    try {
      const notification = new Notification('Calendar Reminder', {
        body: message,
        icon: 'assets/icons/icon-192x192.png'
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Could not show desktop notification.', error);
      this.pendingReminderMessages.push(message);
      this.showNextReminder();
    }
  }

  private showNextReminder() {
    if (this.isShowingReminder || this.pendingReminderMessages.length === 0) {
      return;
    }

    const message = this.pendingReminderMessages.shift();
    if (message === undefined) {
      return;
    }

    this.isShowingReminder = true;
    this.snackBar.open(message, 'Dismiss', {
      duration: 10000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['reminder-snackbar']
    }).afterDismissed().subscribe(() => {
      this.isShowingReminder = false;
      this.showNextReminder();
    });
  }

  openAppointmentForm() {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      data: {date:this.selectedDate}
    });

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

    console.log('before',this.selectedDate)
    this.selectedDate = date;
    console.log('after',this.selectedDate)
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
