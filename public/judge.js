/**
 * クリア判定の補助ロジック。
 *
 * 出力の一致だけでは判定できない課題（Printfを使わせたいのにPrintlnでも同じ出力になる等）のために、
 * 「コードに特定の記述が含まれているか」を判定する。
 * ブラウザ（app.js）とNode（scripts/validate.js）の両方から同じ実装を使えるようにしている。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.GO_TUTOR_JUDGE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  /**
   * Goコードからコメントを取り除く。
   * 初期コードのTODOコメントに「%vを使う」のような説明が書かれているため、
   * コメントを残したままだと判定が必ず通ってしまう。
   * 文字列リテラル（"..."、`...`、'...'）の中にある // や /* はコメントとして扱わない。
   */
  function stripGoComments(code) {
    var out = "";
    var i = 0;
    var n = code.length;
    while (i < n) {
      var ch = code[i];
      var next = code[i + 1];
      if (ch === '"' || ch === "'" || ch === "`") {
        // 文字列リテラルは閉じ引用符までそのまま出力する
        var quote = ch;
        out += ch;
        i++;
        while (i < n) {
          var c = code[i];
          out += c;
          i++;
          // 生文字列（バッククォート）以外はエスケープを考慮する
          if (c === "\\" && quote !== "`" && i < n) {
            out += code[i];
            i++;
            continue;
          }
          if (c === quote) break;
        }
        continue;
      }
      if (ch === "/" && next === "/") {
        while (i < n && code[i] !== "\n") i++;
        continue;
      }
      if (ch === "/" && next === "*") {
        i += 2;
        while (i < n && !(code[i] === "*" && code[i + 1] === "/")) i++;
        i += 2;
        continue;
      }
      out += ch;
      i++;
    }
    return out;
  }

  /** requiredCodeの1要素（文字列または{text, message}）を{text, message}の形にそろえる */
  function normalizeRequirement(item) {
    if (typeof item === "string") return { text: item, message: "" };
    if (!item || typeof item !== "object") return { text: "", message: "" };
    return { text: String(item.text || ""), message: String(item.message || "") };
  }

  /**
   * コード（コメント除去後）に必須の記述がすべて含まれているかを判定する。
   * @param {string} code 学習者が実行したコード
   * @param {Array} requiredCode ステップのrequiredCode（未指定なら常にok）
   * @returns {{ok: boolean, missing: Array<{text: string, message: string}>}}
   */
  function checkRequiredCode(code, requiredCode) {
    if (!Array.isArray(requiredCode) || requiredCode.length === 0) {
      return { ok: true, missing: [] };
    }
    var stripped = stripGoComments(code || "");
    var missing = [];
    for (var i = 0; i < requiredCode.length; i++) {
      var req = normalizeRequirement(requiredCode[i]);
      if (req.text && stripped.indexOf(req.text) === -1) missing.push(req);
    }
    return { ok: missing.length === 0, missing: missing };
  }

  return {
    stripGoComments: stripGoComments,
    normalizeRequirement: normalizeRequirement,
    checkRequiredCode: checkRequiredCode,
  };
});
