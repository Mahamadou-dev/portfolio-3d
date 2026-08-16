// lib/profile.ts
// Données personnelles qui évoluent toutes seules avec le temps.
// L'âge affiché sur le site est calculé, jamais écrit en dur : il n'y a donc
// rien à corriger chaque année.

/** Année de naissance. */
export const BIRTH_YEAR = 2005;

/** Jour et mois de naissance : 10 mai. L'âge affiché est donc exact toute l'année. */
export const BIRTH_MONTH_DAY: { month: number; day: number } | null = { month: 5, day: 10 };

/** Âge en années révolues, calculé à la date du jour. */
export function currentAge(now: Date = new Date()): number {
  let age = now.getFullYear() - BIRTH_YEAR;

  if (BIRTH_MONTH_DAY) {
    // getMonth() est indexé à 0 ; on compare sur un mois 1-12.
    const monthNow = now.getMonth() + 1;
    const beforeBirthday =
      monthNow < BIRTH_MONTH_DAY.month ||
      (monthNow === BIRTH_MONTH_DAY.month && now.getDate() < BIRTH_MONTH_DAY.day);
    if (beforeBirthday) age -= 1;
  }

  return age;
}
