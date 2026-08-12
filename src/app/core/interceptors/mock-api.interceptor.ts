import type {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';

import { routeById, type RailRoute } from '../../shared/data/jakarta-routes';

import type {
  IncidentStatus,
  LineType,
  Paginated,
  PositionStatus,
  ScheduleStatus,
  SortOrder,
  TrainStatus
} from '../models/api.types';
import type { Incident } from '../models/incident.model';
import type { Line } from '../models/line.model';
import type { TrainPosition } from '../models/position.model';
import type { Schedule } from '../models/schedule.model';
import type { Station } from '../models/station.model';
import type { Train } from '../models/train.model';

/**
 * Mock REST API interceptor - fase development (GOALS.md: REST & Mock Service Layer).
 * Seed data disinkronkan dengan schema.sql. Saat backend real tersedia, hapus
 * interceptor ini dari app.config.ts.
 */

const MOCK_LATENCY_MS = 250;

// ---------------------------------------------------------------------------
// Seed data (sinkron dengan schema.sql)
// ---------------------------------------------------------------------------

const lines: Line[] = [
  { id: 1, code: 'MRT_NS', name: 'MRT North-South Line', type: 'MRT', colorHex: '#00529B', isActive: true },
  { id: 2, code: 'MRT_EW', name: 'MRT East-West Line', type: 'MRT', colorHex: '#00A79D', isActive: true },
  { id: 3, code: 'KRL_RED', name: 'KRL Red Line', type: 'KRL', colorHex: '#C8102E', isActive: true },
  { id: 4, code: 'KRL_GREEN', name: 'KRL Green Line', type: 'KRL', colorHex: '#3A913F', isActive: true },
  { id: 5, code: 'KRL_YELLOW', name: 'KRL Yellow Line', type: 'KRL', colorHex: '#F5C400', isActive: true }
];

const rawStations: Array<{ id: number; code: string; name: string; lineId: number }> = [
  { id: 1, code: 'LB', name: 'Lebak Bulus', lineId: 1 },
  { id: 2, code: 'FH', name: 'Fatmawati', lineId: 1 },
  { id: 3, code: 'BM', name: 'Blok M', lineId: 1 },
  { id: 4, code: 'HI', name: 'Bundaran HI', lineId: 1 },
  { id: 8, code: 'DA', name: 'Dukuh Atas', lineId: 1 },
  { id: 9, code: 'SA', name: 'Setiabudi Astra', lineId: 1 },
  { id: 10, code: 'BH', name: 'Bendungan Hilir', lineId: 1 },
  { id: 11, code: 'IM', name: 'Istora Mandiri', lineId: 1 },
  { id: 12, code: 'SN', name: 'Senayan', lineId: 1 },
  { id: 13, code: 'AS', name: 'ASEAN', lineId: 1 },
  { id: 14, code: 'BCA', name: 'Blok M BCA', lineId: 1 },
  { id: 15, code: 'CP', name: 'Cipete Raya', lineId: 1 },
  { id: 16, code: 'HN', name: 'Haji Nawi', lineId: 1 },
  { id: 17, code: 'CL', name: 'Cilandak', lineId: 1 },
  { id: 5, code: 'JK', name: 'Jakarta Kota', lineId: 3 },
  { id: 18, code: 'KB', name: 'Kampung Bandan', lineId: 3 },
  { id: 6, code: 'MN', name: 'Manggarai', lineId: 3 },
  { id: 19, code: 'TB', name: 'Tebet', lineId: 3 },
  { id: 20, code: 'CW', name: 'Cawang', lineId: 3 },
  { id: 21, code: 'DK', name: 'Duren Kalibata', lineId: 3 },
  { id: 22, code: 'PM', name: 'Pasar Minggu', lineId: 3 },
  { id: 23, code: 'TA', name: 'Tanjung Barat', lineId: 3 },
  { id: 24, code: 'LA', name: 'Lenteng Agung', lineId: 3 },
  { id: 25, code: 'UP', name: 'Univ. Pancasila', lineId: 3 },
  { id: 26, code: 'DB', name: 'Depok Baru', lineId: 3 },
  { id: 27, code: 'DP', name: 'Depok', lineId: 3 },
  { id: 28, code: 'CT', name: 'Citayam', lineId: 3 },
  { id: 29, code: 'BJ', name: 'Bojonggede', lineId: 3 },
  { id: 30, code: 'CB', name: 'Cilebut', lineId: 3 },
  { id: 7, code: 'BG', name: 'Bogor', lineId: 3 }
];

const stations: Station[] = rawStations.map((s) => ({
  id: s.id,
  code: s.code,
  name: s.name,
  isActive: true,
  line: lines.find((l) => l.id === s.lineId) as Line
}));

const stationById = (id: number): Station => stations.find((s) => s.id === id) as Station;
const stationByName = (name: string): Station | null => stations.find((s) => s.name === name) ?? null;
const lineById = (id: number): Line => lines.find((l) => l.id === id) as Line;

const trains: Train[] = [
  { id: 1, trainCode: 'MRT-NS-101', line: lineById(1), capacity: 1200, status: 'ACTIVE', createdAt: '2026-08-01T00:00:00+07:00', updatedAt: '2026-08-01T00:00:00+07:00' },
  { id: 2, trainCode: 'MRT-NS-102', line: lineById(1), capacity: 1200, status: 'ACTIVE', createdAt: '2026-08-01T00:00:00+07:00', updatedAt: '2026-08-01T00:00:00+07:00' },
  { id: 3, trainCode: 'MRT-NS-103', line: lineById(1), capacity: 1200, status: 'MAINTENANCE', createdAt: '2026-08-01T00:00:00+07:00', updatedAt: '2026-08-01T00:00:00+07:00' },
  { id: 4, trainCode: 'KRL-RED-201', line: lineById(3), capacity: 1800, status: 'ACTIVE', createdAt: '2026-08-01T00:00:00+07:00', updatedAt: '2026-08-01T00:00:00+07:00' },
  { id: 5, trainCode: 'KRL-RED-202', line: lineById(3), capacity: 1800, status: 'DELAYED', createdAt: '2026-08-01T00:00:00+07:00', updatedAt: '2026-08-01T00:00:00+07:00' }
];

const trainById = (id: number): Train | null => trains.find((t) => t.id === id) ?? null;

function buildSchedules(): Schedule[] {
  const items: Schedule[] = [];
  let id = 1;
  const day = '2026-08-12T';

  const toWib = (d: Date): string => {
    const shifted = new Date(d.getTime() + 7 * 3600 * 1000).toISOString();
    return `${shifted.slice(0, 19)}+07:00`;
  };
  const at = (time: string): Date => new Date(`${day}${time}+07:00`);

  const add = (
    train: Train,
    origin: Station,
    destination: Station,
    departure: string,
    durationMinutes: number,
    status: ScheduleStatus
  ): void => {
    const dep = at(departure);
    const arr = new Date(dep.getTime() + durationMinutes * 60000);
    items.push({
      id: id++,
      train,
      originStation: origin,
      destinationStation: destination,
      departureTime: toWib(dep),
      arrivalTime: toWib(arr),
      status
    });
  };

  const mrt = trainById(1) as Train;
  const mrt2 = trainById(2) as Train;
  const krl = trainById(4) as Train;
  const krl2 = trainById(5) as Train;
  const lb = stationById(1);
  const hi = stationById(4);
  const jk = stationById(5);
  const bg = stationById(7);

  for (let minute = 330; minute <= 1290; minute += 30) {
    const h = Math.floor(minute / 60).toString().padStart(2, '0');
    const m = (minute % 60).toString().padStart(2, '0');
    const t = `${h}:${m}`;
    const status: ScheduleStatus =
      minute === 390 || minute === 600 ? 'DELAYED' : minute === 930 ? 'CANCELLED' : 'ON_TIME';
    add(mrt, lb, hi, t, 37, status);
    add(mrt2, hi, lb, t, 37, 'ON_TIME');
  }
  for (let minute = 270; minute <= 1290; minute += 60) {
    const h = Math.floor(minute / 60).toString().padStart(2, '0');
    const m = (minute % 60).toString().padStart(2, '0');
    const t = `${h}:${m}`;
    const status: ScheduleStatus = minute === 450 ? 'DELAYED' : 'ON_TIME';
    add(krl, jk, bg, t, 95, status);
    add(krl2, bg, jk, t, 95, status);
  }

  return items;
}

const schedules = buildSchedules();

const incidents: Incident[] = [
  {
    id: 1,
    lineType: 'MRT',
    train: trainById(2),
    locationStation: 'Blok M',
    delayDurationMinutes: 15,
    description: 'Penumpukan penumpang di pintu masuk Stasiun Blok M.',
    status: 'RESOLVED',
    reportedAt: '2026-08-12T06:20:00+07:00',
    resolvedAt: '2026-08-12T07:10:00+07:00'
  },
  {
    id: 2,
    lineType: 'KRL',
    train: trainById(5),
    locationStation: 'Manggarai',
    delayDurationMinutes: 25,
    description: 'Sinyal bermasalah di sekitar Stasiun Manggarai.',
    status: 'OPEN',
    reportedAt: '2026-08-12T08:05:00+07:00',
    resolvedAt: null
  }
];

const positions: TrainPosition[] = [
  { train: trainById(1) as Train, currentStation: null, latitude: -6.2896, longitude: 106.8035, speedKmh: 62.5, status: 'IN_TRANSIT', lastUpdatedAt: '2026-08-12T09:00:00+07:00' },
  { train: trainById(2) as Train, currentStation: stationById(3), latitude: -6.2445, longitude: 106.8003, speedKmh: 0, status: 'AT_STATION', lastUpdatedAt: '2026-08-12T09:00:00+07:00' },
  { train: trainById(4) as Train, currentStation: stationById(5), latitude: -6.1374, longitude: 106.8146, speedKmh: 0, status: 'AT_STATION', lastUpdatedAt: '2026-08-12T09:00:00+07:00' },
  { train: trainById(5) as Train, currentStation: null, latitude: -6.206, longitude: 106.8607, speedKmh: 45.2, status: 'IN_TRANSIT', lastUpdatedAt: '2026-08-12T09:00:00+07:00' }
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function respond<T>(body: T, status = 200): ReturnType<HttpInterceptorFn> {
  return of(new HttpResponse({ status, body }) as HttpEvent<unknown>).pipe(
    delay(MOCK_LATENCY_MS)
  );
}

function respondNoContent(): ReturnType<HttpInterceptorFn> {
  return of(new HttpResponse({ status: 204 }) as HttpEvent<unknown>).pipe(
    delay(MOCK_LATENCY_MS)
  );
}

function respondError(message: string, code: string, status = 400): ReturnType<HttpInterceptorFn> {
  return respond({ error: { code, message } }, status);
}

function paginate<T>(items: T[], page: number, limit: number): Paginated<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  return {
    data: items.slice((safePage - 1) * limit, safePage * limit),
    meta: { page: safePage, limit, totalItems, totalPages }
  };
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  return String(a).localeCompare(String(b));
}

function sortItems<T>(items: T[], key: string, order: SortOrder, accessor: (row: T) => unknown): T[] {
  const dir = order === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => dir * compareValues(accessor(a), accessor(b)));
}

