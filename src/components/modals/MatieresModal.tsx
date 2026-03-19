'use client';

import { UniteType } from '@/models/Promotion';
import { CloseIcon } from '@/icons';

interface MatieresModalProps {
  isOpen: boolean;
  onClose: () => void;
  unites: UniteType[];
  promotionName: string;
}

export default function MatieresModal({ isOpen, onClose, unites, promotionName }: MatieresModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[70vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Programme d'Études - {promotionName}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 bg-red-500 text-white hover:bg-red-600 rounded-full transition-colors duration-200"
            title="Fermer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {unites.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucune unité d'enseignement configurée pour cette promotion.
          </p>
        ) : (
          <div className="space-y-6">
            {unites.map((unite, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {unite.designation}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <p><span className="font-medium">Code:</span> {unite.code}</p>
                    <p><span className="font-medium">ID Promotion:</span> {unite.id_promotion}</p>
                    <p><span className="font-medium">ID:</span> {unite.id}</p>
                  </div>
                  
                  {unite.objectifs && (
                    <div className="mt-3">
                      <h4 className="font-medium text-gray-900 mb-1">Objectifs:</h4>
                      <p className="text-sm text-gray-600">{unite.objectifs}</p>
                    </div>
                  )}
                  
                  {unite.competences && (
                    <div className="mt-3">
                      <h4 className="font-medium text-gray-900 mb-1">Compétences:</h4>
                      <p className="text-sm text-gray-600">{unite.competences}</p>
                    </div>
                  )}
                </div>

                {unite.matieres && unite.matieres.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Matières ({unite.matieres.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {unite.matieres.map((matiere, mIndex) => (
                        <div key={mIndex} className="bg-gray-50 rounded-lg p-3">
                          <h5 className="font-medium text-gray-900 text-sm mb-2">
                            {matiere.designation}
                          </h5>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p><span className="font-medium">Code:</span> {matiere.code}</p>
                            <p><span className="font-medium">Crédits:</span> {matiere.credit}</p>
                            <p><span className="font-medium">Semestre:</span> {matiere.semestre}</p>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                matiere.statut === 'Obligatoire' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {matiere.statut}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
