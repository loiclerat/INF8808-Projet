import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { SquareMatrixPlotComponent } from "./visualizations/square-matrix-plots/square-matrix-plots.component";
import { MapComponent } from './visualizations/map/map.component';

@NgModule({
  declarations: [AppComponent, SquareMatrixPlotComponent, MapComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
