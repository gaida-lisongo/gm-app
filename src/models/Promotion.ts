import { executeQuery } from "@/libs/mySql";
import { RowDataPacket, OkPacket } from "mysql2";

export interface UniteType {
    id: number;
    designation: string;
    id_promotion: number;
    code: string;
    competences: string | null;
    objectifs: string | null;
    matieres: MatiereType[] | null
}

export interface MatiereType {
    id: number;
    designation: string;
    credit: string;
    id_unite: number;
    code: string;
    semestre: string;
    statut: string
}

export interface PromotionType {
    id: number;
    id_section: number;
    id_niveau: number;
    orientation: string | null;
    classe: string,
    systeme: string,
    section_name?: string,
    mention_name?: string,
    unites: UniteType[] | null,
    jurys: JuryType[] | null
}

export interface JuryType {
    id: number;
    id_niveau: number;
    id_jury: number;
    id_annee: number;
    annee_acad: string;
    filiere: string;
    designation: string;
    president: string;
    secretaire: string;
    membre: string
}

export interface InscritType {
    id: number;
    id_etudiant: number;
    section: string;
    option: string;
    annee: string;
    pourcentage_exetat: string;
    nom: string;
    post_nom: string;
    prenom: string;
    matricule: string;
    sexe: string;
    telephone: string;
    adresse: string;
    email: string;
    lieu_naissance: string;
    date_naissance: string;
    annee_acad: string;
    id_annee_acad: number;
    id_promotion: number,
    notes?: NoteType[] | []
}

export interface NoteType {
    id: number;
    id_etudiant: number;
    id_matiere: number;
    cours: string;
    credit: number;
    id_unite: number;
    semestre: string;
    id_annee: number;
    tp: string;
    td: string;
    cmi: string;
    examen: string;
    rattrapage: number
}

class Promotion {
    async allPromotions(): Promise<PromotionType[]> {
        const result = await executeQuery(
            `SELECT 
                p.*,
                CONCAT(n.intitule, ' ', s.designation) AS 'classe',
                n.systeme,
                s.designation AS 'section_name',
                m.designation AS 'mention_name'
            FROM promotion p
            INNER JOIN niveau n ON n.id = p.id_niveau
            INNER JOIN section s ON s.id = p.id_section
            INNER JOIN mention m ON m.id = s.id_mention
            ORDER BY m.designation ASC, s.designation ASC, n.intitule ASC`,
        );
        return result as PromotionType[];
    }

    async all(sectionId: number) : Promise<PromotionType[]> {
        const result = await executeQuery(
            `SELECT p.*, CONCAT(n.intitule, ' ', s.designation) AS 'classe', n.systeme
            FROM promotion p
            INNER JOIN niveau n ON n.id = p.id_niveau
            INNER JOIN section s ON s.id = p.id_section
            WHERE s.id = ?`,
            [sectionId]
        );
        return result as PromotionType[];
    }

    async find(promotionId: number): Promise<PromotionType | null> {
        const result = await executeQuery(
            `SELECT 
                p.*,
                CONCAT(n.intitule, ' ', s.designation) AS 'classe',
                n.systeme,
                s.designation AS 'section_name',
                m.designation AS 'mention_name'
            FROM promotion p
            INNER JOIN niveau n ON n.id = p.id_niveau
            INNER JOIN section s ON s.id = p.id_section
            INNER JOIN mention m ON m.id = s.id_mention
            WHERE p.id = ?
            LIMIT 1`,
            [promotionId]
        );

        const rows = result as PromotionType[];
        return rows[0] ?? null;
    }

    async unites(promotionId: number): Promise<UniteType[]> {
        const result = await executeQuery(
            `SELECT *
            FROM unite u
            WHERE u.id_promotion = ?`, 
            [promotionId]
        );
        return result as UniteType[];
    }

    async matieres(uniteId: number): Promise<MatiereType[]> {
        const result = await executeQuery(
            `SELECT *
            FROM matiere m
            WHERE m.id_unite = ?`, 
            [uniteId]
        );
        return result as MatiereType[];
    }

    async matieresByPromotion(promotionId: number, anneeId: number) {
        try {
            const req = await executeQuery(
                `SELECT 
                    unite.id AS 'unite', 
                    unite.designation, 
                    unite.code, 
                    unite.id_promotion,
                    unite.competences,
                    unite.objectifs,
                    matiere.id, 
                    matiere.designation,
                    matiere.credit, 
                    matiere.id_unite,
                    matiere.code,
                    charge_horaire.semestre, 
                    charge_horaire.statut
                FROM matiere
                INNER JOIN unite ON unite.id = matiere.id_unite
                INNER JOIN charge_horaire ON charge_horaire.id_matiere = matiere.id
                WHERE unite.id_promotion =  ? AND charge_horaire.id_annee=?;
                `,
                [promotionId, anneeId]
            );

            const unitesData :any[] = [];
            (req as RowDataPacket[]).forEach((row) => {
                let unite = unitesData.find(u => u.id === row.unite);
                if (!unite) {
                    unite = {
                        id: row.unite,
                        designation: row.designation,
                        code: row.code,
                        id_promotion: row.id_promotion,
                        competences: row.competences,
                        objectifs: row.objectifs,
                        matieres: []
                    };
                    unitesData.push(unite);
                }
                unite.matieres.push({
                    id: row.id,
                    designation: row.designation,
                    credit: row.credit,
                    id_unite: row.id_unite,
                    code: row.code,
                    semestre: row.semestre,
                    statut: row.statut
                });
            });

            return unitesData;
        } catch (error) {
            console.error('Erreur lors de la récupération des matières par promotion:', error);
            return [];            
        }
    }

