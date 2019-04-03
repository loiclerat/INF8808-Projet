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
  private type : string;

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

    this.type = "state"

    this.svg = d3
      .select("#map")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.path = d3.geoPath();
    this.us = await d3.json("https://d3js.org/us-10m.v1.json");
    //this.svg.append("g").attr("class", "states");

    //load neccessary data
    this.statesIdNames = await d3.json("./../../../../extract/id-formatting/states-id.json");
    this.dataSatesIncidents = await d3.json("./../../../../extract/domain-color-max/domain_States.json");


    // color
    this.statesMap = topoJson.feature(this.us, this.us.objects.states).features;
    this.updateJsonMapForStates(this.currentYear);

    this.buildForStates();

    //counties
    this.countiesIdNames = await d3.json("./../../../../extract/id-formatting/counties-id.json");
    this.dataCountiesIncidents = await d3.json("./../../../../extract/domain-color-max/domain_Counties.json");
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
    var key = d3.select("#legend1")
      .append("svg")
      .attr("width", 200)
      .attr("height", 50);

    var legend = key.append("defs")
      .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    legend.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FFF7FB")
      .attr("stop-opacity", 1);

    legend.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#023858")
      .attr("stop-opacity", 1);

    key.append("rect")
      .attr("width", 200)
      .attr("height", 50 - 30)
      .style("fill", "url(#gradient)")
      .attr("transform", "translate(0,10)");

  } 

  buildForCounties() {
    this.type = "counties";
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
        return d3.interpolateBlues(d.properties.value);
      });
  }

  buildForStates() {
    this.type = "state";
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
        return d3.interpolateBlues(d.properties.value);
      });
  }

  changeYear(year : string){
    this.currentYear = year
    
  }

  updateJsonMapForStates(year : string){
    this.statesMap.forEach((state: any) => {
      let stateName = this.statesIdNames[state.id];
      let result = stateName in this.dataSatesIncidents[year] ? this.dataSatesIncidents[year][stateName] : 0;
      state.properties = {
        value: result
      };
    });
  }


  change() {
    this.buildForCounties();
  }
}