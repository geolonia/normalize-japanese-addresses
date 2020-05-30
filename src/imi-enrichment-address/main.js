import find from "./lib/find"

const enrichment = (str) => {

  const target = {
    "@context": "https://imi.go.jp/ns/core/context.jsonld",
    "@type": "場所型",
    "住所": {
      "@type": "住所型",
      "表記": str
    }
  }

  const address = target["住所"] || target;
  const response = find(address["表記"]);

  if (!response) {
    return new Error("該当する地名が見つかりません")
  }

  if (response.multipleChoice) {
    return new Error("該当する地名が複数あります")
  }

  let code = response.code;
  if (response.expectedChome !== undefined) {
    let t = "" + response.expectedChome;
    while (t.length < 3) t = "0" + t;
    code = code + t;
  }

  return code
};

export default enrichment
