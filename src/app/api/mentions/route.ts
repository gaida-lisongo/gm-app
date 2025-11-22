import Mention, { MentionData, SectionData } from "@/models/Mention";
import { NextRequest, NextResponse } from "next/server";    

export async function GET() {
    try {
        const mentionsData = await Mention.all();

        if(!mentionsData || mentionsData.length === 0) {
            return NextResponse.json({ error: 'Aucune mention trouvée' }, { status: 404 });
        }

        const mentions = [];

        for(const mention of mentionsData) {
            if (!mention.id) continue; // Skip mentions without id
            
            const sectionsData = await Mention.find(mention.id);
            mentions.push({
                id: mention.id,
                designation: mention.designation,
                id_agent: mention.id_agent,
                date_creation: mention.date_creation,
                description: mention.description,
                sections: sectionsData || [],
            });
        }
        return NextResponse.json(mentions);
    } catch (error) {
        console.error('Erreur lors de la récupération des mentions:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Validation basique
        if (!body.designation || !body.id_agent || !body.date_creation || !body.description) {
            return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
        }

        const mention = await Mention.create(body);
        return NextResponse.json(mention, { status: 201 });
    } catch (error) {
        console.error('Erreur lors de la création de la mention:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// Note: PUT et DELETE avec paramètres d'URL doivent être dans un fichier [id]/route.ts
// Ces méthodes ne peuvent pas accéder aux paramètres d'URL dans ce contexte

