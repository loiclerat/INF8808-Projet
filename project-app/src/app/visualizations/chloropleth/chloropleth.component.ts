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
  private type: MapType;
  private svg: any;
  private path: d3.GeoPath<any, d3.GeoPermissibleObjects>;
  private width = 1000;
  private height = 700;
  private us: any;
  private statesIncidentes: any[] = []; // TODO C'est quoi???
  private statesMap: any;
  private countiesMap: any;

  constructor() {
    this.statesIncidentes.push({
      value: 1000,
      state: "Alabama"
    });
  }

  async ngOnInit() {
    this.type = MapType.State;

    this.svg = d3.select("svg#map")
      .attr("width", this.width)
      .attr("height", this.height);

    this.path = d3.geoPath();
    this.us = await d3.json("https://d3js.org/us-10m.v1.json");
    this.svg.append("g").attr("class", "states"); // TODO C'est quoi???

    // color
    this.statesMap = topoJson.feature(this.us, this.us.objects.states).features;
    this.statesMap.forEach((state: any) => {
      state.properties = {
        value: Math.random() // TODO Des valeurs random?????
      };
    });

    this.buildForStates();

    this.countiesMap = topoJson.feature(
      this.us,
      this.us.objects.counties
    ).features;

    this.countiesMap.forEach((county: any) => {
      county.properties = {
        value: Math.random() // TODO Des valeurs random?????
      };
    });
  }

  private buildForCounties() {
    this.svg.selectAll("*").remove();

    this.svg.selectAll("path")
      .data(this.countiesMap)
      .enter()
      .append("path")
      .attr("d", this.path)
      .style("fill", function (d) {
        return d3.interpolateReds(d.properties.value);
      });
  }

  private getIndexMatch(states: any[], stateId: string) {
    for (let i = 0; i < states.length; i++) {
      states[i].state; // TODO heu????
    }
  }

  private buildForStates() {
    this.svg.selectAll("*").remove();

    this.svg
      .selectAll("path")
      .data(this.statesMap)
      .enter()
      .append("path")
      .attr("d", this.path)
      .style("fill", function (d) {
        return d3.interpolateReds(d.properties.value);
      });
  }

  public change() {
    if (this.type === MapType.County) {
      this.type = MapType.State;
      this.buildForStates();
    } else {
      this.type = MapType.County;
      this.buildForCounties();
    }
  }
}
