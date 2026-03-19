import Promotion, {
  type InscritType,
  type JuryType,
  type PromotionType,
  type UniteType,
} from "@/models/Promotion";

export interface PromotionOverview {
  promotion: PromotionType;
  years: Array<{ id: number; annee_acad: string }>;
  selectedYearId: number | null;
  unites: UniteType[];
}

export interface PromotionYearDetails {
  promotion: PromotionType;
  year: { id: number; annee_acad: string } | null;
  jurys: JuryType[];
  unites: UniteType[];
  etudiants: InscritType[];
}

export async function getPromotionCards() {
  return Promotion.allPromotions();
}

export async function getPromotionOverview(
  promotionId: number,
  preferredYearId?: number
): Promise<PromotionOverview | null> {
  const promotion = await Promotion.find(promotionId);

  if (!promotion) {
    return null;
  }

  const years = await Promotion.years(promotionId);
  const selectedYearId = preferredYearId ?? years[0]?.id ?? null;
  const unites = selectedYearId
    ? await Promotion.matieresByPromotion(promotionId, selectedYearId)
    : [];

  return {
    promotion,
    years,
    selectedYearId,
    unites,
  };
}

export async function getPromotionYearDetails(
  promotionId: number,
  anneeId: number
): Promise<PromotionYearDetails | null> {
  const promotion = await Promotion.find(promotionId);

  if (!promotion) {
    return null;
  }

  const years = await Promotion.years(promotionId);
  const year = years.find((item) => item.id === anneeId) ?? null;
  const jurys = await Promotion.juryByYear(promotionId, anneeId);
  const unites = await Promotion.matieresByPromotion(promotionId, anneeId);
  const inscrits = await Promotion.inscrits(promotionId, anneeId);

  const etudiants = await Promise.all(
    inscrits.map(async (etudiant) => ({
      ...etudiant,
      notes: await Promotion.notes(etudiant.id_etudiant, etudiant.id_annee_acad),
    }))
  );

  return {
    promotion,
    year,
    jurys,
    unites,
    etudiants,
  };
}
