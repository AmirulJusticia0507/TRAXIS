import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as L from 'leaflet';

import type { LineType } from '../../../core/models/api.types';
import type { TrainPosition } from '../../../core/models/position.model';
import { StatusBadge } from '../status-badge/status-badge';
import { JAKARTA_ROUTES, stopsToLatLng } from '../../data/jakarta-routes';

interface MarkerState {
  marker: L.Marker;
  target: [number, number] | null;
}

/**
 * Peta Live Tracking berbasis Leaflet + OpenStreetMap.
 * Menggambar koridor jalur rel Jakarta (MRT & KRL), menempatkan posisi kereta
 * sebagai marker icon kereta, lalu menggerakkannya mulus antar pembaruan
 * polling (interpolasi requestAnimationFrame).
 */
@Component({
  selector: 'app-live-map',
  imports: [StatusBadge],
  templateUrl: './live-map.html',
  styleUrl: './live-map.scss'
})
export class LiveMap {
  readonly positions = input<TrainPosition[]>([]);
  readonly selected = signal<TrainPosition | null>(null);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  private map: L.Map | null = null;
  private markers = new Map<number, MarkerState>();
  private animationId: number | null = null;

  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.selected.set(null);
  };

  constructor() {
    afterNextRender(() => this.initMap());
    this.document.addEventListener('keydown', this.onKeydown);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('keydown', this.onKeydown);
      this.map?.remove();
      if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    });

    effect(() => {
      if (this.map) this.syncMarkers(this.positions());
    });
  }

  private initMap(): void {
    const container = this.host.nativeElement.querySelector('[data-testid="live-map"]');
    if (!container) return;

    this.map = L.map(container as HTMLElement, {
      center: [-6.23, 106.85],
      zoom: 10,
      scrollWheelZoom: false
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    for (const route of JAKARTA_ROUTES) {
      const pts = stopsToLatLng(route.stops).map(
        ([lat, lng]) => [lat, lng] as L.LatLngTuple
      );
      L.polyline(pts, { color: route.colorHex, weight: 4, opacity: 0.9 }).addTo(this.map);
    }

    this.syncMarkers(this.positions());
  }

  private syncMarkers(positions: TrainPosition[]): void {
    if (!this.map) return;

    const seen = new Set<number>();
    for (const position of positions) {
      seen.add(position.train.id);

      const target: [number, number] = [position.latitude, position.longitude];
      const existing = this.markers.get(position.train.id);

      if (existing) {
        existing.target = target;
        existing.marker.setIcon(this.trainIcon(position));
      } else {
        const marker = L.marker(target, { icon: this.trainIcon(position) }).addTo(this.map);
        marker.on('click', () => this.openTrain(position.train.id));
        this.markers.set(position.train.id, { marker, target });
      }
    }

    for (const [id, state] of this.markers) {
      if (!seen.has(id)) {
        this.map.removeLayer(state.marker);
        this.markers.delete(id);
      }
    }

    this.startAnimation();
  }

  private startAnimation(): void {
    if (this.animationId !== null) return;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private animate(): void {
    let active = false;

    for (const state of this.markers.values()) {
      const target = state.target;
      if (!target) continue;

      const current = state.marker.getLatLng();
      const dLat = target[0] - current.lat;
      const dLng = target[1] - current.lng;

      if (Math.hypot(dLat, dLng) < 1e-6) {
        state.marker.setLatLng(target);
        state.target = null;
        continue;
      }

      active = true;
      state.marker.setLatLng([current.lat + dLat * 0.12, current.lng + dLng * 0.12]);
    }

    if (active) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
    }
  }

  private trainIcon(position: TrainPosition): L.DivIcon {
    const status = position.status.toLowerCase();
    const emoji = position.train.line.type === 'MRT' ? '🚝' : '🚆';
    const html = `<span style="display:inline-block;font-size:22px;line-height:1">${emoji}</span>`;
    return L.divIcon({
      className: `live-map__marker live-map__marker--${status}`,
      html,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -14]
    });
  }

  protected readonly emojiFor = (type: LineType): string => (type === 'MRT' ? '🚝' : '🚆');

  protected readonly formatSpeed = (kmh: number): string => `${kmh.toFixed(0)} km/jam`;

  protected readonly formatTime = (iso: string): string =>
    new Date(iso).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

  protected readonly closeModal = (): void => this.selected.set(null);

  private openTrain(trainId: number): void {
    const position = this.positions().find((p) => p.train.id === trainId);
    if (position) this.selected.set(position);
  }
}
