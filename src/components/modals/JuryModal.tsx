'use client';

import { JuryType, InscritType, UniteType } from '@/models/Promotion';
import { CloseIcon, UserIcon, ChevronLeftIcon, EyeIcon } from '@/icons';
import { useState } from 'react';
import { generateBulletinsPDF } from '@/utils/pdfGenerator';

interface JuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  jurys: JuryType[];
  unites: UniteType[];
  promotionName: string;
  mentionName: string;
  systeme: string;
  orientation: string;
}

export default function JuryModal({ isOpen, onClose, unites, jurys, promotionName, mentionName, orientation, systeme }: JuryModalProps) {
  const [currentView, setCurrentView] = useState<'jurys' | 'etudiants'>('jurys');
  const [selectedJury, setSelectedJury] = useState<JuryType | null>(null);
  const [etudiants, setEtudiants] = useState<InscritType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const fetchEtudiants = async (jury: JuryType) => {
    try {
      setLoading(true);
      const request = await fetch(`/api/classes/${jury.id_niveau}/${jury.id_annee}`);
    
      if (!request.ok) throw new Error(`Erreur ${request.status}: ${request.statusText}`);

      const result = await request.json();
      setEtudiants(result);
      setSelectedJury(jury);
      setCurrentView('etudiants');
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants inscrit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToJurys = () => {
    setCurrentView('jurys');
    setSelectedJury(null);
    setEtudiants([]);
    setSearchTerm('');
  };

  const filteredEtudiants = etudiants.filter(etudiant =>
    etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etudiant.post_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etudiant.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateBulletins = async () => {
    if (!selectedJury || etudiants.length === 0) {
      alert('Aucun étudiant disponible pour générer les bulletins.');
      return;
    }

    const bulletinData = {
      etudiants: filteredEtudiants,
      unites: unites,
      promotionInfo: {
        classe: promotionName,
        anneeAcademique: selectedJury.annee_acad,
        section: selectedJury.filiere,
        systeme: systeme,
        president: selectedJury.president,
        orientation: selectedJury?.designation,
        mention: mentionName // Extraire la mention du nom de la promotion
      }
    };

    try {
      const pdfDoc = await generateBulletinsPDF(bulletinData);
      pdfDoc.download(`Bulletins_${selectedJury.designation}_${selectedJury.annee_acad}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération des bulletins PDF.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[70vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            {currentView === 'etudiants' && (
              <button
                onClick={handleReturnToJurys}
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Retour aux jurys"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {currentView === 'jurys' 
                ? `Bureau du Jury - ${promotionName}`
                : `Étudiants - ${selectedJury?.designation} (${selectedJury?.annee_acad})`
              }
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 bg-red-500 text-white hover:bg-red-600 rounded-full transition-colors duration-200"
            title="Fermer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 text-sm">Chargement des étudiants...</p>
            </div>
          </div>
        ) : currentView === 'jurys' ? (
          // Vue des jurys
          jurys.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun jury configuré pour cette promotion.
            </p>
          ) : (
            <div className="space-y-4">
              {jurys.map((jury, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{jury.designation}</h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Filière:</span> {jury.filiere}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Année académique:</span> {jury.annee_acad}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Président
                        </span>
                        <span className="text-sm text-gray-900">{jury.president}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Secrétaire
                        </span>
                        <span className="text-sm text-gray-900">{jury.secretaire}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Membre
                        </span>
                        <span className="text-sm text-gray-900">{jury.membre}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => fetchEtudiants(jury)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      Voir Résultats
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Vue des étudiants
          <div className="space-y-4">
            {/* Barre de recherche */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un étudiant (nom, prénom, matricule...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-gray-600">
                {filteredEtudiants.length} étudiant{filteredEtudiants.length > 1 ? 's' : ''}
              </div>
              <button
                onClick={handleGenerateBulletins}
                className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
                disabled={filteredEtudiants.length === 0}
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Générer Bulletins PDF
              </button>
            </div>

            {/* Tableau des étudiants */}
            {filteredEtudiants.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchTerm ? 'Aucun étudiant trouvé pour cette recherche.' : 'Aucun étudiant inscrit pour cette promotion.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exetat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEtudiants.map((etudiant, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {etudiant.nom} {etudiant.post_nom} {etudiant.prenom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {etudiant.sexe} • {etudiant.telephone}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {etudiant.matricule}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {etudiant.notes?.length || 0} matière{(etudiant.notes?.length || 0) > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {etudiant.pourcentage_exetat}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
