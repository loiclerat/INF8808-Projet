import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { SquareMatrixPlotComponent } from "./visualizations/square-matrix-plots/square-matrix-plots.component";

@NgModule({
  declarations: [AppComponent, SquareMatrixPlotComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
