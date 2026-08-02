// 第22章：よくあるエラー：nil・境界・型
registerChapter({
  number: 22,
  title: "よくあるエラー：nil・境界・型",
  description: "コンパイルは通るのに実行時に落ちるパニック（nil・範囲外・型アサーション失敗など）を実際に起こし、原因の読み解き方と安全な書き方を学びます。",
  steps: [
    {
      id: 211,
      title: "nilマップへの代入パニック",
      explanation: `<p>この章では「コンパイルは通るのに、実行すると落ちる」エラー＝<strong>パニック（panic）</strong>を扱います。パニックが起きるとプログラムはその場で異常終了し、次のようなメッセージが出ます。</p>
<pre><code>panic: assignment to entry in nil map

goroutine 1 [running]:
main.main()
	/path/to/main.go:7 +0x34
exit status 2</code></pre>
<h4>パニックメッセージの読み方</h4>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td><code>panic: ...</code></td><td>1行目がパニックの内容。まずここを読む</td></tr>
<tr><td><code>goroutine 1 [running]:</code>以下</td><td>スタックトレース（どの関数のどの行で起きたか）</td></tr>
<tr><td><code>main.go:7</code></td><td>パニックが起きた行番号。ここを見に行く</td></tr>
</table>
<p><code>assignment to entry in nil map</code>は「nilのマップの要素に代入した」という意味です。<code>var m map[string]int</code>と宣言しただけのマップのゼロ値は<strong>nil</strong>で、中身を入れる領域がまだ確保されていません。</p>
<h4>nilマップの性質</h4>
<ul>
<li><strong>読み取りは安全</strong>：<code>m["key"]</code>はゼロ値（intなら0）を返すだけでパニックしない</li>
<li><strong>書き込みはパニック</strong>：<code>m["key"] = 1</code>は即座に落ちる</li>
</ul>
<p>読み取りだけなら動いてしまうため、「たまたま動いていたコードに書き込みを追加した瞬間に落ちる」というのが典型パターンです。マップは必ず<code>make</code>（またはマップリテラル<code>map[string]int{}</code>）で初期化してから使いましょう。</p>
<pre><code>stock := make(map[string]int) // 領域を確保してから
stock["apple"] = 3            // 書き込めば安全</code></pre>`,
      task: `初期コードを実行してパニックメッセージを確認し、<code>make</code>でマップを初期化してから代入するように直してください。`,
      code: `package main

import "fmt"

func main() {
	var stock map[string]int
	stock["apple"] = 3
	fmt.Println("apple:", stock["apple"])
}`,
      solution: `package main

import "fmt"

func main() {
	stock := make(map[string]int)
	stock["apple"] = 3
	fmt.Println("apple:", stock["apple"])
}`,
      hints: [
        `var宣言だけのマップはnilで、書き込む領域がありません。使う前に初期化が必要です。`,
        `var stock map[string]int を stock := make(map[string]int) に変えましょう。`
      ],
      expectedOutput: "apple: 3"
    },
    {
      id: 212,
      title: "index out of range（範囲外アクセス）",
      explanation: `<p>スライスや配列の「存在しない番号」にアクセスすると起きる、実行時エラーの代表格です。初期コードは3件を表示した後に落ちます。</p>
<pre><code>score: 70
score: 85
score: 90
panic: runtime error: index out of range [3] with length 3</code></pre>
<h4>読み方</h4>
<p><code>index out of range [3] with length 3</code>は「長さ3のスライスに、インデックス3でアクセスした」という意味です。<strong>アクセスしようとした番号</strong>と<strong>実際の長さ</strong>の両方が書かれているのが親切な点で、ここから原因がほぼ特定できます。</p>
<p>インデックスは0から始まるため、長さ3のスライスで有効なのは<code>0, 1, 2</code>です。<code>[3]</code>は「最後の次」、つまり1つはみ出しています。</p>
<h4>典型的な原因：ループ条件のoff-by-one</h4>
<pre><code>for i := 0; i &lt;= len(scores); i++ { // &lt;= が原因
	fmt.Println(scores[i])          // i == len(scores) で範囲外
}</code></pre>
<p>条件を<code>i &lt;= len(scores)</code>と書くと、最後の周回で<code>i</code>が長さと同じ値になり範囲外アクセスになります。正しくは<code>i &lt; len(scores)</code>です。このような「1つずれ」のバグはoff-by-oneエラーと呼ばれ、経験者でもやりがちです。</p>
<h4>予防策</h4>
<ul>
<li>インデックスが不要なら<code>for _, s := range scores</code>を使う（範囲外が構造的に起きない）</li>
<li>インデックスループを書くときは条件を「<code>&lt; len(...)</code>」の形にする癖をつける</li>
</ul>`,
      task: `パニックメッセージの<code>[3] with length 3</code>から原因を特定し、ループ条件を修正して3件だけ正しく表示されるようにしてください。`,
      code: `package main

import "fmt"

func main() {
	scores := []int{70, 85, 90}
	for i := 0; i <= len(scores); i++ {
		fmt.Println("score:", scores[i])
	}
}`,
      solution: `package main

import "fmt"

func main() {
	scores := []int{70, 85, 90}
	for i := 0; i < len(scores); i++ {
		fmt.Println("score:", scores[i])
	}
}`,
      hints: [
        `長さ3のスライスで有効なインデックスは0〜2です。iはどこまで進んでいるでしょうか。`,
        `ループ条件のi <= len(scores)をi < len(scores)に直しましょう。`
      ],
      expectedOutput: "score: 90"
    },
    {
      id: 213,
      title: "slice bounds out of range（スライス式の範囲外）",
      explanation: `<p>前ステップの「要素アクセスの範囲外」と似ていますが、こちらは<code>s[low:high]</code>という<strong>スライス式（切り出し）</strong>での範囲外です。メッセージも区別されています。</p>
<pre><code>panic: runtime error: slice bounds out of range [:5] with capacity 3</code></pre>
<h4>読み方と前ステップとの違い</h4>
<table>
<tr><th>メッセージ</th><th>起きる操作</th><th>比較対象</th></tr>
<tr><td>index out of range [i] with length N</td><td><code>s[i]</code>（要素アクセス）</td><td>長さ（len）</td></tr>
<tr><td>slice bounds out of range [:i] with capacity N</td><td><code>s[low:high]</code>（切り出し）</td><td>容量（cap）</td></tr>
</table>
<p><code>[:5]</code>は「上限として5を指定した」こと、<code>with capacity 3</code>は「このスライスの容量は3しかない」ことを表します。要素アクセスは長さ（len）が上限ですが、スライス式は<strong>容量（cap）まで</strong>なら切り出せるため、比較対象がcapacityと表示されるのがポイントです。</p>
<h4>スライス式のルールのおさらい</h4>
<ul>
<li><code>s[low:high]</code>は「low番目からhigh-1番目まで」を切り出す（highの要素は含まない）</li>
<li>条件は<code>0 &lt;= low &lt;= high &lt;= cap(s)</code>。これを破ると実行時パニック</li>
<li>要素数3の<code>[]int{10, 20, 30}</code>から2件目以降を取りたいなら<code>s[1:3]</code></li>
</ul>
<p>「先頭から」「末尾まで」は<code>s[:2]</code>や<code>s[1:]</code>と省略できます。末尾までの切り出しに具体的な数字を書かず<code>s[1:]</code>とすれば、要素数が変わっても範囲外になりません。こうした「lenに連動する書き方」を選ぶのが予防策です。</p>`,
      task: `パニックメッセージから上限指定の誤りを特定し、<code>data</code>の2件目から末尾まで（<code>[20 30]</code>）を正しく切り出すように直してください。`,
      code: `package main

import "fmt"

func main() {
	data := []int{10, 20, 30}
	part := data[1:5]
	fmt.Println("部分スライス:", part)
}`,
      solution: `package main

import "fmt"

func main() {
	data := []int{10, 20, 30}
	part := data[1:3]
	fmt.Println("部分スライス:", part)
}`,
      hints: [
        `dataの要素数は3なので、スライス式の上限に指定できるのは最大3です。`,
        `data[1:3]、または末尾まで取るならdata[1:]と書きます。`
      ],
      expectedOutput: "部分スライス: [20 30]"
    },
    {
      id: 214,
      title: "nilポインタ参照（nil pointer dereference）",
      explanation: `<p>Goの実行時パニックの中で、実務で最も多く遭遇するのがこれです。</p>
<pre><code>panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x2 addr=0x0 pc=0x...]

goroutine 1 [running]:
main.main()
	/path/to/main.go:11 +0x3c</code></pre>
<h4>読み方</h4>
<p><code>nil pointer dereference</code>は「nilのポインタの参照先を見ようとした」という意味です。2行目の<code>SIGSEGV</code>（セグメンテーション違反）はOSレベルの不正メモリアクセス通知で、<code>addr=0x0</code>が「アドレス0＝nilを触った」ことを示します。詳細は読み飛ばしてよく、大事なのは<strong>1行目と、スタックトレース中の行番号</strong>です。</p>
<h4>なぜ起きるか</h4>
<p><code>var u *User</code>と宣言しただけのポインタのゼロ値はnilで、どの実体も指していません。その状態で<code>u.Name</code>とフィールドを触ると、「存在しない場所のメモリを読む」ことになりパニックします。</p>
<h4>典型的な発生パターンと対策</h4>
<table>
<tr><th>パターン</th><th>対策</th></tr>
<tr><td>宣言しただけで初期化を忘れた</td><td><code>u := &amp;User{...}</code>で実体を作る（今回）</td></tr>
<tr><td>関数がエラー時にnilを返すのに、確認せず使った</td><td>errチェックの後で使う</td></tr>
<tr><td>マップから取れなかった値（nil）をそのまま使った</td><td>カンマokで存在確認する</td></tr>
</table>
<p>根本の心構えは「<strong>ポインタを使う前に、それがnilでないと言い切れるか？</strong>」と自問することです。言い切れないなら<code>if u != nil</code>のガードを入れます（この章の総合演習で練習します）。</p>`,
      task: `パニックの原因になっているnilポインタを、<code>&amp;User{Name: "Gopher"}</code>で実体を指すように初期化して直してください。`,
      code: `package main

import "fmt"

type User struct {
	Name string
}

func main() {
	var u *User
	fmt.Println("名前:", u.Name)
}`,
      solution: `package main

import "fmt"

type User struct {
	Name string
}

func main() {
	u := &User{Name: "Gopher"}
	fmt.Println("名前:", u.Name)
}`,
      hints: [
        `var u *User のゼロ値はnilです。どの実体も指していないポインタのフィールドは読めません。`,
        `u := &User{Name: "Gopher"} のように構造体の実体を作り、そのアドレスを持たせましょう。`
      ],
      expectedOutput: "名前: Gopher"
    },
    {
      id: 215,
      title: "型アサーション失敗（interface conversion）",
      explanation: `<p>インターフェース型の値から中身を取り出す<strong>型アサーション</strong><code>v.(T)</code>は、中身が本当にT型でないと実行時パニックになります。</p>
<pre><code>panic: interface conversion: interface {} is string, not int</code></pre>
<h4>読み方</h4>
<p>「<code>interface {}</code>の中身は<code>string</code>なのに、<code>int</code>だと断言（アサート）された」という意味です。<strong>実際の型（is string）</strong>と<strong>期待した型（not int）</strong>の両方が示されるので、どちらの想定が間違っていたのかをここから判断します。</p>
<h4>安全な書き方：カンマok</h4>
<p>型アサーションには戻り値を2つ受け取る形があり、こちらは<strong>失敗してもパニックしません</strong>。</p>
<pre><code>n, ok := value.(int)
if ok {
	// value は int だった。n を安心して使える
} else {
	// int ではなかった。ok は false、n はゼロ値の 0
}</code></pre>
<table>
<tr><th>書き方</th><th>成功時</th><th>失敗時</th></tr>
<tr><td><code>n := v.(int)</code></td><td>nに値が入る</td><td><strong>パニックで即終了</strong></td></tr>
<tr><td><code>n, ok := v.(int)</code></td><td>n=値、ok=true</td><td>n=0、ok=false（続行できる）</td></tr>
</table>
<p>1戻り値の形を使ってよいのは「ここでこの型でなければプログラムを続ける意味がない」と設計上言い切れるときだけです。外部から来た値やmapの<code>interface{}</code>値など、<strong>型が保証されていない値には必ずカンマokを使う</strong>のが実務の鉄則です。型ごとに分岐したい場合は<code>switch v := value.(type)</code>という型switchも使えます。</p>`,
      task: `型アサーションをカンマok形式に書き換え、intでない場合は<code>intではありません: hello</code>と表示して続行できるように直してください。`,
      code: `package main

import "fmt"

func main() {
	var value interface{} = "hello"
	n := value.(int)
	fmt.Println("1を足すと:", n+1)
}`,
      solution: `package main

import "fmt"

func main() {
	var value interface{} = "hello"
	n, ok := value.(int)
	if ok {
		fmt.Println("1を足すと:", n+1)
	} else {
		fmt.Println("intではありません:", value)
	}
}`,
      hints: [
        `v.(int)の1戻り値形式は、中身がintでないとパニックします。失敗を検知できる形にしましょう。`,
        `n, ok := value.(int) と2つで受ければ、失敗時はokがfalseになるだけで落ちません。`,
        `if ok { 成功時の処理 } else { 失敗時の表示 } と分岐させます。`
      ],
      expectedOutput: "intではありません: hello"
    },
    {
      id: 216,
      title: "ゼロ除算パニック（integer divide by zero）",
      explanation: `<p>整数を0で割ると実行時パニックになります。</p>
<pre><code>panic: runtime error: integer divide by zero</code></pre>
<h4>なぜコンパイルで捕まらないのか</h4>
<p>実は<code>10 / 0</code>のように<strong>定数0で割る式はコンパイルエラー</strong>（division by zero）になります。しかし今回のように「<code>len(scores)</code>の結果がたまたま0だった」という<strong>実行時に決まる値</strong>はコンパイラには予測できないため、実行時パニックとして現れます。</p>
<h4>典型的な発生パターン：空データの平均</h4>
<pre><code>average := total / len(scores) // scores が空だと len は 0</code></pre>
<p>「平均を出す」処理は、データが1件以上ある前提で書きがちです。開発中はテストデータが入っているので動き、本番で「まだデータが0件のユーザー」に当たった瞬間に落ちる、というのが定番の事故です。</p>
<h4>直し方：割る前にガードする</h4>
<pre><code>if len(scores) == 0 {
	fmt.Println("データがありません")
	return // ここで抜ければ以降は len が 1 以上と保証される
}
average := total / len(scores)</code></pre>
<p>このように「異常なケースを先に処理して早めにreturnする」書き方をガード節（早期リターン）と呼びます。ガードの後のコードは「データがある」と保証された状態で書けるため、読みやすさも上がります。なお、float64のゼロ除算はパニックせず<code>+Inf</code>や<code>NaN</code>という特殊な値になるという違いも覚えておくと、いつか役立ちます。</p>`,
      task: `割り算の前に<code>len(scores)</code>が0かどうかを確認するガードを追加し、0件のときは<code>データがありません</code>と表示して<code>return</code>するように直してください。`,
      code: `package main

import "fmt"

func main() {
	scores := []int{}
	total := 0
	for _, s := range scores {
		total += s
	}
	average := total / len(scores)
	fmt.Println("平均:", average)
}`,
      solution: `package main

import "fmt"

func main() {
	scores := []int{}
	total := 0
	for _, s := range scores {
		total += s
	}
	if len(scores) == 0 {
		fmt.Println("データがありません")
		return
	}
	average := total / len(scores)
	fmt.Println("平均:", average)
}`,
      hints: [
        `scoresは空なのでlen(scores)は0です。0で割る前に件数を確認する必要があります。`,
        `割り算の前にif len(scores) == 0 { ... return }のガード節を入れましょう。`
      ],
      expectedOutput: "データがありません"
    },
    {
      id: 217,
      title: "string(65)の罠（エラーにならないバグ）",
      explanation: `<p>今回はエラーもパニックも出ないのに<strong>結果が間違っている</strong>、ある意味もっとタチの悪いケースです。初期コードを実行すると、こう表示されます。</p>
<pre><code>数値の文字列: A</code></pre>
<p><code>"65"</code>と表示したかったのに<code>"A"</code>が出ました。エラーメッセージがないので、出力を注意深く見ないと気づけません。</p>
<h4>なぜ"A"になるのか</h4>
<p>Goの<code>string(整数)</code>は「数値を10進の文字列にする」変換<strong>ではなく</strong>、「その数値をUnicodeコードポイント（文字に振られた番号）とみなして、1文字の文字列を作る」変換です。65は文字<code>A</code>の番号なので、<code>string(65)</code>は<code>"A"</code>になります。</p>
<table>
<tr><th>書き方</th><th>結果</th><th>意味</th></tr>
<tr><td><code>string(65)</code></td><td>"A"</td><td>コードポイント65の文字</td></tr>
<tr><td><code>strconv.Itoa(65)</code></td><td>"65"</td><td>数値の10進表記</td></tr>
<tr><td><code>fmt.Sprintf("%d", 65)</code></td><td>"65"</td><td>書式化して文字列を作る</td></tr>
</table>
<h4>ツールの助けを借りる</h4>
<p>この間違いはあまりに定番なので、静的解析ツール<code>go vet</code>（コードの怪しい箇所を検出する標準ツール）は<code>string(num)</code>のような変換に「conversion from int to string yields a string of one rune」という警告を出してくれます。コンパイルが通っても、vetの警告は必ず目を通す習慣をつけましょう。</p>
<p>覚え方は「<strong>数値→文字列はstrconv.Itoa</strong>（またはfmt.Sprintf）。string()を数値に使うのは、意図的に文字を作るときだけ」です。</p>`,
      task: `実行して<code>A</code>と表示されてしまうことを確認し、<code>strconv.Itoa</code>を使って<code>数値の文字列: 65</code>と表示されるように直してください。`,
      code: `package main

import "fmt"

func main() {
	num := 65
	s := string(num)
	fmt.Println("数値の文字列:", s)
}`,
      solution: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	num := 65
	s := strconv.Itoa(num)
	fmt.Println("数値の文字列:", s)
}`,
      hints: [
        `string(整数)は「その番号の文字」を作る変換です。65は文字Aの番号なので"A"になります。`,
        `数値を10進の文字列にするにはstrconv.Itoa(num)を使います。importに"strconv"の追加も忘れずに。`
      ],
      expectedOutput: "数値の文字列: 65"
    },
    {
      id: 218,
      title: ":=によるシャドーイングバグ",
      explanation: `<p>これもエラーが出ないバグです。初期コードは「penを数える」つもりのプログラムですが、実行結果はこうなります。</p>
<pre><code>ループ内のcount: 1
ループ内のcount: 1
最終カウント: 0</code></pre>
<p>penは2本あるのに、ループ内は毎回1、最終カウントは0。外側の<code>count</code>がまったく更新されていません。</p>
<h4>原因：シャドーイング</h4>
<p>if文の中の<code>count := count + 1</code>に注目してください。<code>:=</code>は<strong>新しい変数の宣言</strong>なので、この行はifブロックの中だけで有効な<strong>別のcount</strong>を作っています。内側のcountが外側のcountを「影に隠す」ことから、これをシャドーイングと呼びます。</p>
<pre><code>count := 0            // 外側の count
if item == "pen" {
	count := count + 1 // 新しい内側の count が誕生（外側の0+1で常に1）
	                   // ifを抜けると内側の count は消える
}
// 外側の count は 0 のまま</code></pre>
<h4>厄介な点と対策</h4>
<ul>
<li>内側のcountはブロック内で使われているため、<strong>未使用エラーにもならない</strong>（使っていなければコンパイラが教えてくれた）</li>
<li>第21章で学んだ「no new variables」エラーの<strong>逆パターン</strong>：あちらは=にすべき所で:=を使って怒られたが、こちらは別スコープなので:=が合法になってしまい、静かにバグる</li>
<li>対策は「既存の変数を更新するときは<code>=</code>」を徹底すること。ifやforの中で<code>:=</code>を書くときは「新しい変数を作る意図か？」と一呼吸置く</li>
</ul>
<p>特に<code>value, err := f()</code>をif内で書いてerrを外に伝えたつもりになる事故が実務では頻出です。<code>:=</code>を見たら常にスコープを意識しましょう。</p>`,
      task: `実行結果がおかしい原因（シャドーイング）を特定し、外側の<code>count</code>が正しく更新されて<code>最終カウント: 2</code>になるように直してください。`,
      code: `package main

import "fmt"

func main() {
	count := 0
	items := []string{"pen", "note", "pen"}
	for _, item := range items {
		if item == "pen" {
			count := count + 1
			fmt.Println("ループ内のcount:", count)
		}
	}
	fmt.Println("最終カウント:", count)
}`,
      solution: `package main

import "fmt"

func main() {
	count := 0
	items := []string{"pen", "note", "pen"}
	for _, item := range items {
		if item == "pen" {
			count = count + 1
			fmt.Println("ループ内のcount:", count)
		}
	}
	fmt.Println("最終カウント:", count)
}`,
      hints: [
        `if内のcount := count + 1は、外側のcountとは別の新しい変数を作っています。`,
        `既存の変数を更新するなら:=ではなく=です。count = count + 1に直しましょう。`
      ],
      expectedOutput: "最終カウント: 2"
    },
    {
      id: 219,
      title: "マップの値の構造体フィールドに直接代入できない",
      explanation: `<p>マップの値が構造体のとき、そのフィールドを直接書き換えようとすると、独特なコンパイルエラーが出ます。</p>
<pre><code>./main.go:13:2: cannot assign to struct field points["start"].X in map</code></pre>
<h4>読み方</h4>
<p>「マップの中にある構造体フィールド<code>points["start"].X</code>へは代入できない」という意味です。どの式が問題かをそのまま示してくれているので、場所の特定は簡単ですが、「なぜダメなのか」が分からないと直し方に迷います。</p>
<h4>なぜ代入できないのか</h4>
<p><code>points["start"]</code>でマップから取り出される構造体は、実は<strong>コピー（複製）</strong>です。マップは内部でデータを移動させることがあるため、Goは要素の「本体の場所（アドレス）」を取らせてくれません。仮に<code>points["start"].X = 100</code>を許すと「コピーに代入してすぐ捨てる」無意味な操作になるため、コンパイラがエラーとして禁止しています。</p>
<h4>直し方は2パターン</h4>
<p><strong>パターン1：取り出して、書き換えて、戻す</strong>（今回はこちら）</p>
<pre><code>p := points["start"] // コピーを取り出す
p.X = 100            // コピーを書き換える
points["start"] = p  // マップに戻す</code></pre>
<p><strong>パターン2：マップの値をポインタにする</strong></p>
<pre><code>points := map[string]*Point{"start": {X: 1, Y: 2}}
points["start"].X = 100 // ポインタ経由なら直接書き換えられる</code></pre>
<p>書き換えが頻繁ならパターン2が便利ですが、nilポインタ（ステップ214）に注意が必要になります。まずは基本のパターン1を身につけましょう。ちなみにスライスの要素は本体の場所を取れるため<code>s[0].X = 100</code>が可能で、この点がマップとの大きな違いです。</p>`,
      task: `「取り出して、書き換えて、戻す」の3行に書き換えてエラーを解消し、<code>start: {100 2}</code>と表示されるようにしてください。`,
      code: `package main

import "fmt"

type Point struct {
	X, Y int
}

func main() {
	points := map[string]Point{
		"start": {X: 1, Y: 2},
	}
	points["start"].X = 100
	fmt.Println("start:", points["start"])
}`,
      solution: `package main

import "fmt"

type Point struct {
	X, Y int
}

func main() {
	points := map[string]Point{
		"start": {X: 1, Y: 2},
	}
	p := points["start"]
	p.X = 100
	points["start"] = p
	fmt.Println("start:", points["start"])
}`,
      hints: [
        `マップから取り出した構造体はコピーなので、フィールドへの直接代入は禁止されています。`,
        `p := points["start"] で取り出し、p.X = 100 で書き換え、points["start"] = p で戻します。`
      ],
      expectedOutput: "start: {100 2}"
    },
    {
      id: 220,
      title: "総合演習：nil安全なコードに直す",
      explanation: `<p>この章の総まとめです。初期コードには<strong>nilに関する罠が2つ</strong>仕込まれており、実行するとまず1つ目でパニックします。</p>
<pre><code>panic: assignment to entry in nil map

goroutine 1 [running]:
main.main()
	/path/to/main.go:15 +0x38</code></pre>
<h4>直し方の進め方</h4>
<p>実行時パニックの修正は「落ちた箇所を直す→再実行→次に落ちた箇所を直す」の繰り返しです。ただし毎回1つずつ潰すのではなく、<strong>同種の危険が他にないかをまとめて点検する</strong>のが上級者の動きです。今回のnilチェックリストはこの2つです。</p>
<table>
<tr><th>危険箇所</th><th>症状</th><th>対策</th></tr>
<tr><td><code>var tags map[string]string</code>への書き込み</td><td>assignment to entry in nil map</td><td><code>make</code>で初期化（ステップ211）</td></tr>
<tr><td><code>nickname(missing)</code>のnilポインタ</td><td>nil pointer dereference</td><td>関数側にnilガードを追加（ステップ214）</td></tr>
</table>
<h4>ガードは「使う側」でなく「関数側」に置く</h4>
<p>呼び出しのたびに<code>if missing != nil</code>と書く方法もありますが、チェック漏れが起きやすいのが弱点です。ポインタを受け取る関数の<strong>入り口でガードする</strong>と、どこから呼ばれても安全になります。</p>
<pre><code>func nickname(p *Profile) string {
	if p == nil {
		return "(未設定)" // nilなら安全なデフォルト値を返す
	}
	return p.Nickname
}</code></pre>
<p>「nilの可能性がある値は、境界（関数の入り口）で無害化する」——この設計感覚は、エラー処理やAPI設計にもそのままつながるGoの重要な作法です。2箇所を直して、3行すべてが表示されるプログラムに仕上げましょう。</p>`,
      task: `(1)<code>tags</code>を<code>make</code>で初期化し、(2)<code>nickname</code>関数の先頭に「<code>p</code>がnilなら<code>"(未設定)"</code>を返す」ガードを追加して、パニックせずに3行表示されるようにしてください。`,
      code: `package main

import "fmt"

type Profile struct {
	Nickname string
}

// nickname はプロフィールからニックネームを取り出す
func nickname(p *Profile) string {
	// TODO: pがnilの場合のガードを追加する
	return p.Nickname
}

func main() {
	// TODO: nilマップのままでは書き込めない
	var tags map[string]string
	tags["role"] = "admin"

	prof := &Profile{Nickname: "gopher"}
	var missing *Profile

	fmt.Println("role:", tags["role"])
	fmt.Println("prof:", nickname(prof))
	fmt.Println("missing:", nickname(missing))
}`,
      solution: `package main

import "fmt"

type Profile struct {
	Nickname string
}

// nickname はプロフィールからニックネームを取り出す
func nickname(p *Profile) string {
	if p == nil {
		return "(未設定)"
	}
	return p.Nickname
}

func main() {
	tags := make(map[string]string)
	tags["role"] = "admin"

	prof := &Profile{Nickname: "gopher"}
	var missing *Profile

	fmt.Println("role:", tags["role"])
	fmt.Println("prof:", nickname(prof))
	fmt.Println("missing:", nickname(missing))
}`,
      hints: [
        `まず実行して落ちた行を確認しましょう。1つ目はnilマップへの書き込みです（makeで初期化）。`,
        `1つ目を直して再実行すると、今度はnickname(missing)でnilポインタパニックが起きます。`,
        `nickname関数の先頭にif p == nil { return "(未設定)" }を追加すれば、どこから呼ばれても安全です。`
      ],
      expectedOutput: "missing: (未設定)"
    }
  ]
});
