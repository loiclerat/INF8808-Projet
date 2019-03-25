import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as d3 from "d3";

import { Incident } from "src/app/incident.model";
import { Localization } from "../localization-fr";

class DataByState {
  constructor(
    public name: string,
    public incidentsByMonth: number[]
  ) {}
}

@Component({
  selector: "app-slope-chart",
  templateUrl: "./slope-chart.component.html",
  styleUrls: ["./slope-chart.component.css"]
})
export class SlopeChartComponent implements OnChanges {
  @Input() public data: Incident[];
  private dataByState: DataByState[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.currentValue) {
      this.preprocessing();
      this.initialization();
    }
  }

  // D3 examples : http://christopheviau.com/d3list/

  private preprocessing() {

    // Extract data only 2014 and 2017
    // Extract 100 first and 100 last cities (nb incident / nb hab)
  }

  // Début mais pas fini
  private initialization() {
    
  }
}
