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

class Promotion {
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
}

export default new Promotion();
