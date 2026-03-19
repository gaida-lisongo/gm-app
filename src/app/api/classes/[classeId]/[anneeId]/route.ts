import Promotion, { InscritType, PromotionType } from "@/models/Promotion";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params } : { params : Promise<{ classeId: string, anneeId: string }> }){
    try {
        const { classeId, anneeId } = await params;  
        const id_promotion = parseInt(classeId);
        const id_annee = parseInt(anneeId);

        if(isNaN(id_promotion) || isNaN(id_annee)){
            return NextResponse.json({error: 'ID invalide'}, { status: 404 });
        }
        
        const etudiantsData = await Promotion.inscrits(id_promotion, id_annee);

        if (!etudiantsData || etudiantsData.length === 0) {
            return NextResponse.json({ error: 'Etudiants non trouvée' }, { status: 404 });
        }
        
        const etudiants: InscritType[] = [];

        for (const etudiant of etudiantsData) {
            const notes = await Promotion.notes(etudiant.id_etudiant, etudiant.id_annee_acad);
            
            etudiants.push({
                ...etudiant,
                notes
            })
        }
        
        return NextResponse.json(etudiants);
    } catch (error) {
        console.error('Erreur lors de la récupération de la promotion:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
        
    }
}
