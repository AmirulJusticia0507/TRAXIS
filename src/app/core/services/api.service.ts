import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  IncidentStatus,
  LineType,
  Paginated,
  ScheduleStatus,
  SortOrder,
  TrainStatus
} from '../models/api.types';
import type { Incident, IncidentCreate, IncidentUpdate } from '../models/incident.model';
import type { Line } from '../models/line.model';
import type { TrainPosition } from '../models/position.model';
import type { Schedule } from '../models/schedule.model';
import type { Station } from '../models/station.model';
import type { Train, TrainCreate, TrainUpdate } from '../models/train.model';

export interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
}

export interface ScheduleQuery extends ListQuery {
  line?: string;
  status?: ScheduleStatus | ScheduleStatus[];
  from?: string;
  to?: string;
  q?: string;
}

export interface TrainQuery extends ListQuery {
  status?: TrainStatus;
  line?: string;
}

export interface IncidentQuery extends ListQuery {
  lineType?: LineType;
  status?: IncidentStatus;
  from?: string;
  to?: string;
}

/**
 * ApiService - wrapper tiped terhadap seluruh endpoint REST (openapi.yaml).
 * Endpoint publik maupun authenticated memakai base environment.apiBaseUrl.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // ---- System ----

  getHealth(): Observable<{ status: string; database: string; timestamp: string }> {
    return this.http.get<{ status: string; database: string; timestamp: string }>(
      `${this.baseUrl}/health`
    );
  }

  // ---- Schedules ----

  getSchedules(query: ScheduleQuery = {}): Observable<Paginated<Schedule>> {
    return this.http.get<Paginated<Schedule>>(`${this.baseUrl}/schedules`, {
      params: this.buildParams(query)
    });
  }

  getScheduleById(id: number): Observable<Schedule> {
    return this.http.get<Schedule>(`${this.baseUrl}/schedules/${id}`);
  }

  // ---- Trains ----

  getTrains(query: TrainQuery = {}): Observable<Paginated<Train>> {
    return this.http.get<Paginated<Train>>(`${this.baseUrl}/trains`, {
      params: this.buildParams(query)
    });
  }

  createTrain(body: TrainCreate): Observable<Train> {
    return this.http.post<Train>(`${this.baseUrl}/trains`, body);
  }

  updateTrain(id: number, body: TrainUpdate): Observable<Train> {
    return this.http.put<Train>(`${this.baseUrl}/trains/${id}`, body);
  }

  deleteTrain(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/trains/${id}`);
  }

  // ---- Incidents ----

  getIncidents(query: IncidentQuery = {}): Observable<Paginated<Incident>> {
    return this.http.get<Paginated<Incident>>(`${this.baseUrl}/incidents`, {
      params: this.buildParams(query)
    });
  }

  createIncident(body: IncidentCreate): Observable<Incident> {
    return this.http.post<Incident>(`${this.baseUrl}/incidents`, body);
  }

  updateIncidentStatus(id: number, body: IncidentUpdate): Observable<Incident> {
    return this.http.put<Incident>(`${this.baseUrl}/incidents/${id}`, body);
  }

  // ---- References ----

  getStations(line?: string): Observable<Station[]> {
    const params = line ? new HttpParams().set('line', line) : undefined;
    return this.http.get<Station[]>(`${this.baseUrl}/stations`, { params });
  }

  getLines(lineType?: LineType): Observable<Line[]> {
    const params = lineType ? new HttpParams().set('lineType', lineType) : undefined;
    return this.http.get<Line[]>(`${this.baseUrl}/lines`, { params });
  }

  // ---- Live Tracking ----

  getLivePositions(): Observable<TrainPosition[]> {
    return this.http.get<TrainPosition[]>(`${this.baseUrl}/positions/live`);
  }

  // ---- Helpers ----

  private buildParams(query: ListQuery): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      if (Array.isArray(value)) {
        params = params.set(key, value.join(','));
      } else {
        params = params.set(key, String(value));
      }
    }
    return params;
  }
}
