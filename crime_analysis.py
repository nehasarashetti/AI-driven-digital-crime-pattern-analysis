import os
import pandas as pd


# ============================================================
# AI CRIME PATTERN ANALYSIS
# Dataset: cleaned_indian_crimes.csv
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATASET_FILE = os.path.join(
    BASE_DIR,
    "datasets",
    "cleaned_indian_crimes.csv"
)


# ============================================================
# LOAD DATASET
# ============================================================

def load_dataset():
    """
    Load the cleaned Indian crime dataset.
    """

    if not os.path.exists(DATASET_FILE):
        raise FileNotFoundError(
            f"Cleaned dataset not found at: {DATASET_FILE}"
        )

    df = pd.read_csv(DATASET_FILE)

    return df


# ============================================================
# BASIC DATASET INFORMATION
# ============================================================

def get_dataset_info():
    """
    Return basic information about the dataset.
    """

    df = load_dataset()

    return {
        "total_records": int(len(df)),
        "total_columns": int(len(df.columns)),
        "columns": df.columns.tolist()
    }


# ============================================================
# CRIME TYPE ANALYSIS
# ============================================================

def get_crime_distribution(limit=10):
    """
    Find the most common crime types.
    """

    df = load_dataset()

    result = (
        df["Crime Description"]
        .fillna("Unknown")
        .value_counts()
        .head(limit)
    )

    return [
        {
            "crime": str(crime),
            "count": int(count)
        }
        for crime, count in result.items()
    ]


# ============================================================
# CITY / LOCATION ANALYSIS
# ============================================================

def get_city_distribution(limit=10):
    """
    Find cities with the highest number of reported crimes.
    """

    df = load_dataset()

    result = (
        df["City"]
        .fillna("Unknown")
        .value_counts()
        .head(limit)
    )

    return [
        {
            "city": str(city),
            "count": int(count)
        }
        for city, count in result.items()
    ]


# ============================================================
# WEAPON ANALYSIS
# ============================================================

def get_weapon_distribution(limit=10):
    """
    Analyze weapons associated with historical crime records.
    """

    df = load_dataset()

    result = (
        df["Weapon Used"]
        .fillna("Unknown")
        .value_counts()
        .head(limit)
    )

    return [
        {
            "weapon": str(weapon),
            "count": int(count)
        }
        for weapon, count in result.items()
    ]


# ============================================================
# TIME OF DAY ANALYSIS
# ============================================================

def get_hour_distribution():
    """
    Analyze crime occurrence by hour.
    """

    df = load_dataset()

    result = (
        pd.to_numeric(df["Occurrence Hour"], errors="coerce")
        .dropna()
        .astype(int)
        .value_counts()
        .sort_index()
    )

    return [
        {
            "hour": int(hour),
            "count": int(count)
        }
        for hour, count in result.items()
    ]


# ============================================================
# MONTHLY ANALYSIS
# ============================================================

def get_month_distribution():
    """
    Analyze crime occurrence by month.
    """

    df = load_dataset()

    result = (
        pd.to_numeric(df["Occurrence Month"], errors="coerce")
        .dropna()
        .astype(int)
        .value_counts()
        .sort_index()
    )

    return [
        {
            "month": int(month),
            "count": int(count)
        }
        for month, count in result.items()
    ]


# ============================================================
# YEAR + MONTH TREND ANALYSIS
# ============================================================

