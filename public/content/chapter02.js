// 第2章：基本型と演算
registerChapter({
  number: 2,
  title: "基本型と演算",
  description: "整数・小数・文字列・真偽値というGoの基本型と、その演算・型変換のルールを学び、実用的な計算プログラムを書けるようになります。",
  steps: [
    {
      id: 11,
      title: "整数型（int、int64、uint）",
      explanation: `<p>第1章では整数を単に<code>int</code>として扱いましたが、Goの整数型には実は多くの種類があります。まずは代表的な3つを押さえましょう。</p>
<table>
<tr><th>型</th><th>扱える範囲</th><th>使いどころ</th></tr>
<tr><td><code>int</code></td><td>環境依存（64bit環境では約±922京）</td><td>迷ったらこれ。Goの整数の標準</td></tr>
<tr><td><code>int64</code></td><td>約±922京（常に64bit）</td><td>環境によらず確実に大きな値を扱いたいとき</td></tr>
<tr><td><code>uint</code></td><td>0以上のみ（符号なし）</td><td>負にならないことが保証される特殊な場面</td></tr>
</table>
<pre><code>var a int = 100
var b int64 = 9000000000 // 90億。int32には収まらない大きさ
var c uint = 42          // uintは負の値を入れられない</code></pre>
<p>ポイントは3つあります。1つ目、<strong>普段はintを使う</strong>こと。Goの標準ライブラリも基本的にintを受け渡しします。2つ目、<code>int64</code>のようにビット数付きの型は「どの環境でも同じ範囲」を保証したいときに使います（他にint8、int16、int32もあります）。3つ目、<code>uint</code>（unsigned int：符号なし整数）は0未満になりえない型ですが、引き算で0を下回ると巨大な値に化ける事故があるため、実務では「特別な理由がなければ使わない」のが定石です。</p>
<p>そしてGoでは、<code>int</code>と<code>int64</code>は<strong>別の型として厳密に区別されます</strong>。似た者同士でもそのままでは混ぜて計算できません（この話はステップ17で詳しく扱います）。まずは「整数にも種類がある」「基本はint」という感覚をつかみましょう。</p>`,
      task: `そのまま実行して3つの整数型の値を確認しましょう。次に、変数<code>b</code>の値を<code>9000000000</code>（90億）に書き換えて、int64が大きな値を扱えることを確かめてください。`,
      code: `package main

import "fmt"

func main() {
	var a int = 100
	// TODO: bの値を9000000000（90億）に書き換えて実行する
	var b int64 = 64
	var c uint = 42

	fmt.Printf("int: %d\\n", a)
	fmt.Printf("int64: %d\\n", b)
	fmt.Printf("uint: %d\\n", c)
}`,
      solution: `package main

import "fmt"

func main() {
	var a int = 100
	// int64はどの環境でも64bitなので90億のような大きな値も安全に扱える
	var b int64 = 9000000000
	var c uint = 42

	fmt.Printf("int: %d\\n", a)
	fmt.Printf("int64: %d\\n", b)
	fmt.Printf("uint: %d\\n", c)
}`,
      hints: [`整数リテラル（コードに直接書く数値）にはカンマを入れず、9000000000とそのまま書きます。`, `var b int64 = 9000000000 に書き換えるだけです。%dはint64もそのまま表示できます。`],
      expectedOutput: "int64: 9000000000"
    },
    {
      id: 12,
      title: "浮動小数点型（float64）",
      explanation: `<p>小数を扱うには浮動小数点型を使います。Goには<code>float32</code>と<code>float64</code>がありますが、<strong>特別な理由がない限りfloat64を使う</strong>のがGoの流儀です。精度が高く、標準ライブラリの数学関数もfloat64を前提にしています。</p>
<pre><code>var radius float64 = 2.0
pi := 3.14159 // 小数リテラルから := で宣言すると自動的にfloat64になる</code></pre>
<p>短縮宣言で<code>3.14</code>のような小数を代入すると、型推論により自動でfloat64になります。表示には<code>%f</code>という書式指定子を使い、小数点以下の桁数も指定できます。</p>
<table>
<tr><th>書式</th><th>意味</th><th>3.14159の表示例</th></tr>
<tr><td><code>%f</code></td><td>小数（デフォルトは6桁）</td><td><code>3.141590</code></td></tr>
<tr><td><code>%.2f</code></td><td>小数点以下2桁で四捨五入</td><td><code>3.14</code></td></tr>
<tr><td><code>%v</code></td><td>いい感じに表示</td><td><code>3.14159</code></td></tr>
</table>
<p>1つ注意があります。浮動小数点数はコンピュータ内部で2進数の近似値として保存されるため、<code>0.1+0.2</code>が<code>0.30000000000000004</code>になるような微小な誤差が起こりえます。日常の計算では気にしなくて構いませんが、<strong>金額計算では誤差が許されないため浮動小数点を使わない</strong>（整数で「銭」単位を扱うなど）のが実務の鉄則です。「小数には誤差がありうる」と知っておくだけで、将来のバグを1つ防げます。</p>`,
      task: `TODOの行を完成させて円の面積（半径×半径×円周率）を計算し、<code>%.2f</code>を使って<code>円の面積: 12.57</code>と表示してください。`,
      code: `package main

import "fmt"

func main() {
	pi := 3.14159
	var radius float64 = 2.0

	// TODO: piとradiusを使って面積を計算し、変数areaに入れる
	area := 0.0

	// TODO: %.2fを使って「円の面積: 12.57」と表示する
	fmt.Printf("%v\\n", area)
}`,
      solution: `package main

import "fmt"

func main() {
	pi := 3.14159
	var radius float64 = 2.0

	// 面積 = 円周率 × 半径 × 半径
	area := pi * radius * radius

	// %.2f で小数点以下2桁に丸めて表示する
	fmt.Printf("円の面積: %.2f\\n", area)
}`,
      hints: [`掛け算の記号は*です。面積はpi * radius * radiusで計算できます。`, `表示はfmt.Printf("円の面積: %.2f\\n", area)とします。%.2fが小数点以下2桁指定です。`],
      expectedOutput: "円の面積: 12.57"
    },
    {
      id: 13,
      title: "数値演算と整数除算の罠",
      explanation: `<p>Goの算術演算子は<code>+ - * / %</code>の5つです。<code>%</code>は割り算の余りを求める演算子（剰余演算子）です。</p>
<table>
<tr><th>演算子</th><th>意味</th><th>例</th><th>結果</th></tr>
<tr><td><code>+</code> <code>-</code> <code>*</code></td><td>加算・減算・乗算</td><td><code>7 * 2</code></td><td><code>14</code></td></tr>
<tr><td><code>/</code></td><td>除算</td><td><code>7 / 2</code></td><td><code>3</code>（！）</td></tr>
<tr><td><code>%</code></td><td>剰余（余り）</td><td><code>7 % 2</code></td><td><code>1</code></td></tr>
</table>
<p>ここに初心者が必ず一度はハマる罠があります。<strong>整数同士の割り算は、結果も整数になり、小数点以下は切り捨てられる</strong>のです。</p>
<pre><code>fmt.Println(7 / 2)     // 3（3.5ではない！）
fmt.Println(7.0 / 2.0) // 3.5（小数同士なら小数の結果になる）</code></pre>
<p>「7÷2は3.5のはず」という数学の常識が通用しません。これはGoに限らず多くのプログラミング言語に共通する仕様で、「整数の世界で計算が完結する」と考えると理解しやすいでしょう。切り捨てられた端数は<code>%</code>で取り出せます（<code>7 % 2</code>は<code>1</code>）。この組み合わせは「500円を3人で割ると1人166円、余り2円」のような計算に便利です。</p>
<p>小数の結果が欲しいときは、小数同士で計算する必要があります。平均点の計算などで<code>(80 + 90) / 2</code>と書いて気づかぬうちに端数が消えるのは、実務でも本当によくあるバグです。<strong>割り算を書いたら「整数除算になっていないか」を必ず疑う</strong>習慣をつけましょう。</p>`,
      task: `まず実行して<code>7 / 2</code>が3になることを確認してください。その後、TODOの行を小数リテラル（<code>7.0</code>と<code>2.0</code>）を使った計算に修正し、<code>7.0 / 2.0 = 3.5</code>と表示させてください。`,
      code: `package main

import "fmt"

func main() {
	fmt.Println("7 / 2 =", 7/2)
	fmt.Println("7 % 2 =", 7%2)
	// TODO: 整数の7/2を、小数の7.0/2.0に修正して3.5を得る
	fmt.Println("7.0 / 2.0 =", 7/2)
}`,
      solution: `package main

import "fmt"

func main() {
	// 整数同士の割り算は小数点以下が切り捨てられる
	fmt.Println("7 / 2 =", 7/2)
	fmt.Println("7 % 2 =", 7%2)
	// 小数同士の割り算なら小数の結果が得られる
	fmt.Println("7.0 / 2.0 =", 7.0/2.0)
}`,
      hints: [`整数同士の割り算は整数、小数同士の割り算は小数になります。計算に使う数値の書き方がポイントです。`, `最後の行の7/2を7.0/2.0に書き換えると、結果が3.5になります。`],
      expectedOutput: "7.0 / 2.0 = 3.5"
    },
    {
      id: 14,
      title: "bool型",
      explanation: `<p><code>bool</code>型は<code>true</code>（真）か<code>false</code>（偽）の2つの値だけを持つ型です。「条件が成り立つかどうか」を表すために使われ、後の章で学ぶif文の土台になる重要な型です。</p>
<p>bool値を作る最も一般的な方法は<strong>比較演算子</strong>です。</p>
<table>
<tr><th>演算子</th><th>意味</th><th>例</th><th>結果</th></tr>
<tr><td><code>==</code></td><td>等しい</td><td><code>5 == 5</code></td><td><code>true</code></td></tr>
<tr><td><code>!=</code></td><td>等しくない</td><td><code>5 != 5</code></td><td><code>false</code></td></tr>
<tr><td><code>&gt;</code> <code>&gt;=</code></td><td>より大きい・以上</td><td><code>10 &gt; 5</code></td><td><code>true</code></td></tr>
<tr><td><code>&lt;</code> <code>&lt;=</code></td><td>より小さい・以下</td><td><code>3 &lt; 1</code></td><td><code>false</code></td></tr>
</table>
<p>さらに、bool値同士を組み合わせる<strong>論理演算子</strong>があります。</p>
<table>
<tr><th>演算子</th><th>意味</th><th>例</th></tr>
<tr><td><code>&amp;&amp;</code></td><td>かつ（両方trueならtrue）</td><td><code>age &gt;= 20 &amp;&amp; age &lt; 65</code></td></tr>
<tr><td><code>||</code></td><td>または（どちらかがtrueならtrue）</td><td><code>day == 6 || day == 7</code></td></tr>
<tr><td><code>!</code></td><td>否定（trueとfalseを反転）</td><td><code>!isClosed</code></td></tr>
</table>
<p>比較の結果は変数に入れられます。<code>isAdult := age &gt;= 20</code>のように、<strong>条件に名前を付ける</strong>と、コードが文章のように読めるようになります。これはリーダブルコードでも推奨される重要テクニックです。なお、代入の<code>=</code>と比較の<code>==</code>の書き間違いは定番のミスですが、Goでは文法エラーになるのですぐ気づけます。</p>`,
      task: `まず実行して比較結果を観察してください。その後、TODOの行で「20歳以上かつ65歳未満か」を<code>&amp;&amp;</code>を使って判定し、変数<code>isWorkingAge</code>に入れて表示してください。`,
      code: `package main

import "fmt"

func main() {
	fmt.Println("10 > 5 は", 10 > 5)
	fmt.Println("3 < 1 は", 3 < 1)

	age := 25
	// TODO: ageが20以上かつ65未満かを判定してisWorkingAgeに入れる
	isWorkingAge := false

	fmt.Println("isWorkingAge:", isWorkingAge)
}`,
      solution: `package main

import "fmt"

func main() {
	fmt.Println("10 > 5 は", 10 > 5)
	fmt.Println("3 < 1 は", 3 < 1)

	age := 25
	// 比較の結果はbool値として変数に保存できる
	isWorkingAge := age >= 20 && age < 65

	fmt.Println("isWorkingAge:", isWorkingAge)
}`,
      hints: [`「20以上」はage >= 20、「65未満」はage < 65です。2つの条件を「かつ」でつなぎます。`, `isWorkingAge := age >= 20 && age < 65 と書きます。ageが25なので結果はtrueになります。`],
      expectedOutput: "10 > 5 は true"
    },
    {
      id: 15,
      title: "string型と文字列連結",
      explanation: `<p><code>string</code>型は文字列（テキスト）を表す型です。ダブルクォートで囲んで作り、<code>+</code>演算子で連結（つなぎ合わせること）ができます。</p>
<pre><code>first := "Hello"
second := "Go"
message := first + ", " + second + "!"
fmt.Println(message) // Hello, Go!</code></pre>
<p>数値の足し算と同じ<code>+</code>記号ですが、文字列に対しては「連結」として働きます。ただし<strong>文字列と数値を直接<code>+</code>でつなぐことはできません</strong>。<code>"点数は" + 90</code>はコンパイルエラーになります（解決方法はステップ18で学びます）。</p>
<p>Goのstringには重要な特徴が2つあります。</p>
<table>
<tr><th>特徴</th><th>意味</th></tr>
<tr><td>不変（イミュータブル）</td><td>一度作った文字列の中身は変更できない。連結すると新しい文字列が作られる</td></tr>
<tr><td>UTF-8でエンコード</td><td>日本語・絵文字など世界中の文字をそのまま扱える（詳細は次のステップ）</td></tr>
</table>
<p>また、ダブルクォート内では<code>\\n</code>（改行）や<code>\\"</code>（ダブルクォート自体）などのエスケープシーケンスが使えます。</p>
<pre><code>fmt.Println("1行目\\n2行目")   // \\nの位置で改行される
fmt.Println("彼は\\"Go\\"と言った") // 彼は"Go"と言った</code></pre>
<p>文字列の連結はプログラミングの最頻出操作の1つです。挨拶文、ファイルパス、メッセージの組み立てなど、あらゆる場面で登場します。まずは<code>+</code>で自由自在につなげられるようになりましょう。</p>`,
      task: `TODOの行で、変数<code>first</code>と<code>second</code>を<code>+</code>で連結し、<code>Hello, Go!</code>という文字列を作って表示してください（カンマ・スペース・ビックリマークも忘れずに）。`,
      code: `package main

import "fmt"

func main() {
	first := "Hello"
	second := "Go"

	// TODO: firstとsecondを+で連結して「Hello, Go!」を作る
	message := ""

	fmt.Println(message)
}`,
      solution: `package main

import "fmt"

func main() {
	first := "Hello"
	second := "Go"

	// +演算子で文字列を連結できる。", "や"!"のような文字列リテラルも混ぜられる
	message := first + ", " + second + "!"

	fmt.Println(message)
}`,
      hints: [`変数と文字列リテラルは+で自由につなげられます。間に", "を挟むのがポイントです。`, `message := first + ", " + second + "!" とすれば「Hello, Go!」になります。`],
      expectedOutput: "Hello, Go!"
    },
    {
      id: 16,
      title: "runeとbyte（日本語文字列のlen）",
      explanation: `<p>文字列の長さは<code>len</code>関数で取得できます。ところが日本語で試すと、直感に反する結果になります。</p>
<pre><code>s := "Go言語"
fmt.Println(len(s)) // 8（4文字なのに！）</code></pre>
<p>なぜ8なのでしょうか。<code>len</code>が返すのは文字数ではなく<strong>バイト数</strong>（データ量の単位）だからです。Goの文字列はUTF-8という方式で保存されており、半角英数字は1文字1バイト、日本語はほとんどが1文字3バイトになります。「Go言語」は2バイト（Go）＋6バイト（言語）で8バイトです。</p>
<p>この問題を扱うために、Goには文字を表す2つの型があります。</p>
<table>
<tr><th>型</th><th>正体</th><th>表すもの</th></tr>
<tr><td><code>byte</code></td><td>uint8の別名</td><td>データの最小単位（1バイト）</td></tr>
<tr><td><code>rune</code></td><td>int32の別名</td><td>1つの文字（Unicodeコードポイント）</td></tr>
</table>
<p>文字数を数えたいときは、文字列を<code>[]rune</code>（runeの並び）に変換してから<code>len</code>を取ります。</p>
<pre><code>s := "Go言語"
fmt.Println(len(s))         // 8（バイト数）
fmt.Println(len([]rune(s))) // 4（文字数）</code></pre>
<p><code>[]rune(s)</code>は「文字列sをrune単位の並びに変換する」という書き方です。日本語を扱うサービスで「名前は10文字まで」のような制限を実装するとき、バイト数で数えてしまうと日本語3文字ちょっとで弾かれるバグになります。<strong>lenはバイト数、文字数が欲しければ[]rune</strong>。日本人エンジニアには特に重要な知識です。</p>`,
      task: `まず実行して<code>len("Go言語")</code>が8になることを確認してください。その後、TODOの行を<code>[]rune</code>を使った形に修正して、<code>文字数: 4</code>と表示させてください。`,
      code: `package main

import "fmt"

func main() {
	s := "Go言語"

	fmt.Println("バイト数:", len(s))
	// TODO: []rune(s)に変換してから長さを取り、文字数の4を表示する
	fmt.Println("文字数:", len(s))
}`,
      solution: `package main

import "fmt"

func main() {
	s := "Go言語"

	// lenはバイト数を返す。日本語は1文字3バイトなので 2+6=8
	fmt.Println("バイト数:", len(s))
	// []runeに変換すると文字単位で数えられる
	fmt.Println("文字数:", len([]rune(s)))
}`,
      hints: [`lenに渡す前に、文字列をrune（文字）単位の並びに変換する必要があります。`, `len(s)をlen([]rune(s))に書き換えると、バイト数ではなく文字数が得られます。`],
      expectedOutput: "文字数: 4"
    },
    {
      id: 17,
      title: "型変換は明示的",
      explanation: `<p>多くの言語では、intとfloatを混ぜて計算すると自動で型を合わせてくれます（暗黙の型変換）。しかしGoは違います。<strong>異なる型同士の演算はコンパイルエラー</strong>になり、変換したいときは必ず自分で明示します。</p>
<pre><code>var n int = 5
var f float64 = 1.5
fmt.Println(n * f)
// エラー: invalid operation: n * f (mismatched types int and float64)</code></pre>
<p>エラーメッセージの「mismatched types」は「型が一致していない」という意味です。解決するには、<code>型名(値)</code>という書き方で型変換（キャスト）します。</p>
<table>
<tr><th>書き方</th><th>意味</th><th>例</th></tr>
<tr><td><code>float64(n)</code></td><td>整数nを小数に変換</td><td><code>float64(5)</code>→<code>5.0</code></td></tr>
<tr><td><code>int(f)</code></td><td>小数fを整数に変換（小数点以下は切り捨て）</td><td><code>int(3.9)</code>→<code>3</code>（四捨五入ではない！）</td></tr>
<tr><td><code>int64(n)</code></td><td>intをint64に変換</td><td>同じ整数同士でも変換が必要</td></tr>
</table>
<pre><code>result := float64(n) * f // 5.0 * 1.5 = 7.5
count := int(3.9)        // 3（切り捨てに注意）</code></pre>
<p>面倒に感じるかもしれませんが、これはGoの意図的な設計です。暗黙変換は「知らないうちに精度が落ちていた」「意図しない型で計算されていた」というバグの温床になります。Goは<strong>変換が起こる場所をすべてコードに残す</strong>ことで、読み手が計算の挙動を正確に追えるようにしています。ステップ16の<code>[]rune(s)</code>も、実はこの型変換の仲間です。</p>`,
      task: `このコードは型の不一致でコンパイルエラーになります。<code>float64()</code>を使って変数<code>n</code>を変換し、<code>結果: 7.5</code>と表示されるように修正してください。`,
      code: `package main

import "fmt"

func main() {
	var n int = 5
	var f float64 = 1.5

	// このままではコンパイルエラー: mismatched types int and float64
	// TODO: nをfloat64に変換して計算できるようにする
	fmt.Println("結果:", n*f)
}`,
      solution: `package main

import "fmt"

func main() {
	var n int = 5
	var f float64 = 1.5

	// 型名(値) で明示的に変換してから計算する
	fmt.Println("結果:", float64(n)*f)
}`,
      hints: [`intとfloat64は直接掛け算できません。どちらかの型に揃える必要があります。`, `n*fをfloat64(n)*fに書き換えると、float64同士の掛け算になりエラーが解消します。`],
      expectedOutput: "結果: 7.5"
    },
    {
      id: 18,
      title: "strconvで文字列と数値の変換",
      explanation: `<p>ステップ17の型変換<code>型名(値)</code>は数値同士の変換には使えますが、<strong>「数値↔文字列」の変換には使えません</strong>。<code>string(65)</code>は「65という文字列」ではなく、文字コード65の文字"A"になってしまいます。数値と文字列の変換には、標準ライブラリの<code>strconv</code>パッケージ（string conversionの略）を使います。まずは代表的な2つの関数だけ覚えましょう。</p>
<table>
<tr><th>関数</th><th>変換の向き</th><th>例</th></tr>
<tr><td><code>strconv.Itoa</code></td><td>整数→文字列（Integer to ASCII）</td><td><code>strconv.Itoa(25)</code>→<code>"25"</code></td></tr>
<tr><td><code>strconv.Atoi</code></td><td>文字列→整数（ASCII to Integer）</td><td><code>strconv.Atoi("100")</code>→<code>100</code></td></tr>
</table>
<p>複数のパッケージを使うときは、import文をカッコでまとめます。</p>
<pre><code>import (
    "fmt"
    "strconv"
)</code></pre>
<p><code>Atoi</code>は少し特殊で、<strong>2つの値を返します</strong>。"abc"のように数値に変換できない文字列が来る可能性があるため、「変換結果」と「エラー情報」のペアが返るのです。エラー処理は後の章でしっかり学ぶので、今は2つ目の値を<code>_</code>（ステップ9で登場した値の捨て場）で受け流します。</p>
<pre><code>n, _ := strconv.Atoi("100") // nは整数の100になる
s := strconv.Itoa(25)       // sは文字列の"25"になる
msg := "年齢は" + s + "歳"    // 文字列になれば+で連結できる</code></pre>
<p>ユーザー入力やファイルの中身は基本的にすべて文字列として届くため、「文字列を数値にして計算し、結果をまた文字列にして表示する」のは実務の超頻出パターンです。</p>`,
      task: `TODOの2か所を完成させてください。1つ目は<code>strconv.Itoa</code>で数値25を文字列にして連結し、2つ目は<code>strconv.Atoi</code>で文字列"100"を数値にして23と足し算します。`,
      code: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	age := 25
	// TODO: strconv.Itoaでageを文字列にして「年齢は25歳」を作る
	message := "年齢は" + "" + "歳"
	fmt.Println(message)

	// TODO: strconv.Atoiで"100"を数値にしてnに入れる（エラーは_で受ける）
	n := 0
	fmt.Println("100 + 23 =", n+23)
}`,
      solution: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	age := 25
	// Itoaで整数を文字列に変換すれば+で連結できる
	message := "年齢は" + strconv.Itoa(age) + "歳"
	fmt.Println(message)

	// Atoiは「変換結果」と「エラー情報」の2つを返す。エラーは今は_で受け流す
	n, _ := strconv.Atoi("100")
	fmt.Println("100 + 23 =", n+23)
}`,
      hints: [`Itoaは整数を受け取って文字列を返すので、+で連結する式の中にそのまま書けます。`, `1つ目は"年齢は" + strconv.Itoa(age) + "歳"です。`, `2つ目はn, _ := strconv.Atoi("100")と書きます。2つの値を受け取るので左辺も2つ必要です。`],
      expectedOutput: "100 + 23 = 123"
    },
    {
      id: 19,
      title: "iotaと定数グループ",
      explanation: `<p>関連する定数をまとめて宣言したいとき、Goでは<code>const</code>をカッコでグループ化できます。そしてここで活躍するのが<code>iota</code>（イオタ）という仕組みです。</p>
<pre><code>const (
    Sunday  = iota // 0
    Monday         // 1（自動で iota が続く）
    Tuesday        // 2
)</code></pre>
<p><code>iota</code>は<strong>constグループの中で0から始まり、行が進むごとに1ずつ増える連番生成器</strong>です。しかも2行目以降は右辺を丸ごと省略でき、直前の式（この場合<code>= iota</code>）が自動で繰り返されます。曜日・状態・レベルのような「区別できればよい連番」を手書きせずに済むわけです。</p>
<p>手書きの連番と比べたメリットを整理します。</p>
<table>
<tr><th>観点</th><th>手書き（= 0, = 1, ...）</th><th>iota</th></tr>
<tr><td>途中に定数を追加</td><td>以降の番号をすべて書き直し</td><td>自動で振り直される</td></tr>
<tr><td>番号の重複ミス</td><td>起こりうる</td><td>起こらない</td></tr>
</table>
<p>さらに<code>iota</code>は式の中でも使えます。よく見る応用が「1から始めたい」場合と、サイズ単位の定義です。</p>
<pre><code>const (
    January = iota + 1 // 1
    February           // 2
)</code></pre>
<p>実はGoの標準ライブラリでも、時間の単位や曜日の定義に<code>iota</code>が使われています。「連続する定数のグループを見たらiota」と覚えておくと、他人のGoコードもすらすら読めるようになります。</p>`,
      task: `constグループの手書きの連番を<code>iota</code>を使った形に書き換えてください。<code>Sunday = iota</code>とし、続く2つは右辺を省略します。出力が変わらないことを確認しましょう。`,
      code: `package main

import "fmt"

func main() {
	// TODO: 手書きの連番をiotaを使った形に書き換える（2行目以降は右辺を省略できる）
	const (
		Sunday  = 0
		Monday  = 1
		Tuesday = 2
	)

	fmt.Println("Sunday =", Sunday)
	fmt.Println("Monday =", Monday)
	fmt.Println("Tuesday =", Tuesday)
}`,
      solution: `package main

import "fmt"

func main() {
	// iotaは0から始まり、行ごとに1ずつ増える。2行目以降は右辺を省略できる
	const (
		Sunday = iota
		Monday
		Tuesday
	)

	fmt.Println("Sunday =", Sunday)
	fmt.Println("Monday =", Monday)
	fmt.Println("Tuesday =", Tuesday)
}`,
      hints: [`最初の定数にだけ= iotaと書けば、0から始まる連番になります。`, `Sunday = iotaとし、MondayとTuesdayは名前だけ書けば直前の式が繰り返されて1、2になります。`],
      expectedOutput: "Tuesday = 2"
    },
    {
      id: 20,
      title: "総合演習：BMI計算機",
      explanation: `<p>第2章の総仕上げとして、BMI（体格指数）を計算するプログラムを作ります。BMIは「体重kg ÷ (身長m × 身長m)」で求められる健康指標で、18.5以上25未満が標準範囲とされています。この演習では本章の知識を総動員します。</p>
<table>
<tr><th>使う知識</th><th>登場ステップ</th><th>この演習での用途</th></tr>
<tr><td>int / float64</td><td>11・12</td><td>身長はcm単位の整数、計算は小数で行う</td></tr>
<tr><td>明示的な型変換</td><td>17</td><td>int型の身長をfloat64に変換する</td></tr>
<tr><td>整数除算の罠</td><td>13</td><td>cm→mの変換で100ではなく100.0で割る</td></tr>
<tr><td>bool型と比較</td><td>14</td><td>標準範囲かどうかの判定</td></tr>
<tr><td>%.1f</td><td>12</td><td>結果を小数点以下1桁で表示</td></tr>
</table>
<p>処理の流れは次の3段階です。</p>
<ol>
<li><strong>単位変換</strong>：int型の身長170cmをfloat64に変換し、100.0で割って1.7mにする</li>
<li><strong>計算</strong>：BMI = 体重 ÷ (身長m × 身長m)</li>
<li><strong>判定と表示</strong>：18.5以上25未満かをbool値で求め、%.1fで整形して表示</li>
</ol>
<pre><code>heightM := float64(heightCM) / 100.0 // 型変換してから小数で割る
bmi := weight / (heightM * heightM)  // カッコで計算順序を明示</code></pre>
<p>ポイントは1行目に凝縮されています。<code>float64()</code>への変換を忘れれば型エラー、<code>100</code>で割れば整数除算の罠。本章で学んだ2つの落とし穴が同時に待ち構えている、実戦的な1行です。完成したら身長・体重を自分の値に変えて動かしてみましょう。</p>`,
      task: `TODOの3か所を完成させてBMI計算機を作ってください。身長170cm・体重60.0kgのとき、<code>BMI: 20.8</code>と<code>標準範囲: true</code>が表示されれば成功です。`,
      code: `package main

import "fmt"

func main() {
	var heightCM int = 170
	weight := 60.0

	// TODO: heightCMをfloat64に変換し、100.0で割ってm単位のheightMを作る
	heightM := 0.0

	// TODO: BMI = weight ÷ (heightM × heightM) を計算する
	bmi := 0.0

	// TODO: bmiが18.5以上かつ25未満かを判定してisNormalに入れる
	isNormal := false

	fmt.Printf("身長: %dcm 体重: %.1fkg\\n", heightCM, weight)
	fmt.Printf("BMI: %.1f\\n", bmi)
	fmt.Println("標準範囲:", isNormal)
}`,
      solution: `package main

import "fmt"

func main() {
	var heightCM int = 170
	weight := 60.0

	// int型をfloat64に変換し、100.0で割って整数除算を避ける
	heightM := float64(heightCM) / 100.0

	// BMI = 体重kg ÷ (身長m × 身長m)
	bmi := weight / (heightM * heightM)

	// 18.5以上25未満なら標準範囲
	isNormal := bmi >= 18.5 && bmi < 25.0

	fmt.Printf("身長: %dcm 体重: %.1fkg\\n", heightCM, weight)
	fmt.Printf("BMI: %.1f\\n", bmi)
	fmt.Println("標準範囲:", isNormal)
}`,
      hints: [`まず単位変換から。heightCMはint型なので、float64(heightCM)と変換してから100.0で割ります。`, `BMIの計算はweight / (heightM * heightM)です。カッコを忘れると計算順序が変わってしまいます。`, `判定はbmi >= 18.5 && bmi < 25.0のように、比較演算子と&&を組み合わせます。`],
      expectedOutput: "BMI: 20.8"
    }
  ]
});
