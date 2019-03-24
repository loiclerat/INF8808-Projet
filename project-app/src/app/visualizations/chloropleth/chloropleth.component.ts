import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";
import * as topoJson from "topojson";

@Component({
  selector: 'app-chloropleth',
  templateUrl: './chloropleth.component.html',
  styleUrls: ['./chloropleth.component.css']
})
export class ChloroplethComponent implements OnInit {

  constructor() { }

  ngOnInit() {

    var width = 960,
      height = 1160;

    var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

    var path = d3.geoPath();

    d3.json("https://d3js.org/us-10m.v1.json").then((us: any) => {
      console.log(us);

      svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topoJson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function (d) {
          console.log(d)
          return '#FF0000';
        });

    });

  }

}
