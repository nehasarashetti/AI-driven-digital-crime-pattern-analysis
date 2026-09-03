import pandas as pd
import os
from pathlib import Path

# --------------------------------------------------
# FILE PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets"

INPUT_FILE = DATASET_DIR / "dataset1_indian_crimes.csv"
OUTPUT_FILE = DATASET_DIR / "cleaned_indian_crimes.csv"


# --------------------------------------------------
# LOAD DATASET
# --------------------------------------------------


print("Loading Dataset 1...")

df = pd.read_csv(INPUT_FILE)

print("Dataset loaded successfully!")
print("Rows:", len(df))
print("Columns:", len(df.columns))

print("\nOriginal columns:")
print(df.columns.tolist())


# --------------------------------------------------
# REMOVE DUPLICATE CASES
# --------------------------------------------------

if "Report Number" in df.columns:

    before = len(df)

    df = df.drop_duplicates(
        subset=["Report Number"],
        keep="first"
    )

    after = len(df)

    print("\nDuplicate case records removed:", before - after)


# --------------------------------------------------
# DATE CONVERSION
# --------------------------------------------------

date_columns = [
    "Date Reported",
    "Date of Occurrence",
    "Date Case Closed"
]

for column in date_columns:

    if column in df.columns:

        df[column] = pd.to_datetime(
            df[column],
            errors="coerce"
        )


# --------------------------------------------------
# TIME CONVERSION
# --------------------------------------------------

if "Time of Occurrence" in df.columns:

    df["Time of Occurrence"] = (
        df["Time of Occurrence"]
        .astype(str)
        .str.strip()
    )


# --------------------------------------------------
# TEXT CLEANING
# --------------------------------------------------

text_columns = [
    "City",
    "Crime Description",
    "Weapon Used",
    "Crime Domain",
    "Victim Gender",
    "Case Closed"
]

for column in text_columns:

    if column in df.columns:

        df[column] = (
            df[column]
            .astype("string")
            .str.strip()
        )


# --------------------------------------------------
# HANDLE MISSING VALUES
# --------------------------------------------------

if "Weapon Used" in df.columns:

    df["Weapon Used"] = (
        df["Weapon Used"]
        .fillna("Unknown")
    )


if "Victim Gender" in df.columns:

    df["Victim Gender"] = (
        df["Victim Gender"]
        .fillna("Unknown")
    )


if "Case Closed" in df.columns:

    df["Case Closed"] = (
        df["Case Closed"]
        .fillna("Unknown")
    )


# --------------------------------------------------
# CREATE USEFUL YEAR / MONTH / HOUR FIELDS
# --------------------------------------------------

if "Date of Occurrence" in df.columns:

    df["Occurrence Year"] = (
        df["Date of Occurrence"]
        .dt.year
    )

    df["Occurrence Month"] = (
        df["Date of Occurrence"]
        .dt.month
    )


if "Time of Occurrence" in df.columns:

    parsed_time = pd.to_datetime(
        df["Time of Occurrence"],
        errors="coerce"
    )

    df["Occurrence Hour"] = (
        parsed_time.dt.hour
    )


# --------------------------------------------------
# CHECK MISSING VALUES
# --------------------------------------------------

print("\nMissing values after cleaning:")

print(
    df.isnull()
    .sum()
    .sort_values(ascending=False)
)


# --------------------------------------------------
# SAVE CLEAN DATASET
# --------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n------------------------------------")
print("Dataset 1 cleaning completed!")
print("------------------------------------")

print("Clean dataset saved at:")
print(OUTPUT_FILE)

print("\nFinal rows:", len(df))
print("Final columns:", len(df.columns))