def get_monthly_trend():
    """
    Analyze crime occurrence chronologically by year and month.

    Example:
    2020-01
    2020-02
    2020-03
    ...
    2024-12
    """

    df = load_dataset()

    # Convert year and month to numeric values
    df["Occurrence Year"] = pd.to_numeric(
        df["Occurrence Year"],
        errors="coerce"
    )

    df["Occurrence Month"] = pd.to_numeric(
        df["Occurrence Month"],
        errors="coerce"
    )

    # Remove invalid year/month records
    filtered = df.dropna(
        subset=[
            "Occurrence Year",
            "Occurrence Month"
        ]
    ).copy()

    # Convert to integers
    filtered["Occurrence Year"] = (
        filtered["Occurrence Year"]
        .astype(int)
    )

    filtered["Occurrence Month"] = (
        filtered["Occurrence Month"]
        .astype(int)
    )

    # Keep valid months only
    filtered = filtered[
        filtered["Occurrence Month"].between(1, 12)
    ]

    # Group by year + month
    result = (
        filtered
        .groupby(
            [
                "Occurrence Year",
                "Occurrence Month"
            ]
        )
        .size()
        .reset_index(name="count")
        .sort_values(
            [
                "Occurrence Year",
                "Occurrence Month"
            ]
        )
    )

    records = []

    for _, row in result.iterrows():

        year = int(row["Occurrence Year"])
        month = int(row["Occurrence Month"])

        records.append({
            "year": year,
            "month": month,
            "period": f"{year}-{month:02d}",
            "count": int(row["count"])
        })

    return records

# ============================================================
# YEARLY ANALYSIS
# ============================================================

def get_year_distribution():
    """
    Analyze crime occurrence by year.
    """

    df = load_dataset()

    result = (
        pd.to_numeric(
            df["Occurrence Year"],
            errors="coerce"
        )
        .dropna()
        .astype(int)
        .value_counts()
        .sort_index()
    )

    return [
        {
            "year": int(year),
            "count": int(count)
        }
        for year, count in result.items()
    ]


# ============================================================
# CRIME DOMAIN ANALYSIS
# ============================================================

def get_crime_domain_distribution(limit=10):
    """
    Analyze broad crime domains.
    """

    df = load_dataset()

    result = (
        df["Crime Domain"]
        .fillna("Unknown")
        .value_counts()
        .head(limit)
    )

    return [
        {
            "domain": str(domain),
            "count": int(count)
        }
        for domain, count in result.items()
    ]


# ============================================================
# VICTIM GENDER ANALYSIS
# ============================================================

def get_gender_distribution():
    """
    Analyze crime records by victim gender.
    """

    df = load_dataset()

    result = (
        df["Victim Gender"]
        .fillna("Unknown")
        .value_counts()
    )

    return [
        {
            "gender": str(gender),
            "count": int(count)
        }
        for gender, count in result.items()
    ]


# ============================================================
# CASE STATUS ANALYSIS
# ============================================================

def get_case_status_distribution():
    """
    Analyze closed and open cases.
    """

    df = load_dataset()

    result = (
        df["Case Closed"]
        .fillna("Unknown")
        .value_counts()
    )

    return [
        {
            "status": str(status),
            "count": int(count)
        }
        for status, count in result.items()
    ]


# ============================================================
# WEAPON + CRIME RELATIONSHIP
# ============================================================

def get_weapon_crime_relationship(limit=15):
    """
    Find common combinations of crime type and weapon.
    """

    df = load_dataset()

    result = (
        df.groupby(
            ["Crime Description", "Weapon Used"],
            dropna=False
        )
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .head(limit)
    )

    records = []

    for _, row in result.iterrows():

        crime = row["Crime Description"]
        weapon = row["Weapon Used"]

        if pd.isna(crime):
            crime = "Unknown"

        if pd.isna(weapon):
            weapon = "Unknown"

        records.append({
            "crime": str(crime),
            "weapon": str(weapon),
            "count": int(row["count"])
        })

    return records


# ============================================================
# CITY + CRIME RELATIONSHIP
# ============================================================

def get_city_crime_relationship(limit=15):
    """
    Find common crime types in different cities.
    """

    df = load_dataset()

    result = (
        df.groupby(
            ["City", "Crime Description"],
            dropna=False
        )
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .head(limit)
    )

    records = []

    for _, row in result.iterrows():

        city = row["City"]
        crime = row["Crime Description"]

        if pd.isna(city):
            city = "Unknown"

        if pd.isna(crime):
            crime = "Unknown"

        records.append({
            "city": str(city),
            "crime": str(crime),
            "count": int(row["count"])
        })

    return records


