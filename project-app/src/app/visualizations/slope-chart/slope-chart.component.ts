import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";
import d3Tip from "d3-tip";

import { DataByCity, City, Incident, IncidentJson } from "../../data-by-city.model";

@Component({
  selector: "app-slope-chart",
  templateUrl: "./slope-chart.component.html",
  styleUrls: ["./slope-chart.component.css"]
})
export class SlopeChartComponent implements OnInit {
  // Config stuff
  private static readonly margin = { top: 80, right: 320, bottom: 40, left: 320 };

  private static readonly width = 450;
  private static readonly height = 900 - SlopeChartComponent.margin.top - SlopeChartComponent.margin.bottom;

  private static readonly config = {
    xOffset: 0,
    yOffset: 0,
    width: SlopeChartComponent.width,
    height: SlopeChartComponent.height,
    labelPositioning: {
      alpha: 0.7,
      spacing: 14
    },
    leftTitle: "2014",
    rightTitle: "2017",
    labelGroupOffset: 5,
    labelKeyOffset: 15,
    radius: 4,
    circleUnfocusColor: "#bbb",
    slopeLineUnfocusColor: "#bbb"
  };

  private static readonly nbCitiesToDisplay = 20;

  public loaded = false;
  private data: Incident[];
  private citiesPopulationData: City[];
  private dataByCityManyIncidents: DataByCity[];
  private cityGroupsLeft: number[][];
  private cityGroupsRight: number[][];

  ngOnInit() {
    const parseTime = d3.timeParse("%Y-%m-%d");

    d3.json("../../data.json").then((data: IncidentJson[]) => {
      const formattedData: Incident[] = [];

      data.forEach((incident: IncidentJson) => {
        formattedData.push({
          city_or_county: incident.city_or_county,
          date: parseTime(incident.date),
          latitude: parseFloat(incident.latitude),
          longitude: parseFloat(incident.longitude),
          state: incident.state,
          state_house_district: parseInt(incident.state_house_district, 10)
        });
      });

      this.data = formattedData;
      this.finishLoading();
    });


    d3.json("../../countypop.json").then((data: City[]) => {
      this.citiesPopulationData = data;
      this.finishLoading();
    });
  }

  private finishLoading() {
    if (this.citiesPopulationData && this.data) {
      this.preprocessing();
      this.loaded = true;
      this.initialization();
    }
  }

  private preprocessing() {
    const dataByCity = [];

    this.data.forEach((incident: Incident) => {
      const year = incident.date.getFullYear();
      if (year !== 2014 && year !== 2017) {
        return;
      }

      const cleanCityName: string = incident.city_or_county;
      // If the city exist in our city population dataset
      let cityFromPopulationDataset: City;
      if (cityFromPopulationDataset = this.citiesPopulationData.find(d => d.city === cleanCityName && d.state === incident.state)) {
        let city = dataByCity.find(d => d.cityName === cleanCityName && d.stateName === incident.state);
        if (!city) {
          // Create a new DataByCity if it does not exist yet
          city = {
            cityName: cleanCityName,
            stateName: incident.state,
            incidentRatio2014: 0,
            incidentRatio2017: 0,
            population: cityFromPopulationDataset.pop,
            incidentNumber2014: 0,
            incidentNumber2017: 0,
            yLeftPosition: 0,
            yRightPosition: 0,
            groupIndexLeft: -1,
            groupIndexRight: -1
          };
          dataByCity.push(city);
        }

        // Update incident number
        if (year === 2014) {
          city.incidentNumber2014++;
        } else {
          city.incidentNumber2017++;
        }
      }
    });

    dataByCity.forEach((city: DataByCity) => {
      city.incidentRatio2014 = city.incidentNumber2014 / city.population;
      city.incidentRatio2017 = city.incidentNumber2017 / city.population;
    });

    // On trie dans l'ordre croissant du nomber d'incidents en 2014
    dataByCity.sort((a, b) => a.incidentNumber2014 - b.incidentNumber2014);

    // Populate sub array
    this.dataByCityManyIncidents = dataByCity.slice(dataByCity.length - SlopeChartComponent.nbCitiesToDisplay, dataByCity.length);

    this.data = []; // free up memory
    this.citiesPopulationData = []; // free up memory
  }

