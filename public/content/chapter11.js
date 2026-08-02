// 第11章：文字列処理
registerChapter({
  number: 11,
  title: "文字列処理",
  description: "stringsやstrconvなどの標準パッケージを使った実践的な文字列処理を学びます。検索・分割・変換からrune単位の処理まで、実務で毎日使う技術です。",
  steps: [
    {
      id: 101,
      title: "stringsパッケージの基本（Contains・HasPrefix・Index）",
      explanation: `<p>Goで文字列を扱うとき、最も頻繁に使うのが標準ライブラリの<code>strings</code>パッケージです。文字列の検索・判定・加工のための関数が豊富に用意されています。まずは「文字列の中を調べる」代表的な関数を覚えましょう。</p>
<table>
<tr><th>関数</th><th>役割</th><th>戻り値</th></tr>
<tr><td><code>strings.Contains(s, sub)</code></td><td>sの中にsubが含まれるか</td><td><code>bool</code></td></tr>
<tr><td><code>strings.HasPrefix(s, prefix)</code></td><td>sがprefixで始まるか</td><td><code>bool</code></td></tr>
<tr><td><code>strings.HasSuffix(s, suffix)</code></td><td>sがsuffixで終わるか</td><td><code>bool</code></td></tr>
<tr><td><code>strings.Index(s, sub)</code></td><td>subが最初に現れる位置（バイト単位）</td><td><code>int</code></td></tr>
</table>
<p><code>strings.Index</code>は見つからなかった場合に<code>-1</code>を返します。エラーを返すのではなく「-1という特別な値」で伝えるスタイルは、他の言語でもよく見られる慣習です。</p>
<pre><code>s := "Hello, Go World"
fmt.Println(strings.Contains(s, "Go"))     // true
fmt.Println(strings.HasPrefix(s, "Hello")) // true
fmt.Println(strings.Index(s, "Go"))        // 7
fmt.Println(strings.Index(s, "Rust"))      // -1（見つからない）</code></pre>
<p>注意点として、<code>Index</code>が返す位置は「バイト単位」です。日本語のようなマルチバイト文字（1文字が複数バイトで表現される文字）を含む場合、文字数とは一致しません。この違いはステップ108で詳しく学びます。</p>
<p>実務では「URLが<code>https://</code>で始まるか確認する」「ファイル名が<code>.go</code>で終わるか判定する」など、これらの関数は毎日のように登場します。</p>`,
      task: `TODOのコメント部分に、<code>strings.Index</code>を使って文字列<code>s</code>の中の"Go"の位置を出力するコードを追加してください。`,
      code: `package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "Hello, Go World"

	fmt.Println("Contains:", strings.Contains(s, "Go"))
	fmt.Println("HasPrefix:", strings.HasPrefix(s, "Hello"))
	fmt.Println("HasSuffix:", strings.HasSuffix(s, "World"))

	// TODO: strings.Indexを使って"Go"の位置を出力する
	// 出力例：Index: 7
}
`,
      solution: `package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "Hello, Go World"

	fmt.Println("Contains:", strings.Contains(s, "Go"))
	fmt.Println("HasPrefix:", strings.HasPrefix(s, "Hello"))
	fmt.Println("HasSuffix:", strings.HasSuffix(s, "World"))

	// strings.Indexは最初に見つかった位置（バイト単位）を返す
	fmt.Println("Index:", strings.Index(s, "Go"))
}
`,
      hints: [
        `strings.Indexは第1引数の文字列の中から第2引数の文字列を探し、最初に見つかった位置を返します。`,
        `fmt.Println("Index:", strings.Index(s, "Go")) のように、ラベルと結果を並べて出力できます。`
      ],
      expectedOutput: "Index: 7"
    },
    {
      id: 102,
      title: "大文字小文字変換とTrim系関数",
      explanation: `<p>ユーザーの入力データは「前後に余計な空白がある」「大文字と小文字が混在している」など、そのままでは扱いにくい状態であることが多いです。<code>strings</code>パッケージには、こうした文字列を整える関数が揃っています。</p>
<table>
<tr><th>関数</th><th>役割</th></tr>
<tr><td><code>strings.ToUpper(s)</code></td><td>すべて大文字に変換</td></tr>
<tr><td><code>strings.ToLower(s)</code></td><td>すべて小文字に変換</td></tr>
<tr><td><code>strings.TrimSpace(s)</code></td><td>前後の空白（改行・タブ含む）を除去</td></tr>
<tr><td><code>strings.Trim(s, cutset)</code></td><td>前後から指定した文字集合を除去</td></tr>
<tr><td><code>strings.TrimPrefix(s, prefix)</code></td><td>先頭のprefixを1回だけ除去</td></tr>
<tr><td><code>strings.TrimSuffix(s, suffix)</code></td><td>末尾のsuffixを1回だけ除去</td></tr>
</table>
<pre><code>s := "  Go Language  "
fmt.Println(strings.TrimSpace(s))            // "Go Language"
fmt.Println(strings.Trim("###Title###", "#")) // "Title"
fmt.Println(strings.TrimPrefix("go-tutor", "go-")) // "tutor"</code></pre>
<p>重要なのは、<strong>Goの文字列は不変（イミュータブル：一度作ったら変更できない）</strong>という点です。これらの関数は元の文字列を書き換えるのではなく、<strong>新しい文字列を返します</strong>。戻り値を変数に受け取らないと結果は捨てられてしまうので注意してください。</p>
<p>また<code>Trim</code>と<code>TrimPrefix</code>の違いも押さえましょう。<code>Trim(s, "#")</code>は「#という文字を前後から続く限り全部」除去しますが、<code>TrimPrefix</code>は「指定した文字列そのもの」を先頭から1回だけ除去します。混同しやすいポイントです。</p>`,
      task: `変数<code>s</code>の前後の空白を<code>strings.TrimSpace</code>で除去し、<code>[Go Language]</code>のように角括弧で囲んで出力してください。さらに、除去後の文字列を大文字にして出力してください。`,
      code: `package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "  Go Language  "

	// TODO: TrimSpaceで前後の空白を除去してtrimmedに代入する
	trimmed := s

	fmt.Println("[" + trimmed + "]")

	// TODO: trimmedを大文字にして出力する（出力例：Upper: GO LANGUAGE）

	fmt.Println("Trim:", strings.Trim("###Title###", "#"))
}
`,
      solution: `package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "  Go Language  "

	// TrimSpaceは前後の空白を除去した新しい文字列を返す
	trimmed := strings.TrimSpace(s)

	fmt.Println("[" + trimmed + "]")

	// ToUpperですべて大文字に変換する
	fmt.Println("Upper:", strings.ToUpper(trimmed))

	fmt.Println("Trim:", strings.Trim("###Title###", "#"))
}
`,
      hints: [
        `Goの文字列は不変なので、TrimSpaceの戻り値を変数に受け取る必要があります。`,
        `trimmed := strings.TrimSpace(s) と書き、大文字変換は strings.ToUpper(trimmed) です。`
      ],
      expectedOutput: "[Go Language]"
    },
    {
      id: 103,
      title: "SplitとJoin",
      explanation: `<p>「カンマ区切りの文字列を分解したい」「スライスの要素を1つの文字列にまとめたい」——この2つは文字列処理の定番です。<code>strings.Split</code>と<code>strings.Join</code>はちょうど逆の関係にあります。</p>
<pre><code>csv := "apple,banana,cherry"
parts := strings.Split(csv, ",")
// parts は []string{"apple", "banana", "cherry"}

joined := strings.Join(parts, " / ")
// joined は "apple / banana / cherry"</code></pre>
<p><code>Split(s, sep)</code>は文字列sを区切り文字sepで分割し、<code>[]string</code>（文字列のスライス）を返します。<code>Join(slice, sep)</code>はその逆で、スライスの各要素をsepでつないだ1つの文字列を返します。</p>
<p>Splitには知っておくべき挙動がいくつかあります。</p>
<ul>
<li>区切り文字が見つからない場合、要素数1のスライス（元の文字列がそのまま入る）が返る</li>
<li><code>"a,,b"</code>のように区切り文字が連続すると、間に空文字列<code>""</code>の要素ができる</li>
<li>空文字列<code>""</code>をSplitすると、空文字列1個を含むスライスが返る（要素数0ではない）</li>
</ul>
<p>類似の関数として、連続する空白をまとめて区切ってくれる<code>strings.Fields(s)</code>もあります。「スペース区切りの単語に分けたい」だけならFieldsの方が便利なことも多いです。</p>
<pre><code>words := strings.Fields("Go  is   fun")
// []string{"Go", "is", "fun"}（連続する空白も1つの区切りとして扱う）</code></pre>
<p>Splitで分解し、各要素をforループで処理し、最後にJoinで組み立て直す——という流れはCSV処理などで頻出のパターンです。</p>`,
      task: `カンマ区切りの文字列<code>csv</code>を<code>strings.Split</code>で分割して要素数を出力し、さらに<code>strings.Join</code>で" / "区切りにつなぎ直して出力してください。`,
      code: `package main

import (
	"fmt"
	"strings"
)

func main() {
	csv := "apple,banana,cherry"

	// TODO: csvをカンマで分割してpartsに代入する
	parts := []string{csv}

	fmt.Println("要素数:", len(parts))
	for _, p := range parts {
		fmt.Println("-", p)
	}

	// TODO: partsを" / "でつないでjoinedに代入する
	joined := csv

	fmt.Println(joined)
}
`,
      solution: `package main

import (
	"fmt"
	"strings"
)

func main() {
	csv := "apple,banana,cherry"

	// Splitは区切り文字で分割した[]stringを返す
	parts := strings.Split(csv, ",")

	fmt.Println("要素数:", len(parts))
	for _, p := range parts {
		fmt.Println("-", p)
	}

	// Joinはスライスの要素を区切り文字でつないだ文字列を返す
	joined := strings.Join(parts, " / ")

	fmt.Println(joined)
}
`,
      hints: [
        `SplitとJoinは逆の関係です。Splitは文字列からスライスへ、Joinはスライスから文字列へ変換します。`,
        `strings.Split(csv, ",") と strings.Join(parts, " / ") のように書きます。`
      ],
      expectedOutput: "apple / banana / cherry"
    },
    {
      id: 104,
      title: "ReplaceとReplaceAll",
      explanation: `<p>文字列の一部を置き換えるには<code>strings.Replace</code>と<code>strings.ReplaceAll</code>を使います。両者の違いは「何回置換するか」を指定できるかどうかです。</p>
<pre><code>s := "go go go"
fmt.Println(strings.Replace(s, "go", "Go", 1))  // "Go go go"（最初の1個だけ）
fmt.Println(strings.Replace(s, "go", "Go", 2))  // "Go Go go"（最初の2個）
fmt.Println(strings.Replace(s, "go", "Go", -1)) // "Go Go Go"（すべて）
fmt.Println(strings.ReplaceAll(s, "go", "Go"))  // "Go Go Go"（すべて）</code></pre>
<p><code>Replace(s, old, new, n)</code>の第4引数nは「最大何回置換するか」です。<strong>nに-1を渡すとすべて置換</strong>されます。<code>ReplaceAll(s, old, new)</code>は<code>Replace(s, old, new, -1)</code>とまったく同じ意味で、「全部置換したい」という意図がコードから読み取りやすくなるため、全置換の場合はReplaceAllを使うのがおすすめです。</p>
<p>他の関数と同様、<strong>元の文字列は変更されず、置換後の新しい文字列が返されます</strong>。</p>
<h4>大量に置換するならReplacer</h4>
<p>複数の置換ルールを一度に適用したい場合は<code>strings.NewReplacer</code>が便利です。</p>
<pre><code>r := strings.NewReplacer("&amp;", "&amp;amp;", "「", "[", "」", "]")
fmt.Println(r.Replace("「Go言語」"))  // "[Go言語]"</code></pre>
<p>HTMLのエスケープ処理（特殊な意味を持つ記号を安全な表現に変換すること）のような「ルールの組を順に適用する」処理を1回の走査で行えます。まずはReplace・ReplaceAllをしっかり使えるようになりましょう。</p>`,
      task: `文字列<code>s</code>に対して、(1)最初の1個だけ"go"を"Go"に置換した結果、(2)<code>ReplaceAll</code>ですべて置換した結果、の2つを出力してください。`,
      code: `package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "go go go"

	// TODO: 最初の1個だけ"go"を"Go"に置換して出力する（Replaceの第4引数に注目）
	fmt.Println(strings.Replace(s, "go", "Go", -1))

	// TODO: ReplaceAllを使ってすべて置換して出力する
}
`,
      solution: `package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "go go go"

	// 第4引数の1は「最大1回だけ置換する」という意味
	fmt.Println(strings.Replace(s, "go", "Go", 1))

	// ReplaceAllはすべての出現箇所を置換する
	fmt.Println(strings.ReplaceAll(s, "go", "Go"))
}
`,
      hints: [
        `Replaceの第4引数は置換する最大回数です。-1はすべて、1は最初の1個だけを意味します。`,
        `1個だけなら strings.Replace(s, "go", "Go", 1)、全部なら strings.ReplaceAll(s, "go", "Go") です。`
      ],
      expectedOutput: "Go Go Go"
    },
    {
      id: 105,
      title: "strings.Builderで効率的な連結",
      explanation: `<p>文字列の連結は<code>+</code>演算子でもできますが、ループの中で何度も<code>+=</code>で連結するのは非効率です。Goの文字列は不変なので、連結のたびに「新しい文字列を作ってコピーする」処理が発生するためです。1万回連結すれば1万回のメモリ確保とコピーが起こります。</p>
<pre><code>// 非効率な例：ループのたびに新しい文字列が作られる
s := ""
for i := 0; i &lt; 10000; i++ {
    s += "a"
}</code></pre>
<p>この問題を解決するのが<code>strings.Builder</code>です。内部のバッファ（一時的なデータ置き場）に文字列を書き足していき、最後に<code>String()</code>で1回だけ文字列を取り出します。</p>
<pre><code>var b strings.Builder
b.WriteString("Hello")
b.WriteString(", ")
b.WriteString("Go")
fmt.Println(b.String()) // "Hello, Go"
fmt.Println(b.Len())    // 9（現在のバイト数）</code></pre>
<p>主なメソッドは次の通りです。</p>
<table>
<tr><th>メソッド</th><th>役割</th></tr>
<tr><td><code>WriteString(s)</code></td><td>文字列を追記する</td></tr>
<tr><td><code>WriteRune(r)</code></td><td>1文字（rune）を追記する</td></tr>
<tr><td><code>String()</code></td><td>これまでの内容を文字列として取り出す</td></tr>
<tr><td><code>Len()</code></td><td>現在のバイト数を返す</td></tr>
<tr><td><code>Reset()</code></td><td>内容を空にする</td></tr>
</table>
<p><code>var b strings.Builder</code>と宣言するだけで初期化不要で使い始められます（ゼロ値がそのまま使える設計）。使い分けの目安は、<strong>連結が2〜3回程度なら<code>+</code>で十分、ループ内で繰り返し連結するならBuilder</strong>です。なお、単純にスライスを区切り文字でつなぐだけなら前ステップの<code>strings.Join</code>が最も簡潔です。</p>`,
      task: `<code>strings.Builder</code>を使って、スライス<code>words</code>の要素をスペース区切りで連結し、結果と<code>Len()</code>を出力してください。（2番目以降の要素の前にだけスペースを追加します）`,
      code: `package main

import (
	"fmt"
	"strings"
)

func main() {
	words := []string{"Go", "is", "simple"}

	var b strings.Builder
	for i, w := range words {
		if i > 0 {
			// TODO: 区切りのスペースをBuilderに追記する
		}
		// TODO: 単語wをBuilderに追記する
		_ = w
	}

	fmt.Println(b.String())
	fmt.Println("長さ:", b.Len())
}
`,
      solution: `package main

import (
	"fmt"
	"strings"
)

func main() {
	words := []string{"Go", "is", "simple"}

	// Builderはゼロ値のまま使い始められる
	var b strings.Builder
	for i, w := range words {
		if i > 0 {
			// 2番目以降の要素の前にだけ区切りを入れる
			b.WriteString(" ")
		}
		b.WriteString(w)
	}

	fmt.Println(b.String())
	fmt.Println("長さ:", b.Len())
}
`,
      hints: [
        `Builderへの追記はb.WriteString(文字列)です。最後にb.String()で全体を取り出します。`,
        `if i > 0 のブロックに b.WriteString(" ") を、その後に b.WriteString(w) を書きます。_ = w の行は不要になるので削除しましょう。`
      ],
      expectedOutput: "Go is simple"
    },
    {
      id: 106,
      title: "strconv詳説（Atoi・Itoa・ParseFloat・FormatFloat）",
      explanation: `<p>「文字列の"42"を数値の42にしたい」——この変換を担うのが<code>strconv</code>パッケージです（string conversionの略）。Goでは<code>int("42")</code>のようなキャストはできないため、必ずstrconvを使います。</p>
<table>
<tr><th>関数</th><th>変換</th><th>戻り値</th></tr>
<tr><td><code>strconv.Atoi(s)</code></td><td>文字列→int</td><td><code>(int, error)</code></td></tr>
<tr><td><code>strconv.Itoa(n)</code></td><td>int→文字列</td><td><code>string</code></td></tr>
<tr><td><code>strconv.ParseFloat(s, 64)</code></td><td>文字列→float64</td><td><code>(float64, error)</code></td></tr>
<tr><td><code>strconv.FormatFloat(f, 'f', 2, 64)</code></td><td>float64→文字列</td><td><code>string</code></td></tr>
</table>
<p>重要なのは、<strong>文字列→数値の変換は失敗する可能性があるため、errorも一緒に返される</strong>という点です。"abc"のような数値でない文字列を渡されたら変換できないからです。逆方向（数値→文字列）は必ず成功するのでerrorはありません。</p>
<pre><code>n, err := strconv.Atoi("42")
if err != nil {
    fmt.Println("変換エラー:", err)
    return
}
fmt.Println(n + 8) // 50（ちゃんとintとして計算できる）</code></pre>
<p><code>ParseFloat</code>の第2引数はビット数（64ならfloat64精度）です。<code>FormatFloat</code>の引数は「値、フォーマット（'f'は小数表記）、小数点以下の桁数、ビット数」で、<code>FormatFloat(2.5, 'f', 2, 64)</code>なら"2.50"になります。</p>
<p>AtoiとItoaという名前はC言語由来で、aはASCII（文字）、iはintegerを表します。「a to i＝文字から整数へ」と覚えましょう。名前を混同すると型エラーになるので、コンパイルエラーのメッセージを読んで気づけるようになるのも大事なスキルです。</p>`,
      task: `<code>strconv.Atoi</code>で"42"を数値に変換して8を足した結果を出力し、<code>strconv.Itoa</code>で123を文字列に変換して"円"と連結して出力してください。エラー処理も書きましょう。`,
      code: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	// TODO: このままだとコンパイルエラー。Atoiは(int, error)の2つを返す
	n := strconv.Atoi("42")
	fmt.Println("Atoi:", n+8)

	// TODO: Itoaでintを文字列に変換して"円"と連結する
	fmt.Println("Itoa:", 123+"円")

	f, _ := strconv.ParseFloat("3.14", 64)
	fmt.Println("ParseFloat:", f*2)
	fmt.Println("FormatFloat:", strconv.FormatFloat(2.5, 'f', 2, 64))
}
`,
      solution: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	// Atoiは変換に失敗する可能性があるため(int, error)を返す
	n, err := strconv.Atoi("42")
	if err != nil {
		fmt.Println("変換エラー:", err)
		return
	}
	fmt.Println("Atoi:", n+8)

	// Itoaはintを文字列に変換する（失敗しないのでerrorなし）
	fmt.Println("Itoa:", strconv.Itoa(123)+"円")

	f, _ := strconv.ParseFloat("3.14", 64)
	fmt.Println("ParseFloat:", f*2)
	fmt.Println("FormatFloat:", strconv.FormatFloat(2.5, 'f', 2, 64))
}
`,
      hints: [
        `文字列→数値は失敗しうるので、Atoiは値とerrorの2つを返します。n, err := の形で受け取りましょう。`,
        `intと文字列は+で直接連結できません。strconv.Itoa(123)+"円" のように先に文字列へ変換します。`
      ],
      expectedOutput: "Atoi: 50"
    },
    {
      id: 107,
      title: "fmt.Sprintfと書式指定（%v %+v %T %q・幅・精度）",
      explanation: `<p><code>fmt.Sprintf</code>は「書式（フォーマット）に従って文字列を組み立てて返す」関数です。画面に出力する<code>fmt.Printf</code>と書式の書き方は同じで、Sprintfは出力せずに文字列として返す点だけが違います。</p>
<table>
<tr><th>動詞</th><th>意味</th><th>例（User{Name:"Alice", Age:20}の場合）</th></tr>
<tr><td><code>%v</code></td><td>デフォルト表記</td><td><code>{Alice 20}</code></td></tr>
<tr><td><code>%+v</code></td><td>構造体をフィールド名付きで</td><td><code>{Name:Alice Age:20}</code></td></tr>
<tr><td><code>%T</code></td><td>値の型</td><td><code>main.User</code></td></tr>
<tr><td><code>%q</code></td><td>文字列をダブルクォート付きで</td><td><code>"Alice"</code></td></tr>
<tr><td><code>%d</code></td><td>整数（10進数）</td><td><code>20</code></td></tr>
<tr><td><code>%f</code></td><td>浮動小数点数</td><td><code>3.141590</code></td></tr>
</table>
<p>この<code>%v</code>などの記号は「動詞（verb）」と呼ばれます。特に<code>%+v</code>と<code>%T</code>はデバッグ時に大活躍します。「この変数、今どんな中身でどんな型？」をすぐ確認できるからです。<code>%q</code>は前後の空白の有無を確認したいときに便利です。</p>
<h4>幅と精度</h4>
<p>動詞の前に数値を付けると表示幅や精度を制御できます。</p>
<pre><code>fmt.Sprintf("%5d", 42)     // "   42"（幅5で右寄せ）
fmt.Sprintf("%-5d|", 42)   // "42   |"（-で左寄せ）
fmt.Sprintf("%.2f", 3.14159) // "3.14"（小数点以下2桁）
fmt.Sprintf("%08.2f", 3.14159) // "00003.14"（幅8、0埋め）</code></pre>
<p><code>%.2f</code>は金額や割合の表示で頻出です。前ステップの<code>strconv.FormatFloat(f, 'f', 2, 64)</code>と同じ結果が得られますが、他の文字列と組み合わせて1行で書けるのがSprintfの強みです。表を整形して出力するときは幅指定が役立ちます。</p>`,
      task: `構造体<code>u</code>を<code>%v</code>と<code>%+v</code>のそれぞれで文字列化して出力し、さらに<code>%.2f</code>で3.14159を小数点以下2桁にして出力してください。`,
      code: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

func main() {
	u := User{Name: "Alice", Age: 20}

	fmt.Println(fmt.Sprintf("%v", u))

	// TODO: %+vを使ってフィールド名付きで出力する

	fmt.Println(fmt.Sprintf("%T", u))
	fmt.Println(fmt.Sprintf("%q", u.Name))

	// TODO: %.2fを使って3.14159を小数点以下2桁で出力する
}
`,
      solution: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

func main() {
	u := User{Name: "Alice", Age: 20}

	fmt.Println(fmt.Sprintf("%v", u))

	// %+vはフィールド名付きで構造体を表示する（デバッグに便利）
	fmt.Println(fmt.Sprintf("%+v", u))

	fmt.Println(fmt.Sprintf("%T", u))
	fmt.Println(fmt.Sprintf("%q", u.Name))

	// %.2fは小数点以下2桁に丸めて表示する
	fmt.Println(fmt.Sprintf("%.2f", 3.14159))
}
`,
      hints: [
        `%vと%+vの違いは、構造体のフィールド名が表示されるかどうかです。`,
        `fmt.Sprintf("%+v", u) と fmt.Sprintf("%.2f", 3.14159) をそれぞれPrintlnで出力します。`
      ],
      expectedOutput: "{Name:Alice Age:20}"
    },
    {
      id: 108,
      title: "runeスライスと文字単位の処理",
      explanation: `<p>Goの文字列の実体は「バイトの並び」です。英数字は1文字1バイトですが、日本語はUTF-8という符号化方式で1文字3バイトになるため、<code>len()</code>やインデックスアクセスの結果が直感と食い違います。</p>
<pre><code>s := "こんにちは"
fmt.Println(len(s))  // 15（バイト数。文字数ではない！）
fmt.Println(s[0])    // 227（1バイト目の数値が返ってしまう）</code></pre>
<p>「文字」を単位に扱いたいときは<code>rune</code>（ルーン：Unicodeの1文字を表す型。実体はint32）に変換します。<code>[]rune(s)</code>で文字単位のスライスが得られます。</p>
<pre><code>r := []rune("こんにちは")
fmt.Println(len(r))       // 5（文字数）
fmt.Println(string(r[0])) // "こ"（1文字目）</code></pre>
<p><code>string(r)</code>で文字列に戻せます。また、<code>for range</code>で文字列をループすると、自動的にrune単位で1文字ずつ取り出されます（インデックスはバイト位置になる点に注意）。</p>
<pre><code>for i, c := range "Go語" {
    fmt.Println(i, string(c)) // 0 G、1 o、2 語（iは0,1,2ではなく0,1,2...バイト位置）
}</code></pre>
<h4>定番：文字列の反転</h4>
<p>runeスライスに変換してから先頭と末尾を入れ替えていくのが正しい方法です。バイト単位で反転すると日本語が壊れます。</p>
<pre><code>r := []rune("こんにちは")
for i, j := 0, len(r)-1; i &lt; j; i, j = i+1, j-1 {
    r[i], r[j] = r[j], r[i]
}
fmt.Println(string(r)) // "はちにんこ"</code></pre>
<p><strong>「バイト数はlen(s)、文字数はlen([]rune(s))」</strong>——この区別はGoの文字列処理で最重要の知識です。</p>`,
      task: `文字列<code>s</code>のバイト数と文字数を出力し、runeスライスに変換して反転した文字列を出力してください。`,
      code: `package main

import "fmt"

func main() {
	s := "こんにちは"

	fmt.Println("バイト長:", len(s))

	// TODO: []runeに変換して文字数を出力する
	r := []rune(s)
	fmt.Println("文字数:", len(s)) // ここを修正

	// TODO: rの先頭と末尾を入れ替えていき、反転した文字列を出力する
	// ヒント：for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 { ... }
	fmt.Println("反転:", string(r))
}
`,
      solution: `package main

import "fmt"

func main() {
	s := "こんにちは"

	fmt.Println("バイト長:", len(s))

	// []runeに変換すると文字単位で扱える
	r := []rune(s)
	fmt.Println("文字数:", len(r))

	// 先頭と末尾を入れ替えながら中央に向かって進む
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	fmt.Println("反転:", string(r))
}
`,
      hints: [
        `len(s)はバイト数、len([]rune(s))は文字数です。日本語は1文字3バイトなので結果が変わります。`,
        `反転はr[i], r[j] = r[j], r[i]で2つの要素を同時に入れ替えます。iを進めjを戻しながらi < jの間繰り返します。`
      ],
      expectedOutput: "反転: はちにんこ"
    },
    {
      id: 109,
      title: "unicodeパッケージ（IsDigit・IsUpper）",
      explanation: `<p>「この文字は数字か？大文字か？」を判定するには<code>unicode</code>パッケージを使います。判定対象は文字列ではなく<strong>1文字（rune）</strong>である点がポイントです。前ステップで学んだ「for rangeで1文字ずつ取り出す」処理と組み合わせて使います。</p>
<table>
<tr><th>関数</th><th>判定内容</th><th>例</th></tr>
<tr><td><code>unicode.IsDigit(r)</code></td><td>10進数字か</td><td>'3'→true、'a'→false</td></tr>
<tr><td><code>unicode.IsUpper(r)</code></td><td>大文字か</td><td>'A'→true、'a'→false</td></tr>
<tr><td><code>unicode.IsLower(r)</code></td><td>小文字か</td><td>'a'→true</td></tr>
<tr><td><code>unicode.IsLetter(r)</code></td><td>文字（アルファベットや漢字など）か</td><td>'あ'→true、'1'→false</td></tr>
<tr><td><code>unicode.IsSpace(r)</code></td><td>空白文字か</td><td>' '→true</td></tr>
</table>
<pre><code>for _, r := range "A1b2C3" {
    if unicode.IsDigit(r) {
        fmt.Println(string(r), "は数字")
    }
}</code></pre>
<p>文字列全体を変換する<code>strings.ToUpper</code>に対して、<code>unicode.ToUpper(r)</code>は1文字だけを変換します。「先頭の1文字だけ大文字にする」ような処理はruneスライスとunicode.ToUpperの組み合わせで書けます。</p>
<pre><code>r := []rune("hello")
r[0] = unicode.ToUpper(r[0])
fmt.Println(string(r)) // "Hello"</code></pre>
<p>実務では「パスワードに数字と大文字が含まれているかのバリデーション（入力チェック）」「識別子が英字で始まるかの判定」などで登場します。stringsパッケージが「文字列全体」を扱うのに対し、unicodeパッケージは「1文字の性質」を調べる、と役割を整理して覚えましょう。</p>`,
      task: `文字列<code>s</code>を1文字ずつ調べ、数字の個数と大文字の個数を数えて出力してください。`,
      code: `package main

import (
	"fmt"
	"unicode"
)

func main() {
	s := "A1b2C3"

	digits := 0
	uppers := 0

	for _, r := range s {
		// TODO: rが数字ならdigitsを、大文字ならuppersを増やす
		_ = r
	}

	fmt.Println("数字:", digits, "大文字:", uppers)
	_ = unicode.IsDigit
}
`,
      solution: `package main

import (
	"fmt"
	"unicode"
)

func main() {
	s := "A1b2C3"

	digits := 0
	uppers := 0

	// for rangeで文字列を回すと1文字ずつrune型で取り出せる
	for _, r := range s {
		if unicode.IsDigit(r) {
			digits++
		}
		if unicode.IsUpper(r) {
			uppers++
		}
	}

	fmt.Println("数字:", digits, "大文字:", uppers)
}
`,
      hints: [
        `for rangeで取り出したrune型の変数rを、unicodeパッケージの判定関数にそのまま渡せます。`,
        `if unicode.IsDigit(r) { digits++ } と if unicode.IsUpper(r) { uppers++ } の2つのifを書きます。_ = r と _ = unicode.IsDigit の行は不要になるので削除しましょう。`
      ],
      expectedOutput: "数字: 3 大文字: 2"
    },
    {
      id: 110,
      title: "総合演習：CSV風文字列のパースと集計",
      explanation: `<p>この章の総仕上げとして、CSV（カンマ区切りデータ）風の文字列を解析（パース）して集計するプログラムを作ります。実務のデータ処理の縮図と言える演習です。</p>
<p>扱うデータは「商品名,価格」の組がセミコロンで並んだ文字列です。</p>
<pre><code>data := "apple,120;banana,80;cherry,200"</code></pre>
<p>処理の流れを整理すると次のようになります。</p>
<ol>
<li><code>strings.Split(data, ";")</code>でレコード（1件分のデータ）に分割する</li>
<li>各レコードを<code>strings.Split(rec, ",")</code>でフィールド（項目）に分割する</li>
<li>価格の文字列を<code>strconv.Atoi</code>で数値に変換する（エラー処理を忘れずに）</li>
<li>合計金額と最高値の商品を集計する</li>
</ol>
<p>この「大きな区切りで分割→小さな区切りで分割→型変換→集計」という多段の流れは、ログ解析や設定ファイルの読み込みなど、あらゆるデータ処理の基本形です。</p>
<h4>守りのコードを書く</h4>
<p>実際のデータには不正な行が混ざることがあります。フィールド数が足りない行や数値でない価格をそのまま処理するとプログラムが壊れるため、チェックして読み飛ばす（continueする）のが定石です。</p>
<pre><code>fields := strings.Split(rec, ",")
if len(fields) != 2 {
    continue // フィールド数が不正な行は読み飛ばす
}
price, err := strconv.Atoi(strings.TrimSpace(fields[1]))
if err != nil {
    continue // 数値に変換できない行も読み飛ばす
}</code></pre>
<p><code>TrimSpace</code>を挟んでいるのは、" 120"のように空白が紛れ込んでいてもAtoiが失敗しないようにするためです。細かい配慮ですが、この一手間が実務では効いてきます。</p>`,
      task: `文字列<code>data</code>をパースして、各商品を「名前: 価格円」の形式で出力し、最後に合計金額と最高値の商品を出力してください。TODOの集計処理を完成させましょう。`,
      code: `package main

import (
	"fmt"
	"strconv"
	"strings"
)

func main() {
	data := "apple,120;banana,80;cherry,200"

	total := 0
	maxName := ""
	maxPrice := 0

	records := strings.Split(data, ";")
	for _, rec := range records {
		fields := strings.Split(rec, ",")
		if len(fields) != 2 {
			continue
		}
		name := strings.TrimSpace(fields[0])
		price, err := strconv.Atoi(strings.TrimSpace(fields[1]))
		if err != nil {
			continue
		}

		fmt.Println(name+":", strconv.Itoa(price)+"円")

		// TODO: totalにpriceを加算する

		// TODO: priceがmaxPriceより大きければmaxNameとmaxPriceを更新する
	}

	fmt.Println("合計:", strconv.Itoa(total)+"円")
	fmt.Println("最高値:", maxName, "("+strconv.Itoa(maxPrice)+"円)")
}
`,
      solution: `package main

import (
	"fmt"
	"strconv"
	"strings"
)

func main() {
	data := "apple,120;banana,80;cherry,200"

	total := 0
	maxName := ""
	maxPrice := 0

	// セミコロンでレコードに分割し、カンマでフィールドに分割する
	records := strings.Split(data, ";")
	for _, rec := range records {
		fields := strings.Split(rec, ",")
		if len(fields) != 2 {
			// フィールド数が不正な行は読み飛ばす
			continue
		}
		name := strings.TrimSpace(fields[0])
		price, err := strconv.Atoi(strings.TrimSpace(fields[1]))
		if err != nil {
			// 数値に変換できない行は読み飛ばす
			continue
		}

		fmt.Println(name+":", strconv.Itoa(price)+"円")

		total += price

		if price > maxPrice {
			maxName = name
			maxPrice = price
		}
	}

	fmt.Println("合計:", strconv.Itoa(total)+"円")
	fmt.Println("最高値:", maxName, "("+strconv.Itoa(maxPrice)+"円)")
}
`,
      hints: [
        `合計はtotal += price、最高値の更新はif price > maxPrice { ... }の中で2つの変数を書き換えます。`,
        `最高値の更新では maxName = name と maxPrice = price の両方を忘れずに代入しましょう。`,
        `120+80+200なので、合計は400円になるはずです。`
      ],
      expectedOutput: "合計: 400円"
    }
  ]
});
