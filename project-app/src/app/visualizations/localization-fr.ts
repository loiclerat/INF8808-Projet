/**
 * Tiré de nos TPs et adapté à notre contexte.
 */

import * as d3 from "d3";
import { TimeLocaleDefinition } from "d3";

export class Localization {
  private static frenchLocale: TimeLocaleDefinition = {
    dateTime: "%a %b %e %X %Y",
    date: "%d/%m/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi"
    ],
    shortDays: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    months: [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre"
    ],
    shortMonths: [
      "jan",
      "fév",
      "mar",
      "avr",
      "mai",
      "jun",
      "jui",
      "août",
      "sep",
      "oct",
      "nov",
      "déc"
    ]
  };

  private static locale = d3.timeFormatDefaultLocale(Localization.frenchLocale);

  public static getFormattedDateByMonth(date: Date) {
    return this.locale.format("%B")(date);
  }
}
