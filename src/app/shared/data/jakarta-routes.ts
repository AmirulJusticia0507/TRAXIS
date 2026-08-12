export interface RailStop {
  name: string;
  lat: number;
  lng: number;
}

export interface RailRoute {
  id: string;
  name: string;
  colorHex: string;
  stops: RailStop[];
}

export const JAKARTA_ROUTES: RailRoute[] = [
  {
    id: 'MRT_NS',
    name: 'MRT Jakarta North-South Line',
    colorHex: '#00529B',
    stops: [
      { name: 'Bundaran HI', lat: -6.1949, lng: 106.8233 },
      { name: 'Dukuh Atas', lat: -6.201, lng: 106.8225 },
      { name: 'Setiabudi Astra', lat: -6.2084, lng: 106.8236 },
      { name: 'Bendungan Hilir', lat: -6.2144, lng: 106.8213 },
      { name: 'Istora Mandiri', lat: -6.2213, lng: 106.807 },
      { name: 'Senayan', lat: -6.226, lng: 106.8028 },
      { name: 'ASEAN', lat: -6.2315, lng: 106.804 },
      { name: 'Blok M', lat: -6.2445, lng: 106.7981 },
      { name: 'Blok M BCA', lat: -6.2512, lng: 106.792 },
      { name: 'Cipete Raya', lat: -6.2628, lng: 106.789 },
      { name: 'Haji Nawi', lat: -6.2734, lng: 106.7893 },
      { name: 'Cilandak', lat: -6.2815, lng: 106.7865 },
      { name: 'Fatmawati', lat: -6.2913, lng: 106.789 },
      { name: 'Lebak Bulus', lat: -6.2946, lng: 106.7891 }
    ]
  },
  {
    id: 'KRL_BOGOR',
    name: 'KRL Bogor Line',
    colorHex: '#C8102E',
    stops: [
      { name: 'Jakarta Kota', lat: -6.1372, lng: 106.8147 },
      { name: 'Kampung Bandan', lat: -6.1476, lng: 106.8209 },
      { name: 'Manggarai', lat: -6.2098, lng: 106.8505 },
      { name: 'Tebet', lat: -6.223, lng: 106.8573 },
      { name: 'Cawang', lat: -6.2423, lng: 106.854 },
      { name: 'Duren Kalibata', lat: -6.2558, lng: 106.8558 },
      { name: 'Pasar Minggu', lat: -6.2833, lng: 106.8445 },
      { name: 'Tanjung Barat', lat: -6.3074, lng: 106.838 },
      { name: 'Lenteng Agung', lat: -6.3292, lng: 106.8317 },
      { name: 'Univ. Pancasila', lat: -6.3419, lng: 106.829 },
      { name: 'Depok Baru', lat: -6.3924, lng: 106.8287 },
      { name: 'Depok', lat: -6.4042, lng: 106.8168 },
      { name: 'Citayam', lat: -6.4473, lng: 106.794 },
      { name: 'Bojonggede', lat: -6.4931, lng: 106.7965 },
      { name: 'Cilebut', lat: -6.5303, lng: 106.8025 },
      { name: 'Bogor', lat: -6.594, lng: 106.7904 }
    ]
  },
  {
    id: 'KRL_CIKARANG',
    name: 'KRL Cikarang Line',
    colorHex: '#F5C400',
    stops: [
      { name: 'Manggarai', lat: -6.2098, lng: 106.8505 },
      { name: 'Jatinegara', lat: -6.2154, lng: 106.8564 },
      { name: 'Klender', lat: -6.2138, lng: 106.8999 },
      { name: 'Buaran', lat: -6.2304, lng: 106.9217 },
      { name: 'Bekasi', lat: -6.236, lng: 106.9987 },
      { name: 'Cikarang', lat: -6.2565, lng: 107.1472 }
    ]
  }
];

export function routeById(id: string): RailRoute | undefined {
  return JAKARTA_ROUTES.find((r) => r.id === id);
}

export function stopsToLatLng(stops: RailStop[]): Array<[number, number]> {
  return stops.map((s) => [s.lat, s.lng]);
}
