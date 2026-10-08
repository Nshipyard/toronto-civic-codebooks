#!/usr/bin/env python3
"""Build the three civic codebook tables from authoritative sources.

Sources (retrieved 2026-10-08):
- NOC 2021 V1.0 classification structure, Statistics Canada (EN + FR CSVs)
- Toronto parking infraction codebook from the sibling toronto-parking-tickets-geocoded project
- GSIN codes CSV, Public Services and Procurement Canada (open.canada.ca)
"""
import csv, json, os, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")
OUT = os.path.join(ROOT, "data")
os.makedirs(OUT, exist_ok=True)

def read_csv(path):
    with open(path, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))

# --- 1. NOC 2021 unit groups (level 5), EN + FR titles, TEER from 2nd digit ---
en = read_csv(os.path.join(RAW, "noc2021_en.csv"))
fr = read_csv(os.path.join(RAW, "noc2021_fr.csv"))
fr_by_code = {r["Code dela CNP 2021 v1.0"]: r["Titres de classes"] for r in fr}
BROAD = {
    "0": "Legislative and senior management occupations",
    "1": "Business, finance and administration occupations",
    "2": "Natural and applied sciences and related occupations",
    "3": "Health occupations",
    "4": "Occupations in education, law and social, community and government services",
    "5": "Occupations in art, culture, recreation and sport",
    "6": "Sales and service occupations",
    "7": "Trades, transport and equipment operators and related occupations",
    "8": "Natural resources, agriculture and related production occupations",
    "9": "Occupations in manufacturing and utilities",
}
noc = []
for r in en:
    if r["Level"] != "5":
        continue
    code = r["Code - NOC 2021 V1.0"]
    title_fr = fr_by_code.get(code, "")
    noc.append({
        "code": code,
        "title_en": r["Class title"],
        "title_fr": title_fr,
        "teer": code[1],
        "broad_category": BROAD.get(code[0], ""),
        "major_group": code[:2],
    })
noc.sort(key=lambda x: x["code"])
with open(os.path.join(OUT, "noc_2021.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["code", "title_en", "title_fr", "teer", "broad_category", "major_group"])
    w.writeheader()
    w.writerows(noc)
print("noc_2021.csv:", len(noc), "unit groups; FR titles matched:", sum(1 for r in noc if r["title_fr"]))

# --- 2. Parking infraction codebook (from sibling project, computed from real ticket data) ---
src = "/home/hatch/workspace/toronto-parking-tickets-geocoded/data/infraction_codebook.csv"
dst = os.path.join(OUT, "infraction_codebook.csv")
shutil.copyfile(src, dst)
inf = read_csv(dst)
print("infraction_codebook.csv:", len(inf), "codes")

# --- 3. GSIN procurement codes ---
gsin_raw = read_csv(os.path.join(RAW, "gsin.csv"))
gsin = []
for r in gsin_raw:
    gsin.append({
        "code": r["nibs-gsin"],
        "description_en": r["gsin-description_en"],
        "description_fr": r["gsin-description_fr"],
        "status": r["gsin-code-status_en"],
        "commodity_type": ("Construction" if r["nibs-gsin"][:2] == "51" else "Goods" if r["nibs-gsin"][:1].isdigit() else "Service"),
    })
gsin.sort(key=lambda x: x["code"])
with open(os.path.join(OUT, "procurement_codes.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["code", "description_en", "description_fr", "status", "commodity_type"])
    w.writeheader()
    w.writerows(gsin)
active = sum(1 for r in gsin if r["status"] == "Active")
print("procurement_codes.csv:", len(gsin), "codes;", active, "active")

# --- summary ---
teer_counts = {}
for r in noc:
    teer_counts[r["teer"]] = teer_counts.get(r["teer"], 0) + 1
summary = {
    "generated": "2026-10-08",
    "tables": {
        "noc_2021": {
            "rows": len(noc),
            "source": "Statistics Canada, National Occupational Classification (NOC) 2021 Version 1.0, classification structure",
            "source_url": "https://www.statcan.gc.ca/en/subjects/standard/noc/2021/indexV1",
            "retrieved": "2026-10-08",
            "note": "516 five-digit unit groups. English and French titles verbatim from StatCan. TEER derived from the second digit of the code per StatCan's documented structure (first digit = broad category, second digit = TEER).",
            "by_teer": teer_counts,
        },
        "infractions": {
            "rows": len(inf),
            "source": "City of Toronto open data, Parking Tickets, via the sibling project toronto-parking-tickets-geocoded (2023-2025 extracts, 6,454,695 tickets)",
            "retrieved": "2026-10-08",
            "note": "195 infraction codes with descriptions verbatim from the source file; ticket counts, total fines and average fine computed from 6.45M real tickets.",
        },
        "procurement": {
            "rows": len(gsin),
            "active": active,
            "source": "Public Services and Procurement Canada, Goods and Services Identification Number (GSIN) codes CSV",
            "source_url": "https://open.canada.ca/data/en/dataset/2ce347e5-02fd-4487-975d-67a435efdf9b",
            "retrieved": "2026-10-08",
            "note": "Federal fallback: the City of Toronto does not publish a commodity-code reference table in open data, so this table uses the federal GSIN structure PSPC uses for procurement. Descriptions verbatim EN/FR from PSPC; commodity_type (Goods/Service/Construction) derived from the code pattern per the federal reporting guide.",
        },
    },
}
with open(os.path.join(OUT, "summary.json"), "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2, ensure_ascii=False)
print("summary.json written")
