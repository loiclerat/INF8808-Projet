import { Component, OnInit } from "@angular/core";
import { datajson } from "../../data";
import Incident, { Gender } from "./incident.model";
import * as d3 from "d3";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  public data: Incident[];

  ngOnInit() {
    const parseTime = d3.timeParse("%Y-%m-%d");

    this.data = datajson.map((incident: any) => {
      return new Incident(incident.city_or_county,
        parseTime(incident.date),
        this.parseCharacteristics(incident.incident_characteristics),
        parseFloat(incident.latitude),
        parseFloat(incident.longitude),
        parseInt(incident.n_injured, 10),
        parseInt(incident.n_killed, 10),
        this.parseGender(incident.participant_gender),
        incident.state,
        parseInt(incident.state_house_district, 10)
        );
    });

    console.log(this.data);
  }

  private parseCharacteristics(characteristics: string): string[] {
    return [characteristics]; // TODO
  }

  private parseGender(gender: string): Gender[] {
    let allGender = gender.split("||");

    if (allGender.length === 1) {
      allGender = gender.split("|");
    }

    return allGender.map((g: string) => {
      let g_split = g.split("::");

      if (g_split.length === 1) {
        g_split = g.split(":");
      }

       if (g_split[1] === "Male") {
         return Gender.Male;
       } else if (g_split[1] === "Female") {
         return Gender.Female;
       } else {
         console.log("Other: " + g_split[1]);
       }
    });
  }
}
