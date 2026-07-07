/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Greek word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const EL_WORDS: readonly string[] = [
  "ΒΟΥΝΟ",
  "ΠΟΤΑΜΙ",
  "ΔΑΣΟΣ",
  "ΩΚΕΑΝΟΣ",
  "ΝΗΣΙ",
  "ΛΙΟΝΤΑΡΙ",
  "ΑΕΤΟΣ",
  "ΚΑΡΧΑΡΙΑΣ",
  "ΡΟΛΟΪ",
  "ΣΤΕΜΜΑ",
  "ΚΛΕΙΔΙ",
  "ΚΛΕΙΔΑΡΙΑ",
  "ΑΣΠΙΔΑ",
  "ΣΠΑΘΙ",
  "ΚΑΣΤΡΟ",
  "ΠΥΡΓΟΣ",
  "ΣΧΟΛΕΙΟ",
  "ΝΟΣΟΚΟΜΕΙΟ",
  "ΜΗΛΟ",
  "ΨΩΜΙ",
  "ΓΑΛΑ",
  "ΤΣΑΪ",
  "ΧΡΥΣΟΣ",
  "ΑΣΗΜΙ",
  "ΣΙΔΕΡΟ",
  "ΗΛΙΟΣ",
  "ΦΕΓΓΑΡΙ",
  "ΑΣΤΕΡΙ",
  "ΦΩΤΙΑ",
  "ΝΕΡΟ"
] as const;

export type ElWord = (typeof EL_WORDS)[number];
