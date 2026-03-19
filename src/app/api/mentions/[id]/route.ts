import Mention from "@/models/Mention";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
        }

        const sectionsData = await Mention.find(id) as any[];
        
        if (!sectionsData || sectionsData.length === 0) {
            return NextResponse.json({ error: 'Mention non trouvée' }, { status: 404 });
        }

        return NextResponse.json(sectionsData);
    } catch (error) {
        console.error('Erreur lors de la récupération de la mention:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
        }

        // Validation basique
        if (!body.designation || !body.id_agent || !body.date_creation || !body.description) {
            return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
        }

        const mention = await Mention.update(id, body);
        return NextResponse.json(mention);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la mention:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
        }

        const mention = await Mention.delete(id);
        return NextResponse.json({ message: 'Mention supprimée avec succès', data: mention });
    } catch (error) {
        console.error('Erreur lors de la suppression de la mention:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
