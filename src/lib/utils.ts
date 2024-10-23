import {
  SingleCity,
  SingleMachiAza,
  SinglePrefecture,
} from '@geolonia/japanese-addresses-v2'

export function removeCitiesFromPrefecture(
  pref: SinglePrefecture | undefined,
): Omit<SinglePrefecture, 'cities'> | undefined {
  if (!pref) {
    return undefined
  }

  const newPref: Omit<SinglePrefecture, 'cities'> & { cities?: SingleCity[] } =
    {
      ...pref,
    }
  delete newPref.cities
  return newPref
}

export function removeExtraFromMachiAza(
  machiAza: SingleMachiAza | undefined,
): Omit<SingleMachiAza, 'csv_ranges'> | undefined {
  if (!machiAza) {
    return undefined
  }

  const newMachiAza: SingleMachiAza = { ...machiAza }
  delete newMachiAza.csv_ranges
  return newMachiAza
}