  private initialization() {
    this.createSlopeChart(this.dataByCityManyIncidents, "slope-chart-1");
  }

  private createSlopeChart(data: DataByCity[], svgId: string) {
    // Create main svg
    const svg = d3.select("#" + svgId)
      .attr("width", SlopeChartComponent.width + SlopeChartComponent.margin.left + SlopeChartComponent.margin.right)
      .attr("height", SlopeChartComponent.height + SlopeChartComponent.margin.top + SlopeChartComponent.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + SlopeChartComponent.margin.left + "," + SlopeChartComponent.margin.top + ")");

    // Create Y axis scale
    const yScale = d3.scaleLinear()
      .range([SlopeChartComponent.height, 0]);

    // Calculate y domain for ratios
    const y1Min = d3.min(data, function (d) {
      return Math.min(d.incidentRatio2014, d.incidentRatio2017);
    });

    const y1Max = d3.max(data, function (d) {
      return Math.max(d.incidentRatio2014, d.incidentRatio2017);
    });

    yScale.domain([y1Min, y1Max]);

    // Create tip
    const tip = d3Tip().attr("class", "d3-tip");

    tip.html((d: DataByCity) => {
      return `<div>Comté: <b> ${d.cityName} </b> <br>
                État: <b> ${d.stateName} </b> <br>
                Population: <b> ${d.population} </b> <br>
                Ratio par 1000 habitants (2014): <b> ${this.formatRatio(d.incidentRatio2014)} </b> <br>
                Ratio par 1000 habitants (2017): <b> ${this.formatRatio(d.incidentRatio2017)} </b> <br>
                Incidents (2014): <b> ${d.incidentNumber2014} </b> <br>
                Incidents (2017): <b> ${d.incidentNumber2017} </b> </div>`;
    });

    // Create slope groups
    const slopeGroups = svg.append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "slope-group")
      .attr("opacity", 1.0)
      .attr("id", (d, i) => "slope-group-" + i)
      .on("mouseover", function (d) {
        d3.select(this).raise();

        d3.select(this).selectAll("line")
          .attr("stroke", "black")
          .raise();

        d3.select(this).selectAll("g").selectAll("circle")
          .attr("stroke", "black")
          .raise();

        tip.show(d, this)
          .style("left", (d3.event.pageX - 120) + "px")
          .style("top", (d3.event.pageY - 150) + "px");
      })
      .on("mouseout", function (d) {
        d3.select(this).selectAll("line").attr("stroke", SlopeChartComponent.config.slopeLineUnfocusColor);

        d3.select(this).selectAll("g").selectAll("circle")
          .attr("stroke", SlopeChartComponent.config.circleUnfocusColor);

        tip.hide(d);
      });

    slopeGroups.call(tip);

    // Left groups
    const leftSlopeGroups = slopeGroups.append("g")
      .attr("class", "slope-groups-left")
      .each(d => { d.yLeftPosition = yScale(d.incidentRatio2014); });

    // Right groups
    const rightSlopeGroups = slopeGroups.append("g")
      .attr("class", "slope-groups-right")
      .each(d => { d.yRightPosition = yScale(d.incidentRatio2017); });

    // Init city groups
    this.cityGroupsLeft = [];
    this.cityGroupsRight = [];
    for (let i = 0; i < this.dataByCityManyIncidents.length; i++) {
      this.cityGroupsLeft[i] = [];
      this.cityGroupsLeft[i][0] = i;

      this.cityGroupsRight[i] = [];
      this.cityGroupsRight[i][0] = i;

      this.dataByCityManyIncidents[i].groupIndexLeft = i;
      this.dataByCityManyIncidents[i].groupIndexRight = i;
    }

