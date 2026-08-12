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
import { JAKARTA_ROUTES } from '../../data/jakarta-routes';

/**
 * Peta Live Tracking berbasis Leaflet + OpenStreetMap.
 * Menggambar koridor jalur rel Jakarta (MRT & KRL) lalu menempatkan
 * posisi kereta sebagai marker yang di-refresh tiap polling.
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
  private markers = new Map<number, L.Marker>();

  constructor() {
    afterNextRender(() => this.initMap());
    this.destroyRef.onDestroy(() => this.map?.remove());

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
      const pts = route.coordinates.map(([lat, lng]) => [lat, lng] as L.LatLngTuple);
      L.polyline(pts, { color: route.colorHex, weight: 4, opacity: 0.9 }).addTo(this.map);
    }

    this.syncMarkers(this.positions());
  }

  private syncMarkers(positions: TrainPosition[]): void {
    if (!this.map) return;

    const seen = new Set<number>();
    for (const position of positions) {
      seen.add(position.train.id);

      const icon = this.trainIcon(position);
      const latLng: L.LatLngExpression = [position.latitude, position.longitude];
      const existing = this.markers.get(position.train.id);

      if (existing) {
        existing.setLatLng(latLng);
        existing.setIcon(icon);
      } else {
        const marker = L.marker(latLng, { icon }).addTo(this.map);
        this.markers.set(position.train.id, marker);
      }
      this.markers.get(position.train.id)?.bindPopup(this.popupHtml(position));
    }

    for (const [id, marker] of this.markers) {
      if (!seen.has(id)) {
        this.map.removeLayer(marker);
        this.markers.delete(id);
      }
    }
  }

  private trainIcon(position: TrainPosition): L.DivIcon {
    return L.divIcon({
      className: 'live-map__marker',
      html: `<span class="live-map__dot live-map__dot--${position.status.toLowerCase()}" data-testid="marker-${position.train.trainCode}"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }

  private popupHtml(position: TrainPosition): string {
    const station = position.currentStation ? ` - ${position.currentStation.name}` : '';
    return `<strong>${position.train.trainCode}</strong>${station}<br>${position.train.line.name}<br>${position.speedKmh.toFixed(1)} km/jam`;
  }
}
