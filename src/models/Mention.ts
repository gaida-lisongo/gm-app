import { executeQuery } from "@/libs/mySql";
import { RowDataPacket, OkPacket } from "mysql2";

export interface MentionData {
    id?: number;
    designation: string;
    id_agent: number;
    date_creation: string;
    description: string;
}

export interface SectionData {
    id: number,
    designation: string,
    id_chef: number,
    id_sec: number,
    id_mention: number,
    description: string,
    chef_section: string,
    sec_section: string
}

class Mention {
    async all() : Promise<MentionData[]> {
        const result = await executeQuery('SELECT * FROM mention');
        return result as MentionData[];
    }

    async create(data: Omit<MentionData, 'id'>): Promise<OkPacket> {
        const result = await executeQuery('INSERT INTO mention SET ?', [data]);
        return result as OkPacket;
    }

    async update(id: number, data: Omit<MentionData, 'id'>): Promise<OkPacket> {
        const result = await executeQuery('UPDATE mention SET ? WHERE id = ?', [data, id]);
        return result as OkPacket;
    }

    async delete(id: number): Promise<OkPacket> {
        const result = await executeQuery('DELETE FROM mention WHERE id = ?', [id]);
        return result as OkPacket;
    }

    async find(id: number): Promise<SectionData[]> {
        const result = await executeQuery(`SELECT section.*, CONCAT(chef.grade, '. ', chef.nom, ' ', chef.post_nom) AS 'chef_section', CONCAT(sec.grade, '. ', sec.nom, ' ', sec.post_nom) AS 'sec_section'
                            FROM section
                            INNER JOIN agent chef ON chef.id = section.id_chef
                            INNER JOIN agent sec ON sec.id = section.id_sec
                            WHERE section.id_mention = ?`,
                            [id]);
        return result as SectionData[];
    }
}

export default new Mention();
