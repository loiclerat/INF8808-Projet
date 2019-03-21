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
  selector: "app-line-chart",
  templateUrl: "./line-chart.component.html",
  styleUrls: ["./line-chart.component.css"]
})
export class LineChartComponent implements OnChanges {
  @Input() public data: Incident[];
  private dataByState: DataByState[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.currentValue) {
      this.preprocessing();
      this.initialization();
    }
  }

  private preprocessing() {

    this.dataByState = [];
    this.data.forEach((incident: Incident) => {
      let state = this.dataByState.find(d => d.name === incident.state);
      if (!state) {
        const incidentsByMonth = [];
        for (let year = 2014; year <= 2017; ++year ) {
          for (let month = 0; month < 12; ++ month) {
            incidentsByMonth.push(0);
          }
        }
        state = new DataByState(incident.state, incidentsByMonth);
        this.dataByState.push(state);
      }
      const incidentMonth = incident.date.getMonth();
      const incidentYear = incident.date.getFullYear();

      state.incidentsByMonth[(incidentYear - 2014) * 12 + (incidentMonth - 1)] += 1;
    });

    console.log(this.dataByState);

    this.data = []; // free up memory
  }

  // Début mais pas fini
  private initialization() {
    const marginFocus = {
      top: 10,
      right: 10,
      bottom: 100,
      left: 60
    };
    const widthFocus = 1200 - marginFocus.left - marginFocus.right;
    const heightFocus = 500 - marginFocus.top - marginFocus.bottom;

    /***** Échelles *****/
    const xFocus = d3.scaleTime().range([0, widthFocus]);
    const yFocus = d3.scaleLinear().range([heightFocus, 0]);

    const xAxisFocus = d3.axisBottom(xFocus).tickFormat((d: Date) => Localization.getFormattedDateByMonth(d));
    const yAxisFocus = d3.axisLeft(yFocus);

    const svg = d3.select("svg")
    .attr("width", widthFocus + marginFocus.left + marginFocus.right)
    .attr("height", heightFocus + marginFocus.top + marginFocus.bottom);

    const focus = svg.append("g")
    .attr("transform", "translate(" + marginFocus.left + "," + marginFocus.top + ")");
    
    // const lineFocus = createLine(xFocus, yFocus);

    
    // var color = d3.scaleOrdinal(d3.schemeCategory10);
  }

}
