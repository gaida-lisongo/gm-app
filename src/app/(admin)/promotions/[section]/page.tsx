'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PromotionType } from '@/models/Promotion';
import PromotionCard from '@/components/cards/PromotionCard';
import { AlertIcon, BoxIcon } from '@/icons';
import { useMentionsStore } from '@/store/mentionsStore';

export default function PromotionsPage() {
  const params = useParams();
  const sectionId = params.section as string;
  const { mentions } = useMentionsStore()
  
  const [promotions, setPromotions] = useState<PromotionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<any>(null);

  useEffect(() => {
    if (mentions && sectionId) {
      // Chercher la section dans toutes les mentions
      let foundSection = null;
      let foundMention = null;
      
      for (const mention of mentions) {
        const section = mention.sections.find(s => s.id === parseInt(sectionId));
        if (section) {
          foundSection = section;
          foundMention = mention;
          break;
        }
      }
      
      if (foundSection && foundMention) {
        console.log('Section :', foundSection)
        console.log('Mention :', foundMention)
        setCurrentSection({
          ...foundSection,
          mentionName: foundMention.designation
        });
      }
    }
  }, [mentions, sectionId]);

  useEffect(() => {
    const fetchPromotions = async () => {
      if (!sectionId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/classes/${sectionId}`);
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPromotions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        console.error('Erreur lors du chargement des promotions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [sectionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Chargement des promotions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <AlertIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <BoxIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune promotion trouvée
          </h3>
          <p className="text-gray-600">
            Il n'y a pas encore de promotions configurées pour cette section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {currentSection ? currentSection.designation : `Section ${sectionId}`}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {currentSection && (
              <span className="mr-4">
                <span className="font-medium">Mention:</span> {currentSection.mentionName}
              </span>
            )}
            {promotions.length} promotion{promotions.length > 1 ? 's' : ''} trouvée{promotions.length > 1 ? 's' : ''}
          </p>
          {currentSection && (
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium">Chef de section:</span> {currentSection.chef_section} • 
              <span className="font-medium ml-2">Secrétaire:</span> {currentSection.sec_section}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {currentSection && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {currentSection.designation}
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ID: {sectionId}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promotion) => (
          <PromotionCard 
            key={promotion.id} 
            promotion={promotion} 
            mention={currentSection?.mentionName} 
          />
        ))}
      </div>
    </div>
  );
}