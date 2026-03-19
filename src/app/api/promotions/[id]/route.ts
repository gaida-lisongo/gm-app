import { NextRequest, NextResponse } from "next/server";

import { getPromotionOverview } from "@/lib/promotionWorkflow";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const promotionId = Number.parseInt(id, 10);
    const anneeParam = request.nextUrl.searchParams.get("annee");
    const anneeId = anneeParam ? Number.parseInt(anneeParam, 10) : undefined;

    if (Number.isNaN(promotionId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const overview = await getPromotionOverview(
      promotionId,
      anneeId && !Number.isNaN(anneeId) ? anneeId : undefined
    );

    if (!overview) {
      return NextResponse.json({ error: "Promotion introuvable" }, { status: 404 });
    }

    return NextResponse.json(overview);
  } catch (error: any) {
    console.error("Erreur lors de la recuperation de la promotion:", error);

    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
}
