
// TODO:
// - merger les 2 graphes en 1 seul
// - fit hauteur page
// - merger les villes qui s'overlapent. Réfléchir liste et tooltip dans ce cas (hover only nom ville ?)
// - séparation top 50 / bottom 50
// - légende : ticks (incidents par 1000 habitants)

import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";
import d3Tip from "d3-tip";
import { max } from "d3";

import { DataByCity, City, Incident, IncidentJson } from "../../data-by-city.model";
import { enterView } from "@angular/core/src/render3/instructions";

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
      return `<div>Ville: <b> ${d.cityName} </b> <br>
                Etat: <b> ${d.stateName} </b> <br>
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
      .on("mouseover", function (d) {
        d3.select(this).selectAll("line").attr("stroke", "black");
        d3.select(this).selectAll("g").selectAll("circle").attr("stroke", "black");
        tip.show(d, this)
          .style("left", (d3.event.pageX - 140) + "px")
          .style("top", (d3.event.pageY - 150) + "px");
      })
      .on("mouseout", function (d) {
        d3.select(this).selectAll("line").attr("stroke", SlopeChartComponent.config.slopeLineUnfocusColor);
        d3.select(this).selectAll("g").selectAll("circle").attr("stroke", SlopeChartComponent.config.circleUnfocusColor);
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
    for (let i = 0 ; i < this.dataByCityManyIncidents.length ; i++)
    {
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

    // Draw left labels
    leftSlopeGroups.append("g")
      .attr("class", "slope-label-left")
      .append("text")
      .attr("x", -SlopeChartComponent.config.labelGroupOffset)
      .attr("y", d => d.yLeftPosition)
      .attr("dx", -SlopeChartComponent.config.labelKeyOffset)
      .attr("dy", 3)
      .attr("text-anchor", "end")
      .text(d => d.cityName);

    // Draw right circles
    rightSlopeGroups.append("circle")
      .attr("r", SlopeChartComponent.config.radius)
      .attr("cx", SlopeChartComponent.config.width)
      .attr("cy", d => d.yRightPosition)
      .attr("stroke", SlopeChartComponent.config.circleUnfocusColor);

    // Draw right labels
    rightSlopeGroups.append("g")
      .attr("class", "slope-label-right")
      .append("text")
      .attr("x", SlopeChartComponent.width + SlopeChartComponent.config.labelGroupOffset)
      .attr("y", d => d.yRightPosition)
      .attr("dx", SlopeChartComponent.config.labelKeyOffset)
      .attr("dy", 3)
      .attr("text-anchor", "start")
      .text(d => d.cityName);

    // for(let oneCity of this.dataByCityManyIncidents)
    // {
    //   svg.append("g")
    //     .attr("class", "slope-label-right")
    //     .append("text")
    //     .attr("x", SlopeChartComponent.width + SlopeChartComponent.config.labelGroupOffset)
    //     .attr("y", oneCity.yRightPosition)
    //     .attr("dx", SlopeChartComponent.config.labelKeyOffset)
    //     .attr("dy", 3)
    //     .attr("text-anchor", "start")
    //     .text(oneCity.cityName);
    // }

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
  }

  private formatRatio(ratio: number): string {
    return (Math.round(ratio * 100000) / 100).toString().replace(".", ",");
  }

  // Function to reposition an array selection of slope groups (in the y-axis)
  private relax(slopeGroups: d3.Selection<SVGGElement, DataByCity, SVGGElement, {}>, position: string, groupIndex: string, cityGroups: number[][]) {

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

          //DEBUGRELAX console.log("=== Start fight ("+ groupIndex +") ===");
          //DEBUGRELAX console.log(d1["cityName"] + " ; " + d2["cityName"]);
          //DEBUGRELAX console.log(d1[groupIndex] + " ; " + d2[groupIndex]);
          //DEBUGRELAX console.log(y1 + " ; " + y2); 

          again = true;

          const sign = deltaY > 0 ? 1 : -1;
          const adjust = sign * Math.abs(deltaY) / 2; 
          const newPos = y1 - adjust;
          y1 = newPos;

          // Update d1 group pos
          for(let cityIndex of cityGroups[d1[groupIndex]])
          {
            //DEBUGRELAX console.log(this.dataByCityManyIncidents[cityIndex]["cityName"] + " <- " + newPos);
            this.dataByCityManyIncidents[cityIndex][position] = newPos;
          }

          const oldD2Index = d2[groupIndex];

          // d1 eats d2
          while(cityGroups[oldD2Index].length > 0)
          {
            // Move all city index from old d2 group into d1 group
            let migratingCityIndex = cityGroups[oldD2Index].pop();
            cityGroups[d1[groupIndex]].push(migratingCityIndex);
            
            // Update city's group index
            //DEBUGRELAX console.log(this.dataByCityManyIncidents[migratingCityIndex]["cityName"] + " goes from " + oldD2Index + " to " + d1[groupIndex]);
            this.dataByCityManyIncidents[migratingCityIndex][groupIndex] = d1[groupIndex];
            // Update city's position
            //DEBUGRELAX console.log(this.dataByCityManyIncidents[migratingCityIndex]["cityName"] + " <- " + newPos);
            this.dataByCityManyIncidents[migratingCityIndex][position] = newPos;
            
            //DEBUGRELAX console.log("Remaining length : " + cityGroups[oldD2Index].length);
          }
          //DEBUGRELAX console.log("=== End fight ===");
        });
      });
    } while (again);
  }
}
