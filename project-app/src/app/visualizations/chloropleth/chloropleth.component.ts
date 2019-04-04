import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";
import * as topoJson from "topojson";
import { DataMap } from "src/app/interfaces/DataMap";
import d3Tip from "d3-tip";

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
  private statesMap: any;
  private countiesMap: any;
  private type: MapType;

  private statesIdNames: any;
  private countiesIdNames: any;
  private dataSatesIncidents: any;
  private dataCountiesIncidents: any;

  private minimum: number;
  private maximum: number;
  private tooltip: any;

  constructor() {
  }

  async ngOnInit() {
    //prepare usa map
    this.resetMapSVG();
    this.path = d3.geoPath();
    this.us = await d3.json("https://d3js.org/us-10m.v1.json");
    this.svg.append("g").attr("class", "states");
    this.tooltip = d3Tip().attr("class", "d3-tip");
    this.tooltip.html((data: DataMap, type: MapType) => {
      let typeText = type == MapType.State ? "État" : "Comté";
      return `<div>${typeText}: <b> ${data.name} </b> <br>
                Total: <b> ${data.total} </b><br>
                Maximum : <b> ${data.maximum} </b></div>`
    });
    //load neccessary data
    this.statesIdNames = await d3.json("./../../../../extract/id-formatting/states-id.json");
    this.dataSatesIncidents = await d3.json("./../../../../extract/domain-color-max/domain_States.json");
    this.countiesIdNames = await d3.json("./../../../../extract/id-formatting/counties-id.json");
    this.dataCountiesIncidents = await d3.json("./../../../../extract/domain-color-max/domain_Counties.json");

    const DEFAULT_YEAR = "2014";
    //states
    this.statesMap = topoJson.feature(this.us, this.us.objects.states).features;
    this.updateJsonMapForStates(DEFAULT_YEAR);
    this.type = MapType.State;
    this.buildMap(this.tooltip, this.type);
    //counties
    this.countiesMap = topoJson.feature(this.us, this.us.objects.counties).features;
    this.updateJsonMapForCounties(DEFAULT_YEAR);

    this.buildLegend();
  }

  changeMap(mapType: MapType) {
    this.type = mapType;
    this.buildMap(this.tooltip, mapType);
  }

  private buildMap(tooltip: any, mapType: MapType) {
    let mapTypeData = mapType == MapType.State ? this.statesMap : this.countiesMap;
    this.resetMapSVG();
    this.svg
      .selectAll("path")
      .data(mapTypeData)
      .enter()
      .append("path")
      .attr("d", this.path)
      .style("fill", function (d) {
        return d3.interpolatePuBu(d.properties.value);
      })
      .on("mouseover", function (d, i) {
        console.log(d3.interpolateBlues(d.properties.value))
        d3.select("#map").select("svg").selectAll("path").style("opacity", 0.1);
        d3.select(this).style("opacity", 1);
      })
      .on("mousemove", function (d) {
        tooltip.show(d.properties, MapType.State, this)
          .style("left", (d3.event.pageX - 61) + "px")
          .style("top", (d3.event.pageY - 85) + "px");
      })
      .on("mouseout", function (d) {
        d3.select("#map").select("svg").selectAll("path").style("opacity", 1);
        //d3.select("#tooltip").style("display", "none");
        tooltip.hide(d);
      });
    this.svg.call(tooltip);
  }

  private resetMapSVG() {
    //rebuild a new map
    if (this.svg != undefined)
      this.svg.remove();
    this.svg = d3
      .select("#map")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
  }

  changeYear(year: string) {
    if (this.type == MapType.State) {
      this.updateJsonMapForStates(year);
      this.buildMap(this.tooltip, this.type);
    } else {
      this.updateJsonMapForCounties(year);
      this.buildMap(this.tooltip, this.type);
    }
  }

  updateJsonMapForStates(year: string) {
    this.statesMap.forEach((state: any) => {
      let stateName = this.statesIdNames[state.id];
      let ratio = stateName in this.dataSatesIncidents[year] ? this.dataSatesIncidents[year][stateName] : 0;
      let total = this.dataSatesIncidents[year]["maximum"] * ratio;
      this.maximum = this.dataSatesIncidents[year]["maximum"]
      this.minimum = this.dataSatesIncidents[year]["minimum"]
      state.properties = {
        value: ratio,
        name: stateName,
        total: total,
        maximum: this.maximum,
        minimum: this.minimum
      };
    });
  }

  updateJsonMapForCounties(year: string) {
    this.countiesMap.forEach((county: any) => {
      let countyName = this.countiesIdNames[county.id];
      let ratio = countyName in this.dataCountiesIncidents[year] ? this.dataCountiesIncidents[year][countyName] : 0;
      let total = this.dataCountiesIncidents[year]["maximum"] * ratio;
      this.maximum = this.dataCountiesIncidents[year]["maximum"]
      this.minimum = this.dataCountiesIncidents[year]["minimum"]
      county.properties = {
        value: ratio,
        name: countyName,
        total: total,
        maximum: this.maximum,
        minimum: this.minimum
      };
    });
  }

  buildLegend(): void {
    var key = d3.select("#legend1")
      .append("svg")
      .attr("width", 25)
      .attr("height", 500);

      var legend = key.append("defs")
      .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "100%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "0%")
      .attr("spreadMethod", "pad");

    legend.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FFF7FB")
      .attr("stop-opacity", 1);

    legend.append("stop")
      .attr("offset", "75%")
      .attr("stop-color", "#1e6cb0")
      .attr("stop-opacity", 1);

    legend.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#023858")
      .attr("stop-opacity", 1);

    key.append("rect")
      .attr("width", 25)
      .attr("height", 530 - 30)
      .style("fill", "url(#gradient)")
      .attr("transform", "translate(0,10)");
  }
}