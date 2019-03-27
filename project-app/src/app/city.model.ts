export interface CityJson {
    city: string;
    state: string;
    pop: number;
}
  
export class City {
constructor(
    public city: string,
    public state: string,
    public pop: number,
) {}
}