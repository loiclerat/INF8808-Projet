import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";
import * as topoJson from "topojson";

// import statesData from "./utilis";

enum MapType {
  State = 0,
  County
}

@Component({
  selector: "app-chloropleth",
  templateUrl: "./chloropleth.component.html",
  styleUrls: ["./chloropleth.component.css"]
})
export class ChloroplethComponent implements OnInit {

  private width = 960;
  private height = 700;

  private us: any;
  private svg: any;
  private path: d3.GeoPath<any, d3.GeoPermissibleObjects>;
  private statesIncidentes: any[] = [];
  private statesMap: any;
  private countiesMap: any;

  private statesIdNames;
  private countiesIdNames;
  private dataSatesIncidents;
  private dataCountiesIncidents;

  private currentYear : string;

  constructor() {
    this.statesIncidentes.push({
      value: 1000,
      state: "Alabama"
    });
  }

  async ngOnInit() {
    this.currentYear = "2016";

    this.svg = d3
      .select("#map")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.path = d3.geoPath();
    this.us = await d3.json("https://d3js.org/us-10m.v1.json");
    //this.svg.append("g").attr("class", "states");

    //load neccessary data
    this.statesIdNames = await d3.json("./../../../../extract/states-id.json");
    this.dataSatesIncidents = await d3.json("./../../../../extract/domain_States.json");


    // color
    this.statesMap = topoJson.feature(this.us, this.us.objects.states).features;
    this.statesMap.forEach((state: any) => {
      let stateName = this.statesIdNames[state.id];
      let result = stateName in this.dataSatesIncidents[this.currentYear] ? this.dataSatesIncidents[this.currentYear][stateName] : 0;
      state.properties = {
        value: result
      };
    });

    this.buildForStates();

    //counties
    this.countiesIdNames = await d3.json("./../../../../extract/counties-id.json");
    this.dataCountiesIncidents = await d3.json("./../../../../extract/domain_Counties.json");
    this.countiesMap = topoJson.feature(
      this.us,
      this.us.objects.counties
    ).features;

    this.countiesMap.forEach((county: any) => {
      let countyName = this.countiesIdNames[county.id];
      let result = countyName in this.dataCountiesIncidents[this.currentYear] ? this.dataCountiesIncidents[this.currentYear][countyName] : 0;
      county.properties = {
        value: result
      };
    });
  }

  buildForCounties() {
    this.svg.remove();
    this.svg = d3
      .select("#map")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.svg
      .selectAll("path")
      .data(this.countiesMap)
      .enter()
      .append("path")
      .attr("d", this.path)
      .style("fill", function(d) {
        return d3.interpolatePurples(d.properties.value);
      });
  }

  private getIndexMatch(states: any[], stateId: string) {
    for (let i = 0; i < states.length; i++) {
      states[i].state; // TODO heu????
    }
  }

  buildForStates() {
    this.svg.remove();
    this.svg = d3
      .select("#map")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
    this.svg
      .selectAll("path")
      .data(this.statesMap)
      .enter()
      .append("path")
      .attr("d", this.path)
      .style("fill", function(d) {
        return d3.interpolatePurples(d.properties.value);
      });
  }

  change() {
    this.buildForCounties();
  }
}
