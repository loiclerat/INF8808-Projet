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
  private dataStatesIncidents: any;
  private dataCountiesIncidents: any;

  private minimum: number;
  private maximum: number;
  private tooltip: any;

  private DEFAULT_YEAR = "2014";
  private years = ["2014", "2015", "2016", "2017"]
  private currentYear: string;
  private animationYear: string;
  private isAnimationRunning = false;

  async ngOnInit() {
    // prepare usa map
    this.resetMapSVG();
    this.path = d3.geoPath();
    this.us = await d3.json("https://d3js.org/us-10m.v1.json");
    this.svg.append("g").attr("class", "states");
    this.tooltip = d3Tip().attr("class", "d3-tip");
    this.tooltip.html((data: DataMap, type: MapType) => {
      const typeText = type === MapType.State ? "État" : "Comté";
      return `<div>${typeText} : <b> ${data.name} </b> <br>
                Incidents : <b> ${Math.round(data.total)} </b></div>`; // TODO à valider que c'est vrm cela
    });
    // load neccessary data
    this.statesIdNames = await d3.json("./../../../../extract/id-formatting/states-id.json");
    this.dataStatesIncidents = await d3.json("./../../../../extract/domain-color-max/domain_States.json");
    this.countiesIdNames = await d3.json("./../../../../extract/id-formatting/counties-id.json");
    this.dataCountiesIncidents = await d3.json("./../../../../extract/domain-color-max/domain_Counties.json");

    // counties
    this.countiesMap = topoJson.feature(this.us, this.us.objects.counties).features;
    this.updateJsonMapForCounties(this.currentYear);

    // states
    this.statesMap = topoJson.feature(this.us, this.us.objects.states).features;
    this.currentYear = this.DEFAULT_YEAR;
    this.updateJsonMapForStates(this.currentYear);
    this.type = MapType.State;
    this.buildMap(this.tooltip, this.type);

    this.buildLegend();
  }

  public changeMap(mapType: MapType) {
    this.type = mapType;
    this.buildMap(this.tooltip, mapType);
  }

  private buildMap(tooltip: any, mapType: MapType) {
    const mapTypeData = mapType === MapType.State ? this.statesMap : this.countiesMap;
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
        d3.select("#map").select("svg").selectAll("path").style("opacity", 0.1);
        d3.select(this).style("opacity", 1);
      })
      .on("mousemove", function (d) {
        tooltip.show(d.properties, mapType, this)
          .style("left", (d3.event.pageX - 65) + "px")
          .style("top", (d3.event.pageY - 77) + "px");
      })
      .on("mouseout", function (d) {
        d3.select("#map").select("svg").selectAll("path").style("opacity", 1);
        tooltip.hide(d);
      });
    this.svg.call(tooltip);
  }

  private resetMapSVG() {
    // rebuild a new map
    if (this.svg !== undefined) {
      this.svg.remove();
    }
    this.svg = d3
      .select("#map")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
  }

  public changeYear(year: string, isAnimation: boolean) {
    if (!isAnimation)
      this.currentYear = year;
    if (this.type === MapType.State) {
      this.updateJsonMapForStates(year);
      this.buildMap(this.tooltip, this.type);
    } else {
      this.updateJsonMapForCounties(year);
      this.buildMap(this.tooltip, this.type);
    }
  }

  private updateJsonMapForStates(year: string) {
    this.statesMap.forEach((state: any) => {
      const stateName = this.statesIdNames[state.id];
      const ratio = stateName in this.dataStatesIncidents[year] ? this.dataStatesIncidents[year][stateName] : 0;
      const total = this.dataStatesIncidents[year]["maximum"] * ratio;
      this.maximum = this.dataStatesIncidents[year]["maximum"];
      this.minimum = this.dataStatesIncidents[year]["minimum"];
      state.properties = {
        value: ratio,
        name: stateName,
        total: total,
        maximum: this.maximum,
        minimum: this.minimum
      };
    });
  }

  private updateJsonMapForCounties(year: string) {
    this.countiesMap.forEach((county: any) => {
      const countyName = this.countiesIdNames[county.id];
      const ratio = countyName in this.dataCountiesIncidents[year] ? this.dataCountiesIncidents[year][countyName] : 0;
      const total = this.dataCountiesIncidents[year]["maximum"] * ratio;
      this.maximum = this.dataCountiesIncidents[year]["maximum"];
      this.minimum = this.dataCountiesIncidents[year]["minimum"];
      county.properties = {
        value: ratio,
        name: countyName,
        total: total,
        maximum: this.maximum,
        minimum: this.minimum
      };
    });
  }

  async animate() {
    if (!this.isAnimationRunning) {
      this.isAnimationRunning = true;
      for (let i = 0; i < this.years.length; i++) {
        this.animationYear = this.years[i];
        await this.delay(700);
        this.changeYear(this.animationYear, true);
      }
      this.animationYear = "";
      this.changeYear(this.currentYear, false);
      this.isAnimationRunning = false;
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildLegend(): void {
    const key = d3.select("#legend1")
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
