from pathlib import Path
import json
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

APP_DIR = Path(__file__).resolve().parent
DATA_PATH = APP_DIR.parents[1] / "data20261020.csv"
MODEL_PATH = APP_DIR / "model.js"

CATEGORICAL = ["gender", "edu_level", "marital_status", "birth_nat_code"]
NUMERIC = ["age", "first_entry_yr"]
FEATURES = CATEGORICAL + NUMERIC
TARGET = "nat_acq_yn"


def main():
    df = pd.read_csv(DATA_PATH, encoding="cp949")
    df.columns = df.columns.str.strip()

    # Use focal respondents with a recorded birth-country code and known target.
    # A missing code is excluded rather than treated as a country category.
    model_df = df.loc[df["rel_imm"] == 1, FEATURES + [TARGET]].dropna().copy()

    for column in CATEGORICAL:
        model_df[column] = model_df[column].astype(int)
    model_df[TARGET] = model_df[TARGET].astype(int)

    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", StandardScaler(), NUMERIC),
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
        ]
    )
    model = Pipeline(
        steps=[
            ("preprocess", preprocessor),
            ("classifier", LogisticRegression(max_iter=2000, random_state=42)),
        ]
    )
    model.fit(model_df[FEATURES], model_df[TARGET])

    fitted_preprocessor = model.named_steps["preprocess"]
    classifier = model.named_steps["classifier"]
    names = fitted_preprocessor.get_feature_names_out()
    weights = dict(zip(names, classifier.coef_[0]))
    numeric_scaler = fitted_preprocessor.named_transformers_["numeric"]

    def category_weights(column):
        prefix = f"categorical__{column}_"
        return {
            str(int(value)): float(weights[f"{prefix}{int(value)}"])
            for value in fitted_preprocessor.named_transformers_["categorical"].categories_[CATEGORICAL.index(column)]
        }

    params = {
        "intercept": float(classifier.intercept_[0]),
        "ageMean": float(numeric_scaler.mean_[NUMERIC.index("age")]),
        "ageScale": float(numeric_scaler.scale_[NUMERIC.index("age")]),
        "entryMean": float(numeric_scaler.mean_[NUMERIC.index("first_entry_yr")]),
        "entryScale": float(numeric_scaler.scale_[NUMERIC.index("first_entry_yr")]),
        "ageWeight": float(weights["numeric__age"]),
        "entryWeight": float(weights["numeric__first_entry_yr"]),
        "gender": category_weights("gender"),
        "education": category_weights("edu_level"),
        "marital": category_weights("marital_status"),
        "birthCode": category_weights("birth_nat_code"),
        "countryCodes": sorted(int(value) for value in model_df["birth_nat_code"].unique()),
        "trainingRows": int(len(model_df)),
    }

    # Unicode escapes keep the generated JavaScript source encoding-independent.
    js = """(() => {\n  \"use strict\";\n  const model = __PARAMS__;\n  function predict(values) {\n    let z = model.intercept;\n    z += ((values.age - model.ageMean) / model.ageScale) * model.ageWeight;\n    z += ((values.entry - model.entryMean) / model.entryScale) * model.entryWeight;\n    z += model.gender[String(values.gender)] || 0;\n    z += model.education[String(values.education)] || 0;\n    z += model.marital[String(values.marital)] || 0;\n    z += model.birthCode[String(values.birthCode)] || 0;\n    const score = 1 / (1 + Math.exp(-z));\n    return { score, predicted: score >= 0.5 ? 1 : 0 };\n  }\n  window.NaturalizationModel = { predict, countryCodes: model.countryCodes };\n})();\n"""
    js = js.replace("__PARAMS__", json.dumps(params, ensure_ascii=True, separators=(",", ":")))
    MODEL_PATH.write_text(js, encoding="utf-8")
    print("Updated model.js")
    print("Training rows:", len(model_df))
    print("Positive label rows:", int(model_df[TARGET].sum()))
    print("Country codes:", len(params["countryCodes"]))


if __name__ == "__main__":
    main()
