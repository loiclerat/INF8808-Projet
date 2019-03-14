export default class Incident {
    public constructor(
        private cityOrCountry: string,
        private date: Date,
        private characteristics: string[],
        private latitude: number,
        private longitude: number,
        private injured: number,
        private killed: number,
        private gender: Gender[],
        private state: string,
        private stateHouseDistrict: number
    ) {}
}

export enum Gender {
    Male, Female
}
