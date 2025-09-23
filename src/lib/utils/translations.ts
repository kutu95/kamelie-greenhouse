/**
 * Translation utilities for database values
 */

export function translateFlowerColor(color: string, locale: string): string {
  if (!color) return ''
  
  const translations: Record<string, { de: string; en: string }> = {
    'Rosa': { de: 'Rosa', en: 'Pink' },
    'Rot': { de: 'Rot', en: 'Red' },
    'Weiß': { de: 'Weiß', en: 'White' },
    'Gelb': { de: 'Gelb', en: 'Yellow' },
    'Rot-Weiß': { de: 'Rot-Weiß', en: 'Red-White' },
    'Rosa-Weiß': { de: 'Rosa-Weiß', en: 'Pink-White' },
    'Gelb-Weiß': { de: 'Gelb-Weiß', en: 'Yellow-White' },
    'Mehrfarbig': { de: 'Mehrfarbig', en: 'Multi-colored' },
    'Pink': { de: 'Pink', en: 'Pink' },
    'Red': { de: 'Red', en: 'Red' },
    'White': { de: 'White', en: 'White' },
    'Yellow': { de: 'Yellow', en: 'Yellow' },
  }
  
  const translation = translations[color]
  return translation ? translation[locale as 'de' | 'en'] || color : color
}

export function translateFlowerForm(form: string, locale: string): string {
  if (!form) return ''
  
  const translations: Record<string, { de: string; en: string }> = {
    'Halb gefüllt': { de: 'Halb gefüllt', en: 'Semi-double' },
    'Vollständig gefüllt': { de: 'Vollständig gefüllt', en: 'Fully Double' },
    'Einfach': { de: 'Einfach', en: 'Single' },
    'Anemone': { de: 'Anemone', en: 'Anemone Form' },
    'Pfingstrose': { de: 'Pfingstrose', en: 'Peony Form' },
    'Rose': { de: 'Rose', en: 'Rose Form' },
    'Single': { de: 'Single', en: 'Single' },
    'Semi-double': { de: 'Semi-double', en: 'Semi-double' },
    'Double': { de: 'Double', en: 'Double' },
    'Peony': { de: 'Peony', en: 'Peony Form' },
    'Anemone Form': { de: 'Anemone Form', en: 'Anemone Form' },
    'Rose Form': { de: 'Rose Form', en: 'Rose Form' },
  }
  
  const translation = translations[form]
  return translation ? translation[locale as 'de' | 'en'] || form : form
}

export function translateGrowthHabit(habit: string, locale: string): string {
  if (!habit) return ''
  
  const translations: Record<string, { de: string; en: string }> = {
    'Aufrecht': { de: 'Aufrecht', en: 'Upright' },
    'Breit': { de: 'Breit', en: 'Spreading' },
    'Kompakt': { de: 'Kompakt', en: 'Compact' },
    'Hängend': { de: 'Hängend', en: 'Weeping' },
    'Kletternd': { de: 'Kletternd', en: 'Climbing' },
    'Upright': { de: 'Upright', en: 'Upright' },
    'Spreading': { de: 'Spreading', en: 'Spreading' },
    'Compact': { de: 'Compact', en: 'Compact' },
    'Weeping': { de: 'Weeping', en: 'Weeping' },
    'Climbing': { de: 'Climbing', en: 'Climbing' },
  }
  
  const translation = translations[habit]
  return translation ? translation[locale as 'de' | 'en'] || habit : habit
}

export function translateFoliageType(foliage: string, locale: string): string {
  if (!foliage) return ''
  
  const translations: Record<string, { de: string; en: string }> = {
    'Glänzend dunkelgrün': { de: 'Glänzend dunkelgrün', en: 'Glossy dark green' },
    'Mittelgrün': { de: 'Mittelgrün', en: 'Medium green' },
    'Hellgrün': { de: 'Hellgrün', en: 'Light green' },
    'Dunkelgrün': { de: 'Dunkelgrün', en: 'Dark green' },
    'Glossy dark green': { de: 'Glossy dark green', en: 'Glossy dark green' },
    'Medium green': { de: 'Medium green', en: 'Medium green' },
    'Light green': { de: 'Light green', en: 'Light green' },
    'Dark green': { de: 'Dark green', en: 'Dark green' },
  }
  
  const translation = translations[foliage]
  return translation ? translation[locale as 'de' | 'en'] || foliage : foliage
}
