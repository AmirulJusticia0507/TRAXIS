import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input
} from '@angular/core';
import * as L from 'leaflet';

import type { TrainPosition } from '../../../core/models/position.model';
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
  templateUrl: './live-map.html',
  styleUrl: './live-map.scss'
})
export class LiveMap {
  readonly positions = input<TrainPosition[]>([]);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  private map: L.Map | null = null;
  private markers = new Map<number, MarkerState>();
  private animationId: number | null = null;

  constructor() {
    afterNextRender(() => this.initMap());
    this.destroyRef.onDestroy(() => {
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
        this.markers.set(position.train.id, { marker, target });
      }
      this.markers.get(position.train.id)?.marker.bindPopup(this.popupHtml(position));
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
    const color = position.train.line.colorHex;
    const status = position.status.toLowerCase();
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" role="img" aria-label="${position.train.trainCode}">` +
      `<path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10z" fill="${color}"/>` +
      `<circle cx="7" cy="17" r="1.5" fill="#1f2937"/>` +
      `<circle cx="17" cy="17" r="1.5" fill="#1f2937"/>` +
      `<rect x="4.5" y="5" width="3.4" height="3.4" rx="1" fill="#fff" opacity=".95"/>` +
      `<rect x="10.3" y="5" width="3.4" height="3.4" rx="1" fill="#fff" opacity=".95"/>` +
      `<rect x="16.1" y="5" width="3.4" height="3.4" rx="1" fill="#fff" opacity=".95"/>` +
      `</svg>`;
    return L.divIcon({
      className: `live-map__marker live-map__marker--${status}`,
      html: svg,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14]
    });
  }

  private popupHtml(position: TrainPosition): string {
    const station = position.currentStation ? ` - ${position.currentStation.name}` : '';
    return `<strong>${position.train.trainCode}</strong>${station}<br>${position.train.line.name}<br>${position.speedKmh.toFixed(1)} km/jam`;
  }
}
