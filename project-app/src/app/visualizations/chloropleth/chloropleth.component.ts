import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";
import * as topoJson from "topojson";
//import statesData from "./utilis";

@Component({
  selector: "app-chloropleth",
  templateUrl: "./chloropleth.component.html",
  styleUrls: ["./chloropleth.component.css"]
})
export class ChloroplethComponent implements OnInit {
  private type: string;
  private svg: any;
  private path: d3.GeoPath<any, d3.GeoPermissibleObjects>;
  private width = 960;
  private height = 1160;
  private us: any;
  private statesIncidentes: any[] = [];
  statesMap: any;
  countiesMap: any;

  constructor() {
    this.statesIncidentes.push({
      value: 1000,
      state: "Alabama"
    });
  }

  async ngOnInit() {
    this.type = "states";
    this.svg = d3
      .select("body")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
    this.path = d3.geoPath();
    this.us = await d3.json("https://d3js.org/us-10m.v1.json");
    this.svg.append("g").attr("class", "states");

    //color
    this.statesMap = topoJson.feature(this.us, this.us.objects.states).features;
    this.statesMap.forEach((state: any) => {
      state.properties = {
        value: Math.random()
      };
    });
    this.buildForStates();

    this.countiesMap = topoJson.feature(
      this.us,
      this.us.objects.counties
    ).features;
    this.countiesMap.forEach((county: any) => {
      county.properties = {
        value: Math.random()
      };
    });
  }

  buildForCounties() {
    this.svg.remove();
    this.svg = d3
      .select("body")
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
        return d3.interpolateReds(d.properties.value);
      });
  }

  getIndexMatch(states: any[], stateId: string) {
    for (let i = 0; i < states.length; i++) {
      states[i].state;
    }
  }

  buildForStates() {
    this.svg.remove();
    this.svg = d3
      .select("body")
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
        return d3.interpolateReds(d.properties.value);
      });
  }

  change() {
    console.log("here");
    if (this.type === "counties") {
      this.type = "states";
      this.buildForStates();
    } else {
      this.type = "counties";
      this.buildForCounties();
    }
  }
}
