import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";
import * as topoJson from "topojson";

@Component({
  selector: "app-chloropleth",
  templateUrl: "./chloropleth.component.html",
  styleUrls: ["./chloropleth.component.css"]
})
export class ChloroplethComponent implements OnInit {
  private type: string;
  private svg: any;
  private path: d3.GeoPath<any, d3.GeoPermissibleObjects>;
  private stateData: any;
  private countiesData: any;
  private width = 960;
  private height = 1160;
  private us: any;

  constructor() {}

  async ngOnInit() {
    this.type = "counties";

    this.svg = d3
      .select("body")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.path = d3.geoPath();
    this.us = await d3.json("https://d3js.org/us-10m.v1.json");
    this.svg.append("g").attr("class", "states");

    if (this.type === "counties") {
      this.buildForCounties();
    } else {
      this.buildForStates();
    }
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
      .data(topoJson.feature(this.us, this.us.objects.counties).features)
      .enter()
      .append("path")
      .attr("d", this.path);
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
      .data(topoJson.feature(this.us, this.us.objects.states).features)
      .enter()
      .append("path")
      .attr("d", this.path);
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
