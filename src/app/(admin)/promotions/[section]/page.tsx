"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type {
  InscritType,
  JuryType,
  PromotionType,
  UniteType,
} from "@/models/Promotion";
import { generateBulletinsPDF } from "@/utils/pdfGenerator";

type PromotionOverviewResponse = {
  promotion: PromotionType;
  years: Array<{ id: number; annee_acad: string }>;
  selectedYearId: number | null;
  unites: UniteType[];
};

type PromotionYearDetailsResponse = {
  promotion: PromotionType;
  year: { id: number; annee_acad: string } | null;
  jurys: JuryType[];
  unites: UniteType[];
  etudiants: InscritType[];
};

export default function PromotionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const promotionId = params.section as string;
  const yearParam = searchParams.get("annee");

  const [overview, setOverview] = useState<PromotionOverviewResponse | null>(null);
  const [details, setDetails] = useState<PromotionYearDetailsResponse | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoadingOverview(true);
        setError(null);

        const query = yearParam ? `?annee=${yearParam}` : "";
        const response = await fetch(`/api/promotions/${promotionId}${query}`);

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setOverview(result);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error ? fetchError.message : "Erreur inconnue"
        );
      } finally {
        setLoadingOverview(false);
      }
    };

    fetchOverview();
  }, [promotionId, yearParam]);

  useEffect(() => {
    const yearId = yearParam ? Number.parseInt(yearParam, 10) : NaN;

    if (Number.isNaN(yearId)) {
      setDetails(null);
      setSelectedIds([]);
      return;
    }

    const fetchYearDetails = async () => {
      try {
        setLoadingDetails(true);
        const response = await fetch(`/api/promotions/${promotionId}/${yearId}`);

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setDetails(result);
        setSelectedIds([]);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error ? fetchError.message : "Erreur inconnue"
        );
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchYearDetails();
  }, [promotionId, yearParam]);

  const filteredEtudiants = useMemo(() => {
    const source = details?.etudiants ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return source;
    }

    return source.filter((etudiant) =>
      [etudiant.nom, etudiant.post_nom, etudiant.prenom, etudiant.matricule]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch))
    );
  }, [details?.etudiants, searchTerm]);

  const selectedEtudiants = useMemo(
    () =>
      (details?.etudiants ?? []).filter((etudiant) =>
        selectedIds.includes(etudiant.id_etudiant)
      ),
    [details?.etudiants, selectedIds]
  );

  const activeJury = details?.jurys[0] ?? null;

  const setActiveYear = (anneeId: number) => {
    router.push(`/promotions/${promotionId}?annee=${anneeId}`);
  };

  const clearActiveYear = () => {
    router.push(`/promotions/${promotionId}`);
  };

  const toggleStudent = (studentId: number) => {
    setSelectedIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const toggleVisibleStudents = () => {
    const visibleIds = filteredEtudiants.map((etudiant) => etudiant.id_etudiant);
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) => {
      if (allSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const generatePdfFor = async (etudiants: InscritType[]) => {
    if (!details || !activeJury || etudiants.length === 0) {
      alert("Aucun etudiant disponible pour generer le releve.");
      return;
    }

    setIsGenerating(true);

    try {
      const pdfDoc = await generateBulletinsPDF({
        etudiants,
        unites: details.unites,
        promotionInfo: {
          classe: details.promotion.classe,
          anneeAcademique: details.year?.annee_acad ?? activeJury.annee_acad,
          section: activeJury.filiere,
          mention: details.promotion.mention_name ?? "",
          systeme: details.promotion.systeme,
          orientation: details.promotion.orientation ?? activeJury.designation,
          president: activeJury.president,
        },
      });

      const suffix =
        etudiants.length === 1
          ? `${etudiants[0].matricule}`
          : `${etudiants.length}_etudiants`;

      pdfDoc.download(`Releves_${details.promotion.classe}_${suffix}.pdf`);
    } catch (generationError) {
      console.error("Erreur lors de la generation du PDF:", generationError);
      alert("Erreur lors de la generation du releve.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingOverview) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-sm text-gray-600">Chargement de la promotion...</p>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h1 className="text-lg font-semibold">Erreur de chargement</h1>
        <p className="mt-2 text-sm">{error || "Promotion introuvable."}</p>
      </div>
    );
  }

  const allVisibleSelected =
    filteredEtudiants.length > 0 &&
    filteredEtudiants.every((etudiant) => selectedIds.includes(etudiant.id_etudiant));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            ← Retour a l accueil
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {overview.promotion.classe}
          </h1>
          <p className="text-sm text-gray-600">
            Mention: {overview.promotion.mention_name || "N/A"} · Section:{" "}
            {overview.promotion.section_name || "N/A"} · Systeme:{" "}
            {overview.promotion.systeme}
          </p>
          {overview.promotion.orientation && (
            <p className="text-sm text-gray-600">
              Orientation: {overview.promotion.orientation}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-700 shadow-theme-xs">
          <p>
            <span className="font-semibold text-gray-900">
              {overview.years.length}
            </span>{" "}
            annee{overview.years.length > 1 ? "s" : ""} academique
            {overview.years.length > 1 ? "s" : ""}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-gray-900">
              {overview.unites.length}
            </span>{" "}
            unite{overview.unites.length > 1 ? "s" : ""} chargee
            {overview.unites.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-theme-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Annees academiques
            </h2>
            <p className="text-sm text-gray-600">
              Selectionnez une annee pour afficher le bureau du jury, les
              etudiants inscrits et le palmares.
            </p>
          </div>
          {yearParam && (
            <button
              onClick={clearActiveYear}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Revenir a l apercu de la promotion
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {overview.years.map((year) => {
            const isActive = yearParam === String(year.id);

            return (
              <button
                key={year.id}
                onClick={() => setActiveYear(year.id)}
                className={`rounded-2xl border p-5 text-left transition-colors duration-200 ${
                  isActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/60"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Annee academique
                </p>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  {year.annee_acad}
                </h3>
                <p className="mt-3 text-sm text-gray-600">
                  Ouvrir le jury, les inscrits et la generation de releves.
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-theme-xs">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Structure du programme
            </h2>
            <p className="text-sm text-gray-600">
              Unites d enseignement chargees pour{" "}
              {overview.selectedYearId
                ? `l annee ${overview.years.find((year) => year.id === overview.selectedYearId)?.annee_acad ?? ""}`
                : "cette promotion"}
              .
            </p>
          </div>
          {overview.selectedYearId && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Vue programme basee sur l annee selectionnee
            </span>
          )}
        </div>

        {overview.unites.length === 0 ? (
          <p className="mt-5 text-sm text-gray-600">
            Aucune unite d enseignement disponible pour cette promotion.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {overview.unites.map((unite) => (
              <div
                key={unite.id}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {unite.designation}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Code: {unite.code}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    {unite.matieres?.length || 0} matiere
                    {(unite.matieres?.length || 0) > 1 ? "s" : ""}
                  </span>
                </div>

                {unite.objectifs && (
                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    <span className="font-semibold text-gray-900">Objectifs:</span>{" "}
                    {unite.objectifs}
                  </p>
                )}

                {unite.competences && (
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    <span className="font-semibold text-gray-900">
                      Competences:
                    </span>{" "}
                    {unite.competences}
                  </p>
                )}

                {unite.matieres && unite.matieres.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {unite.matieres.map((matiere) => (
                      <span
                        key={matiere.id}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700"
                      >
                        {matiere.designation} · {matiere.credit} cr
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {yearParam && (
        <section className="space-y-6 rounded-[24px] border border-gray-200 bg-white p-6 shadow-theme-xs">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bureau du jury et palmares
              </h2>
              <p className="text-sm text-gray-600">
                {details?.year?.annee_acad || "Annee academique selectionnee"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => generatePdfFor(details?.etudiants ?? [])}
                disabled={!details || (details.etudiants?.length ?? 0) === 0 || isGenerating}
                className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
              >
                Imprimer toute la classe
              </button>
              <button
                onClick={() => generatePdfFor(selectedEtudiants)}
                disabled={selectedEtudiants.length === 0 || isGenerating}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Imprimer la selection
              </button>
            </div>
          </div>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
                <p className="text-sm text-gray-600">
                  Chargement du jury et des etudiants...
                </p>
              </div>
            </div>
          ) : details ? (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {details.jurys.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 xl:col-span-3">
                    Aucun bureau du jury configure pour cette annee academique.
                  </div>
                ) : (
                  details.jurys.map((jury) => (
                    <div
                      key={jury.id}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                        Bureau du jury
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">
                        {jury.designation}
                      </h3>
                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-semibold text-gray-900">
                            Filiere:
                          </span>{" "}
                          {jury.filiere}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-900">
                            President:
                          </span>{" "}
                          {jury.president}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-900">
                            Secretaire:
                          </span>{" "}
                          {jury.secretaire}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-900">
                            Membre:
                          </span>{" "}
                          {jury.membre}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Rechercher un etudiant par nom, prenom ou matricule..."
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-blue-400 focus:outline-none"
                    />
                    <button
                      onClick={toggleVisibleStudents}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {allVisibleSelected
                        ? "Deselectionner la vue"
                        : "Selectionner la vue"}
                    </button>
                  </div>

                  <div className="text-sm text-gray-600">
                    {filteredEtudiants.length} etudiant
                    {filteredEtudiants.length > 1 ? "s" : ""} · {selectedEtudiants.length} selectionne
                    {selectedEtudiants.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {filteredEtudiants.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
                  Aucun etudiant trouve pour cette recherche.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Selection
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Etudiant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Matricule
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Notes
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Exetat
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEtudiants.map((etudiant) => {
                        const isSelected = selectedIds.includes(etudiant.id_etudiant);

                        return (
                          <tr key={etudiant.id_etudiant} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleStudent(etudiant.id_etudiant)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {etudiant.nom} {etudiant.post_nom} {etudiant.prenom}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {etudiant.sexe} · {etudiant.telephone}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">
                              {etudiant.matricule}
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                {etudiant.notes?.length || 0} note
                                {(etudiant.notes?.length || 0) > 1 ? "s" : ""}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">
                              {etudiant.pourcentage_exetat}%
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => generatePdfFor([etudiant])}
                                disabled={isGenerating}
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Imprimer
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
              Aucun detail disponible pour cette annee academique.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
