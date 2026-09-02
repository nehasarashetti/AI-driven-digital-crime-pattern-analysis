import os
import pandas as pd


# ============================================================
# FILE PATH
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATASET_FILE = os.path.join(
    BASE_DIR,
    "datasets",
    "cleaned_indian_crimes.csv"
)


# ============================================================
# LOAD DATASET
# ============================================================

def load_dataset():

    if not os.path.exists(DATASET_FILE):
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_FILE}"
        )

    return pd.read_csv(DATASET_FILE)


# ============================================================
# NORMALIZE TEXT
# ============================================================

def normalize(value):

    if value is None:
        return ""

    if pd.isna(value):
        return ""

    return str(value).strip().lower()


# ============================================================
# FIND RELATED CASES
# ============================================================

def find_related_cases(
    crime=None,
    weapon=None,
    city=None,
    domain=None,
    hour=None,
    limit=10
):
    """
    Find historical cases related to a newly analyzed crime.

    Matching factors:

    Crime type       -> 40 points
    Weapon           -> 25 points
    City             -> 15 points
    Crime domain     -> 10 points
    Occurrence hour  -> 10 points

    Maximum score = 100
    """

    df = load_dataset()

    # --------------------------------------------------------
    # Clean input values
    # --------------------------------------------------------

    crime = normalize(crime)
    weapon = normalize(weapon)
    city = normalize(city)
    domain = normalize(domain)

    try:
        input_hour = int(hour)
    except (TypeError, ValueError):
        input_hour = None

    # --------------------------------------------------------
    # Calculate similarity score
    # --------------------------------------------------------

    scores = []

    for index, row in df.iterrows():

        score = 0

        # Crime type
        if crime:
            if normalize(
                row.get("Crime Description")
            ) == crime:
                score += 40

        # Weapon
        if weapon:
            if normalize(
                row.get("Weapon Used")
            ) == weapon:
                score += 25

        # City
        if city:
            if normalize(
                row.get("City")
            ) == city:
                score += 15

        # Crime domain
        if domain:
            if normalize(
                row.get("Crime Domain")
            ) == domain:
                score += 10

        # Hour
        if input_hour is not None:

            try:
                row_hour = int(
                    float(row.get("Occurrence Hour"))
                )

                if row_hour == input_hour:
                    score += 10

            except (TypeError, ValueError):
                pass

        # Only keep cases with at least one match
        if score > 0:

            scores.append({
                "index": index,
                "score": score
            })

    # --------------------------------------------------------
    # Sort highest similarity first
    # --------------------------------------------------------

    scores.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    # --------------------------------------------------------
    # Select top cases
    # --------------------------------------------------------

    selected = scores[:limit]

    results = []

    for item in selected:

        row = df.iloc[item["index"]]

        results.append({

            "similarity_score":
                item["score"],

            "report_number":
                row.get("Report Number"),

            "crime":
                row.get("Crime Description"),

            "weapon":
                row.get("Weapon Used"),

            "city":
                row.get("City"),

            "domain":
                row.get("Crime Domain"),

            "date":
                row.get("Date of Occurrence"),

            "time":
                row.get("Time of Occurrence"),

            "year":
                row.get("Occurrence Year"),

            "month":
                row.get("Occurrence Month"),

            "hour":
                row.get("Occurrence Hour"),

            "victim_age":
                row.get("Victim Age"),

            "victim_gender":
                row.get("Victim Gender"),

            "case_closed":
                row.get("Case Closed")
        })

    return results


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    import sys
    import json

    try:

        # Read input from Node.js
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])

        else:
            # Default test input
            input_data = {
                "crime": "ASSAULT",
                "weapon": "Firearm",
                "city": "Delhi",
                "limit": 10
            }

        # Run related case analysis
        results = find_related_cases(
            crime=input_data.get("crime"),
            weapon=input_data.get("weapon"),
            city=input_data.get("city"),
            domain=input_data.get("domain"),
            hour=input_data.get("hour"),
            limit=int(input_data.get("limit", 10))
        )

        # ------------------------------------------------------------
        # Replace NaN / missing values with None
        # ------------------------------------------------------------
        clean_results = []

        for case in results:

            clean_case = {}

            for key, value in case.items():

                if pd.isna(value):
                    clean_case[key] = None
                else:
                    clean_case[key] = value

            clean_results.append(clean_case)


        # ------------------------------------------------------------
        # Return valid JSON to Node.js
        # IMPORTANT: this must be OUTSIDE the for loop
        # ------------------------------------------------------------

        print(
            json.dumps(
                clean_results,
                default=str,
                allow_nan=False
            )
        )

    except Exception as error:

        print(
            json.dumps({
                "error": str(error)
            })
        )