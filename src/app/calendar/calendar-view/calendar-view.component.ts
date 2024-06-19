
import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../shared/appointment.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable, take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Appointment } from '../../shared/appointment';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss']
})
export class CalendarViewComponent implements OnInit {
  appointments$: Observable<Appointment[]>;

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.appointments$ = this.appointmentService.appointments$;
  }

  openAppointmentForm() {
    const dialogRef = this.dialog.open(AppointmentFormComponent);

    dialogRef.componentInstance.appointmentAdded.pipe(take(1)).subscribe((appointment: Appointment) => {
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

    dialogRef.componentInstance.appointmentAdded.pipe(take(1)).subscribe((updatedAppointment: Appointment) => {
      if (updatedAppointment) {
        this.appointmentService.updateAppointment(updatedAppointment);
      }
      dialogRef.close();
    });
  }

  drop(event: CdkDragDrop<Appointment[]>) {
    this.appointments$.pipe(take(1)).subscribe(currentAppointments => {
      moveItemInArray(currentAppointments, event.previousIndex, event.currentIndex);
      this.appointmentService.updateAppointments(currentAppointments);
    });
  }

  deleteAppointment(id: number) {
    this.appointmentService.deleteAppointment(id);
  }
}
