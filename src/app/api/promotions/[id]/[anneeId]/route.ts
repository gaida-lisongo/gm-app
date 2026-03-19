import { NextResponse } from "next/server";

import { getPromotionYearDetails } from "@/lib/promotionWorkflow";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; anneeId: string }> }
) {
  try {
    const { id, anneeId } = await params;
    const promotionId = Number.parseInt(id, 10);
    const yearId = Number.parseInt(anneeId, 10);

    if (Number.isNaN(promotionId) || Number.isNaN(yearId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const details = await getPromotionYearDetails(promotionId, yearId);

    if (!details) {
      return NextResponse.json({ error: "Promotion introuvable" }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (error: any) {
    console.error("Erreur lors de la recuperation des details de promotion:", error);

    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
}
