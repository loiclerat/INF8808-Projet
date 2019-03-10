import { Component, OnInit } from '@angular/core';
import * as DataExtractor from "../utilis/DataExtractor";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    DataExtractor.readData();
  }

}
