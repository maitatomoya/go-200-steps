// 第1章：はじめてのGo
registerChapter({
  number: 1,
  title: "はじめてのGo",
  description: "Goプログラムの基本構造から変数・定数の宣言までを学び、最初のプログラムを自分の手で動かせるようになります。",
  steps: [
    {
      id: 1,
      title: "Hello Worldとfmt.Println",
      explanation: `<p>プログラミング学習の最初の一歩は、画面に文字を表示することです。Goでは<code>fmt</code>パッケージ（フォーマット付き入出力を担当する標準ライブラリ）の<code>Println</code>関数を使います。まずは最小のGoプログラムを見てみましょう。</p>
<pre><code>package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}</code></pre>
<p>それぞれの行の意味は次のとおりです。</p>
<table>
<tr><th>行</th><th>意味</th></tr>
<tr><td><code>package main</code></td><td>このファイルが属するパッケージ（すぐ下で説明）の宣言。<code>main</code>という名前は「これは実行できるプログラムです」という印</td></tr>
<tr><td><code>import "fmt"</code></td><td>fmtパッケージを取り込む宣言。これを書くと<code>fmt.Println</code>のように、fmtの中の関数が使えるようになる</td></tr>
<tr><td><code>func main()</code></td><td>プログラムの実行が始まる関数</td></tr>
<tr><td><code>fmt.Println(...)</code></td><td>カッコ内の値を表示して改行する</td></tr>
</table>
<p><strong>パッケージとは</strong>：関連する機能をひとまとめにした「道具箱」です。<code>fmt</code>は画面表示に関する道具（関数）を集めた道具箱、<code>strings</code>は文字列処理の道具箱、といった具合に、Goには最初から数多くの道具箱（標準ライブラリ）が用意されています。<code>import "fmt"</code>は「fmtという道具箱をこのファイルに持ってくる」という宣言で、これを書いて初めて<code>fmt.Println</code>（fmt道具箱のPrintlnという道具）が使えるようになります。importしていない道具箱の道具を使おうとするとコンパイルエラーになります。また、自分が書くコードもどこかのパッケージに属する必要があり、<code>package main</code>は「このファイルは実行できるプログラム本体です」という宣言です。</p>
<p><strong>最初の3行は、今は「おまじない」で大丈夫です。</strong>この教材の課題では<code>package main</code>・<code>import "fmt"</code>・<code>func main()</code>があらかじめ書いてあるので、現時点では「この3行の中に処理を書くと実行される」とだけ理解して、中身の<code>fmt.Println</code>の行に集中してください。パッケージについては次のステップ2でもう少し掘り下げますが、複数のファイルに分けた大きなプログラムを書くまでは深く気にしなくて構いません。</p>
<p><code>Println</code>は「Print line」の略で、表示のあとに自動で改行が入ります。また、カンマ区切りで複数の値を渡すと、半角スペースで区切って表示されます。</p>
<pre><code>fmt.Println("Go", 2009)
// 出力: Go 2009</code></pre>
<p>文字列（テキストのデータ）はダブルクォート<code>"..."</code>で囲みます。日本語もそのまま扱えるので、まずは自由にメッセージを表示して、コードと出力の対応関係を体で覚えましょう。</p>`,
      task: `まずはそのまま実行して出力を確認しましょう。次に、表示するメッセージを<code>こんにちは、Go！</code>に書き換えて再実行してください。`,
      code: `package main

import "fmt"

func main() {
	// TODO: 一度実行したら、メッセージを「こんにちは、Go！」に書き換える
	fmt.Println("Hello, World!")
}`,
      solution: `package main

import "fmt"

func main() {
	// Printlnは表示のあとに自動で改行する
	fmt.Println("こんにちは、Go！")
}`,
      hints: [`fmt.Printlnのカッコの中のダブルクォートで囲まれた部分が、そのまま画面に表示されます。`, `"Hello, World!"の部分を"こんにちは、Go！"に書き換えれば完成です。`],
      expectedOutput: "こんにちは、Go！"
    },
    {
      id: 2,
      title: "package mainとfunc main",
      explanation: `<p>ステップ1で登場した<code>package main</code>と<code>func main()</code>は、Goプログラムを実行するための「約束事」です。この2つがそろって初めて、実行可能なプログラムになります。パッケージとは、関連する機能をひとまとめにした単位（道具箱のようなもの）で、ステップ1で使った<code>fmt</code>も表示に関する関数を集めたパッケージです。</p>
<table>
<tr><th>要素</th><th>役割</th></tr>
<tr><td><code>package main</code></td><td>「このパッケージは実行可能なプログラムである」という宣言。ライブラリの場合は別の名前になる</td></tr>
<tr><td><code>func main()</code></td><td>プログラムの入り口（エントリーポイント）。実行するとこの関数の中身が上から順に動く</td></tr>
</table>
<p>重要なのは、関数名が<strong>小文字4文字の<code>main</code></strong>でなければならない点です。Goでは大文字と小文字は別物として扱われるため、<code>Main</code>や<code>MAIN</code>では入り口として認識されず、次のようなコンパイルエラー（プログラムを実行形式に変換する段階でのエラー）になります。</p>
<pre><code>runtime.main_main·f: function main is undeclared in the main package</code></pre>
<p>エラーメッセージは「mainパッケージの中にmain関数が宣言されていない」と教えてくれています。エラーメッセージは敵ではなく、直すべき場所を教えてくれる案内役です。<strong>英語でも臆せずに読む習慣</strong>をつけると、上達が一気に速くなります。</p>
<p>なお、<code>import "fmt"</code>のようなimport宣言は<code>package</code>宣言の直後に書きます。この「package→import→関数」という順序もGoの決まりです。</p>`,
      task: `このコードはコンパイルエラーになります。エラーメッセージを読んで原因を特定し、実行できるように修正してください。`,
      code: `package main

import "fmt"

// このコードはコンパイルエラーになる。関数名をよく見て直そう
func Main() {
	fmt.Println("Goの入り口はmain関数")
}`,
      solution: `package main

import "fmt"

// プログラムの入り口は小文字のmain関数でなければならない
func main() {
	fmt.Println("Goの入り口はmain関数")
}`,
      hints: [`Goでは大文字と小文字は区別されます。プログラムの入り口として認識される関数名は決まっています。`, `func Mainのように先頭が大文字になっていると、入り口のmain関数とは見なされません。小文字に直しましょう。`],
      expectedOutput: "Goの入り口はmain関数"
    },
    {
      id: 3,
      title: "fmt.Printlnとfmt.Printfの違い",
      explanation: `<p>パッケージの中には、あらかじめ用意された関数が入っています。<code>import "fmt"</code>と書いて取り込むと、自分で作らなくても<code>fmt.Println</code>のように「パッケージ名.関数名」の形でそれらの関数を呼び出せるようになります。<code>fmt</code>パッケージには表示用の関数がいくつかあり、中でもよく使うのが<code>Println</code>と<code>Printf</code>です。</p>
<table>
<tr><th>関数</th><th>特徴</th></tr>
<tr><td><code>fmt.Println</code></td><td>値をそのまま表示し、自動で改行する。手軽な確認向き</td></tr>
<tr><td><code>fmt.Printf</code></td><td>書式（フォーマット）を指定して表示する。改行は自動では入らない</td></tr>
</table>
<p><code>Printf</code>の「f」はformatの意味で、文字列の中に<strong>書式指定子</strong>（値の埋め込み場所と表示形式を指定する記号）を書き、後ろに埋め込む値を並べます。</p>
<pre><code>fmt.Printf("%sは%d歳です\\n", "Gopher", 13)
// 出力: Gopherは13歳です</code></pre>
<p>まず覚えるべき書式指定子は次の3つです。</p>
<table>
<tr><th>指定子</th><th>意味</th><th>例</th></tr>
<tr><td><code>%v</code></td><td>あらゆる値をいい感じに表示する万能型</td><td><code>fmt.Printf("%v", true)</code>→<code>true</code></td></tr>
<tr><td><code>%s</code></td><td>文字列</td><td><code>fmt.Printf("%s", "Go")</code>→<code>Go</code></td></tr>
<tr><td><code>%d</code></td><td>整数（10進数）</td><td><code>fmt.Printf("%d", 42)</code>→<code>42</code></td></tr>
</table>
<p>注意点は2つ。<code>Printf</code>は改行が自動で入らないため、行末に改行を表す<code>\\n</code>（エスケープシーケンスと呼ばれる特殊文字）を書くこと。そして、書式指定子の数と後ろに並べる値の数・型を一致させることです。迷ったら<code>%v</code>を使えばたいてい表示できます。</p>`,
      task: `TODOの行の<code>Printf</code>を完成させて、<code>Gopherは13歳です</code>と<code>好きなものはコーヒーです</code>の2行を表示してください。`,
      code: `package main

import "fmt"

func main() {
	fmt.Println("--- Printlnはそのまま表示 ---")
	// TODO: %sと%dを使って「Gopherは13歳です」と表示する（行末の\\nを忘れずに）
	fmt.Printf("")
	// TODO: %vを使って「好きなものはコーヒーです」と表示する
	fmt.Printf("")
}`,
      solution: `package main

import "fmt"

func main() {
	fmt.Println("--- Printlnはそのまま表示 ---")
	// %sは文字列、%dは整数の書式指定子
	fmt.Printf("%sは%d歳です\\n", "Gopher", 13)
	// %vはどんな値でも表示できる万能の書式指定子
	fmt.Printf("好きなものは%vです\\n", "コーヒー")
}`,
      hints: [`Printfは第1引数に書式文字列、第2引数以降に埋め込む値をカンマ区切りで並べます。`, `1つ目はfmt.Printf("%sは%d歳です\\n", "Gopher", 13)の形になります。%sの位置に"Gopher"が、%dの位置に13が入ります。`],
      expectedOutput: "Gopherは13歳です"
    },
    {
      id: 4,
      title: "コメントの書き方",
      explanation: `<p>コメントとは、プログラムの実行には影響しない「人間のためのメモ」です。Goには2種類の書き方があります。</p>
<table>
<tr><th>書き方</th><th>名前</th><th>用途</th></tr>
<tr><td><code>// メモ</code></td><td>行コメント</td><td>その行の<code>//</code>以降がコメントになる。最もよく使う</td></tr>
<tr><td><code>/* メモ */</code></td><td>ブロックコメント</td><td>囲んだ範囲すべてがコメントになる。複数行の説明向き</td></tr>
</table>
<pre><code>// 消費税率（2026年時点）
rate := 10 // 行の途中から書くこともできる

/*
複数行にわたる説明は
ブロックコメントでも書ける
*/</code></pre>
<p>コメントには大きく2つの使い道があります。1つ目は<strong>コードの意図や背景を説明する</strong>こと。「何をしているか」はコードを読めば分かるので、「なぜそうしているか」を書くのが良いコメントとされています。2つ目は<strong>コメントアウト</strong>、つまり一時的にコードを無効化することです。デバッグ（不具合の原因調査）中に「この行を止めたらどうなるか」を試すときに便利です。</p>
<p>また、Goには関数やパッケージの直前に書いたコメントがそのままドキュメントになる文化があり（Docコメントと呼ばれます）、標準ライブラリの説明もこの仕組みで生成されています。今は「宣言の直前のコメントは特別扱いされる」ことだけ頭の片隅に置いておきましょう。</p>`,
      task: `1行目の<code>fmt.Println</code>を行コメントで無効化（コメントアウト）し、<code>コメントは実行されない</code>だけが表示されるようにしてください。さらに、main関数の上に自分の言葉で説明コメントを書いてみましょう。`,
      code: `package main

import "fmt"

func main() {
	// TODO: 次の行の先頭に//を付けてコメントアウトする
	fmt.Println("この行は表示されないようにしたい")
	fmt.Println("コメントは実行されない")
}`,
      solution: `package main

import "fmt"

// コメントの動作を確認するプログラム
func main() {
	// コメントアウトされた行は実行されない
	// fmt.Println("この行は表示されないようにしたい")
	fmt.Println("コメントは実行されない")
}`,
      hints: [`行の先頭に//を付けると、その行全体がコメントになり実行されなくなります。`, `fmt.Println("この行は...")の行を// fmt.Println("この行は...")に変えれば、その行は無視されます。`],
      expectedOutput: "コメントは実行されない"
    },
    {
      id: 5,
      title: "変数宣言var",
      explanation: `<p>変数とは、値に名前を付けて保存しておく「箱」のことです。Goでは<code>var</code>キーワードで変数を宣言します。基本形は「<code>var 変数名 型 = 初期値</code>」で、<strong>型（データの種類）を変数名の後ろに書く</strong>のがGoの特徴です。</p>
<pre><code>var lang string = "Go"   // string型（文字列）の変数lang
var year int = 2009      // int型（整数）の変数year</code></pre>
<p>varによる宣言には、次の3つのバリエーションがあります。</p>
<table>
<tr><th>書き方</th><th>例</th><th>説明</th></tr>
<tr><td>型と初期値の両方</td><td><code>var age int = 13</code></td><td>最も丁寧な書き方</td></tr>
<tr><td>初期値のみ（型推論）</td><td><code>var age = 13</code></td><td>初期値から型を自動判定してくれる</td></tr>
<tr><td>型のみ</td><td><code>var age int</code></td><td>初期値は自動で入る（次のステップ以降で解説）</td></tr>
</table>
<p>型推論（初期値から型をコンパイラが自動で決める仕組み）があるため、型の記述は省略できる場面が多いです。ただし「この変数は絶対にint64で扱いたい」のように型を明示したいときは、きちんと書きます。</p>
<p>一度宣言した変数には、<code>=</code>で新しい値を代入し直すことができます。ただし<strong>同じ型の値しか代入できません</strong>。string型の変数に整数を入れようとするとコンパイルエラーになります。この「型に厳しい」性質が、Goのプログラムを安全に保っています。</p>
<pre><code>var count int = 1
count = 2      // OK：同じint型
count = "two"  // エラー：string型は代入できない</code></pre>`,
      task: `TODOの2か所で、var宣言を使ってstring型の変数<code>lang</code>（値は"Go"）とint型の変数<code>year</code>（値は2009）を宣言し、<code>Goの誕生年は2009年</code>と表示させてください。`,
      code: `package main

import "fmt"

func main() {
	// TODO: string型の変数langを宣言して"Go"を入れる
	// TODO: int型の変数yearを宣言して2009を入れる

	fmt.Printf("%sの誕生年は%d年\\n", lang, year)
}`,
      solution: `package main

import "fmt"

func main() {
	// var 変数名 型 = 初期値 の形で宣言する
	var lang string = "Go"
	var year int = 2009

	fmt.Printf("%sの誕生年は%d年\\n", lang, year)
}`,
      hints: [`var宣言の基本形は「var 変数名 型 = 初期値」です。文字列はstring型、整数はint型です。`, `1つ目はvar lang string = "Go"、2つ目も同じ形でint型として書きます。`],
      expectedOutput: "Goの誕生年は2009年"
    },
    {
      id: 6,
      title: "短縮宣言:=",
      explanation: `<p>Goには<code>var</code>よりも短く変数を宣言できる<strong>短縮変数宣言</strong><code>:=</code>があります。宣言と初期値の代入を同時に行い、型は初期値から自動で推論されます。</p>
<pre><code>score := 90        // var score int = 90 と同じ意味
subject := "Go入門" // var subject string = "Go入門" と同じ意味</code></pre>
<p>実際のGoのコードでは、関数の中の変数はほとんど<code>:=</code>で宣言されます。ただし<code>var</code>との使い分けには明確なルールがあります。</p>
<table>
<tr><th>観点</th><th><code>:=</code>（短縮宣言）</th><th><code>var</code></th></tr>
<tr><td>使える場所</td><td>関数の中だけ</td><td>関数の外（パッケージレベル）でも使える</td></tr>
<tr><td>初期値</td><td>必須</td><td>省略できる（省略時は自動の初期値が入る）</td></tr>
<tr><td>型の明示</td><td>できない（常に推論）</td><td>できる</td></tr>
</table>
<p>注意したいのは<code>:=</code>と<code>=</code>の違いです。<code>:=</code>は「新しい変数を作って値を入れる」、<code>=</code>は「すでにある変数に値を入れ直す」です。同じ変数に2回<code>:=</code>を使うと「その名前はもう宣言済み」というエラーになります。</p>
<pre><code>count := 1  // 新しい変数countを宣言
count = 2   // 既存のcountに再代入（=を使う）
count := 3  // エラー：countはすでに宣言されている</code></pre>
<p>迷ったら「関数の中で初期値があるなら<code>:=</code>、それ以外は<code>var</code>」と覚えておけば実務でも通用します。</p>`,
      task: `var宣言で書かれた2つの変数を、短縮宣言<code>:=</code>を使った形に書き換えてください。出力が<code>Go入門のスコアは90点</code>のまま変わらないことも確認しましょう。`,
      code: `package main

import "fmt"

func main() {
	// TODO: 次の2つのvar宣言を := を使った短縮宣言に書き換える
	var subject string = "Go入門"
	var score int = 90

	fmt.Printf("%sのスコアは%d点\\n", subject, score)
}`,
      solution: `package main

import "fmt"

func main() {
	// := は宣言と代入を同時に行い、型は初期値から推論される
	subject := "Go入門"
	score := 90

	fmt.Printf("%sのスコアは%d点\\n", subject, score)
}`,
      hints: [`短縮宣言では、varキーワードと型の記述が不要になります。`, `var subject string = "Go入門" は subject := "Go入門" と書き換えられます。scoreも同様です。`],
      expectedOutput: "Go入門のスコアは90点"
    },
    {
      id: 7,
      title: "定数const",
      explanation: `<p>定数とは、一度決めたら<strong>変更できない値</strong>のことです。Goでは<code>const</code>キーワードで宣言します。書き方は<code>var</code>と似ていますが、<code>:=</code>は使えず、宣言時に必ず値を決める必要があります。</p>
<pre><code>const appName = "GoTutor" // 型は省略できる（推論される）
const version int = 3     // 型を明示してもよい</code></pre>
<p>定数に値を代入し直そうとすると、コンパイルエラーになります。</p>
<pre><code>const pi = 3.14
pi = 3.14159 // エラー: cannot assign to pi</code></pre>
<p>「実行してみたら値が書き換わっていた」という事故を、実行する前のコンパイル段階で防いでくれるわけです。では、変数と定数はどう使い分けるのでしょうか。</p>
<table>
<tr><th></th><th>変数（var / :=）</th><th>定数（const）</th></tr>
<tr><td>値の変更</td><td>できる</td><td>できない</td></tr>
<tr><td>向いている用途</td><td>計算結果、状態など変わる値</td><td>アプリ名、税率、上限値など変わらない値</td></tr>
<tr><td>宣言できる値</td><td>あらゆる値</td><td>数値・文字列・真偽値などコンパイル時に決まる値のみ</td></tr>
</table>
<p>実務では「マジックナンバー（意味が分からないまま埋め込まれた数値）をなくす」ために定数が多用されます。たとえば<code>if age &gt;= 20</code>と書くより、<code>const adultAge = 20</code>を定義して使うほうが、20という数値の意味が明確になります。プログラム中で変わらない値を見つけたら、まず定数にできないか考える習慣をつけましょう。</p>`,
      task: `TODOの2か所で、定数<code>appName</code>（値は"GoTutor"）と定数<code>version</code>（値は3）を<code>const</code>で宣言し、<code>GoTutor v3</code>と表示させてください。`,
      code: `package main

import "fmt"

func main() {
	// TODO: 定数appNameを"GoTutor"として宣言する
	// TODO: 定数versionを3として宣言する

	fmt.Printf("%s v%d\\n", appName, version)
}`,
      solution: `package main

import "fmt"

func main() {
	// constで宣言した値はあとから変更できない
	const appName = "GoTutor"
	const version = 3

	fmt.Printf("%s v%d\\n", appName, version)
}`,
      hints: [`constの書き方はvarに似ていますが、:=は使えません。「const 名前 = 値」の形です。`, `1つ目はconst appName = "GoTutor"です。2つ目も同じ形で数値の3を設定します。`],
      expectedOutput: "GoTutor v3"
    },
    {
      id: 8,
      title: "ゼロ値（宣言だけした変数の初期値）",
      explanation: `<p>ステップ5で「varは初期値を省略できる」と紹介しました。では、初期値なしで宣言した変数には何が入っているのでしょうか。答えは<strong>ゼロ値</strong>（型ごとに決まった自動の初期値）です。</p>
<pre><code>var i int     // 0が入っている
var s string  // ""（空文字列）が入っている</code></pre>
<p>主な型のゼロ値は次のとおりです。</p>
<table>
<tr><th>型</th><th>ゼロ値</th><th>備考</th></tr>
<tr><td><code>int</code>（整数）</td><td><code>0</code></td><td>数値系はすべて0</td></tr>
<tr><td><code>float64</code>（小数）</td><td><code>0</code></td><td>表示上は0になる</td></tr>
<tr><td><code>string</code>（文字列）</td><td><code>""</code></td><td>長さ0の空文字列。表示しても何も見えない</td></tr>
<tr><td><code>bool</code>（真偽値）</td><td><code>false</code></td><td>真偽値は後の章で詳しく学ぶ</td></tr>
</table>
<p>他の言語では、初期化していない変数を使うと予測不能な値（ゴミ値）が入っていたり、実行時エラーになったりすることがあります。Goは「<strong>宣言された変数は必ず使える状態にしておく</strong>」という設計思想で、この種のバグを言語レベルで防いでいます。</p>
<p>この性質のおかげで、「まず宣言だけしておき、あとから条件に応じて値を入れる」という書き方が安全にできます。実務でも「カウンタを<code>var count int</code>と宣言すれば0から始まる」のように、ゼロ値を前提にしたコードが広く書かれています。<strong>ゼロ値を意味のある初期状態として活用する</strong>のがGoらしい設計とされています。</p>`,
      task: `そのまま実行して、各型のゼロ値がどう表示されるかを観察してください。その後、TODOの行を追加してbool型のゼロ値も表示してみましょう。`,
      code: `package main

import "fmt"

func main() {
	// 初期値を省略して宣言だけすると、ゼロ値が入る
	var i int
	var f float64
	var s string

	fmt.Printf("intのゼロ値: %v\\n", i)
	fmt.Printf("float64のゼロ値: %v\\n", f)
	fmt.Printf("stringのゼロ値: [%v]\\n", s)
	// TODO: var b bool を宣言して「boolのゼロ値: false」と表示する
}`,
      solution: `package main

import "fmt"

func main() {
	// 初期値を省略して宣言だけすると、ゼロ値が入る
	var i int
	var f float64
	var s string
	var b bool

	fmt.Printf("intのゼロ値: %v\\n", i)
	fmt.Printf("float64のゼロ値: %v\\n", f)
	fmt.Printf("stringのゼロ値: [%v]\\n", s)
	fmt.Printf("boolのゼロ値: %v\\n", b)
}`,
      hints: [`bool型の変数も他と同じように「var 変数名 bool」で宣言できます。`, `var b boolと宣言し、fmt.Printf("boolのゼロ値: %v\\n", b)で表示します。falseと表示されれば成功です。`],
      expectedOutput: "boolのゼロ値: false"
    },
    {
      id: 9,
      title: "未使用変数はコンパイルエラー",
      explanation: `<p>Goには、他の言語経験者が最初に驚く特徴があります。<strong>宣言したのに使っていない変数があると、コンパイルエラーになる</strong>のです。</p>
<pre><code>func main() {
    message := "使われない変数"
    fmt.Println("こんにちは")
}
// エラー: declared and not used: message</code></pre>
<p>「警告ではなくエラーにするなんて厳しすぎる」と感じるかもしれません。しかしこれはGoの設計思想そのものです。使われない変数は、書き間違い（使うつもりだった変数名のタイプミスなど）や消し忘れのサインであることが多く、放置するとコードの読み手を混乱させます。Goは「<strong>動くコードは常に整理された状態であるべき</strong>」という思想で、これをエラーとして強制します。未使用のimportも同様にエラーになります。</p>
<p>ちなみに、どうしても値を受け取るだけで使わない場面のために、<code>_</code>（ブランク識別子と呼ばれる「値の捨て場」）が用意されています。詳しくは後の章で使いますが、存在だけ知っておきましょう。</p>
<table>
<tr><th>状況</th><th>結果</th></tr>
<tr><td>宣言した変数を使っていない</td><td>コンパイルエラー</td></tr>
<tr><td>importしたパッケージを使っていない</td><td>コンパイルエラー</td></tr>
<tr><td><code>_</code>に代入する</td><td>エラーにならない（意図的に捨てたと見なされる）</td></tr>
</table>
<p>エラーの直し方は2つです。その変数を実際に使うか、宣言ごと削除するか。「とりあえず宣言だけしておく」が許されないおかげで、Goのコードベースは自然と綺麗に保たれます。</p>`,
      task: `このコードは<code>declared and not used</code>というコンパイルエラーになります。変数<code>message</code>を実際に使うように修正して、その中身を表示してください。`,
      code: `package main

import "fmt"

func main() {
	// このままではコンパイルエラー: declared and not used: message
	message := "Goは未使用変数を許さない"
	fmt.Println("こんにちは")
}`,
      solution: `package main

import "fmt"

func main() {
	// 宣言した変数は必ず使う。使わないなら宣言ごと削除する
	message := "Goは未使用変数を許さない"
	fmt.Println(message)
}`,
      hints: [`エラーを解消するには、宣言した変数messageをコードのどこかで実際に使う必要があります。`, `fmt.Printlnの引数を"こんにちは"からmessageに変えれば、変数が使われた扱いになりエラーが消えます。`],
      expectedOutput: "Goは未使用変数を許さない"
    },
    {
      id: 10,
      title: "総合演習：自己紹介カードを整形出力",
      explanation: `<p>第1章の総仕上げとして、これまで学んだ知識を全部使って「自己紹介カード」を出力するプログラムを完成させます。使う道具を振り返りましょう。</p>
<table>
<tr><th>ステップ</th><th>道具</th><th>用途</th></tr>
<tr><td>1・3</td><td><code>fmt.Println</code> / <code>fmt.Printf</code></td><td>そのまま表示／書式付きで表示</td></tr>
<tr><td>3</td><td><code>%s</code> <code>%d</code> <code>%v</code></td><td>文字列・整数・万能の書式指定子</td></tr>
<tr><td>5・6</td><td><code>var</code> / <code>:=</code></td><td>変数の宣言</td></tr>
<tr><td>7</td><td><code>const</code></td><td>変更しない値の宣言</td></tr>
</table>
<p>今回のポイントは<strong>値とレイアウトの分離</strong>です。名前や年齢といった「データ」は変数・定数として上部にまとめ、表示部分では変数を埋め込むだけにします。こうしておくと、あとで名前を変えたいときに1か所だけ直せば済みます。これは実務のプログラム設計でも通用する基本の考え方です。</p>
<pre><code>const line = "====================" // 罫線は変えないのでconst
name := "Gopher"                    // データは変数にまとめる

fmt.Println(line)
fmt.Printf("名前: %s\\n", name)
fmt.Println(line)</code></pre>
<p>枠線のような繰り返し使う飾り文字列を定数にしておけば、デザイン変更にも1行で対応できます。完成したら、値を自分の情報に書き換えて再実行してみましょう。データを変えるだけで出力が変わる感覚こそ、変数を学んだ成果です。</p>`,
      task: `TODOに従って変数・定数を宣言し、罫線付きの自己紹介カードを完成させてください。<code>名前: Gopher</code>を含む5項目が枠線の中に表示されれば成功です。`,
      code: `package main

import "fmt"

func main() {
	// TODO: 罫線用の定数lineを"=============================="として宣言する
	// TODO: 変数nameに"Gopher"、ageに13を短縮宣言で入れる
	// TODO: var宣言でstring型のhobbyに"コードを書くこと"を入れる

	fmt.Println(line)
	fmt.Println("      自己紹介カード")
	fmt.Println(line)
	// TODO: Printfで「名前: Gopher」「年齢: 13歳」「趣味: コードを書くこと」を1行ずつ表示する
	fmt.Println(line)
}`,
      solution: `package main

import "fmt"

func main() {
	// 変わらない罫線はconst、データは変数として分離する
	const line = "=============================="
	name := "Gopher"
	age := 13
	var hobby string = "コードを書くこと"

	fmt.Println(line)
	fmt.Println("      自己紹介カード")
	fmt.Println(line)
	fmt.Printf("名前: %s\\n", name)
	fmt.Printf("年齢: %d歳\\n", age)
	fmt.Printf("趣味: %s\\n", hobby)
	fmt.Println(line)
}`,
      hints: [`まずconst lineとname・age・hobbyの宣言を書き、コンパイルが通る状態を作ってから表示部分に進みましょう。`, `文字列は%s、整数は%dで埋め込みます。例: fmt.Printf("名前: %s\\n", name)`, `未使用変数はエラーになるので、宣言した変数はすべてPrintfで使い切る必要があります。`],
      expectedOutput: "名前: Gopher"
    }
  ]
});
