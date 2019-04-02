import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { LineChartComponent } from "./visualizations/line-chart/line-chart.component";
import { ChloroplethComponent } from "./visualizations/chloropleth/chloropleth.component";
import { SlopeChartComponent } from "./visualizations/slope-chart/slope-chart.component";

@NgModule({
  declarations: [AppComponent, LineChartComponent, SlopeChartComponent, ChloroplethComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
