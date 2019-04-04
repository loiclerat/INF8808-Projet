import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";

import { Localization } from "../localization-fr";
import { DataByState } from "../../data-by-state.model";

@Component({
  selector: "app-line-chart",
  templateUrl: "./line-chart.component.html",
  styleUrls: ["./line-chart.component.css"]
})
export class LineChartComponent implements OnInit {
  private dataByState: DataByState[];
  private readonly NUMBER_OF_MONTHS = 48;
  private readonly constantStates = [
    "Montana",
    "Hawaii",
    "Alabama",
    "Mississippi",
    "Arizona",
    "New Mexico",
    "Arkansas",
    "Oklahoma",
    "Nevada",
    "Delaware",
    "Utah",
    "Kansas",
    "Colorado",
    "West Virginia",
    "Indiana",
    "Oregon",
    "District of Columbia",
    "Iowa",
    "Connecticut",
    "Wyoming",
    "Rhode Island",
    "Idaho",
    "South Dakota",
    "New Hampshire",
    "Nebraska",
    "Maine",
    "Minnesota",
    "Washington",
    "North Dakota",
    "Alaska"
  ];

  ngOnInit() {
    d3.json("../../data-by-state.json").then((data: DataByState[]) => {
      this.dataByState = data;
      this.initialization();
    });
  }

  public showState(state: string) {
    d3.select("#line-chart").selectAll("path.line")
      .attr("stroke-width", (d: DataByState) => d.state === state ? 10 : 1)
      .style("opacity", (d: DataByState) => d.state === state ? 1 : 0.3);
  }

  public showConstantState() {
    d3.select("#line-chart").selectAll("path.line")
      .attr("stroke-width", (d: DataByState) => this.constantStates.indexOf(d.state) !== -1 ? 3 : 1)
      .style("opacity", (d: DataByState) => this.constantStates.indexOf(d.state) !== -1 ? 1 : 0.3);
  }

  public hideState() {
    d3.select("#line-chart").selectAll("path.line")
      .style("opacity", 1)
      .attr("stroke-width", 1);
  }

  private initialization() {
    const margin = {
      top: 30,
      right: 10,
      bottom: 100,
      left: 60
    };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    const tickValues = [];
    for (let i = 0; i < this.NUMBER_OF_MONTHS / 4; ++i) {
      tickValues.push(i * 4);
    }

    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d: number) => Localization.getFormattedDateByMonth(d))
      .tickValues(tickValues);
    const yAxis = d3.axisLeft(yScale);

    const svg = d3.select("svg#line-chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const line = this.createLine(xScale, yScale);

    const color: any = d3.scaleOrdinal().range(this.colorGenerator(50));
    this.domainColor(color);

    this.domainX(xScale);
    this.domainY(yScale);

    this.createLineChart(g, line, color, this.updateTooltip, this.mouseout, yScale);

    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    g.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    g.append("text")
      .attr("fill", "currentColor")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height + 40)
      .text("Temps");

    g.append("text")
      .attr("fill", "currentColor")
      .attr("text-anchor", "end")
      .attr("y", -55)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Nombre d'incidents");
  }

  private createLine(x: d3.ScaleLinear<number, number>, y: d3.ScaleLinear<number, number>) {
    return d3.line()
      .x((d: any, i: number) => x(i))
      .y((d: any) => y(d))
      .curve(d3.curveCardinal);
  }

  private domainColor(color: d3.ScaleOrdinal<string, string>) {
    color.domain(this.dataByState.map(state => state.state));
  }

  private domainX(xScale: d3.ScaleLinear<number, number>) {
    xScale.domain([0, this.NUMBER_OF_MONTHS - 1]);
  }

  private domainY(yScale: d3.ScaleLinear<number, number>) {
    yScale.domain([0, d3.max(this.dataByState, i => d3.max(i.incidents_by_month))]).nice();
  }

  private createLineChart(
    g: d3.Selection<SVGGElement, {}, HTMLElement, any>,
    line: any,
    color: d3.ScaleOrdinal<string, string>,
    updateTooltip: Function,
    mouseout: Function,
    yScale: d3.ScaleLinear<number, number>
  ) {
    g.selectAll("path")
      .data(this.dataByState)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", d => color(d.state))
      .attr("d", d => line(d.incidents_by_month))
      .attr("clip-path", "url(#clip)")
      .attr("class", d => d.state + " line")
      .on("mouseover", function (d) {
        g.selectAll("path").style("opacity", 0.3);
        d3.select(this).style("opacity", 1);
        d3.select(this).attr("stroke-width", 10);

        updateTooltip(d, yScale, this);
      })
      .on("mousemove", function (d) {
        d3.select(this).attr("stroke-width", 10);

        updateTooltip(d, yScale, this);
      })
      .on("mouseout", function () {
        g.selectAll("path").style("opacity", 1);
        d3.select(this).attr("stroke-width", 1);

        mouseout();
      });
  }

  private updateTooltip(d: DataByState, yScale: d3.ScaleLinear<number, number>, self: SVGPathElement) {
    d3.select("#tooltip")
      .style("display", "inline")
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px")
      .html(
        "<p>État : " + d.state + "</p>" +
        "<p>Incidents : " + Math.round(yScale.invert(d3.mouse(self)[1])) + "</p>"
      );
  }

  private mouseout() {
    d3.select("#tooltip").style("display", "none");
  }

  private colorGenerator(length: number): d3.HSLColorFactory[] {
    const base = 5;
    const lightnessMin = 0.4;
    const lightnessMax = 0.8;
    const lightnessDecay = 100;

    const colors = [];
    for (let i = 0; i < length; ++i) {
      const tmp = i.toString(base).split("").reverse().join("");
      const hue = 360 * parseInt(tmp, base) / Math.pow(base, tmp.length);
      const lightness = lightnessMin + (lightnessMax - lightnessMin) * (1 - Math.exp(-i / lightnessDecay));

      colors.push(d3.hsl(hue, 1, lightness));
    }

    return colors;
  }
}
