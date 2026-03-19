import Promotion, { PromotionType } from "@/models/Promotion";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params } : { params : Promise<{ classeId: string }> }){
    try {
        const { classeId } = await params;  
        const id = parseInt(classeId);

        if(isNaN(id)){
            return NextResponse.json({error: 'ID invalide'}, { status: 404 });
        }
        
        const promotionsData = await Promotion.all(id);

        if (!promotionsData || promotionsData.length === 0) {
            return NextResponse.json({ error: 'Promotion non trouvée' }, { status: 404 });
        }
        
        const promotions: PromotionType[] = [];

        for (const promotion of promotionsData) {
            const jurys = await Promotion.jurys(promotion.id);
            const defaultYearId = jurys[0]?.id_annee;
            const unitesData = defaultYearId
                ? await Promotion.matieresByPromotion(promotion.id, defaultYearId)
                : [];

            if(!unitesData || unitesData.length === 0){
                promotions.push({
                    ...promotion,
                    unites: [],
                    jurys
                });

            } else {
                promotions.push({
                    ...promotion,
                    unites: unitesData,
                    jurys
                });
            }
        }
        return NextResponse.json(promotions);
    } catch (error) {
        console.error('Erreur lors de la récupération de la promotion:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
        
    }
}