function getParam(req: HttpRequest<unknown>, name: string): string | null {
  return req.params.get(name);
}

function getPageLimit(req: HttpRequest<unknown>): { page: number; limit: number } {
  const page = Number(getParam(req, 'page') ?? '1');
  const limit = Math.min(Math.max(Number(getParam(req, 'limit') ?? '20'), 1), 100);
  return { page: Number.isFinite(page) ? page : 1, limit: Number.isFinite(limit) ? limit : 20 };
}

function splitMulti(value: string | null): string[] | null {
  if (!value) return null;
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function getHealth(): ReturnType<HttpInterceptorFn> {
  return respond({
    status: 'ok',
    database: 'up',
    timestamp: new Date().toISOString()
  });
}

function handleListSchedules(req: HttpRequest<unknown>): ReturnType<HttpInterceptorFn> {
  const { page, limit } = getPageLimit(req);
  const line = getParam(req, 'line');
  const statuses = splitMulti(getParam(req, 'status'));
  const from = getParam(req, 'from');
  const to = getParam(req, 'to');
  const q = getParam(req, 'q')?.toLowerCase() ?? null;
  const sort = getParam(req, 'sort') ?? 'departure_time';
  const order = (getParam(req, 'order') ?? 'asc') as SortOrder;

  let items = schedules.filter((s) => {
    if (line && s.train.line.code !== line) return false;
    if (statuses && !statuses.includes(s.status)) return false;
    if (from && s.departureTime < from) return false;
    if (to && s.departureTime > to) return false;
    if (q) {
      const haystack = `${s.train.trainCode} ${s.train.line.name} ${s.originStation.name} ${s.destinationStation.name}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const accessors: Record<string, (s: Schedule) => unknown> = {
    train_code: (s) => s.train.trainCode,
    line_code: (s) => s.train.line.code,
    line_name: (s) => s.train.line.name,
    origin_station: (s) => s.originStation.name,
    destination_station: (s) => s.destinationStation.name,
    departure_time: (s) => s.departureTime,
    arrival_time: (s) => s.arrivalTime,
    status: (s) => s.status
  };
  items = sortItems(items, sort, order, accessors[sort] ?? accessors['departure_time']);

  return respond(paginate(items, page, limit));
}

function handleGetSchedule(req: HttpRequest<unknown>): ReturnType<HttpInterceptorFn> {
  const id = Number(req.url.split('/').filter(Boolean).pop());
  const schedule = schedules.find((s) => s.id === id);
  return schedule ? respond(schedule) : respondError('Schedule tidak ditemukan', 'NOT_FOUND', 404);
}

function handleListTrains(req: HttpRequest<unknown>): ReturnType<HttpInterceptorFn> {
  const { page, limit } = getPageLimit(req);
  const status = getParam(req, 'status') as TrainStatus | null;
  const line = getParam(req, 'line');
  const sort = getParam(req, 'sort') ?? 'train_code';
  const order = (getParam(req, 'order') ?? 'asc') as SortOrder;

  let items = trains.filter((t) => {
    if (status && t.status !== status) return false;
    if (line && t.line.code !== line) return false;
    return true;
  });

  const accessors: Record<string, (t: Train) => unknown> = {
    train_code: (t) => t.trainCode,
    line_name: (t) => t.line.name,
    capacity: (t) => t.capacity,
    status: (t) => t.status
  };
  items = sortItems(items, sort, order, accessors[sort] ?? accessors['train_code']);

  return respond(paginate(items, page, limit));
}

function handleCreateTrain(req: HttpRequest<unknown>): ReturnType<HttpInterceptorFn> {
  const body = req.body as { trainCode: string; lineId: number; capacity: number; status: TrainStatus };

  if (!body?.trainCode || !body.lineId) {
    return respondError('trainCode dan lineId wajib diisi', 'VALIDATION_ERROR');
  }
  if (trains.some((t) => t.trainCode === body.trainCode)) {
    return respondError('trainCode sudah dipakai', 'CONFLICT', 409);
  }

  const nextId = trains.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  const now = new Date().toISOString();
  const train: Train = {
    id: nextId,
    trainCode: body.trainCode,
    line: lineById(body.lineId),
    capacity: body.capacity ?? 0,
    status: body.status ?? 'ACTIVE',
    createdAt: now,
    updatedAt: now
  };
  trains.push(train);
  return respond(train, 201);
}

function handleUpdateTrain(req: HttpRequest<unknown>): ReturnType<HttpInterceptorFn> {
  const id = Number(req.url.split('/').filter(Boolean).pop());
  const train = trainById(id);
  if (!train) return respondError('Train tidak ditemukan', 'NOT_FOUND', 404);

  const body = req.body as { trainCode: string; lineId: number; capacity: number; status: TrainStatus };
  if (body.trainCode && trains.some((t) => t.id !== id && t.trainCode === body.trainCode)) {
    return respondError('trainCode sudah dipakai', 'CONFLICT', 409);
  }

  train.trainCode = body.trainCode ?? train.trainCode;
  train.line = body.lineId ? lineById(body.lineId) : train.line;
  train.capacity = body.capacity ?? train.capacity;
  train.status = body.status ?? train.status;
  train.updatedAt = new Date().toISOString();
  return respond(train);
}

function handleDeleteTrain(req: HttpRequest<unknown>): ReturnType<HttpInterceptorFn> {
  const id = Number(req.url.split('/').filter(Boolean).pop());
  const index = trains.findIndex((t) => t.id === id);
  if (index === -1) return respondError('Train tidak ditemukan', 'NOT_FOUND', 404);
  trains.splice(index, 1);
  return respondNoContent();
}

function handleListIncidents(req: HttpRequest<unknown>): ReturnType<HttpInterceptorFn> {
  const { page, limit } = getPageLimit(req);
  const lineType = getParam(req, 'lineType') as LineType | null;
  const status = getParam(req, 'status') as IncidentStatus | null;
  const from = getParam(req, 'from');
  const to = getParam(req, 'to');
  const sort = getParam(req, 'sort') ?? 'reported_at';
  const order = (getParam(req, 'order') ?? 'desc') as SortOrder;

  let items = incidents.filter((i) => {
    if (lineType && i.lineType !== lineType) return false;
    if (status && i.status !== status) return false;
    if (from && i.reportedAt < from) return false;
    if (to && i.reportedAt > to) return false;
    return true;
  });

  const accessors: Record<string, (i: Incident) => unknown> = {
    reported_at: (i) => i.reportedAt,
    line_type: (i) => i.lineType,
    status: (i) => i.status,
    delay_duration_minutes: (i) => i.delayDurationMinutes
  };
  items = sortItems(items, sort, order, accessors[sort] ?? accessors['reported_at']);

  return respond(paginate(items, page, limit));
}

function handleCreateIncident(req: HttpRequest<unknown>): ReturnType<HttpInterceptorFn> {
  const body = req.body as {
    lineType: LineType;
    trainId: number | null;
    locationStation: string;
    delayDurationMinutes: number;
    description: string;
  };

  if (!body?.lineType || !body.locationStation || body.locationStation.length < 3) {
    return respondError('locationStation minimal 3 karakter', 'VALIDATION_ERROR');
  }
  if (!body.description || body.description.length === 0) {
    return respondError('description wajib diisi', 'VALIDATION_ERROR');
  }
  if (body.description.length > 500) {
    return respondError('description maksimal 500 karakter', 'VALIDATION_ERROR');
  }
  if (body.delayDurationMinutes < 0 || body.delayDurationMinutes > 300) {
    return respondError('delayDurationMinutes harus 0-300', 'VALIDATION_ERROR');
  }

  const nextId = incidents.reduce((max, i) => Math.max(max, i.id), 0) + 1;
  const incident: Incident = {
    id: nextId,
    lineType: body.lineType,
    train: body.trainId ? trainById(body.trainId) : null,
    locationStation: body.locationStation,
    delayDurationMinutes: body.delayDurationMinutes ?? 0,
    description: body.description,
    status: 'OPEN',
    reportedAt: new Date().toISOString(),
    resolvedAt: null
  };
  incidents.push(incident);
  return respond(incident, 201);
}

function handleUpdateIncident(req: HttpRequest<unknown>): ReturnType<HttpInterceptorFn> {
  const id = Number(req.url.split('/').filter(Boolean).pop());
  const incident = incidents.find((i) => i.id === id);
  if (!incident) return respondError('Incident tidak ditemukan', 'NOT_FOUND', 404);

  const body = req.body as { status: IncidentStatus };
  if (body?.status) {
    incident.status = body.status;
    incident.resolvedAt = body.status === 'RESOLVED' ? new Date().toISOString() : null;
  }
  return respond(incident);
}

function handleListStations(req: HttpRequest<unknown>): ReturnType<HttpInterceptorFn> {
  const line = getParam(req, 'line');
  const items = line ? stations.filter((s) => s.line.code === line) : stations;
  return respond(items);
}

function handleListLines(req: HttpRequest<unknown>): ReturnType<HttpInterceptorFn> {
  const lineType = getParam(req, 'lineType') as LineType | null;
  const items = lineType ? lines.filter((l) => l.type === lineType) : lines;
  return respond(items);
}

// ---------------------------------------------------------------------------
// Simulasi pergerakan kereta mengikuti koridor jalur (MRT/KRL)
// ---------------------------------------------------------------------------

const EARTH_RADIUS_KM = 6371;
const MOVE_TICK_KM = 2 / 3600; // jarak (km) yang ditempuh dalam 1 tick saat 1 km/jam

interface TrainMotion {
  route: RailRoute;
  cumulativeKm: number[];
  totalKm: number;
  progress: number;
  dir: 1 | -1;
  speedKmh: number;
  dwellTicks: number;
  atStation: string | null;
  lastLat: number;
  lastLng: number;
}

const motionById = new Map<number, TrainMotion>();

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(s));
}

function routeForLine(line: Line): RailRoute | undefined {
  if (line.id === 1) return routeById('MRT_NS');
  if (line.id === 3) return routeById('KRL_BOGOR');
  return undefined;
}

function projectToRoute(
  route: RailRoute,
  cumulativeKm: number[],
  lat: number,
  lng: number
): { progress: number; lat: number; lng: number } {
  const lat0 = (route.stops[0].lat * Math.PI) / 180;
  const cos0 = Math.cos(lat0);
  let best = { progress: 0, lat: route.stops[0].lat, lng: route.stops[0].lng, dist: Infinity };
  for (let i = 0; i < route.stops.length - 1; i++) {
    const ax = route.stops[i].lng * cos0;
    const ay = route.stops[i].lat;
    const bx = route.stops[i + 1].lng * cos0;
    const by = route.stops[i + 1].lat;
    const px = lng * cos0;
    const py = lat;
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq ? ((px - ax) * dx + (py - ay) * dy) / lenSq : 0;
    t = Math.min(1, Math.max(0, t));
    const cx = ax + dx * t;
    const cy = ay + dy * t;
    const dist = Math.hypot(px - cx, py - cy);
    if (dist < best.dist) {
      best = {
        progress: cumulativeKm[i] + t * (cumulativeKm[i + 1] - cumulativeKm[i]),
        lat: cy,
        lng: cx / cos0,
        dist
      };
    }
  }
  return { progress: best.progress, lat: best.lat, lng: best.lng };
}

function positionAlongRoute(
  route: RailRoute,
  cumulativeKm: number[],
  progress: number
): { lat: number; lng: number } {
  const stops = route.stops;
  let seg = 0;
  while (seg < cumulativeKm.length - 2 && progress > cumulativeKm[seg + 1]) seg++;
  const segLen = cumulativeKm[seg + 1] - cumulativeKm[seg] || 1;
  const t = Math.min(1, Math.max(0, (progress - cumulativeKm[seg]) / segLen));
  return {
    lat: stops[seg].lat + (stops[seg + 1].lat - stops[seg].lat) * t,
    lng: stops[seg].lng + (stops[seg + 1].lng - stops[seg].lng) * t
  };
}

function buildMotion(route: RailRoute, seedLat: number, seedLng: number): TrainMotion {
  const cumulativeKm: number[] = [0];
  for (let i = 1; i < route.stops.length; i++) {
    cumulativeKm.push(
      cumulativeKm[i - 1] +
        haversineKm(
          route.stops[i - 1].lat,
          route.stops[i - 1].lng,
          route.stops[i].lat,
          route.stops[i].lng
        )
    );
  }
  const totalKm = cumulativeKm[cumulativeKm.length - 1];
  const start = projectToRoute(route, cumulativeKm, seedLat, seedLng);
  return {
    route,
    cumulativeKm,
    totalKm,
    progress: start.progress,
    dir: 1,
    speedKmh: 40 + Math.random() * 30,
    dwellTicks: 0,
    atStation: null,
    lastLat: start.lat,
    lastLng: start.lng
  };
}

function nearestStationIndex(motion: TrainMotion, lat: number, lng: number): number {
  for (let i = 0; i < motion.route.stops.length; i++) {
    const s = motion.route.stops[i];
    if (haversineKm(lat, lng, s.lat, s.lng) < 0.25) return i;
  }
  return -1;
}

function stepMotion(
  motion: TrainMotion
): { lat: number; lng: number; speedKmh: number; status: PositionStatus; stationName: string | null } {
  if (motion.dwellTicks > 0) {
    motion.dwellTicks--;
    return { lat: motion.lastLat, lng: motion.lastLng, speedKmh: 0, status: 'AT_STATION', stationName: motion.atStation };
  }

  motion.speedKmh = Math.min(80, Math.max(20, motion.speedKmh + (Math.random() - 0.5) * 8));
  let next = motion.progress + motion.dir * motion.speedKmh * MOVE_TICK_KM;
  if (next >= motion.totalKm) {
    next = motion.totalKm;
    motion.dir = -1;
  }
  if (next <= 0) {
    next = 0;
    motion.dir = 1;
  }
  motion.progress = next;

  const pos = positionAlongRoute(motion.route, motion.cumulativeKm, motion.progress);
  motion.lastLat = pos.lat;
  motion.lastLng = pos.lng;

  const stationIdx = nearestStationIndex(motion, pos.lat, pos.lng);
  if (stationIdx >= 0) {
    motion.atStation = motion.route.stops[stationIdx].name;
    motion.dwellTicks = 1 + Math.floor(Math.random() * 2);
    return { lat: pos.lat, lng: pos.lng, speedKmh: 0, status: 'AT_STATION', stationName: motion.atStation };
  }
  return { lat: pos.lat, lng: pos.lng, speedKmh: motion.speedKmh, status: 'IN_TRANSIT', stationName: null };
}

function handleLivePositions(): ReturnType<HttpInterceptorFn> {
  const now = new Date().toISOString();
  for (const p of positions) {
    let motion = motionById.get(p.train.id);
    if (!motion) {
      const route = routeForLine(p.train.line);
      if (!route) continue;
      motion = buildMotion(route, p.latitude, p.longitude);
      motionById.set(p.train.id, motion);
    }
    const step = stepMotion(motion);
    p.latitude = step.lat;
    p.longitude = step.lng;
    p.speedKmh = step.speedKmh;
    p.status = step.status;
    p.currentStation = step.stationName ? stationByName(step.stationName) : null;
    p.lastUpdatedAt = now;
  }
  return respond([...positions]);
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const mockApiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const url = new URL(req.url, 'http://mock.local');
  const path = url.pathname.replace(/^\/api\/v1/, '').replace(/^\/+|\/+$/g, '') || '/';

  const segments = path.split('/').filter(Boolean);

  if (path === 'health' && req.method === 'GET') return getHealth();

  if (path === 'schedules' && req.method === 'GET') return handleListSchedules(req);
  if (segments[0] === 'schedules' && segments.length === 2 && req.method === 'GET')
    return handleGetSchedule(req);

  if (path === 'trains' && req.method === 'GET') return handleListTrains(req);
  if (path === 'trains' && req.method === 'POST') return handleCreateTrain(req);
  if (segments[0] === 'trains' && segments.length === 2 && req.method === 'PUT')
    return handleUpdateTrain(req);
  if (segments[0] === 'trains' && segments.length === 2 && req.method === 'DELETE')
    return handleDeleteTrain(req);

  if (path === 'incidents' && req.method === 'GET') return handleListIncidents(req);
  if (path === 'incidents' && req.method === 'POST') return handleCreateIncident(req);
  if (segments[0] === 'incidents' && segments.length === 2 && req.method === 'PUT')
    return handleUpdateIncident(req);

  if (path === 'stations' && req.method === 'GET') return handleListStations(req);
  if (path === 'lines' && req.method === 'GET') return handleListLines(req);
  if (path === 'positions/live' && req.method === 'GET') return handleLivePositions();

  return respondError(`Endpoint mock tidak dikenal: ${req.method} ${path}`, 'NOT_FOUND', 404);
};
