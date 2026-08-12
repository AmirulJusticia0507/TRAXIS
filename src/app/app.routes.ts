import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'schedules', pathMatch: 'full' },
  {
    path: 'schedules',
    loadComponent: () =>
      import('./features/schedules/schedules-list/schedules-list').then((m) => m.SchedulesList)
  },
  {
    path: 'trains',
    loadComponent: () => import('./features/trains/train-list/train-list').then((m) => m.TrainList)
  },
  {
    path: 'trains/new',
    loadComponent: () => import('./features/trains/train-form/train-form').then((m) => m.TrainForm)
  },
  {
    path: 'trains/:id/edit',
    loadComponent: () => import('./features/trains/train-form/train-form').then((m) => m.TrainForm)
  },
  {
    path: 'incidents',
    loadComponent: () =>
      import('./features/incidents/incident-list/incident-list').then((m) => m.IncidentList)
  },
  {
    path: 'incidents/report',
    loadComponent: () =>
      import('./features/incidents/incident-report/incident-report').then((m) => m.IncidentReport)
  },
  {
    path: 'stations',
    loadComponent: () =>
      import('./features/stations/stations-list/stations-list').then((m) => m.StationsList)
  },
  {
    path: 'live',
    loadComponent: () =>
      import('./features/live-tracking/live-tracking/live-tracking').then((m) => m.LiveTracking)
  },
  { path: '**', redirectTo: 'schedules' }
];
