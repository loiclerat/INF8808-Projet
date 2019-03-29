export class Localization {
  private static shortMonths = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jui",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc"
    ];

  public static getFormattedDateByMonth(index: number) {
    return Localization.shortMonths[index % 12] + " " + (Math.floor(index / 12) + 2014);
  }
}
