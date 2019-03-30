// TODO: 
// - tooltip
// - second graphe
// - titre
// - légende
// - Improve style
// - Modif données pour essayer d'avoir les grandes villes manquantes
// - Cleaning
// - Highlight grandes villes ?
// - Test relax meilleur ?

import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as d3 from "d3";

import { Incident } from "src/app/incident.model";
import { City } from "src/app/city.model";
import { max } from "d3";


class DataByCity {
  constructor(
    public cityName: string,
    public stateName: string,
    public population: number,
    public incidentNumber2014: number,
    public incidentNumber2017: number,
    public incidentRatio2014: number,
    public incidentRatio2017: number,
    public yLeftPosition: number,
    public yRightPosition: number
    ) {}
  }
  

  @Component({
    selector: "app-slope-chart",
    templateUrl: "./slope-chart.component.html",
    styleUrls: ["./slope-chart.component.css"]
  })
  export class SlopeChartComponent implements OnChanges {
    // Inputs
    @Input() public data: Incident[];
    @Input() public citiesPopulationData: City[];
    
    // Data by city
    private dataByCityManyIncidents: DataByCity[];
    private dataByCityFewIncidents: DataByCity[];
    
    // Config stuff
    static readonly margin = {top: 100, right: 275, bottom: 40, left: 275};
     
    static readonly width = 960 - SlopeChartComponent.margin.left - SlopeChartComponent.margin.right;
    static readonly height = 4000 - SlopeChartComponent.margin.top - SlopeChartComponent.margin.bottom;
          
    static readonly config = {
      xOffset: 0,
      yOffset: 0,
      width: SlopeChartComponent.width,
      height: SlopeChartComponent.height,
      labelPositioning: {
        alpha: 0.5,
        spacing: 18
      },
      leftTitle: "2014",
      rightTitle: "2017",
      labelGroupOffset: 5,
      labelKeyOffset: 50,
      radius: 6,
      // Reduce this to turn on detail-on-hover version
      unfocusOpacity: 0.3
    }

    static readonly nbCitiesToDisplay = 50;

    ngOnChanges(changes: SimpleChanges) {
      if (changes.data && changes.data.currentValue) {
        this.preprocessing();
        this.initialization();
      }
    }
    
    // D3 examples : http://christopheviau.com/d3list/
    // https://bl.ocks.org/tlfrd/042b2318c8767bad7a485098fbf760fc
    
    private preprocessing() {
    let dataByCity = [];

    this.data.forEach((incident: Incident) => {
      const year = incident.date.getFullYear();
      if (year != 2014 && year != 2017)
      {
        return;
      }

      let cleanCityName = incident.city_or_county.split(" (", 1);

      // If the city exist in our city population dataset
      let cityFromPopulationDataset;
      if (cityFromPopulationDataset = this.citiesPopulationData.find(d => d.city === cleanCityName[0] && d.state === incident.state))
      {
        let city = dataByCity.find(d => d.cityName === cleanCityName[0] && d.stateName === incident.state);
        if (!city) 
        {
          // Create a new DataByCity if it does not exist yet
          city = new DataByCity(cleanCityName[0], incident.state, cityFromPopulationDataset.pop, 0, 0, 0, 0, 0, 0);
          dataByCity.push(city);
        }

        // Update incident number
        if (year == 2014)
        {
          city.incidentNumber2014++;
        }
        else
        {
          city.incidentNumber2017++;
        }
      }
    });

    dataByCity.forEach((city: DataByCity) => {
      city.incidentRatio2014 = city.incidentNumber2014 / city.population;
      city.incidentRatio2017 = city.incidentNumber2017 / city.population;
    });

    // On trie dans l'ordre croissant du nomber d'incidents en 2014
    dataByCity.sort((a, b) => { return a.incidentNumber2014 - b.incidentNumber2014});

    // Populate sub arrays
    this.dataByCityFewIncidents = dataByCity.slice(0, SlopeChartComponent.nbCitiesToDisplay);
    this.dataByCityManyIncidents = dataByCity.slice(dataByCity.length - SlopeChartComponent.nbCitiesToDisplay, dataByCity.length);

    this.data = []; // free up memory
    this.citiesPopulationData = []; // free up memory
  }

  private initialization() {

    // Create main svg
    var svg = d3.select("body").append("svg")
          .attr("width", SlopeChartComponent.width + SlopeChartComponent.margin.left +SlopeChartComponent.margin.right)
          .attr("height", SlopeChartComponent.height + SlopeChartComponent.margin.top + SlopeChartComponent.margin.bottom)
        .append("g")
          .attr("transform", "translate(" + SlopeChartComponent.margin.left + "," + SlopeChartComponent.margin.top + ")");
    
    // Create Y axis scale
    var yScale = d3.scaleLinear()
    	.range([SlopeChartComponent.height, 0]);
    
    // Useless ?
    // function drawSlopeGraph(cfg, data, yScale, leftYAccessor, rightYAccessor) {
    //   var slopeGraph = svg.append("g")
    //   	.attr("class", "slope-graph")
    //   	.attr("transform", "translate(" + [cfg.xOffset, cfg.yOffset] + ")");     
    // }    

    // Calculate y domain for ratios
    var y1Min = d3.min(this.dataByCityManyIncidents, function(d) {              
      return Math.min(d.incidentRatio2014, d.incidentRatio2017);
    });
    
    var y1Max = d3.max(this.dataByCityManyIncidents, function(d) {     
      return Math.max(d.incidentRatio2014, d.incidentRatio2017);
    });

    yScale.domain([y1Min, y1Max]);
          
    // var voronoi = d3.voronoi()
    //   .x(d => d.year == "2012-2013" ? 0 : width)
    //   .y(d => yScale(d.max / d.min))
    //   .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);
    
    // Create slope groups
    var slopeGroups = svg.append("g")
      .selectAll("g")
      .data(this.dataByCityManyIncidents)
      .enter().append("g")
        .attr("class", "slope-group")
        .attr("opacity", SlopeChartComponent.config.unfocusOpacity)
        .on("mouseover", function() { d3.select(this).attr("opacity", 1) })
        .on("mouseout", function() { 
          let opacity = SlopeChartComponent.config.unfocusOpacity;
          d3.select(this).attr("opacity", SlopeChartComponent.config.unfocusOpacity) 
        });
    
    // Left groups
    var leftSlopeGroups = slopeGroups.append("g")
      .attr("class", "slope-groups-left")
      .each(d => { d.yLeftPosition = yScale(d.incidentRatio2014) });

    // Right groups
    var rightSlopeGroups = slopeGroups.append("g")
    .attr("class", "slope-groups-left")
    .each(d => { d.yRightPosition = yScale(d.incidentRatio2017) });

    // Relax y positions to avoid labels and circles overlapping
    let heightAdjustLeft = this.relax(leftSlopeGroups, "yLeftPosition");
    let heightAdjustRight = this.relax(rightSlopeGroups, "yRightPosition");

    // Maximum height value might need a little adjustment after relax
    let heightAdjustFinal = max([heightAdjustLeft, heightAdjustRight]);

    // Draw left circles
    leftSlopeGroups.append("circle")
      .attr("r", SlopeChartComponent.config.radius)
      .attr("cy", d => d.yLeftPosition);
    
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
      .attr("cy", d => d.yRightPosition);
    
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
    
    // Draw titles
    var titles = svg.append("g")
      .attr("class", "title");
    
    // Left (2014)
    titles.append("text")
      .attr("text-anchor", "end")
      .attr("dx", -10)
      .attr("dy", -SlopeChartComponent.margin.top / 2)
      .text(SlopeChartComponent.config.leftTitle);
    
    // Left (2017)
    titles.append("text")
      .attr("x", SlopeChartComponent.config.width)
      .attr("dx", 10)
      .attr("dy", -SlopeChartComponent.margin.top / 2)
      .text(SlopeChartComponent.config.rightTitle);

    // Draw border lines
    var borderLines = svg.append("g")
      .attr("class", "border-lines")
    borderLines.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", SlopeChartComponent.config.height + heightAdjustFinal);
    borderLines.append("line")
      .attr("x1", SlopeChartComponent.width).attr("y1", 0)
      .attr("x2", SlopeChartComponent.width).attr("y2", SlopeChartComponent.config.height + heightAdjustFinal);

    // Draw slope lines
    slopeGroups.append("line")
    .attr("class", "slope-line")
    .attr("x1", 0)
    .attr("y1", d => d.yLeftPosition)
    .attr("x2", SlopeChartComponent.config.width)
    .attr("y2", d => d.yRightPosition);
    

    //// Async example
    // this.resolveAfter2Seconds(20).then(value => {
    //   console.log(`promise result: ${value}`);
    // });
    // console.log('I will not wait until promise is resolved');
    ////

    // rightSlopeLabels.select("text")
    // 	.attr("y", d => d.yRightPosition);
    
    // var voronoiGroup = svg.append("g")
    // 	.attr("class", "voronoi");
    
  //   voronoiGroup.selectAll("path")
  //   	.data(voronoi.polygons(d3.merge(nestedByName.map(d => d.values))))
  //   	.enter().append("path")
  //   		.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
  //   		.on("mouseover", mouseover)
  //   		.on("mouseout", mouseout);
  // });  
  }

  //// Async example
  // private resolveAfter2Seconds(x) {
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve(x);
  //     }, 2000);
  //   });
  // }
  ////

  // Function to reposition an array selection of labels (in the y-axis)
  private relax(labels, position) {
    var heightAdjust = 0;
    do{
      var again = false;
      labels.each((d, i) => {
        var a = d;
        var y1 = d[position];
        labels.each((d, j) => {
          var  b = d;
          if (a == b) return;
          var y2 = b[position];
          var deltaY = y1 - y2;

          if (Math.abs(deltaY) > SlopeChartComponent.config.labelPositioning.spacing) return;

          again = true;
          var sign = deltaY > 0 ? 1 : -1;
          var adjust = sign * SlopeChartComponent.config.labelPositioning.alpha;
          a[position] = +y1 + adjust;
          b[position] = +y2 - adjust;
          
          // We might need to adjust the maximum height value 
          heightAdjust += a[position] > SlopeChartComponent.config.height ? adjust : 0;
        })
      })
    }while(again);

    return heightAdjust;
  }
}