    async jurys(promotionId: number): Promise<JuryType[]> {
        const result = await executeQuery(`
            SELECT nj.*, CONCAT(a.debut, ' - ', a.fin) as 'annee_acad', s.designation as 'filiere', j.designation, CONCAT(pj.grade, ' ', pj.nom, ' ', pj.post_nom) as 'president', CONCAT(sj.grade, ' ', sj.nom, ' ', sj.post_nom) as 'secretaire', CONCAT(mj.grade, ' ', mj.nom, ' ', mj.post_nom) as 'membre'
            FROM niveau_jury nj
            INNER JOIN jury j ON j.id = nj.id_jury
            INNER JOIN agent pj ON pj.id = j.id_president
            INNER JOIN agent sj ON sj.id = j.id_secretaire
            INNER JOIN agent mj ON mj.id = j.id_membre
            INNER JOIN section s ON s.id = j.id_section
            INNER JOIN annee a ON a.id = nj.id_annee
            WHERE nj.id_niveau = ?`, 
            [promotionId]
        );
        return result as JuryType[];
    }

    async juryByYear(promotionId: number, anneeId: number): Promise<JuryType[]> {
        const result = await executeQuery(`
            SELECT 
                nj.*, 
                CONCAT(a.debut, ' - ', a.fin) as 'annee_acad', 
                s.designation as 'filiere', 
                j.designation, 
                CONCAT(pj.grade, ' ', pj.nom, ' ', pj.post_nom) as 'president', 
                CONCAT(sj.grade, ' ', sj.nom, ' ', sj.post_nom) as 'secretaire', 
                CONCAT(mj.grade, ' ', mj.nom, ' ', mj.post_nom) as 'membre'
            FROM niveau_jury nj
            INNER JOIN jury j ON j.id = nj.id_jury
            INNER JOIN agent pj ON pj.id = j.id_president
            INNER JOIN agent sj ON sj.id = j.id_secretaire
            INNER JOIN agent mj ON mj.id = j.id_membre
            INNER JOIN section s ON s.id = j.id_section
            INNER JOIN annee a ON a.id = nj.id_annee
            WHERE nj.id_niveau = ? AND nj.id_annee = ?`,
            [promotionId, anneeId]
        );
        return result as JuryType[];
    }

    async years(promotionId: number): Promise<Array<{ id: number; annee_acad: string }>> {
        const result = await executeQuery(
            `SELECT DISTINCT 
                a.id,
                CONCAT(a.debut, ' - ', a.fin) AS 'annee_acad'
            FROM niveau_jury nj
            INNER JOIN annee a ON a.id = nj.id_annee
            WHERE nj.id_niveau = ?
            ORDER BY a.debut DESC, a.fin DESC`,
            [promotionId]
        );
        return result as Array<{ id: number; annee_acad: string }>;
    }

    async inscrits(promotionId: number, anneeId: number): Promise<InscritType[]>{
        const result = await executeQuery(
            `SELECT 
                ae.*, 
                e.nom, 
                e.post_nom, 
                e.prenom, 
                e.matricule, 
                e.sexe, 
                e.telephone, 
                e.adresse, 
                e.e_mail AS 'email', 
                e.lieu_naissance, 
                e.date_naiss AS 'date_naissance', 
                CONCAT(a.debut, ' - ', a.fin) as 'annee_acad', 
                pe.id_annee_acad, 
                pe.id_promotion
            FROM promotion_etudiant pe
            INNER JOIN administratif_etudiant ae ON ae.id = pe.id_adminEtudiant
            INNER JOIN etudiant e ON e.id = ae.id_etudiant
            INNER JOIN annee a ON a.id = pe.id_annee_acad
            WHERE pe.id_promotion = ? AND pe.id_annee_acad = ?`,
            [promotionId, anneeId]
        );

        return result as InscritType[]
    }

    async notes(etudiantId: number, anneeId: number): Promise<NoteType[]>{
        const result = await executeQuery(
            `SELECT 
                f.*, 
                m.designation AS cours, 
                m.credit, 
                m.id_unite,
                m.semestre,
                (f.tp + f.td) AS cmi
            FROM fiche_cotation f
            INNER JOIN matiere m ON m.id = f.id_matiere
            WHERE  f.id_etudiant = ? AND  f.id_annee = ?`,
            [etudiantId, anneeId]
        );

        return result as NoteType[]
    }
}

export default new Promotion();