# ============================================================
# RELATED CASES
# ============================================================

def find_related_cases(
    crime=None,
    city=None,
    weapon=None,
    limit=10
):
    """
    Find historical cases related to information
    extracted from an uploaded image/video.
    """

    df = load_dataset()

    filtered = df.copy()

    if crime:
        filtered = filtered[
            filtered["Crime Description"]
            .fillna("")
            .astype(str)
            .str.contains(
                str(crime),
                case=False,
                na=False
            )
        ]

    if city:
        filtered = filtered[
            filtered["City"]
            .fillna("")
            .astype(str)
            .str.contains(
                str(city),
                case=False,
                na=False
            )
        ]

    if weapon:
        filtered = filtered[
            filtered["Weapon Used"]
            .fillna("")
            .astype(str)
            .str.contains(
                str(weapon),
                case=False,
                na=False
            )
        ]

    filtered = filtered.head(limit)

    records = []

    for _, row in filtered.iterrows():

        records.append({
            "report_number": str(row.get("Report Number", "")),
            "date_reported": str(row.get("Date Reported", "")),
            "date_of_occurrence": str(
                row.get("Date of Occurrence", "")
            ),
            "time_of_occurrence": str(
                row.get("Time of Occurrence", "")
            ),
            "city": str(row.get("City", "")),
            "crime": str(
                row.get("Crime Description", "")
            ),
            "weapon": str(
                row.get("Weapon Used", "")
            ),
            "crime_domain": str(
                row.get("Crime Domain", "")
            ),
            "case_closed": str(
                row.get("Case Closed", "")
            )
        })

    return records


# ============================================================
# COMPLETE ANALYSIS
# ============================================================

def get_complete_analysis():
    """
    Generate the complete historical crime analysis.
    """

    return {
        "dataset": get_dataset_info(),

        "crime_distribution":
            get_crime_distribution(),

        "city_distribution":
            get_city_distribution(),

        "weapon_distribution":
            get_weapon_distribution(),

        "hour_distribution":
            get_hour_distribution(),

        "month_distribution":
            get_month_distribution(),

        "monthly_trend":
            get_monthly_trend(),

        "year_distribution":
            get_year_distribution(),

        "crime_domain_distribution":
            get_crime_domain_distribution(),

        "gender_distribution":
            get_gender_distribution(),

        "case_status_distribution":
            get_case_status_distribution(),

        "weapon_crime_relationship":
            get_weapon_crime_relationship(),

        "city_crime_relationship":
            get_city_crime_relationship()
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    import json

    try:
        analysis = get_complete_analysis()

        print(
            json.dumps(
                analysis,
                default=str
            )
        )

    except Exception as error:

        print(
            json.dumps({
                "success": False,
                "error": str(error)
            })
        )

    print("\n========================================")
    print(" AI CRIME PATTERN ANALYSIS ENGINE")
    print("========================================")

    try:

        info = get_dataset_info()

        print("\nDataset loaded successfully!")
        print("Total records:", info["total_records"])
        print("Total columns:", info["total_columns"])

        print("\nTop Crime Types:")
        for item in get_crime_distribution():
            print(
                f"  {item['crime']} : {item['count']}"
            )

        print("\nTop Cities:")
        for item in get_city_distribution():
            print(
                f"  {item['city']} : {item['count']}"
            )

        print("\nTop Weapons:")
        for item in get_weapon_distribution():
            print(
                f"  {item['weapon']} : {item['count']}"
            )

        print("\nTop Crime + Weapon combinations:")
        for item in get_weapon_crime_relationship():
            print(
                f"  {item['crime']} + "
                f"{item['weapon']} : "
                f"{item['count']}"
            )

        print("\n========================================")
        print(" ANALYSIS ENGINE WORKING")
        print("========================================")

    except Exception as error:

        print("\nERROR:")
        print(error)