(() => {
  "use strict";
  const model = window.NaturalizationModel;
  const form = document.getElementById("predict-form");
  const birthCode = document.getElementById("birthCode");

  const labels = {
    gender: { 1: "\uB0A8\uC131", 2: "\uC5EC\uC131" },
    education: {
      1: "\uBC1B\uC9C0 \uC54A\uC558\uC74C(\uBBF8\uCDE8\uD559 \uD3EC\uD568)",
      2: "\uCD08\uB4F1\uD559\uAD50", 3: "\uC911\uD559\uAD50",
      4: "\uACE0\uB4F1\uD559\uAD50", 5: "\uB300\uD559\uAD50(4\uB144\uC81C \uBBF8\uB9CC)",
      6: "\uB300\uD559\uAD50(4\uB144\uC81C \uC774\uC0C1)", 7: "\uB300\uD559\uC6D0 \uC774\uC0C1"
    },
    marital: {
      1: "\uBBF8\uD63C", 2: "\uBC30\uC6B0\uC790 \uC788\uC74C",
      3: "\uBC30\uC6B0\uC790 \uC0AC\uB9DD", 4: "\uC774\uD63C\u00B7\uBCC4\uAC70"
    }
  };

  for (const code of model.countryCodes) {
    const option = document.createElement("option");
    option.value = String(code);
    option.textContent = "\uAD6D\uAC00 \uCF54\uB4DC " + code;
    birthCode.appendChild(option);
  }

  function showRows(rows) {
    document.getElementById("summary").innerHTML =
      rows.map(([name, value]) => "<tr><th>" + name + "</th><td>" + value + "</td></tr>").join("");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = {
      gender: Number(document.getElementById("gender").value),
      age: Number(document.getElementById("age").value),
      education: Number(document.getElementById("edu").value),
      marital: Number(document.getElementById("marital").value),
      birthCode: Number(birthCode.value),
      entry: Number(document.getElementById("entry").value)
    };

    if (values.age < 18 || values.age > 95 || values.entry < 1937 || values.entry > 2021) {
      window.alert("\uC785\uB825\uAC12\uC774 \uD559\uC2B5\uC790\uB8CC \uBC94\uC704\uB97C \uBC97\uC5B4\uB0AC\uC2B5\uB2C8\uB2E4.");
      return;
    }
    if (!model.countryCodes.includes(values.birthCode)) {
      window.alert("\uC6D0\uC790\uB8CC\uC5D0 \uC788\uB294 \uCD9C\uC0DD \uAD6D\uC801 \uCF54\uB4DC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.");
      return;
    }

    const prediction = model.predict(values);
    document.getElementById("analysis").classList.remove("hidden");
    const box = document.getElementById("result");
    box.className = "result " + (prediction.predicted === 1 ? "positive" : "negative");
    document.getElementById("classification").textContent = prediction.predicted === 1
      ? "\uAD6D\uC801\uC744 \uCDE8\uB4DD\uD55C \uC0AC\uB78C\uC73C\uB85C \uBD84\uB958\uB418\uC5C8\uC2B5\uB2C8\uB2E4"
      : "\uAD6D\uC801\uC744 \uCDE8\uB4DD\uD558\uC9C0 \uC54A\uC740 \uC0AC\uB78C\uC73C\uB85C \uBD84\uB958\uB418\uC5C8\uC2B5\uB2C8\uB2E4";
    document.getElementById("score").textContent = (prediction.score * 100).toFixed(1) + "%";

    showRows([
      ["\uC131\uBCC4", labels.gender[values.gender]],
      ["\uB9CC \uB098\uC774", values.age + "\uC138"],
      ["\uCD5C\uC885\uD559\uB825", labels.education[values.education]],
      ["\uD63C\uC778 \uC0C1\uD0DC", labels.marital[values.marital]],
      ["\uCD9C\uC0DD \uC2DC \uAD6D\uC801 \uAD6D\uAC00 \uCF54\uB4DC", String(values.birthCode)],
      ["\uCD5C\uCD08 \uC785\uAD6D \uC5F0\uB3C4", values.entry + "\uB144"]
    ]);

    document.getElementById("message").textContent = prediction.predicted === 1
      ? "\uC548\uB0B4\uBB38 \uBBF8\uB9AC\uBCF4\uAE30: \uAD6D\uC801 \uAD00\uB828 \uC0C1\uB2F4\uC774\uB098 \uC808\uCC28 \uC815\uBCF4\uAC00 \uD544\uC694\uD558\uC2E0\uAC00\uC694? \uC774 \uD654\uBA74\uC740 \uC2E4\uC81C\uB85C \uBA54\uC2DC\uC9C0\uB97C \uBC1C\uC1A1\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
      : "\uC774 \uBD84\uB958 \uACB0\uACFC\uB9CC\uC73C\uB85C \uC9C0\uC6D0\uC774 \uD544\uC694 \uC5C6\uB2E4\uACE0 \uD310\uB2E8\uD558\uC9C0 \uB9C8\uC138\uC694.";
    document.getElementById("analysis").scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
