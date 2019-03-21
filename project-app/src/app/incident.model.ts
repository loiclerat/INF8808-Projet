export interface IncidentJson {
  city_or_country: string;
  date: string;
  latitude: string;
  longitude: string;
  state: string;
  state_house_district: string;
}

export class Incident {
  constructor(
    public city_or_country: string,
    public date: Date,
    public latitude: number,
    public longitude: number,
    public state: string,
    public state_house_district: number
  ) {}
}
