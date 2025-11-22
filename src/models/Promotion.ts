import { executeQuery } from "@/libs/mySql";
import { RowDataPacket, OkPacket } from "mysql2";

export interface PromotionType {
    id: number,
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

    async matieres(data: Omit<PromotionType, 'id'>): Promise<OkPacket> {
        const result = await executeQuery('INSERT INTO mention SET ?', [data]);
        return result as OkPacket;
    }

    async jurys(id: number, data: Omit<PromotionType, 'id'>): Promise<OkPacket> {
        const result = await executeQuery('UPDATE mention SET ? WHERE id = ?', [data, id]);
        return result as OkPacket;
    }

    async delete(id: number): Promise<OkPacket> {
        const result = await executeQuery('DELETE FROM mention WHERE id = ?', [id]);
        return result as OkPacket;
    }

    async find(id: number): Promise<PromotionType[]> {
        const result = await executeQuery(`SELECT section.*, CONCAT(chef.grade, '. ', chef.nom, ' ', chef.post_nom) AS 'chef_section', CONCAT(sec.grade, '. ', sec.nom, ' ', sec.post_nom) AS 'sec_section'
                            FROM section
                            INNER JOIN agent chef ON chef.id = section.id_chef
                            INNER JOIN agent sec ON sec.id = section.id_sec
                            WHERE section.id_mention = ?`,
                            [id]);
        return result as PromotionType[];
    }
}

export default new Promotion();
