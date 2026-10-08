"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const TEER_EN: Record<string, string> = {
  "0": "Management",
  "1": "University degree",
  "2": "College or apprenticeship, 2+ years",
  "3": "College or apprenticeship, under 2 years",
  "4": "High school plus job training",
  "5": "Short on-the-job training",
};

const TEER_FR: Record<string, string> = {
  "0": "Gestion",
  "1": "Diplôme universitaire",
  "2": "Collégial ou apprentissage, 2 ans et plus",
  "3": "Collégial ou apprentissage, moins de 2 ans",
  "4": "Secondaire plus formation en emploi",
  "5": "Courte formation en emploi",
};

const en = {
  teerLabels: TEER_EN,
  banner: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    badge: "Open source",
  },
  nav: { explorer: "Explorer", showcase: "Showcase", developers: "Developers", data: "Data", back: "All projects" },
  hero: {
    kicker: "Nshipyard Canada · Project 07",
    title: "Every civic code, resolved to its meaning.",
    sub: "Toronto's civic datasets speak in codes: a 5-digit NOC number for an occupation, a 3-digit infraction for a parking ticket, a GSIN string for a procurement line. This project publishes the three reference tables that decode them: 516 occupations from the National Occupational Classification 2021, 195 Toronto parking infraction codes with real ticket counts, and 4,909 federal procurement codes.",
    cta1: "Search the codebooks",
    cta2: "Read the methodology",
  },
  stats: [
    { value: "516", label: "NOC 2021 occupations, English and French titles, TEER category on each" },
    { value: "195", label: "Toronto parking infraction codes, each with tickets, fines, and average fine" },
    { value: "4,909", label: "GSIN procurement codes with English and French descriptions" },
    { value: "3", label: "reference tables, one search box, REST API and MCP tools over all of them" },
  ],
  explorer: {
    kicker: "Explorer",
    title: "One search across all three codebooks.",
    search: "Search by code or keyword…",
    all: "All tables",
    noc: "NOC occupations",
    infractions: "Parking infractions",
    procurement: "Procurement (GSIN)",
    results: "results",
    noResult: "No code matches.",
    empty: "Type a code like 21211 or 3, or a keyword like nurse, parking, or relocation, to see it resolved.",
    code: "Code",
    titleLabel: "Title",
    detail: "Detail",
    teer: "TEER",
    tickets: "Tickets",
    totalFines: "Total fines",
    avgFine: "Average fine",
    status: "Status",
    commodityType: "Commodity type",
    source: "Source",
    sourceNoc: "Statistics Canada, NOC 2021 V1.0, verbatim titles",
    sourceInf: "City of Toronto open data via the parking-tickets project",
    sourceGsin: "PSPC, GSIN list, verbatim descriptions",
  },
  showcase: {
    kicker: "Showcase",
    title: "Raw codes in, human meaning out.",
    body: "A codebook earns its keep when it resolves something. Below, three real codes from real Toronto datasets, before and after resolution. The ticket counts come from 6,454,695 real parking tickets issued in 2023-2025.",
    before: "Before",
    after: "After",
    demos: [
      {
        raw: "21211",
        rawLabel: "NOC 2021 unit group",
        resolved: "Data scientists",
        resolvedFr: "Scientifiques des données",
        extra: "TEER 1 · Natural and applied sciences",
      },
      {
        raw: "3",
        rawLabel: "Toronto parking infraction",
        resolved: "PARK ON PRIVATE PROPERTY",
        resolvedFr: "",
        extra: "1,085,167 tickets · $64.7M in fines · $59.64 average",
      },
      {
        raw: "V502A",
        rawLabel: "GSIN procurement code",
        resolved: "Relocation Services",
        resolvedFr: "Services de réinstallation",
        extra: "Service · Active",
      },
    ],
    teerTitle: "516 occupations by TEER",
    teerBody: "TEER, the Training, Education, Experience and Responsibility scale that Statistics Canada and Employment and Social Development Canada attach to every NOC 2021 occupation, runs from 0 (management) to 5 (short on-the-job training). Most Toronto-relevant licensed work sits in TEER 2-4.",
  },
  developers: {
    kicker: "For developers",
    title: "Query it from code, or from an agent.",
    body: "Three consumption paths, same reference data. REST for applications, OpenAPI for integration, MCP tools over streamable HTTP for AI agents.",
    endpoints: "Endpoints",
    tryIt: "Try it",
    openapi: "OpenAPI spec",
  },
  mcp: {
    kicker: "Connect your agent",
    title: "Put this data to work inside your AI tools.",
    body: "Pick your harness, copy the prompt, send it to your agent. Your agent runs the setup itself.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Other" },
    cardTitle: "Copy and send this to {tab}",
    copy: "Copy",
    copied: "Copied",
    chatgptNote: "ChatGPT connects through the documented REST API rather than MCP directly.",
    pChatgpt:
      "I want to use the {displayName} through its API.\n- OpenAPI spec: {origin}/api/openapi.json\n- REST base: {origin}/api/v1\nFirst tell me in two sentences what this API offers, then {exampleLower}, and show me the result.",
    pClaude:
      "In Claude (claude.ai), open Settings, then Connectors, and add a custom connector:\n- Name: {displayName}\n- URL: {origin}/mcp\nThen list the available tools, {exampleLower}, and show me the result.",
    pClaudeCode:
      "Set up the {displayName} MCP server so I can query it from here.\n1. Run: claude mcp add --transport http {slug} {origin}/mcp\n2. Run `claude mcp list` to confirm it connected.\n3. {example}, and show me the result.",
    pCli:
      "# MCP endpoint (streamable HTTP)\n{origin}/mcp\n\n# List the available tools\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Everything else",
    otherBody: "Any harness that speaks MCP over streamable HTTP, or plain REST.",
    mcpEndpoint: "MCP endpoint",
    openapiSpec: "OpenAPI spec",
    restBase: "REST base",
  },
  downloads: {
    kicker: "Data",
    title: "Take the files.",
    body: "Versioned releases, MIT licensed. CSV for spreadsheets and joins.",
    files: [
      { name: "noc_2021.csv", desc: "516 NOC 2021 unit groups: code, EN/FR titles, TEER, broad category" },
      { name: "infraction_codebook.csv", desc: "195 Toronto parking infraction codes with ticket and fine totals" },
      { name: "procurement_codes.csv", desc: "4,909 GSIN codes: EN/FR descriptions, status, commodity type" },
    ],
    download: "Download",
    methodology: "Methodology",
    methodologyBody:
      "NOC titles are verbatim from Statistics Canada (EN and FR files, retrieved 2026-10-08); TEER is derived from the second digit of the 5-digit code, per StatCan's documented structure. Infraction descriptions are verbatim from the City of Toronto parking tickets file; counts and fines computed from 6,454,695 real tickets (2023-2025) in the sibling project. GSIN descriptions are verbatim from Public Services and Procurement Canada (retrieved 2026-10-08); the commodity type (Goods/Service/Construction) is derived from the code pattern per the federal reporting guide. Toronto publishes no commodity-code table in open data, so the federal GSIN is the documented fallback for procurement.",
  },
  footer: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    sources: "Sources: Statistics Canada (NOC 2021 V1.0), City of Toronto Open Data (parking tickets), Public Services and Procurement Canada (GSIN).",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  teerLabels: TEER_FR,
  banner: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    badge: "Code source ouvert",
  },
  nav: { explorer: "Explorateur", showcase: "Vitrine", developers: "Développeurs", data: "Données", back: "Tous les projets" },
  hero: {
    kicker: "Nshipyard Canada · Projet 07",
    title: "Chaque code civique, résolu à son sens.",
    sub: "Les données civiques de Toronto parlent en codes : un numéro CNP à 5 chiffres pour une profession, une infraction à 3 chiffres pour un stationnement, un code GSIN pour une ligne d'approvisionnement. Ce projet publie les trois tables de référence qui les décodent : 516 professions de la Classification nationale des professions 2021, 195 codes d'infraction de stationnement avec les nombres réels de contraventions, et 4 909 codes fédéraux d'approvisionnement.",
    cta1: "Fouiller les tables",
    cta2: "Lire la méthodologie",
  },
  stats: [
    { value: "516", label: "professions CNP 2021, titres français et anglais, catégorie FEER sur chacune" },
    { value: "195", label: "codes d'infraction de stationnement, chacun avec contraventions, amendes et amende moyenne" },
    { value: "4 909", label: "codes d'approvisionnement GSIN avec descriptions en français et en anglais" },
    { value: "3", label: "tables de référence, une recherche, API REST et outils MCP sur l'ensemble" },
  ],
  explorer: {
    kicker: "Explorateur",
    title: "Une recherche dans les trois tables.",
    search: "Rechercher par code ou mot-clé…",
    all: "Toutes les tables",
    noc: "Professions CNP",
    infractions: "Infractions de stationnement",
    procurement: "Approvisionnement (GSIN)",
    results: "résultats",
    noResult: "Aucun code ne correspond.",
    empty: "Tapez un code comme 21211 ou 3, ou un mot-clé comme infirmier, stationnement ou déménagement, pour le voir résolu.",
    code: "Code",
    titleLabel: "Titre",
    detail: "Détail",
    teer: "FEER",
    tickets: "Contraventions",
    totalFines: "Amendes totales",
    avgFine: "Amende moyenne",
    status: "Statut",
    commodityType: "Type de produit",
    source: "Source",
    sourceNoc: "Statistique Canada, CNP 2021 v1.0, titres textuels",
    sourceInf: "Données ouvertes de la Ville de Toronto via le projet contraventions",
    sourceGsin: "SPAC, liste GSIN, descriptions textuelles",
  },
  showcase: {
    kicker: "Vitrine",
    title: "Codes bruts en entrée, sens humain en sortie.",
    body: "Une table de codes prouve sa valeur quand elle résout quelque chose. Ci-dessous, trois vrais codes de vrais jeux de données torontois, avant et après résolution. Les nombres de contraventions viennent de 6 454 695 vraies contraventions de stationnement émises en 2023-2025.",
    before: "Avant",
    after: "Après",
    demos: [
      {
        raw: "21211",
        rawLabel: "Groupe de base CNP 2021",
        resolved: "Scientifiques des données",
        resolvedFr: "Data scientists",
        extra: "FEER 1 · Sciences naturelles et appliquées",
      },
      {
        raw: "3",
        rawLabel: "Infraction de stationnement de Toronto",
        resolved: "PARK ON PRIVATE PROPERTY",
        resolvedFr: "",
        extra: "1 085 167 contraventions · 64,7 M$ d'amendes · 59,64 $ en moyenne",
      },
      {
        raw: "V502A",
        rawLabel: "Code d'approvisionnement GSIN",
        resolved: "Services de réinstallation",
        resolvedFr: "Relocation Services",
        extra: "Service · Actif",
      },
    ],
    teerTitle: "516 professions par FEER",
    teerBody: "La FEER, l'échelle de formation, études, expérience et responsabilités que Statistique Canada et Emploi et Développement social Canada attachent à chaque profession CNP 2021, va de 0 (gestion) à 5 (courte formation en emploi). La plupart des emplois visés par les permis torontois se situent aux FEER 2 à 4.",
  },
  developers: {
    kicker: "Pour les développeurs",
    title: "Interrogez-la depuis du code, ou depuis un agent.",
    body: "Trois façons de consommer les mêmes données de référence. REST pour les applications, OpenAPI pour l'intégration, outils MCP en HTTP continu pour les agents IA.",
    endpoints: "Points de terminaison",
    tryIt: "Essayer",
    openapi: "Spécification OpenAPI",
  },
  mcp: {
    kicker: "Connectez votre agent",
    title: "Exploitez ces données dans vos outils d'IA.",
    body: "Choisissez votre plateforme, copiez l'invite, envoyez-la à votre agent. Votre agent exécute la configuration lui-même.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Autre" },
    cardTitle: "Copiez et envoyez ceci à {tab}",
    copy: "Copier",
    copied: "Copié",
    chatgptNote: "ChatGPT se connecte via l'API REST documentée plutôt que directement en MCP.",
    pChatgpt:
      "Je veux utiliser {displayName} via son API.\n- Spécification OpenAPI : {origin}/api/openapi.json\n- Base REST : {origin}/api/v1\nD'abord, dis-moi en deux phrases ce que cette API offre, puis {exampleLower}, et montre-moi le résultat.",
    pClaude:
      "Dans Claude (claude.ai), ouvre les paramètres, puis Connecteurs, et ajoute un connecteur personnalisé :\n- Nom : {displayName}\n- URL : {origin}/mcp\nEnsuite, liste les outils disponibles, {exampleLower}, et montre-moi le résultat.",
    pClaudeCode:
      "Configure le serveur MCP {displayName} pour que je puisse l'interroger d'ici.\n1. Exécute : claude mcp add --transport http {slug} {origin}/mcp\n2. Exécute `claude mcp list` pour confirmer la connexion.\n3. {example}, et montre-moi le résultat.",
    pCli:
      "# Point de terminaison MCP (HTTP continu)\n{origin}/mcp\n\n# Lister les outils disponibles\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Tout le reste",
    otherBody: "Toute plateforme qui parle MCP en HTTP continu, ou REST tout court.",
    mcpEndpoint: "Point de terminaison MCP",
    openapiSpec: "Spécification OpenAPI",
    restBase: "Base REST",
  },
  downloads: {
    kicker: "Données",
    title: "Prenez les fichiers.",
    body: "Versions numérotées, licence MIT. CSV pour les tableurs et les jointures.",
    files: [
      { name: "noc_2021.csv", desc: "516 groupes de base CNP 2021 : code, titres FR/EN, FEER, grande catégorie" },
      { name: "infraction_codebook.csv", desc: "195 codes d'infraction de stationnement avec totaux de contraventions et d'amendes" },
      { name: "procurement_codes.csv", desc: "4 909 codes GSIN : descriptions FR/EN, statut, type de produit" },
    ],
    download: "Télécharger",
    methodology: "Méthodologie",
    methodologyBody:
      "Les titres CNP sont textuels de Statistique Canada (fichiers FR et EN, récupérés le 2026-10-08); la FEER est dérivée du deuxième chiffre du code à 5 chiffres, selon la structure documentée par StatCan. Les descriptions d'infraction sont textuelles du fichier des contraventions de la Ville de Toronto; les nombres et amendes sont calculés à partir de 6 454 695 vraies contraventions (2023-2025) dans le projet jumeau. Les descriptions GSIN sont textuelles de Services publics et Approvisionnement Canada (récupérées le 2026-10-08); le type de produit (bien/service/construction) est dérivé du motif du code selon le guide fédéral. Toronto ne publie aucune table de codes de produits en données ouvertes; le GSIN fédéral est donc la solution de rechange documentée pour l'approvisionnement.",
  },
  footer: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    sources: "Sources : Statistique Canada (CNP 2021 v1.0), Données ouvertes de la Ville de Toronto (contraventions), Services publics et Approvisionnement Canada (GSIN).",
  },
};

const dicts: Record<Lang, Dict> = { en, fr };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
