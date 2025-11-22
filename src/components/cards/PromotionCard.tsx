'use client';

import { PromotionType } from '@/models/Promotion';
import { UserIcon, DocsIcon, EyeIcon } from '@/icons';
import { useState } from 'react';
import JuryModal from '@/components/modals/JuryModal';
import MatieresModal from '@/components/modals/MatieresModal';

interface PromotionCardProps {
  promotion: PromotionType;
}

export default function PromotionCard({ promotion }: PromotionCardProps) {
  const [showJuryModal, setShowJuryModal] = useState(false);
  const [showMatieresModal, setShowMatieresModal] = useState(false);

  const unitesCount = promotion.unites?.length || 0;
  const matieresCount = promotion.unites?.reduce((total, unite) => {
    return total + (unite.matieres?.length || 0);
  }, 0) || 0;
  const jurysCount = promotion.jurys?.length || 0;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {promotion.classe}
            </h3>
            <p className="text-sm text-gray-600">
              Système: <span className="font-medium">{promotion.systeme}</span>
            </p>
            {promotion.orientation && (
              <p className="text-sm text-gray-600 mt-1">
                Orientation: <span className="font-medium">{promotion.orientation}</span>
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ID: {promotion.id}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
              <DocsIcon className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{unitesCount}</p>
              <p className="text-xs text-gray-600">Unités</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
              <DocsIcon className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{matieresCount}</p>
              <p className="text-xs text-gray-600">Matières</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
              <UserIcon className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{jurysCount}</p>
              <p className="text-xs text-gray-600">Jurys</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowMatieresModal(true)}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            Voir Matières
          </button>
          
          <button
            onClick={() => setShowJuryModal(true)}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Voir Jury
          </button>
        </div>
      </div>

      {/* Modals */}
      <JuryModal
        isOpen={showJuryModal}
        onClose={() => setShowJuryModal(false)}
        jurys={promotion.jurys || []}
        promotionName={promotion.classe}
      />
      
      <MatieresModal
        isOpen={showMatieresModal}
        onClose={() => setShowMatieresModal(false)}
        unites={promotion.unites || []}
        promotionName={promotion.classe}
      />
    </>
  );
}
