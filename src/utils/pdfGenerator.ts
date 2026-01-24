import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { InscritType, UniteType, NoteType } from '@/models/Promotion';

// Configuration des polices
(pdfMake as any).vfs = (pdfFonts.vfs as any);

interface BulletinData {
    etudiants: InscritType[];
    unites: UniteType[];
    promotionInfo: {
        classe: string;
        anneeAcademique: string;
        section: string;
        mention: string;
        systeme: string;
        orientation: string;
        president: string;
    };
}

// Fonction pour convertir une image en base64
const getImageBase64 = async (imagePath: string): Promise<string> => {
    try {
        const response = await fetch(imagePath);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Erreur lors du chargement de l\'image:', error);
        return '';
    }
};

const imagesAssets = {
    logoRDC: '/images/drc_flag.png',
    logoESURSI: '/images/min_logo.png',
    filigrane: '/images/background.jpg',
    signature: '/images/sgacad.png',
    sceau: '/images/sceau.png',
}

// Fonction utilitaire pour le style des cellules de notes
const cellStyle = (text: string | number, alignment: 'left' | 'center' | 'right' = 'center', color?: string) => ({
    text: String(text), // Assure que c'est une chaîne
    alignment: alignment,
    style: 'normal',
    ...(color && { color: color })
});

// Fonction pour déterminer la couleur selon la moyenne
const getCellStyleForAverage = (moyenne: number, text: string, alignment: 'left' | 'center' | 'right' = 'center') => {
    const color = moyenne >= 10 ? 'green' : 'red';
    return cellStyle(text, alignment, color);
};