    // Relax y positions to avoid labels and circles overlapping
    this.relax(leftSlopeGroups, "yLeftPosition", "groupIndexLeft", this.cityGroupsLeft);
    this.relax(rightSlopeGroups, "yRightPosition", "groupIndexRight", this.cityGroupsRight);

    // Draw left circles
    leftSlopeGroups.append("circle")
      .attr("r", SlopeChartComponent.config.radius)
      .attr("cy", d => d.yLeftPosition)
      .attr("stroke", SlopeChartComponent.config.circleUnfocusColor);

    // Draw left labels concatenated
    this.cityGroupsLeft.forEach((oneGroup: number[]) => {
      if (oneGroup.length > 0) {
        svg.append("g")
          .attr("class", "slope-label-right")
          .append("text")
          .attr("x", -SlopeChartComponent.config.labelGroupOffset)
          .attr("y", this.dataByCityManyIncidents[oneGroup[0]].yLeftPosition)
          .attr("dx", -SlopeChartComponent.config.labelKeyOffset)
          .attr("dy", 3)
          .attr("text-anchor", "end")
          .html(() => {
            let htmlString = "";

            oneGroup.forEach((cityIndex: number) => {
              if (htmlString !== "") {
                htmlString += ", ";
              }

              htmlString += "<a class='city-label' data-id=" + cityIndex + ">" +
                this.dataByCityManyIncidents[cityIndex]["cityName"] + "</a>";
            });
            return htmlString;
          });
      }
    });

    // Draw right circles
    rightSlopeGroups.append("circle")
      .attr("r", SlopeChartComponent.config.radius)
      .attr("cx", SlopeChartComponent.config.width)
      .attr("cy", d => d.yRightPosition)
      .attr("stroke", SlopeChartComponent.config.circleUnfocusColor);

    // Draw right labels concatenated
    this.cityGroupsRight.forEach((oneGroup: number[]) => {
      if (oneGroup.length > 0) {
        // Append svg groups for labels, these are separated from the left/right slope groups
        svg.append("g")
          .attr("class", "slope-label-right")
          .append("text")
          .attr("x", SlopeChartComponent.width + SlopeChartComponent.config.labelGroupOffset)
          .attr("y", this.dataByCityManyIncidents[oneGroup[0]].yRightPosition)
          .attr("dx", SlopeChartComponent.config.labelKeyOffset)
          .attr("dy", 3)
          .attr("text-anchor", "start")
          .html(() => {
            let htmlString = "";

            oneGroup.forEach((cityIndex: number) => {
              if (htmlString !== "") {
                htmlString += ", ";
              }

              htmlString += "<a class='city-label' data-id=" + cityIndex + ">" +
                this.dataByCityManyIncidents[cityIndex]["cityName"] + "</a>";
            });
            return htmlString;
          });
      }
    });

    // Bind labels mouseover behavior
    d3.selectAll(".city-label")
      .on("mouseover", function () {
        // Set text bold
        d3.select(this).attr("style", "font-weight: bold");

        // Retrieve city index
        const cityIndex = d3.select(this).attr("data-id");

        // Retrieve corresponding svg group (slope line and circle)
        const matchingGroups = d3.select("#slope-group-" + cityIndex);
        const domElement: any = matchingGroups.node();

        // Create mouseover event
        const evtOver = document.createEvent("Events");
        evtOver.initEvent("mouseover", true, false);

        domElement.dispatchEvent(evtOver);
      })
      .on("mouseout", function () {
        // Set text normal
        d3.select(this).attr("style", "font-weight: normal");

        // Retrieve city index
        const cityIndex = d3.select(this).attr("data-id");

        // Retrieve corresponding svg group (slope line and circle)
        const matchingGroups = d3.select("#slope-group-" + cityIndex);
        const domElement: any = matchingGroups.node();

        // Create mouseout event
        const evtOut = document.createEvent("Events");
        evtOut.initEvent("mouseout", true, false);

        domElement.dispatchEvent(evtOut);
      });

