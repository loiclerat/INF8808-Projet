import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as d3 from "d3";

import { Incident } from "src/app/incident.model";
import { City } from "src/app/city.model";

class DataByCity {
  constructor(
    public cityName: string,
    // TODO : do we really need this one ?
    public stateName: string,
    public incidentRatio2014: number,
    public incidentRatio2017: number
  ) {}
}

@Component({
  selector: "app-slope-chart",
  templateUrl: "./slope-chart.component.html",
  styleUrls: ["./slope-chart.component.css"]
})
export class SlopeChartComponent implements OnChanges {
  @Input() public data: Incident[];
  @Input() public citiesData: City[];

  private dataByCity: DataByCity[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.currentValue) {
      this.preprocessing();
      this.initialization();
    }
  }

  // D3 examples : http://christopheviau.com/d3list/
  // https://bl.ocks.org/tlfrd/042b2318c8767bad7a485098fbf760fc

  private preprocessing() {
    this.dataByCity = [];

    this.data.forEach((incident: Incident) => {
      const year = incident.date.getFullYear();
      if (year != 2014 && year != 2017)
      {
        return;
      }

      let cleanCityName = incident.city_or_county.split(" (", 1);

      // If the city exist in our city population dataset
      if (this.citiesData.find(d => d.city === cleanCityName[0]))
      {
        let city = this.dataByCity.find(d => d.cityName === cleanCityName[0]);
        if (!city) 
        {
          // Create a new DataByCity if it does not exist yet
          city = new DataByCity(cleanCityName[0], incident.state, 0, 0);
          this.dataByCity.push(city);
        }

        // Update incident number
        if (year == 2014)
        {
          city.incidentRatio2014++;
        }
        else
        {
          city.incidentRatio2017++;
        }
      }
    });

    this.data = []; // free up memory
    this.citiesData = []; // free up memory
  }

  // Début mais pas fini
  private initialization() {

    var margin = {top: 100, right: 275, bottom: 40, left: 275};
   
    var width = 960 - margin.left - margin.right,
    		height = 2000 - margin.top - margin.bottom;
        
    var svg = d3.select("body").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var y1 = d3.scaleLinear()
    	.range([height, 0]);
    
    var config = {
      xOffset: 0,
      yOffset: 0,
      width: width,
      height: height,
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
    
    function drawSlopeGraph(cfg, data, yScale, leftYAccessor, rightYAccessor) {
      var slopeGraph = svg.append("g")
      	.attr("class", "slope-graph")
      	.attr("transform", "translate(" + [cfg.xOffset, cfg.yOffset] + ")");     
    }
      
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
    

    var y1Min = d3.min(this.dataByCity, function(d) {              
      return Math.min(d.incidentRatio2014, d.incidentRatio2017);
    });
    
    var y1Max = d3.max(this.dataByCity, function(d) {     
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
      .attr("x2", 0).attr("y2", config.height);
    borderLines.append("line")
      .attr("x1", width).attr("y1", 0)
      .attr("x2", width).attr("y2", config.height);
    
    var slopeGroups = svg.append("g")
      .selectAll("g")
      .data(this.dataByCity)
      .enter().append("g")
        .attr("class", "slope-group");
    
    var slopeLines = slopeGroups.append("line")
      .attr("class", "slope-line")
      .attr("x1", 0)
      .attr("y1", function(d) {
        return y1(d.incidentRatio2014);
      })
      .attr("x2", config.width)
      .attr("y2", function(d) {
        return y1(d.incidentRatio2017);
      });
    
    var leftSlopeCircle = slopeGroups.append("circle")
      .attr("r", config.radius)
      .attr("cy", d => y1(d.incidentRatio2014));
    
    var leftSlopeLabels = slopeGroups.append("g")
      .attr("class", "slope-label-left");
      // .each(function(d) {
      //   d.xLeftPosition = -config.labelGroupOffset;
      //   d.yLeftPosition = y1(d.incidentRatio2014);
      // })
    
    leftSlopeLabels.append("text")
      .attr("class", "label-figure")
      .attr("x", -config.labelGroupOffset)
      .attr("y", d => y1(d.incidentRatio2014))
      .attr("dx", -10)
      .attr("dy", 3)
      .attr("text-anchor", "end")
      .text(d => (d.incidentRatio2014).toPrecision(3));
    
    leftSlopeLabels.append("text")
      .attr("x", -config.labelGroupOffset)
      .attr("y", d => y1(d.incidentRatio2014))
      .attr("dx", -config.labelKeyOffset)
      .attr("dy", 3)
      .attr("text-anchor", "end")
      .text(d => d.cityName);
    
    var rightSlopeCircle = slopeGroups.append("circle")
      .attr("r", config.radius)
      .attr("cx", config.width)
      .attr("cy", d => y1(d.incidentRatio2017));
    
    var rightSlopeLabels = slopeGroups.append("g")
      .attr("class", "slope-label-right");
      // .each(function(d) {
      //   d.xRightPosition = width + config.labelGroupOffset;
      //   d.yRightPosition = y1(d.values[1].max / d.values[1].min);
      // })
    
    rightSlopeLabels.append("text")
      .attr("class", "label-figure")
      .attr("x", width + config.labelGroupOffset)
      .attr("y", d => y1(d.incidentRatio2017))
      .attr("dx", 10)
      .attr("dy", 3)
      .attr("text-anchor", "start")
      .text(d => (d.incidentRatio2017).toPrecision(3));
    
    rightSlopeLabels.append("text")
      .attr("x", width + config.labelGroupOffset)
      .attr("y", d => y1(d.incidentRatio2017))
      .attr("dx", config.labelKeyOffset)
      .attr("dy", 3)
      .attr("text-anchor", "start")
      .text(d => d.cityName);
    
    var titles = svg.append("g")
      .attr("class", "title");
    
    titles.append("text")
      .attr("text-anchor", "end")
      .attr("dx", -10)
      .attr("dy", -margin.top / 2)
      .text(config.leftTitle);
    
    titles.append("text")
      .attr("x", config.width)
      .attr("dx", 10)
      .attr("dy", -margin.top / 2)
      .text(config.rightTitle);
    
    // this.relax(leftSlopeLabels, "yLeftPosition");
    // leftSlopeLabels.selectAll("text")
    // 	.attr("y", ????);
    
    // this.relax(rightSlopeLabels, "yRightPosition");
    // rightSlopeLabels.selectAll("text")
    // 	.attr("y", ????);
    
    // d3.selectAll(".slope-group")
    // 	.attr("opacity", config.unfocusOpacity);
    
    // var voronoiGroup = svg.append("g")
    // 	.attr("class", "voronoi");
    
  //   voronoiGroup.selectAll("path")
  //   	.data(voronoi.polygons(d3.merge(nestedByName.map(d => d.values))))
  //   	.enter().append("path")
  //   		.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
  //   		.on("mouseover", mouseover)
  //   		.on("mouseout", mouseout);
  // });
  
  // function mouseover(d) {
  //   d3.select(d.data.group).attr("opacity", 1);
  // }
  
  // function mouseout(d) {
  //   d3.selectAll(".slope-group")
  //   	.attr("opacity", config.unfocusOpacity);
  // }
  
  }

  // Function to reposition an array selection of labels (in the y-axis)
  // private relax(labels, position) {
  //   var again = false;
  //   labels.each(function (d, i) {
  //     var a = this;
  //     var da = d3.select(a).datum();
  //     var y1 = da[position];
  //     labels.each(function (d, j) {
  //       var  b = this;
  //       if (a == b) return;
  //       var db = d3.select(b).datum();
  //       var y2 = db[position];
  //       var deltaY = y1 - y2;

  //       if (Math.abs(deltaY) > config.labelPositioning.spacing) return;

  //       again = true;
  //       var sign = deltaY > 0 ? 1 : -1;
  //       var adjust = sign * config.labelPositioning.alpha;
  //       da[position] = +y1 + adjust;
  //       db[position] = +y2 - adjust;

  //       if (again) {
  //        this.relax(labels, position);
  //       }
  //     })
  //   })
  // }
}
