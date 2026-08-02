// 第21章：よくあるエラー：コンパイル基礎
registerChapter({
  number: 21,
  title: "よくあるエラー：コンパイル基礎",
  description: "Goのコンパイラが出す代表的なエラーメッセージを実際に発生させ、読み方と直し方を身につける章です。",
  steps: [
    {
      id: 201,
      title: "undefined: 変数名のtypo",
      explanation: `<p>ここからの章では、Goでよく出会うエラーメッセージを「わざと発生させて、読んで、直す」訓練をします。エラーメッセージは敵ではなく、コンパイラからの最高のヒントです。まずは一番よくある「typo（打ち間違い）」から始めましょう。</p>
<p>初期コードを実行すると、次のようなエラーが出ます。</p>
<pre><code>./main.go:8:36: undefined: nmae</code></pre>
<h4>エラーメッセージの読み方</h4>
<p>Goのコンパイルエラーは「<code>ファイル名:行番号:桁番号: 内容</code>」という形式です。</p>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td><code>./main.go</code></td><td>エラーが起きたファイル</td></tr>
<tr><td><code>8:36</code></td><td>8行目の36桁目（行の先頭から数えた文字位置）</td></tr>
<tr><td><code>undefined: nmae</code></td><td>「<code>nmae</code>という名前は定義されていない」</td></tr>
</table>
<p><code>undefined</code>（未定義）は、その名前の変数・関数・型がどこにも宣言されていないという意味です。原因のほとんどは打ち間違いで、このコードでは<code>name</code>と宣言した変数を<code>nmae</code>と書いてしまっています。</p>
<h4>直し方のパターン</h4>
<ul>
<li>エラーに出た名前と、宣言した名前をよく見比べる（1文字の入れ替わりが多い）</li>
<li>宣言した場所が別の関数の中になっていないか確認する（変数は宣言したブロックの中でしか使えない）</li>
<li>関数名なら、大文字・小文字の違いも疑う（Goでは<code>Print</code>と<code>print</code>は別物）</li>
</ul>
<p>まずは「行番号の行を見る→その名前を検索する」という手順を体に覚えさせましょう。</p>`,
      task: `初期コードを実行してエラーメッセージを確認し、<code>undefined: nmae</code>の原因になっているtypoを修正してください。`,
      code: `package main

import "fmt"

func main() {
	name := "Gopher"
	fmt.Println("ようこそ、", name)
	fmt.Println("がんばろう、", nmae)
}`,
      solution: `package main

import "fmt"

func main() {
	name := "Gopher"
	fmt.Println("ようこそ、", name)
	fmt.Println("がんばろう、", name)
}`,
      hints: [
        `エラーの「8:36」は8行目の36桁目という意味です。その行にある変数名をよく見ましょう。`,
        `宣言したのは「name」ですが、8行目では「nmae」と書かれています。`
      ],
      expectedOutput: "がんばろう、 Gopher"
    },
    {
      id: 202,
      title: "declared and not used（未使用変数）",
      explanation: `<p>Goには「宣言した変数は必ず使わなければならない」という厳格なルールがあります。初期コードを実行すると、次のエラーが出ます。</p>
<pre><code>./main.go:7:2: tax declared and not used</code></pre>
<h4>なぜエラーになるのか</h4>
<p><code>declared and not used</code>は「宣言されたのに使われていない」という意味です。多くの言語では未使用変数は警告（無視して実行できる）止まりですが、Goでは<strong>コンパイルエラー</strong>です。使わない変数は「消し忘れ」か「使い忘れ（バグの前兆）」のどちらかなので、Goは早い段階で気づかせてくれます。</p>
<h4>直し方は2択</h4>
<table>
<tr><th>状況</th><th>直し方</th></tr>
<tr><td>本当に不要な変数だった</td><td>宣言ごと削除する</td></tr>
<tr><td>使うつもりだった</td><td>使う処理を書く（今回はこちら）</td></tr>
</table>
<p>このコードでは消費税<code>tax</code>を宣言したのに、税込価格の計算に使い忘れています。「使うつもりだったのに未使用エラーが出た」というのは、計算やロジックの書き忘れを教えてくれている状態です。</p>
<p>なお、一時的にエラーを黙らせたいだけならブランク識別子<code>_ = tax</code>という書き方もありますが、これは「あとで必ず消す前提のしのぎ」であり、提出するコードに残すべきではありません。</p>
<pre><code>total := price + tax // 使えばエラーは消える
fmt.Println("税込価格:", total)</code></pre>`,
      task: `エラーメッセージを確認したら、<code>tax</code>を使って税込価格（<code>price+tax</code>）を計算し、<code>税込価格: 1320</code>と表示されるようにしてください。`,
      code: `package main

import "fmt"

func main() {
	price := 1200
	tax := 120
	fmt.Println("税抜価格:", price)
}`,
      solution: `package main

import "fmt"

func main() {
	price := 1200
	tax := 120
	fmt.Println("税抜価格:", price)
	fmt.Println("税込価格:", price+tax)
}`,
      hints: [
        `未使用変数の解決は「消す」か「使う」の2択です。今回はtaxを使って税込価格を計算します。`,
        `fmt.Println("税込価格:", price+tax) のような行を追加しましょう。`
      ],
      expectedOutput: "税込価格: 1320"
    },
    {
      id: 203,
      title: "imported and not used（未使用import）",
      explanation: `<p>未使用変数と同じく、Goでは「importしたパッケージを使わない」こともコンパイルエラーになります。初期コードのエラーはこうです。</p>
<pre><code>./main.go:5:2: "strings" imported and not used</code></pre>
<h4>読み方</h4>
<p>「5行目でimportした<code>"strings"</code>パッケージがどこでも使われていない」という意味です。パッケージ名がダブルクォート付きで示されるのが特徴で、行番号はimport文の行を指します。</p>
<h4>いつ起きるか</h4>
<ul>
<li>使うつもりでimportを書いたが、実装を忘れた（今回のパターン）</li>
<li>リファクタリングでコードを消したら、importだけ残った</li>
<li>コピペしたコードに不要なimportが混ざっていた</li>
</ul>
<p>直し方は変数のときと同じ2択で、「import文を消す」か「そのパッケージを使う」かです。実務ではエディタのgoimports（保存時にimportを自動で追加・削除するツール）で自動解決するのが一般的ですが、エラーメッセージから「どのパッケージが余っているか」を読み取れることが基本です。</p>
<pre><code>fmt.Println(strings.ToUpper("go go go"))
// strings.ToUpper は文字列をすべて大文字にする関数</code></pre>
<p>今回は<code>strings.ToUpper</code>（文字列を大文字に変換する関数）を使うつもりだった、という想定で直してみましょう。</p>`,
      task: `<code>strings.ToUpper</code>を使って<code>"go go go"</code>を大文字に変換して表示し、未使用importのエラーを解消してください。`,
      code: `package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println("go go go")
}`,
      solution: `package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.ToUpper("go go go"))
}`,
      hints: [
        `未使用importの解決も「消す」か「使う」の2択です。今回はstringsパッケージを使う方向で直します。`,
        `fmt.Printlnの引数をstrings.ToUpper("go go go")に変えましょう。`
      ],
      expectedOutput: "GO GO GO"
    },
    {
      id: 204,
      title: "missing return（戻り値の返し忘れ）",
      explanation: `<p>戻り値の型を宣言した関数は、<strong>どの実行経路を通っても必ず値を返す</strong>必要があります。初期コードのエラーはこれです。</p>
<pre><code>./main.go:9:1: missing return</code></pre>
<h4>読み方</h4>
<p><code>missing return</code>は「returnが足りない」という意味で、行番号は関数の<strong>閉じ波括弧の行</strong>を指すことが多いのがポイントです。「9行目に何か書き足すの？」と考えるのではなく、「この関数のどこかの経路でreturnが抜けている」と読み替えましょう。</p>
<h4>なぜ起きるのか</h4>
<p>初期コードの<code>grade</code>関数は、<code>score</code>が80以上のときだけ<code>return "合格"</code>します。では80未満だったら？　関数の最後まで到達してしまい、返す値がありません。コンパイラはこの「返り値のない経路」を見つけてエラーにします。</p>
<pre><code>func grade(score int) string {
	if score >= 80 {
		return "合格"
	}
	// score が 80 未満のときの return がない！
}</code></pre>
<h4>直し方のパターン</h4>
<ul>
<li>ifの外（関数の最後）に、当てはまらなかった場合のreturnを書く（今回はこちら）</li>
<li>elseで両方の経路にreturnを書く</li>
</ul>
<p>Goでは「条件を満たしたら早めにreturnし、最後にデフォルトの値をreturnする」書き方（早期リターン）が好まれます。ネストが浅くなり、経路の漏れにも気づきやすくなります。</p>`,
      task: `<code>grade</code>関数がどの経路でも値を返すように、80未満の場合に<code>"不合格"</code>を返すreturnを追加してください。`,
      code: `package main

import "fmt"

func grade(score int) string {
	if score >= 80 {
		return "合格"
	}
}

func main() {
	fmt.Println(grade(90))
	fmt.Println(grade(50))
}`,
      solution: `package main

import "fmt"

func grade(score int) string {
	if score >= 80 {
		return "合格"
	}
	return "不合格"
}

func main() {
	fmt.Println(grade(90))
	fmt.Println(grade(50))
}`,
      hints: [
        `scoreが80未満のとき、関数はどこで値を返すでしょうか。経路を指でなぞってみましょう。`,
        `ifブロックの後ろ、関数の最後にreturn "不合格"を追加します。`
      ],
      expectedOutput: "不合格"
    },
    {
      id: 205,
      title: "関数の外に書かれた文（non-declaration statement）",
      explanation: `<p>Goのソースファイルのトップレベル（関数の外側）に置けるのは、<code>package</code>・<code>import</code>・<code>var</code>・<code>const</code>・<code>type</code>・<code>func</code>といった<strong>宣言だけ</strong>です。<code>fmt.Println(...)</code>のような「実行する文」を関数の外に書くと、次のエラーになります。</p>
<pre><code>./main.go:5:1: syntax error: non-declaration statement outside function body</code></pre>
<h4>読み方</h4>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td><code>syntax error</code></td><td>文法エラー（コードの構造自体が正しくない）</td></tr>
<tr><td><code>non-declaration statement</code></td><td>宣言ではない文（＝実行文）</td></tr>
<tr><td><code>outside function body</code></td><td>関数の本体の外にある</td></tr>
</table>
<p>つまり「実行文は関数の中にしか書けないのに、外に書いてあるよ」という指摘です。スクリプト言語（PythonやJavaScript）ではファイルの先頭にいきなり処理を書けるため、その感覚で書くとこのエラーに出会います。</p>
<h4>直し方</h4>
<p>実行したい文は<code>func main()</code>の中に移動します。どうしても「プログラム開始前に一度だけ実行したい初期化」がある場合は、変数のトップレベル宣言（<code>var x = 計算式</code>）や<code>init</code>関数という仕組みもありますが、まずは「実行文はmainの中」と覚えれば十分です。</p>
<pre><code>func main() {
	fmt.Println("プログラム開始") // 関数の中ならOK
}</code></pre>`,
      task: `関数の外に書かれている<code>fmt.Println("プログラム開始")</code>を<code>main</code>関数の中（先頭）に移動して、エラーを解消してください。`,
      code: `package main

import "fmt"

fmt.Println("プログラム開始")

func main() {
	fmt.Println("処理中")
}`,
      solution: `package main

import "fmt"

func main() {
	fmt.Println("プログラム開始")
	fmt.Println("処理中")
}`,
      hints: [
        `関数の外に置けるのは宣言（var・const・type・funcなど）だけです。実行文はどこに書くべきでしょうか。`,
        `fmt.Println("プログラム開始")の行をmain関数の波括弧の内側、先頭に移動しましょう。`
      ],
      expectedOutput: "処理中"
    },
    {
      id: 206,
      title: "mismatched types（intとfloat64の混在）",
      explanation: `<p>Goは型にとても厳格で、<code>int</code>と<code>float64</code>を混ぜた計算を<strong>自動変換してくれません</strong>。初期コードのエラーはこれです。</p>
<pre><code>./main.go:8:11: invalid operation: count * price (mismatched types int and float64)</code></pre>
<h4>読み方</h4>
<p><code>invalid operation</code>は「この演算はできない」、括弧内の<code>mismatched types int and float64</code>が理由で、「intとfloat64という食い違った型どうしだから」という意味です。どの式が問題かも<code>count * price</code>と具体的に示してくれています。</p>
<h4>なぜ自動変換しないのか</h4>
<p>多くの言語はintとfloatの計算を暗黙に変換しますが、暗黙の変換は「知らないうちに精度が落ちる」「意図しない型になる」というバグの温床です。Goは<strong>変換を必ずコードに明示させる</strong>ことで、読む人が型の流れを追えるようにしています。</p>
<h4>直し方：明示的な型変換</h4>
<pre><code>total := float64(count) * price // intをfloat64に揃える</code></pre>
<p><code>float64(値)</code>のように「型名(値)」と書くのがGoの型変換です。逆に<code>int(price)</code>とするとpriceの小数部分が切り捨てられて計算結果が変わってしまうので、<strong>精度の高い側（float64）に揃える</strong>のが基本です。</p>
<p>なお、<code>count := 3</code>のような<code>:=</code>での宣言は、右辺が整数リテラルならint、小数点付きならfloat64と型が決まります。宣言時の型を意識する習慣をつけましょう。</p>`,
      task: `<code>count</code>を<code>float64</code>に型変換して掛け算できるようにし、<code>合計: 59.4円</code>と表示されるようにしてください（表示には<code>fmt.Printf("合計: %.1f円\\n", total)</code>を使います）。`,
      code: `package main

import "fmt"

func main() {
	count := 3
	price := 19.8
	total := count * price
	fmt.Println("合計:", total)
}`,
      solution: `package main

import "fmt"

func main() {
	count := 3
	price := 19.8
	total := float64(count) * price
	fmt.Printf("合計: %.1f円\\n", total)
}`,
      hints: [
        `Goは型の異なる値どうしの演算を許しません。どちらかの型に明示的に揃える必要があります。`,
        `精度を保つため、intのcountをfloat64(count)に変換してから掛け算しましょう。`,
        `小数の表示はfmt.Printfの%.1f（小数第1位まで）を使うときれいに出せます。`
      ],
      expectedOutput: "合計: 59.4円"
    },
    {
      id: 207,
      title: "cannot use（引数の型不一致）",
      explanation: `<p>関数に「宣言と違う型の値」を渡すと、コンパイラは次のようなエラーを出します。</p>
<pre><code>./main.go:11:13: cannot use number (variable of type int) as string value in argument to printLabel</code></pre>
<h4>読み方</h4>
<p>長いエラーですが、区切って読めば全部書いてあります。</p>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td><code>cannot use number</code></td><td>numberは使えない</td></tr>
<tr><td><code>(variable of type int)</code></td><td>numberの実際の型はint</td></tr>
<tr><td><code>as string value</code></td><td>string値としては（＝期待されている型はstring）</td></tr>
<tr><td><code>in argument to printLabel</code></td><td>printLabelへの引数の場所で</td></tr>
</table>
<p>つまり「<strong>実際の型</strong>」と「<strong>期待される型</strong>」と「<strong>場所</strong>」の3点セットです。この形式は引数以外にも、変数への代入（in assignment）や戻り値（in return statement）でも同じように出ます。</p>
<h4>直し方の考え方</h4>
<ul>
<li>渡す側を変換する：intを文字列にしたいなら<code>strconv.Itoa(number)</code>（Integer to ASCIIの略）</li>
<li>受け取る側の宣言を直す：そもそも関数がintを受け取るべきだった場合</li>
</ul>
<p>注意点として、<code>string(number)</code>と書くとコンパイルは通りますが、数値を「文字コード」とみなした変換になり、期待した結果になりません（この罠は第22章で詳しく扱います）。数値→文字列は<code>strconv.Itoa</code>が正解です。</p>`,
      task: `<code>strconv.Itoa</code>を使って<code>number</code>を文字列に変換してから<code>printLabel</code>に渡し、エラーを解消してください（<code>strconv</code>のimportも必要です）。`,
      code: `package main

import "fmt"

func printLabel(label string) {
	fmt.Println("ラベル: " + label)
}

func main() {
	number := 42
	printLabel(number)
}`,
      solution: `package main

import (
	"fmt"
	"strconv"
)

func printLabel(label string) {
	fmt.Println("ラベル: " + label)
}

func main() {
	number := 42
	printLabel(strconv.Itoa(number))
}`,
      hints: [
        `エラーには「実際の型（int）」と「期待される型（string）」の両方が書かれています。intをstringにする必要があります。`,
        `数値から文字列への変換はstrconv.Itoa(number)です。string(number)ではないことに注意。`,
        `strconvを使うのでimportに"strconv"を追加するのを忘れずに。`
      ],
      expectedOutput: "ラベル: 42"
    },
    {
      id: 208,
      title: ":=と=の取り違え（no new variables）",
      explanation: `<p>Goには「宣言して代入する<code>:=</code>」と「代入だけの<code>=</code>」の2つがあり、混同するとこのエラーになります。</p>
<pre><code>./main.go:7:8: no new variables on left side of :=</code></pre>
<h4>読み方</h4>
<p>「<code>:=</code>の左側に新しい変数がひとつもない」という意味です。<code>:=</code>は<strong>新しい変数を宣言する</strong>ための記号なので、すでに宣言済みの<code>total</code>だけを左辺に置くと「宣言するものがないのに:=を使っている」と怒られます。</p>
<table>
<tr><th>記号</th><th>役割</th><th>使える場面</th></tr>
<tr><td><code>:=</code></td><td>宣言＋代入</td><td>その変数を初めて作るとき（関数内のみ）</td></tr>
<tr><td><code>=</code></td><td>代入のみ</td><td>宣言済みの変数の値を書き換えるとき</td></tr>
</table>
<h4>関連する落とし穴</h4>
<p>逆に、未宣言の変数に<code>=</code>を使うと<code>undefined</code>エラーになります。また、<code>a, err := f()</code>のように左辺が複数あるときは「<strong>1つでも新しい変数があれば:=が使える</strong>」というルールがあり、宣言済みのerrと新しいaを同時に扱えます。このルールの副作用として、うっかり全部を新しい変数のつもりで<code>:=</code>してしまう「シャドーイング」という罠もあります（第22章で扱います）。</p>
<p>まずは「2回目からは=」と覚えましょう。</p>
<pre><code>total := 0        // 1回目：宣言なので :=
total = total + 10 // 2回目以降：代入なので =</code></pre>`,
      task: `2回目の<code>total</code>への操作を、宣言（<code>:=</code>）ではなく代入（<code>=</code>）に直してエラーを解消してください。`,
      code: `package main

import "fmt"

func main() {
	total := 0
	total := total + 10
	fmt.Println("合計:", total)
}`,
      solution: `package main

import "fmt"

func main() {
	total := 0
	total = total + 10
	fmt.Println("合計:", total)
}`,
      hints: [
        `:=は「新しい変数の宣言」、=は「宣言済み変数への代入」です。totalはもう宣言されています。`,
        `7行目のtotal := total + 10をtotal = total + 10に変えましょう。`
      ],
      expectedOutput: "合計: 10"
    },
    {
      id: 209,
      title: "波括弧の位置（unexpected newline）",
      explanation: `<p>Goでは<strong>開き波括弧<code>{</code>を次の行に書くことができません</strong>。ifの条件の後で改行して<code>{</code>を書くと、こんなエラーになります。</p>
<pre><code>./main.go:7:16: syntax error: unexpected newline, expected { after if clause</code></pre>
<h4>読み方</h4>
<p>「ifの節（条件部分）の後には<code>{</code>が来るはずなのに、予期しない改行が来た」という意味です。<code>unexpected X, expected Y</code>（Xが来たがYのはずだった）はsyntax errorの定番フォーマットで、「Yを補うか、Xを消す」のが基本の直し方です。</p>
<h4>なぜ改行がダメなのか：セミコロン自動挿入</h4>
<p>Goの文法上は文の終わりにセミコロン<code>;</code>が必要ですが、コンパイラが<strong>行末に自動でセミコロンを挿入</strong>してくれるため、普段は書かずに済んでいます。この仕組みのせいで、</p>
<pre><code>if score >= 80
{ ... }</code></pre>
<p>と書くと、コンパイラには</p>
<pre><code>if score >= 80;
{ ... }</code></pre>
<p>のように見えてしまい、条件の直後に文が終わったことになって文法が壊れます。関数宣言の<code>func main()</code>の後ろでも同じことが起きます。</p>
<h4>直し方</h4>
<p>開き波括弧は<strong>必ず前の行の末尾に置く</strong>、これだけです。他言語（C#やJavaの一部スタイル）の「次の行に{を書く」流儀はGoでは文法エラーになるため、スタイルの好みで争う余地がなく、全員のコードが同じ形になります。これはGoの設計思想のひとつです。</p>`,
      task: `開き波括弧<code>{</code>をif条件と同じ行の末尾に移動して、エラーを解消してください。`,
      code: `package main

import "fmt"

func main() {
	score := 85
	if score >= 80
	{
		fmt.Println("合格です")
	}
}`,
      solution: `package main

import "fmt"

func main() {
	score := 85
	if score >= 80 {
		fmt.Println("合格です")
	}
}`,
      hints: [
        `Goでは行末にセミコロンが自動挿入されるため、開き波括弧を次の行に書けません。`,
        `if score >= 80 { のように、条件と同じ行の末尾に{を置きましょう。`
      ],
      expectedOutput: "合格です"
    },
    {
      id: 210,
      title: "総合演習：複数のコンパイルエラーを順に直す",
      explanation: `<p>この章の総まとめです。実際の開発では、エラーは1つずつ丁寧に出てくれるとは限りません。初期コードを実行すると、一度に複数のエラーが並びます。</p>
<pre><code>./main.go:5:2: "strings" imported and not used
./main.go:12:1: missing return
./main.go:17:3: result declared and not used
./main.go:18:26: undefined: reslt</code></pre>
<h4>複数エラーの読み方のコツ</h4>
<ul>
<li><strong>上から順に、1つずつ直す</strong>。1つのミスが複数のエラーを引き起こすことがあるので、1つ直したら再実行して残りを確認するのが確実です。</li>
<li><strong>エラーどうしの関係を疑う</strong>。上の例では、<code>result declared and not used</code>と<code>undefined: reslt</code>はセットです。<code>result</code>を<code>reslt</code>とtypoしたせいで、「reslt→未定義」「result→未使用」という2つのエラーが同時に出ています。typoを1箇所直すだけで2つ消えます。</li>
<li><strong>syntax errorが混ざっていたら最優先で直す</strong>。文法が壊れているとコンパイラは後続を正しく解析できず、無関係なエラーを大量に出すことがあります（今回は含まれていません）。</li>
</ul>
<h4>今回直すべき3箇所</h4>
<table>
<tr><th>エラー</th><th>原因</th><th>直し方</th></tr>
<tr><td>imported and not used</td><td>strings未使用</td><td>import文から削除</td></tr>
<tr><td>missing return</td><td>60点未満の経路にreturnがない</td><td>return "不合格" を追加</td></tr>
<tr><td>undefined / not used</td><td>resultのtypo</td><td>resltをresultに修正</td></tr>
</table>
<p>「エラー文を読む→行番号へ飛ぶ→原因を1つ直す→再実行」のサイクルを体で覚えましょう。</p>`,
      task: `4つのエラーメッセージを読み、(1)未使用importの削除、(2)missing returnの解消（60点未満は<code>"不合格"</code>）、(3)typoの修正、の3箇所を直してプログラムを完成させてください。`,
      code: `package main

import (
	"fmt"
	"strings"
)

func judge(score int) string {
	if score >= 60 {
		return "合格"
	}
}

func main() {
	scores := []int{90, 55}
	for _, s := range scores {
		result := judge(s)
		fmt.Println("結果:", reslt)
	}
}`,
      solution: `package main

import "fmt"

func judge(score int) string {
	if score >= 60 {
		return "合格"
	}
	return "不合格"
}

func main() {
	scores := []int{90, 55}
	for _, s := range scores {
		result := judge(s)
		fmt.Println("結果:", result)
	}
}`,
      hints: [
        `エラーは上から1つずつ。まずstringsはどこでも使っていないのでimportから消しましょう。`,
        `judge関数は60未満のときに返す値がありません。関数の最後にreturn "不合格"を追加します。`,
        `resultとresltのtypoを直せば、undefinedとnot usedの2つのエラーが同時に消えます。`
      ],
      expectedOutput: "結果: 不合格"
    }
  ]
});
