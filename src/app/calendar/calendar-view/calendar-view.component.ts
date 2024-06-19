
import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../shared/appointment.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable, take } from 'rxjs';
import { Appointment } from '../../shared/appointment';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss']
})
export class CalendarViewComponent implements OnInit {
  appointments$: Observable<Appointment[]>;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit() {
    this.appointments$ = this.appointmentService.appointments$;
  }

  drop(event: CdkDragDrop<Appointment[]>) {
    this.appointments$.pipe(take(1)).subscribe(currentAppointments => {
      moveItemInArray(currentAppointments, event.previousIndex, event.currentIndex);
      this.appointmentService.updateAppointments(currentAppointments);
    });
  }

  deleteAppointment(id: string) {
    this.appointmentService.deleteAppointment(id);
  }
}
