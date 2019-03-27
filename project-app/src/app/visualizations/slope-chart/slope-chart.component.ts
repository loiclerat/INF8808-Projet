import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as d3 from "d3";

import { Incident } from "src/app/incident.model";
import { City } from "src/app/city.model";

class DataByCity {
  constructor(
    public cityName: string,
    // TODO : do we really need this one ?
    public stateName: string,
    public incidentRatio2014: number,
    public incidentRatio2017: number
  ) {}
}

@Component({
  selector: "app-slope-chart",
  templateUrl: "./slope-chart.component.html",
  styleUrls: ["./slope-chart.component.css"]
})
export class SlopeChartComponent implements OnChanges {
  @Input() public data: Incident[];
  @Input() public citiesData: City[];

  private dataByCity: DataByCity[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.currentValue) {
      this.preprocessing();
      this.initialization();
    }
  }

  // D3 examples : http://christopheviau.com/d3list/

  private preprocessing() {

    // Extract data only 2014 and 2017
    // Restreindre aux ville dispo dans citypop
    // Extract 100 first and 100 last cities (nb incident / nb hab)


  }

  // Début mais pas fini
  private initialization() {
    
  }
}
