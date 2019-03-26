import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";

import { Incident, IncidentJson } from "./incident.model";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  // public data: Incident[];

  ngOnInit() {
    // const parseTime = d3.timeParse("%Y-%m-%d");

    // d3.json("../../data.json").then((data: IncidentJson[]) => {
    //   this.data = [];

    //   data.forEach(incident => {
    //     // TODO À enlever après reformattage des données par Ayoub/Marc
    //     const date = parseTime(incident.date);
    //     if (date.getFullYear() > 2013 && date.getFullYear() < 2018) {
    //       this.data.push(
    //         new Incident(
    //           incident.city_or_country,
    //           parseTime(incident.date),
    //           parseFloat(incident.latitude),
    //           parseFloat(incident.longitude),
    //           incident.state,
    //           parseInt(incident.state_house_district, 10)
    //         )
    //       );
    //     }
    //   });
    // });
  }
}