    // Draw titles
    const titles = svg.append("g")
      .attr("class", "title");

    // Left (2014)
    titles.append("text")
      .attr("text-anchor", "end")
      .attr("dx", -10)
      .attr("dy", -SlopeChartComponent.margin.top / 2)
      .text(SlopeChartComponent.config.leftTitle);

    // Right (2017)
    titles.append("text")
      .attr("x", SlopeChartComponent.config.width)
      .attr("dx", 10)
      .attr("dy", -SlopeChartComponent.margin.top / 2)
      .text(SlopeChartComponent.config.rightTitle);

    // Draw border lines
    const borderLines = svg.append("g")
      .attr("class", "border-lines");

    borderLines.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", SlopeChartComponent.config.height/* + heightAdjustFinal*/);

    borderLines.append("line")
      .attr("x1", SlopeChartComponent.width).attr("y1", 0)
      .attr("x2", SlopeChartComponent.width).attr("y2", SlopeChartComponent.config.height/* + heightAdjustFinal*/);

    // Draw slope lines
    slopeGroups.append("line")
      .attr("class", "slope-line")
      .attr("x1", 0)
      .attr("y1", d => d.yLeftPosition)
      .attr("x2", SlopeChartComponent.config.width)
      .attr("y2", d => d.yRightPosition)
      .attr("stroke", SlopeChartComponent.config.slopeLineUnfocusColor);

    // Draw legend up
    svg.append("g")
      .attr("class", "slope-legend")
      .append("text")
      .attr("x", SlopeChartComponent.width / 2)
      .attr("y", yScale(y1Max))
      .attr("text-anchor", "middle")
      .text(this.formatRatio(y1Max) + " incidents par 1000 habitants");

    // Draw legend down
    svg.append("g")
      .attr("class", "slope-legend")
      .append("text")
      .attr("x", SlopeChartComponent.width / 2)
      .attr("y", yScale(y1Min) + 20)
      .attr("text-anchor", "middle")
      .text(this.formatRatio(y1Min) + " incidents par 1000 habitants");
  }

  private formatRatio(ratio: number): string {
    return (Math.round(ratio * 100000) / 100).toString().replace(".", ",");
  }

  // Function to reposition an array selection of slope groups (in the y-axis)
  private relax(slopeGroups: d3.Selection<SVGGElement, DataByCity, SVGGElement, {}>,
    position: string,
    groupIndex: string,
    cityGroups: number[][]) {

    let again: boolean;
    do {
      again = false;

      slopeGroups.each((d1, i) => {
        let y1 = d1[position];

        slopeGroups.each((d2, j) => {
          if (d1.cityName === d2.cityName && d1.stateName === d2.stateName) {
            return;
          }

          const y2 = d2[position];
          const deltaY = y1 - y2;

          // If enough space, dont't need to relax
          if (Math.abs(deltaY) > SlopeChartComponent.config.labelPositioning.spacing || deltaY === 0) {
            return;
          }

          again = true;

          const sign = deltaY > 0 ? 1 : -1;
          const adjust = sign * Math.abs(deltaY) / 2;
          const newPos = y1 - adjust;
          y1 = newPos;

          // Update d1 group pos
          cityGroups[d1[groupIndex]].forEach((cityIndex: number) => {
            this.dataByCityManyIncidents[cityIndex][position] = newPos;
          });

          const oldD2Index = d2[groupIndex];

          // d1 eats d2
          while (cityGroups[oldD2Index].length > 0) {
            // Move all city index from old d2 group into d1 group
            const migratingCityIndex = cityGroups[oldD2Index].pop();
            cityGroups[d1[groupIndex]].push(migratingCityIndex);

            // Update city's group index
            this.dataByCityManyIncidents[migratingCityIndex][groupIndex] = d1[groupIndex];
            // Update city's position
            this.dataByCityManyIncidents[migratingCityIndex][position] = newPos;
          }
        });
      });
    } while (again);
  }
}