export const generateBulletinsPDF = async (data: BulletinData) => {
    // Charger les images en base64
    const logoRDCBase64 = await getImageBase64(imagesAssets.logoRDC);
    const logoESURSIBase64 = await getImageBase64(imagesAssets.logoESURSI);
    const filigraneBase64 = await getImageBase64(imagesAssets.filigrane); 
    const signatureBase64 = await getImageBase64(imagesAssets.signature);
    const sceauBase64 = await getImageBase64(imagesAssets.sceau);
    const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60] as [number, number, number, number],
        content: [],
        // Ajouter l'image de fond (filigrane) si disponible
        background: filigraneBase64 ? {
            image: filigraneBase64,
            width: 595.28, // Largeur A4 en points
            height: 841.89, // Hauteur A4 en points
            absolutePosition: { x: 0, y: 0 },
        } : undefined,
        styles: {
            header: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            subheader: { fontSize: 10, bold: true, margin: [0, 5, 0, 3] },
            studentInfo: { fontSize: 10, margin: [0, 2, 0, 2] },
            tableHeader: { bold: true, fillColor: '#f0f0f0', alignment: 'center', fontSize: 7 },
            normal: { fontSize: 10 },
            small: { fontSize: 10 }
        },
        defaultStyle: { 
          fontSize: 10,
          alignment: 'center'
        }
    };

    const tableContent = {
      widths: [ 
        '12.5%', '12.5%', '12.5%', '12.5%', 
        '12.5%', '12.5%', '12.5%', '12.5%'
      ],
      body: [
        // LIGNE 1 : En-tête institutionnel (Fusion des 8 colonnes en 3 éléments)
        [
          { text: "Logo RDC", colspan: 2, alignment: 'center', style: 'studentInfo' },
          { 
            text: "République Démocratique du Congo\nMinistère de l'Enseignement Supérieur, Universitaire, Recherche Scientique et Innovations\nInstitut Supérieur de Techniques Appliquées de Gombe-Matadi\n\"I.S.T.A/GM à Mbanza-Ngungu\"",
            alignment: "center",
            colspan: 4,
            style: 'small' 
          },
          { text: "Logo ESURSI", colspan: 2, alignment: 'center', style: 'studentInfo' },
        ],
        
        // LIGNE 2 : En-tête des notes (8 entrées, TOUTES définies comme des OBJETS)
        [
          { text: 'N°', style: 'tableHeader' },
          { text: 'Matière', style: 'tableHeader' },
          { text: 'CMI', style: 'tableHeader' },
          { text: 'EXA', style: 'tableHeader' },
          { text: 'TOT.S', style: 'tableHeader' },
          { text: 'RAT', style: 'tableHeader' },
          { text: 'CRD', style: 'tableHeader' },
          { text: 'TOTAL.P', style: 'tableHeader' }
        ]
      ],
    };

    // Note : Votre structure d'en-tête ne nécessite qu'une seule ligne d'en-tête institutionnel.
    // L'idée du tableau fusionné ci-dessus semble tenter de faire l'en-tête des notes sur la même ligne, ce qui est complexe.

    // Générer une page pour chaque étudiant
    data.etudiants.forEach((etudiant, index) => {
        // Ajouter un saut de page sauf pour le premier étudiant
        if (index > 0) {
            docDefinition.content.push({ text: '', pageBreak: 'before' });
        }

        // Générer un N/ref unique de 14 caractères basé sur la timestamp
        const timestamp = Date.now().toString();
        const nRef = ((parseInt(timestamp) * etudiant?.id)).toString().slice(-14).padStart(14, '0'); // Prendre les 14 derniers digits
        const nRefDigits = (nRef).split(''); // Séparer chaque digit

        let ncv = 0;
        let totalCredit = 0;
        let totalNote = 0;
        let maxNote = 0;

        const mentionJurry = (pourcentage: number) => {
          if(pourcentage >= 90.0) {
            return 'Excellent'
          } else if(pourcentage >= 80.0) {
            return 'Très Bien'
          } else if(pourcentage >= 70.0) {
            return 'Bien'
          } else if(pourcentage >= 60.0) {
            return 'Assez Bien'
          } else if(pourcentage >= 50.0) {
            return 'Passable'
          } else {
            return 'Insuffisant'
          }
        }

        // Filtrer les unités qui ont des matières
        const unitesAvecMatieres = data.unites.filter(u => u.matieres && u.matieres.length > 0);
        
        const notesTableBody = unitesAvecMatieres.map(u => {
            // Filtrer les matières qui ont un crédit valide (non null et > 0)
            const matieresAvecCredit = u.matieres?.filter(m => {
                const credit = parseFloat(m?.credit ?? '0');
                return credit > 0; // Exclure les matières avec crédit null, undefined ou 0
            }) || [];

            // Si l'unité n'a plus de matières valides après filtrage, l'exclure complètement
            if (matieresAvecCredit.length === 0) {
                return null; // Retourner null pour cette unité
            }

            // Calculer les totaux pour cette UE
            let creditsUE = 0;
            let totUE = 0;

            matieresAvecCredit.forEach(m => {
                const credit = parseFloat(m?.credit ?? '0');
                creditsUE += credit;
                totalCredit += credit;
                maxNote += 20 * credit;
                const noteSession = etudiant?.notes?.find(n => n.id_matiere === m.id);
                
                // Calculs de base
                const totalSession = (noteSession?.cmi && noteSession?.examen) ? parseFloat(noteSession?.cmi ?? '0') + parseFloat(noteSession?.examen ?? '0') : 0;
                
                // Détermination de la note finale (la meilleure note entre Session et Rattrapage)
                const noteFinale = (noteSession?.rattrapage ?? 0) > totalSession ? (noteSession?.rattrapage ?? 0) : totalSession;
                ncv += noteFinale >= 10 ? credit : 0;
                
                const totalP = noteFinale * credit;
                totUE += totalP;
                totalNote += totalP;
            });

            // Calcul de la moyenne de l'UE
            const moyenneUE = creditsUE > 0 ? totUE / creditsUE : 0;

            // Ligne de synthèse de l'UE (Unité d'Enseignement)
            return [
                // Colonne 1: Designation de l'UE
                {
                    text: u.designation,
                    alignment: 'left',
                    bold: true,
                },
                // Colonne 2: Total Crédits UE
                cellStyle(creditsUE, 'center'),
                // Colonne 3: Moyenne UE avec coloration
                getCellStyleForAverage(moyenneUE, `${moyenneUE.toFixed(2)}/20`, 'center')
            ];
        }).filter(row => row !== null); // Filtrer les unités exclues
        
        // En-tête du bulletin
        // 1. En-tête institutionnel (Utilise la structure la plus stable)
        docDefinition.content.push({
          table: {
            // Largeurs : 55pt pour chaque logo, '*' pour le texte central
            widths: [55, '*', 55], 
            body: [
              [
                // Logo RDC
                logoRDCBase64 ? {
                  image: logoRDCBase64,
                  width: 50,
                  height: 50,
                  alignment: 'center',
                  margin: [0, 5, 0, 0],
                  border: [true, true, false, true]
                } : { 
                  text: "", 
                  alignment: 'center', 
                  style: 'small' 
                },
                // Texte central
                {
                  text: "République Démocratique du Congo\nMinistère de l'Enseignement Supérieur, Universitaire, Recherche Scientique et Innovations\nInstitut Supérieur de Techniques Appliquées de Gombe-Matadi\n\"I.S.T.A/GM à Mbanza-Ngungu\"",
                  alignment: "center",
                  style: 'small',
                  border: [false, true, false, true]
                },
                // Logo ESURSI
                logoESURSIBase64 ? {
                  image: logoESURSIBase64,
                  width: 50,
                  height: 50,
                  alignment: 'center',
                  margin: [0, 5, 0, 0],
                  border: [false, true, true, true]
                } : { 
                  text: "", 
                  alignment: 'center', 
                  style: 'small',
                  border: [false, true, true, true] 
                }
              ]
            ]
          },
          style: 'studentInfo',
          margin: [0, 0, 0, 0] // Ajout d'une marge après l'en-tête
        });
        
        // Calcul pour 14 cases (100 / 14 ≈ 7.14%)
        const caseWidth = `${100 / 14}%`;

        // Créer le tableau de 14 largeurs égales
        const widths14Cases = Array(14).fill(caseWidth); 

        docDefinition.content.push({
          table: { // Tableau Parent (2 colonnes)
            widths: ['10%', '90%'], // 10% pour l'étiquette, 90% pour les 14 cases
            body: [
              [
                // Colonne 1 : Étiquette
                { 
                  text: 'N/ref', 
                  alignment: 'right', 
                  style: 'normal', 
                  border: [true, false, false, false],
                  margin: [0, 4, 0, 0] 
                },
                
                // Colonne 2 : Contient le Tableau Enfant de 14 cases
                {
                  border: [false, false, true, false],
                  table: {
                    // Définir les largeurs du sous-tableau (14 x 7.14% = 100% de la colonne parente)
                    widths: widths14Cases, 
                    body: [
                      // Une seule ligne avec 14 cellules
                      [
                        // Les 14 cellules avec les digits du N/ref généré
                        { text: nRefDigits[0], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[1], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[2], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[3], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[4], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[5], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[6], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[7], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[8], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[9], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[10], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[11], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[12], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                        { text: nRefDigits[13], border: [true, true, true, true], margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
                      ]
                    ]
                  },
                }
              ],              
              [
                {
                  text: `RELEVE DES COTES ${data.promotionInfo.anneeAcademique}`,
                  style: 'studentInfo',
                  alignment: 'center',
                  colSpan: 2
                }
              ]
            ]
          },  
          margin: [0, 0, 0, 0]
        });

        docDefinition.content.push({
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    `MENTION : ${data?.promotionInfo.mention}`,
                    `SECTION : ${data?.promotionInfo.section}`,                    
                    `PROMOTION : ${data?.promotionInfo.classe}`,
                    `DECISION DU JURY : ${totalCredit ? (ncv * 100 / totalCredit >= 75 ? 'ADMIS' : 'NON ADMIS') : 'NON ADMIS'}`,
                  ],
                  style: 'small',
                  alignment: 'left'
                },
                {
                  stack: [
                    `ETUDIANT : ${etudiant?.nom} ${etudiant?.post_nom} ${etudiant?.prenom ? etudiant?.prenom : ''}`,                    
                    `SEXE : ${etudiant?.sexe}`, 
                    `NE(E) A : ${etudiant?.lieu_naissance ? etudiant?.lieu_naissance : 'S/N'}, LE ${etudiant?.date_naissance ? etudiant?.date_naissance : 'S/N'}`,                    
                    `MATRICULE : ${etudiant?.matricule}`,
                  ],
                  style: 'small',
                  alignment: 'left'
                }
              ],
              [
                {
                  text: `SYSTEME : ${data?.promotionInfo.systeme}`,
                  style: 'small',
                  alignment: 'left',
                  border: [true, false, false, false]
                },
                {
                  text: `LICENCE`,
                  style: 'small',
                  alignment: 'right',
                  border: [false, false, true, false]
                }
              ]
            ]
          },
          margin: [0, 0, 0, 0]
        });

        // Header des notes simplifié
        docDefinition.content.push({
            table: {
              // 3 colonnes seulement
              widths: ['60%', '20%', '20%'], 
              body: [
                [
                  { 
                    text: 'UNITE D\'ENSEIGNEMENT', 
                    style: 'tableHeader',
                    alignment: 'center',
                    bold: true
                  },
                  { 
                    text: 'CREDITS', 
                    style: 'tableHeader',
                    alignment: 'center',
                    bold: true
                  },
                  { 
                    text: 'MOYENNE', 
                    style: 'tableHeader',
                    alignment: 'center',
                    bold: true
                  }
                ]
              ]
            },
            margin: [0, 0, 0, 0]
        })
        
        // ce qui corrige l'erreur "Malformed table row".

        docDefinition.content.push({
          table: {
              // 3 colonnes (doivent correspondre au header)
              widths: ['60%', '20%', '20%'], 
              body: notesTableBody
          }
        });

        // Correction de la structure syntheseRow
        const syntheseRow = [
            // LIGNE 1 (3 cellules - la dernière avec rowSpan: 6)
            [
                {
                    text: 'Synthèse des notes',
                    colSpan: 2,
                    alignment: 'left',
                    bold: true,
                    fillColor: '#f5f5f5' 
                },
                {}, // Placeholder pour colSpan: 2
                
            ],
            // LIGNE 2 (2 cellules - la 3ème est couverte par le rowSpan)
            [
                {
                    text: 'Total crédits',
                    alignment: 'left',
                    bold: true,
                },
                cellStyle(totalCredit, 'center'),
                // ❌ Cellule ABSENTE : La 3ème colonne est couverte par le rowSpan
            ],
            // LIGNE 3 (2 cellules - la 3ème est couverte par le rowSpan)
            [
                {
                    text: 'Nombre des crédits validés',
                    alignment: 'left',
                    bold: true,
                },
                cellStyle(ncv, 'center'),
            ],
            // LIGNE 4 (2 cellules - la 3ème est couverte par le rowSpan)
            [
                {
                    text: 'Nombre des crédits non validés',
                    alignment: 'left',
                    bold: true,
                },
                cellStyle(totalCredit - ncv, 'center'),
            ],
            // LIGNE 5 (2 cellules - la 3ème est couverte par le rowSpan)
            [
                {
                    text: 'Pourcentage',
                    alignment: 'left',
                    bold: true,
                },
                cellStyle(maxNote ? ((totalNote / maxNote) * 100).toFixed(2) : 0, 'center'),
            ],
            // LIGNE 6 (2 cellules - la 3ème est couverte par le rowSpan)
            [
                {
                    text: 'Mention',
                    alignment: 'left',
                    bold: true,
                },
                cellStyle(mentionJurry(maxNote ? ((totalNote / maxNote) * 100) : 0), 'center'),
            ],
            [
              {
                text: `Sceau de la section`,
                // 💡 CORRECTION : rowSpan: 6 (pour 6 lignes de synthèse)
                style: { fontSize: 10, alignment: 'center' },
                border: [false, false, false, false],
                margin: [0, 10, 0, 0]
              },
              {
                text: `Fait à Mbanza - Ngungu, le ${new Date().toLocaleDateString()}`,
                // 💡 CORRECTION : rowSpan: 6 (pour 6 lignes de synthèse)
                colSpan: 2,
                style: { fontSize: 10, alignment: 'right' },
                border: [false, false, false, false]
              },
            ],
            [
              {
                text: `Le Secrétaire Général Académique\n\n`,
                style: { fontSize: 10, alignment: 'right' },
                border: [false, false, false, false],
                colSpan: 3,
                margin: [0, 8, 15, 0]
              },
            ],
            [
              {
                text: `\n\n\n\LISONGO SEMETE Gabriel\n\n     Chef de Travaux\n\n`,
                style: { fontSize: 10, alignment: 'right' },
                border: [false, false, false, false],
                colSpan: 3,
                margin: [0, 8, 15, 0]
              },
            ]
        ];

        docDefinition.content.push({
            table: {
                widths: ['30%', '20%', '50%'],
                body: syntheseRow 
            },
            margin: [0, 5, 0, 0]
        });

    });

    return pdfMake.createPdf(docDefinition);
};