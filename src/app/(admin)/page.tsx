"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { PromotionType } from "@/models/Promotion";

type PromotionCard = PromotionType & {
  section_name?: string;
  mention_name?: string;
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const sectionFilter = searchParams.get("section");
  const [promotions, setPromotions] = useState<PromotionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/promotions");

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setPromotions(data);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error ? fetchError.message : "Erreur inconnue"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const filteredPromotions = useMemo(() => {
    if (!sectionFilter) {
      return promotions;
    }

    const sectionId = Number.parseInt(sectionFilter, 10);
    if (Number.isNaN(sectionId)) {
      return promotions;
    }

    return promotions.filter((promotion) => promotion.id_section === sectionId);
  }, [promotions, sectionFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-sm text-gray-600">Chargement des promotions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h1 className="text-lg font-semibold">Erreur de chargement</h1>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-linear-to-br from-white via-slate-50 to-blue-50 p-8 shadow-theme-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
              Workflow Releve de Cotes
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Acces direct aux promotions et aux annees academiques
            </h1>
            <p className="text-sm leading-6 text-gray-600 sm:text-base">
              Selectionnez une promotion pour consulter son programme, ouvrir une
              annee academique et generer les releves de cotes de toute la
              classe, d un groupe d etudiants ou d un seul etudiant.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white/80 px-4 py-3 text-sm text-gray-700 shadow-theme-xs">
            <span className="font-semibold text-gray-900">
              {filteredPromotions.length}
            </span>{" "}
            promotion{filteredPromotions.length > 1 ? "s" : ""} disponible
            {filteredPromotions.length > 1 ? "s" : ""}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Liste des promotions
            </h2>
            <p className="text-sm text-gray-600">
              Chaque carte ouvre la promotion, ses annees academiques et sa
              structure de programme.
            </p>
          </div>
          {sectionFilter && (
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retirer le filtre de section
            </Link>
          )}
        </div>

        {filteredPromotions.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            Aucune promotion trouvee pour ce filtre.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPromotions.map((promotion) => (
              <Link
                key={promotion.id}
                href={`/promotions/${promotion.id}`}
                className="group rounded-[24px] border border-gray-200 bg-white p-6 shadow-theme-xs transition-transform duration-200 hover:-translate-y-1 hover:shadow-theme-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                      {promotion.mention_name || "Mention"}
                    </p>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {promotion.classe}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Section: {promotion.section_name || "N/A"}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    ID {promotion.id}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Systeme
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {promotion.systeme}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Orientation
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {promotion.orientation || "Aucune"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 inline-flex items-center text-sm font-medium text-blue-700">
                  Ouvrir la promotion
                  <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
