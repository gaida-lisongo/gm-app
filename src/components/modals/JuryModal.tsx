'use client';

import { JuryType } from '@/models/Promotion';
import { CloseIcon } from '@/icons';

interface JuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  jurys: JuryType[];
  promotionName: string;
}

export default function JuryModal({ isOpen, onClose, jurys, promotionName }: JuryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[70vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Bureau du Jury - {promotionName}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 bg-red-500 text-white hover:bg-red-600 rounded-full transition-colors duration-200"
            title="Fermer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {jurys.length === 0 ? (
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
