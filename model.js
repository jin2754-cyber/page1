(() => {
  "use strict";
  const coefficients = {
    intercept: -0.28180057488723803,
    ageMean: 41.096176129779835,
    ageScale: 11.248662174898728,
    entryMean: 2007.3025621217973,
    entryScale: 8.44561650428647,
    gender: { 1: 0.15193534440901843, 2: -0.42501434774475344 },
    education: {
      1: 0.2603465695092622, 2: 0.472199462105497, 3: 0.2447366224057676,
      4: 0.1569141285838153, 5: -0.09958906772581406,
      6: -0.3707092803926969, 7: -0.9369774378215534
    },
    marital: {
      1: 2.7144029560807157, 2: -2.1565887990810655,
      3: -0.6605551470834435, 4: -0.1703380132519394
    },
    birth: { 1: -2.4533365464720736, 2: 2.1802575431363804 }
  };

  const labels = {
    gender: { 1: "남성", 2: "여성" },
    education: {
      1: "받지 않았음(미취학 포함)", 2: "초등학교", 3: "중학교",
      4: "고등학교", 5: "대학교(4년제 미만)", 6: "대학교(4년제 이상)", 7: "대학원 이상"
    },
    marital: { 1: "미혼", 2: "배우자 있음", 3: "배우자 사망", 4: "이혼·별거" },
    birth: { 1: "대한민국", 2: "외국" }
  };

  function predict(values) {
    let z = coefficients.intercept;
    z += ((values.age - coefficients.ageMean) / coefficients.ageScale) * -0.150280968077972;
    z += ((values.entry - coefficients.entryMean) / coefficients.entryScale) * -0.8932569574709487;
    z += coefficients.gender[values.gender];
    z += coefficients.education[values.education];
    z += coefficients.marital[values.marital];
    z += coefficients.birth[values.birth];
    const score = 1 / (1 + Math.exp(-z));
    return { score, predicted: score >= 0.5 ? 1 : 0 };
  }

  document.getElementById("predict-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const values = {
      gender: Number(document.getElementById("gender").value),
      age: Number(document.getElementById("age").value),
      education: Number(document.getElementById("edu").value),
      marital: Number(document.getElementById("marital").value),
      birth: Number(document.getElementById("birth").value),
      entry: Number(document.getElementById("entry").value)
    };
    if (values.age < 18 || values.age > 95 || values.entry < 1937 || values.entry > 2021) {
      window.alert("입력값이 학습자료 범위를 벗어났습니다.");
      return;
    }

    const { score, predicted } = predict(values);
    document.getElementById("analysis").classList.remove("hidden");
    const box = document.getElementById("result");
    box.className = "result " + (predicted === 1 ? "positive" : "negative");
    document.getElementById("classification").textContent =
      predicted === 1 ? "귀화한 사람으로 분류되었습니다" : "귀화하지 않은 사람으로 분류되었습니다";
    document.getElementById("score").textContent = (score * 100).toFixed(1) + "%";

    const rows = [
      ["성별", labels.gender[values.gender]],
      ["만 나이", values.age + "세"],
      ["최종학력", labels.education[values.education]],
      ["혼인 상태", labels.marital[values.marital]],
      ["출생 시 국적", labels.birth[values.birth]],
      ["최초 입국 연도", values.entry + "년"]
    ];
    document.getElementById("summary").innerHTML =
      rows.map(([name, value]) => "<tr><th>" + name + "</th><td>" + value + "</td></tr>").join("");
    document.getElementById("message").textContent = predicted === 1
      ? "안내문 미리보기: 귀화 관련 상담이나 절차 정보가 필요하신가요? 가까운 담당 기관에서 안내를 받아보실 수 있습니다. 이 화면은 실제 메시지를 발송하지 않습니다."
      : "이 분류 결과만으로 지원이 필요 없다고 판단하지 마세요.";
    document.getElementById("analysis").scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
