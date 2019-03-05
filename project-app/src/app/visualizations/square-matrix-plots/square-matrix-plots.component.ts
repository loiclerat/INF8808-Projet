import {
  Component,
  OnInit,
  OnChanges,
  ViewChild,
  ElementRef,
  Input
} from "@angular/core";

import * as d3 from "d3";
import * as d3Tip from "d3-tip";

@Component({
  selector: "app-square-matrix-plots",
  templateUrl: "square-matrix-plots.component.html",
  styleUrls: ["square-matrix-plots.component.css"]
})
export class SquareMatrixPlotComponent {
//   @ViewChild("squareMatrixPlotContainer") container: ElementRef;

//   @Input() dataset: any[]; // mettre une classe pour le dataset

//   private isInitialized = false;

//   private svgMargin = { top: 20, right: 50, bottom: 100, left: 0 };
//   private imgSize = { x: 30, y: 30 };
//   private imgSizeLegend = { x: 15, y: 15 };
//   private imgMargin = { top: 5, right: 3, bottom: 5, left: 3 };
//   private nbImages = { x: 10, y: 10 };

//   private sortedDataset: any;
//   private data: any;
//   private color: any;
//   private images: any;
//   private legend: any;

//   private static lrm(array: number[], target: number): number[] {
//     const off = target - _.reduce(array, (acc, x) => acc + Math.round(x), 0);
//     return _(array)
//       .map((v, i) => ({ i: i, v: v }))
//       .sortBy(v => Math.round(v.v) - v.v)
//       .map((v, i) => ({
//         i: v.i,
//         v:
//           Math.round(v.v) +
//           (off > i ? 1 : 0) -
//           (i >= array.length + off ? 1 : 0)
//       }))
//       .sortBy(v => v.i)
//       .map(v => v.v)
//       .value();
//   }

//   /**
//    * Initialise le composant.
//    */
//   ngOnInit() {
//     if (!this.dataset || this.dataset.length === 0) {
//       return;
//     }

//     const width =
//       (this.imgSize.x + this.imgMargin.left + this.imgMargin.right) *
//       this.nbImages.x;
//     const height =
//       (this.imgSize.y + this.imgMargin.top + this.imgMargin.bottom) *
//       this.nbImages.y;

//     const host = d3.select(this.container.nativeElement);
//     const [g] = buildSvg(host, width, height, this.svgMargin);

//     this.generateData();

//     this.color = d3.scale.category10();
//     this.color.domain(
//       _(10)
//         .range()
//         .map(v => v.toString())
//         .value()
//     );

//     const tip: any = d3Tip()
//       .attr("class", "d3-tip")
//       .offset([-10, 0])
//       .html(d => d.name + " (" + d.proportions + "&nbsp;%)");

//     g.call(tip);

//     this.images = g
//       .append("g")
//       .attr("transform", "translate(" + 60 + "," + 0 + ")");
//     this.images
//       .selectAll("rect")
//       .data(this.data)
//       .enter()
//       .append("rect")
//       .attr({
//         x: (d, i) =>
//           (i % this.nbImages.x) *
//           (this.imgSize.x + this.imgMargin.left + this.imgMargin.right),
//         y: (d, i) =>
//           (this.imgSize.y + this.imgMargin.top + this.imgMargin.bottom) *
//           Math.floor(i / this.nbImages.y),
//         width: this.imgSize.x,
//         height: this.imgSize.y,
//         fill: d => this.color(d.id)
//       })
//       .on("mouseover", function(event) {
//         showTooltip.call(this, event, tip);
//       })
//       .on("mouseout", tip.hide);

//     this.legend = g.append("g").attr("class", "gLegend");
//     this.generateLegend();

//     this.isInitialized = true;
//   }

//   /**
//    * Met à jour le composant.
//    */
//   ngOnChanges() {
//     if (!this.isInitialized) {
//       return;
//     }
//     this.generateData();

//     this.images
//       .selectAll("rect")
//       .data(this.data)
//       .transition()
//       .duration(1000)
//       .attr("fill", d => this.color(d.id));

//     this.generateLegend();
//   }

//   /**
//    * Génère les données associées à la grid.
//    */
//   private generateData() {
//     const total = _.sumBy(this.dataset, d => d.totalAccidents);
//     const proportionsData = SquareMatrixPlotComponent.lrm(
//       _.map(this.dataset, d => (d.totalAccidents * 100) / total),
//       100
//     );
//     this.sortedDataset = _(this.dataset)
//       .sortBy(d => d.totalAccidents)
//       .reverse()
//       .map((d: any) => {
//         d.proportions = proportionsData[d.id];
//         return d;
//       })
//       .value();
//     this.data = _.flatMap(this.sortedDataset, v =>
//       _.fill(Array(v.proportions), v)
//     );
//   }

//   /**
//    * Génère la légendde associée à la grid.
//    */
//   private generateLegend() {
//     this.legend.html("");

//     const l = this.legend
//       .selectAll("g")
//       .data(this.sortedDataset)
//       .enter()
//       .append("g")
//       .filter(d => d.proportions !== 0)
//       .attr("id", (d, i) => "who" + i);

//     l.append("rect").attr({
//       x: 0,
//       y: 0,
//       width: this.imgSizeLegend.x,
//       height: this.imgSizeLegend.y,
//       fill: d => this.color(d.id)
//     });

//     l.append("text")
//       .text(d => d.name)
//       .attr({
//         x: (d, i) => this.imgSizeLegend.x + 10, // + i * (this.imgSizeLegend.x),
//         y: this.imgSizeLegend.y
//       });

//     let y =
//       this.nbImages.y *
//         (this.imgSize.y + this.imgMargin.top + this.imgMargin.bottom) +
//       30;
//     l.attr({
//       transform: function(d, i) {
//         let x = 0;
//         if (i > 0) {
//           _.range(i % 5).forEach(v => {
//             const e: any = d3.select("#who" + (v + 5 * Math.floor(i / 5)));
//             const bb1 = e.node().getBBox();
//             x += bb1.x + bb1.width + 15;
//           });
//         }

//         if (i === 5) {
//           y += 40;
//         }
//         return "translate(" + x + ", " + y + ")";
//       }
//     });
//   }
}
