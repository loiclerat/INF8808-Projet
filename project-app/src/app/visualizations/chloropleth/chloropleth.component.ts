import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";
import * as topoJson from "topojson";

enum MapType {
  State,
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
  private type: MapType;

  private statesIdNames;
  private countiesIdNames;
  private dataSatesIncidents;
  private dataCountiesIncidents;

  constructor() {
    this.statesIncidentes.push({
      value: 1000,
      state: "Alabama"
    });
  }

  async ngOnInit() {
    //prepare usa map
    this.svg = d3
      .select("#map")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
    this.path = d3.geoPath();
    this.us = await d3.json("https://d3js.org/us-10m.v1.json");
    this.svg.append("g").attr("class", "states");

    //load neccessary data
    this.statesIdNames = await d3.json("./../../../../extract/id-formatting/states-id.json");
    this.dataSatesIncidents = await d3.json("./../../../../extract/domain-color-max/domain_States.json");
    this.countiesIdNames = await d3.json("./../../../../extract/id-formatting/counties-id.json");
    this.dataCountiesIncidents = await d3.json("./../../../../extract/domain-color-max/domain_Counties.json");

    const DEFAULT_YEAR = "2017";
    //states
    this.statesMap = topoJson.feature(this.us, this.us.objects.states).features;
    this.updateJsonMapForStates(DEFAULT_YEAR);
    this.buildForStates();
    //counties
    this.countiesMap = topoJson.feature(this.us, this.us.objects.counties).features;
    this.updateJsonMapForCounties(DEFAULT_YEAR);

    this.buildLegend();
  }

  buildLegend(): void {
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
    this.type = MapType.County;
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
      .style("fill", function (d) {
        return d3.interpolateBlues(d.properties.value);
      })
      .on("mousemove", function (d) {
        //this.svg.selectAll("path").style("opacity", 0.5);
        console.log(d.id, d.properties.value, d.properties.name, d.properties.total);
        d3.select(this).attr('fill-opacity', 1);
      })
      .on("mouseout", function (d) {
        //this.svg.selectAll("path").style("opacity", 1);
        return d3.interpolateBlues(d.properties.value);
      });
  }

  buildForStates() {
    this.type = MapType.State;
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
      .style("fill", function (d) {
        return d3.interpolatePuBu(d.properties.value);
      })
      .on("mousemove", function (d) {
        //this.svg.selectAll("path").style("opacity", 0.5);
        console.log(d.id, d.properties.value, d.properties.name, d.properties.total);
        d3.select(this).attr('fill-opacity', 1);
      })
      .on("mouseout", function (d) {
        //this.svg.selectAll("path").style("opacity", 1);
        return d3.interpolateBlues(d.properties.value);
      });
  }

  changeYear(year: string) {
    if (this.type == MapType.State) {
      this.updateJsonMapForStates(year);
      this.buildForStates();
    } else {
      this.updateJsonMapForCounties(year);
      this.buildForCounties();
    }
  }

  updateJsonMapForStates(year: string) {
    this.statesMap.forEach((state: any) => {
      let stateName = this.statesIdNames[state.id];
      let ratio = stateName in this.dataSatesIncidents[year] ? this.dataSatesIncidents[year][stateName] : 0;
      let total = this.dataSatesIncidents[year]["maximum"] * ratio;
      state.properties = {
        value: ratio,
        name: stateName,
        total: total
      };
    });
  }

  updateJsonMapForCounties(year: string) {
    this.countiesMap.forEach((county: any) => {
      let countyName = this.countiesIdNames[county.id];
      let ratio = countyName in this.dataCountiesIncidents[year] ? this.dataCountiesIncidents[year][countyName] : 0;
      let total = this.dataCountiesIncidents[year]["maximum"] * ratio;
      county.properties = {
        value: ratio,
        name: countyName,
        total: total
      };
    });
  }
}