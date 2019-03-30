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
    
    // Config const stuff
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


  // Début mais pas fini
  private initialization() {

    var svg = d3.select("body").append("svg")
          .attr("width", SlopeChartComponent.width + SlopeChartComponent.margin.left +SlopeChartComponent.margin.right)
          .attr("height", SlopeChartComponent.height + SlopeChartComponent.margin.top + SlopeChartComponent.margin.bottom)
        .append("g")
          .attr("transform", "translate(" + SlopeChartComponent.margin.left + "," + SlopeChartComponent.margin.top + ")");
    
    var y1 = d3.scaleLinear()
    	.range([SlopeChartComponent.height, 0]);
    
    // Useless ?
    // function drawSlopeGraph(cfg, data, yScale, leftYAccessor, rightYAccessor) {
    //   var slopeGraph = svg.append("g")
    //   	.attr("class", "slope-graph")
    //   	.attr("transform", "translate(" + [cfg.xOffset, cfg.yOffset] + ")");     
    // }
      
    // Combine ratios into a single array
    // var ratios = [];
    // data.pay_ratios_2012_13.forEach(function(d) {
    //   d.year = "2012-2013";
    //   ratios.push(d);
    // });
    // data.pay_ratios_2015_16.forEach(function(d) {
    //   d.year = "2015-2016";
    //   ratios.push(d);
    // });
                
    // Nest by university
    // var nestedByName = d3.nest()
    // 	.key(function(d) { return d.name })
    // 	.entries(ratios);
    
    // Filter out those that only have data for a single year
    // nestedByName = nestedByName.filter(function(d) {
    //   return d.values.length > 1;
    // });
    
    // var y1Min = d3.min(nestedByName, function(d) {        
    //   var ratio1 = d.values[0].max / d.values[0].min;
    //   var ratio2 = d.values[1].max / d.values[1].min;
      
    //   return Math.min(ratio1, ratio2);
    // });
    
    // var y1Max = d3.max(nestedByName, function(d) {        
    //   var ratio1 = d.values[0].max / d.values[0].min;
    //   var ratio2 = d.values[1].max / d.values[1].min;
      
    //   return Math.max(ratio1, ratio2);
    // });
    

    var y1Min = d3.min(this.dataByCityManyIncidents, function(d) {              
      return Math.min(d.incidentRatio2014, d.incidentRatio2017);
    });
    
    var y1Max = d3.max(this.dataByCityManyIncidents, function(d) {     
      return Math.max(d.incidentRatio2014, d.incidentRatio2017);
    });


    // Calculate y domain for ratios
      y1.domain([y1Min, y1Max]);
    
      var yScale = y1;
          
    // var voronoi = d3.voronoi()
    //   .x(d => d.year == "2012-2013" ? 0 : width)
    //   .y(d => yScale(d.max / d.min))
    //   .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);
    
    var borderLines = svg.append("g")
      .attr("class", "border-lines")
    borderLines.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", SlopeChartComponent.config.height);
    borderLines.append("line")
      .attr("x1", SlopeChartComponent.width).attr("y1", 0)
      .attr("x2", SlopeChartComponent.width).attr("y2", SlopeChartComponent.config.height);
    
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
    
    var slopeLines = slopeGroups.append("line")
      .attr("class", "slope-line")
      .attr("x1", 0)
      .attr("y1", function(d) {
        return y1(d.incidentRatio2014);
      })
      .attr("x2", SlopeChartComponent.config.width)
      .attr("y2", function(d) {
        return y1(d.incidentRatio2017);
      });
    
    var leftSlopeGroups = slopeGroups.append("g")
      .attr("class", "slope-groups-left")
      .each(function(d) { d.yLeftPosition = y1(d.incidentRatio2014) });

    var leftSlopeCircle = leftSlopeGroups.append("circle")
      .attr("r", SlopeChartComponent.config.radius)
      .attr("cy", d => y1(d.incidentRatio2014));
    
    var leftSlopeLabels = leftSlopeGroups.append("g")
      .attr("class", "slope-label-left")
    
    // leftSlopeLabels.append("text")
    //   .attr("class", "label-figure")
    //   .attr("x", -config.labelGroupOffset)
    //   .attr("y", d => y1(d.incidentRatio2014))
    //   .attr("dx", -10)
    //   .attr("dy", 3)
    //   .attr("text-anchor", "end")
    //   .text(d => (d.incidentRatio2014).toPrecision(3));
    
    leftSlopeLabels.append("text")
      .attr("x", -SlopeChartComponent.config.labelGroupOffset)
      .attr("y", d => d.yLeftPosition)
      .attr("dx", -SlopeChartComponent.config.labelKeyOffset)
      .attr("dy", 3)
      .attr("text-anchor", "end")
      .text(d => d.cityName);
    
    var rightSlopeGroups = slopeGroups.append("g")
      .attr("class", "slope-groups-left");

    var rightSlopeCircle = rightSlopeGroups.append("circle")
      .attr("r", SlopeChartComponent.config.radius)
      .attr("cx", SlopeChartComponent.config.width)
      .attr("cy", d => y1(d.incidentRatio2017));
    
    var rightSlopeLabels = rightSlopeGroups.append("g")
      .attr("class", "slope-label-right")
      .each(function(d) { d.yRightPosition = y1(d.incidentRatio2017) });
    
    // rightSlopeLabels.append("text")
    //   .attr("class", "label-figure")
    //   .attr("x", width + config.labelGroupOffset)
    //   .attr("y", d => y1(d.incidentRatio2017))
    //   .attr("dx", 10)
    //   .attr("dy", 3)
    //   .attr("text-anchor", "start")
    //   .text(d => (d.incidentRatio2017).toPrecision(3));
    
    rightSlopeLabels.append("text")
      .attr("x", SlopeChartComponent.width + SlopeChartComponent.config.labelGroupOffset)
      .attr("y", d => d.yRightPosition)
      .attr("dx", SlopeChartComponent.config.labelKeyOffset)
      .attr("dy", 3)
      .attr("text-anchor", "start")
      .text(d => d.cityName);
    
    var titles = svg.append("g")
      .attr("class", "title");
    
    titles.append("text")
      .attr("text-anchor", "end")
      .attr("dx", -10)
      .attr("dy", -SlopeChartComponent.margin.top / 2)
      .text(SlopeChartComponent.config.leftTitle);
    
    titles.append("text")
      .attr("x", SlopeChartComponent.config.width)
      .attr("dx", 10)
      .attr("dy", -SlopeChartComponent.margin.top / 2)
      .text(SlopeChartComponent.config.rightTitle);
    
    // this.relax(leftSlopeGroups, "yLeftPosition");
    // this.relax(rightSlopeGroups, "yRightPosition");


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
    do{
      var again = false;
      labels.each((d, i) => {
        var a = d;
        //var da = d3.select(a).datum();
        var y1 = d[position];
        labels.each((d, j) => {
          var  b = d;
          if (a == b) return;
          //var db = d3.select(b).datum();
          var y2 = b[position];
          var deltaY = y1 - y2;

          if (Math.abs(deltaY) > SlopeChartComponent.config.labelPositioning.spacing) return;

          again = true;
          var sign = deltaY > 0 ? 1 : -1;
          var adjust = sign * SlopeChartComponent.config.labelPositioning.alpha;
          a[position] = +y1 + adjust;
          b[position] = +y2 - adjust;
        })
      })
    }while(again);

    // Update label positions
    labels.select("text")
      .attr("y", d => d[position]);
    labels.select("circle")
      .attr("cy", d => d[position]);
  }
}
