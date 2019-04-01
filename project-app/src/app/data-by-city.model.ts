export interface DataByCity {
  cityName: string;
  // TODO : do we really need this one ?
  stateName: string;
  incidentRatio2014: number;
  incidentRatio2017: number;
}

export interface City {
  city: string;
  state: string;
  pop: number;
}

export interface IncidentJson {
  city_or_county: string;
  date: string;
  latitude: string;
  longitude: string;
  state: string;
  state_house_district: string;
}

export interface Incident {
  city_or_county: string;
  date: Date;
  latitude: number;
  longitude: number;
  state: string;
  state_house_district: number;
}
