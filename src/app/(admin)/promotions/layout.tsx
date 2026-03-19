import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Promotions | Dashboard Admin',
  description: 'Gestion des promotions, classes et programmes académiques',
  keywords: ['promotions', 'classes', 'programmes', 'académique', 'gestion'],
};

export default function PromotionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Promotions</h1>
        <p className="mt-2 text-sm text-gray-600">
          Visualisez et gérez les promotions, leurs unités d'enseignement et les jurys associés.
        </p>
      </div>
      {children}
    </div>
  );
}