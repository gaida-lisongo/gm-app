import { NextResponse } from "next/server";

import { getPromotionCards } from "@/lib/promotionWorkflow";

export async function GET() {
  try {
    const promotions = await getPromotionCards();

    return NextResponse.json(promotions);
  } catch (error: any) {
    console.error("Erreur lors de la recuperation des promotions:", error);

    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
}
