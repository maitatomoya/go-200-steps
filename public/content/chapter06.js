// 第6章：マップ
registerChapter({
  number: 6,
  title: "マップ",
  description: "キーと値のペアを扱うmapを学びます。ゼロ値の罠やカンマokイディオム、順序不定への対処など、実務で必須の知識を体験します。",
  steps: [
    {
      id: 51,
      title: "mapの基本（makeで作成、追加、取得）",
      explanation: `<p><strong>map(マップ)</strong>は、<strong>キー</strong>から<strong>値</strong>を高速に引ける対応表のデータ構造です。他言語では辞書(dictionary)や連想配列、ハッシュと呼ばれるものにあたります。</p>
<p>型は<code>map[キーの型]値の型</code>と書きます。<code>map[string]int</code>なら「文字列をキーにint値を引く対応表」です。作成には<strong>make</strong>を使います。</p>
<pre><code>age := make(map[string]int) // 空のmapを作成
age["田中"] = 30            // キー"田中"に値30を登録
age["鈴木"] = 25            // 追加
age["田中"] = 31            // 同じキーへの代入は上書き
fmt.Println(age["田中"])    // 31(キーで取得)
fmt.Println(len(age))       // 2(登録済みのペア数)</code></pre>
<p>スライスがインデックス(0, 1, 2, ...)で要素を引くのに対し、mapは<strong>好きなキー</strong>で引けるのが特徴です。</p>
<table>
<tr><th></th><th>スライス</th><th>map</th></tr>
<tr><td>要素の指定</td><td>インデックス(整数)</td><td>キー(文字列など)</td></tr>
<tr><td>追加</td><td>append</td><td><code>m[キー] = 値</code></td></tr>
<tr><td>順序</td><td>並び順が保たれる</td><td>順序の保証なし(後のステップで体験)</td></tr>
</table>
<p>登録済みの件数は<code>len</code>で取得できます。「名前から年齢を引く」「商品名から価格を引く」など、<strong>IDや名前をキーにデータを管理する</strong>場面はプログラミングの至るところに登場します。mapはスライスと並ぶGoの二大コレクションです。</p>`,
      task: `<code>age</code>マップにキー<code>"鈴木"</code>、値<code>25</code>を追加してください。`,
      code: `package main

import "fmt"

func main() {
	// makeでmapを作成(キー:string、値:int)
	age := make(map[string]int)
	age["田中"] = 30
	// TODO: キー"鈴木"に値25を登録する

	fmt.Println("田中:", age["田中"])
	fmt.Println("鈴木:", age["鈴木"])
	fmt.Println("人数:", len(age))
}
`,
      solution: `package main

import "fmt"

func main() {
	// makeでmapを作成(キー:string、値:int)
	age := make(map[string]int)
	age["田中"] = 30
	// キーを指定して代入すると新しいペアが登録される
	age["鈴木"] = 25

	fmt.Println("田中:", age["田中"])
	fmt.Println("鈴木:", age["鈴木"])
	fmt.Println("人数:", len(age))
}
`,
      hints: [
        `mapへの登録は「マップ名[キー] = 値」の形で書きます。スライスと違ってappendは使いません。`,
        `age["田中"] = 30 と同じ形で、"鈴木"と25のペアを登録しましょう。`
      ],
      expectedOutput: "鈴木: 25"
    },
    {
      id: 52,
      title: "mapリテラル",
      explanation: `<p>最初から中身が決まっているmapは、<strong>mapリテラル</strong>で作成と初期化を同時に行えます。スライスリテラルのmap版です。</p>
<pre><code>price := map[string]int{
	"apple":  150,
	"banana": 100,
	"cherry": 400,
}
fmt.Println(price["apple"]) // 150</code></pre>
<p>書き方のルールを整理します。</p>
<ul>
<li>各ペアは<code>キー: 値</code>の形で書き、カンマで区切る</li>
<li>複数行で書く場合、<strong>最後のペアの後ろにもカンマが必要</strong>(Goの文法上の決まり。付け忘れるとコンパイルエラー)</li>
<li>空のmapは<code>map[string]int{}</code>とも書ける(makeと同じ効果)</li>
</ul>
<p>1行で書くこともできます。ペアが少ないときはこちらが手軽です。</p>
<pre><code>point := map[string]int{"国語": 80, "数学": 95}</code></pre>
<p>makeとリテラルの使い分けはシンプルです。</p>
<table>
<tr><th>作り方</th><th>向いている場面</th></tr>
<tr><td><code>make(map[string]int)</code></td><td>空で作って後からデータを詰める</td></tr>
<tr><td><code>map[string]int{...}</code></td><td>初期データが最初から決まっている</td></tr>
</table>
<p>設定値の対応表や変換テーブルなど、「コードに埋め込む固定の対応関係」はmapリテラルで書くのが定番です。最後のカンマ(末尾カンマ)はスライスリテラルの複数行でも同じルールなので、ここで覚えてしまいましょう。</p>`,
      task: `mapリテラルを使って、<code>"apple"</code>が<code>150</code>、<code>"banana"</code>が<code>100</code>のペアを持つ<code>price</code>を作ってください。`,
      code: `package main

import "fmt"

func main() {
	// TODO: mapリテラルで "apple":150 と "banana":100 を持つmapを作る
	price := map[string]int{}

	fmt.Println("apple:", price["apple"])
	fmt.Println("banana:", price["banana"])
	fmt.Println("品数:", len(price))
}
`,
      solution: `package main

import "fmt"

func main() {
	// mapリテラル:複数行で書くときは最後のペアにもカンマが必要
	price := map[string]int{
		"apple":  150,
		"banana": 100,
	}

	fmt.Println("apple:", price["apple"])
	fmt.Println("banana:", price["banana"])
	fmt.Println("品数:", len(price))
}
`,
      hints: [
        `波かっこの中に「キー: 値」のペアをカンマ区切りで並べます。`,
        `複数行で書く場合は "banana": 100, のように最後のペアの後ろにもカンマを付けないとコンパイルエラーになります。`
      ],
      expectedOutput: "apple: 150"
    },
    {
      id: 53,
      title: "存在しないキーはゼロ値（罠の体験）",
      explanation: `<p>mapで<strong>登録されていないキー</strong>を取得すると何が起きるでしょうか。エラー?パニック?――どちらでもなく、Goでは<strong>値の型のゼロ値が静かに返ってきます</strong>。</p>
<pre><code>stock := map[string]int{"pen": 10}
fmt.Println(stock["pen"])    // 10
fmt.Println(stock["eraser"]) // 0 ← エラーにならずゼロ値が返る!</code></pre>
<p>ゼロ値は型ごとに決まっています(第2章の復習です)。</p>
<table>
<tr><th>値の型</th><th>存在しないキーで返る値</th></tr>
<tr><td>int</td><td>0</td></tr>
<tr><td>string</td><td>""(空文字列)</td></tr>
<tr><td>bool</td><td>false</td></tr>
<tr><td>[]int(スライス)</td><td>nil</td></tr>
</table>
<p>この仕様は便利な面もあります。たとえばカウント用途では、未登録キーが0扱いになるおかげで<code>count["go"]++</code>といきなり書けます(後の演習で使います)。</p>
<p>一方で<strong>危険な罠</strong>にもなります。「在庫0の商品」と「そもそも登録されていない商品」が、どちらも<code>0</code>で区別できないのです。タイプミスしたキーで取得してもエラーにならないため、<strong>バグに気づきにくい</strong>という問題もあります。</p>
<pre><code>fmt.Println(stock["Pen"]) // 0(大文字始まりのタイプミス。エラーにならない!)</code></pre>
<p>この「存在するかどうか」を確実に見分ける方法が、次のステップで学ぶカンマokイディオムです。まずは本ステップでゼロ値が返る挙動を実際に確かめておきましょう。</p>`,
      task: `実行して存在しないキーで<code>0</code>が返ることを確認したら、<code>map[string]string</code>型の<code>capital</code>でも存在しないキーを取得し、空文字列が返ることを確認してください。`,
      code: `package main

import "fmt"

func main() {
	stock := map[string]int{"pen": 10}

	fmt.Println("pen:", stock["pen"])
	// 存在しないキーを取得すると…エラーにならずゼロ値が返る
	fmt.Println("eraser:", stock["eraser"])

	// TODO: 値がstring型のmapで存在しないキーを取得し、
	// ゼロ値(空文字列)が返ることをPrintfの[%s]で確認する
	capital := map[string]string{"日本": "東京"}
	fmt.Printf("日本:[%s]\\n", capital["日本"])
}
`,
      solution: `package main

import "fmt"

func main() {
	stock := map[string]int{"pen": 10}

	fmt.Println("pen:", stock["pen"])
	// 存在しないキーを取得すると…エラーにならずゼロ値が返る
	fmt.Println("eraser:", stock["eraser"])

	// 値がstring型なら、ゼロ値の空文字列""が返る
	capital := map[string]string{"日本": "東京"}
	fmt.Printf("日本:[%s]\\n", capital["日本"])
	fmt.Printf("フランス:[%s]\\n", capital["フランス"])
}
`,
      hints: [
        `mapの値の型がintなら0、stringなら""(空文字列)がゼロ値です。`,
        `fmt.Printf("フランス:[%s]\\n", capital["フランス"]) を追加すると、[]の間に何も表示されない=空文字列が返っていることが見えます。`
      ],
      expectedOutput: "eraser: 0"
    },
    {
      id: 54,
      title: "カンマokイディオム（v, ok := m[k]）",
      explanation: `<p>前ステップで見た「値0なのか未登録なのか区別できない」問題を解決するのが、<strong>カンマokイディオム</strong>です。mapの取得は、実は<strong>2つの値を受け取る</strong>形で書けます。</p>
<pre><code>v, ok := stock["note"]
// v  : 値(存在しなければゼロ値)
// ok : キーが存在すればtrue、しなければfalse(bool型)</code></pre>
<p>2番目の<code>ok</code>を見れば、ゼロ値が「登録された0」なのか「未登録」なのかを確実に判定できます。</p>
<table>
<tr><th>状況</th><th>v</th><th>ok</th></tr>
<tr><td>キー"note"に0が登録済み</td><td>0</td><td>true</td></tr>
<tr><td>キー"eraser"は未登録</td><td>0</td><td>false</td></tr>
</table>
<p>第3章で学んだ「ifの初期化文」と組み合わせるのがGoの定番スタイルです。<code>ok</code>のスコープ(有効範囲)をifの中だけに閉じ込められます。</p>
<pre><code>if v, ok := stock["eraser"]; ok {
	fmt.Println("在庫:", v)
} else {
	fmt.Println("未登録です")
}</code></pre>
<p>変数名は慣習として<code>ok</code>を使います。存在確認だけしたい(値は不要)ときは、ブランク識別子と組み合わせて<code>_, ok := m[k]</code>と書きます。</p>
<p>このイディオム(慣用句)はmap以外にも、後の章で学ぶ型アサーションやチャネル受信など、Goのあちこちに登場する重要パターンです。「2つ目の戻り値で成否を知る」という形をここでしっかり身につけましょう。</p>`,
      task: `カンマokイディオムを使って<code>"eraser"</code>を取得し、存在すれば値を、存在しなければ<code>eraserは未登録です</code>と表示してください。`,
      code: `package main

import "fmt"

func main() {
	stock := map[string]int{"pen": 10, "note": 0}

	// noteの0は「在庫0」なのか「未登録」なのか、値だけでは分からない
	v, ok := stock["note"]
	fmt.Println("note:", v, "存在する?", ok)

	// TODO: "eraser"をカンマokで取得し、存在すれば値を、
	// 存在しなければ"eraserは未登録です"と表示する
}
`,
      solution: `package main

import "fmt"

func main() {
	stock := map[string]int{"pen": 10, "note": 0}

	// noteの0は「在庫0」なのか「未登録」なのか、値だけでは分からない
	v, ok := stock["note"]
	fmt.Println("note:", v, "存在する?", ok)

	// ifの初期化文と組み合わせるのが定番スタイル
	if e, ok := stock["eraser"]; ok {
		fmt.Println("eraser:", e)
	} else {
		fmt.Println("eraserは未登録です")
	}
}
`,
      hints: [
        `mapの取得は「値, ok := m[キー]」の形で書くと、2つ目にキーの有無(bool)が返ります。`,
        `if e, ok := stock["eraser"]; ok { ... } else { ... } のように、ifの初期化文と組み合わせて書いてみましょう。`
      ],
      expectedOutput: "eraserは未登録です"
    },
    {
      id: 55,
      title: "deleteでキーを削除する",
      explanation: `<p>mapからキーと値のペアを取り除くには、組み込み関数<strong>delete</strong>を使います。</p>
<pre><code>user := map[string]int{"alice": 20, "bob": 25}
delete(user, "bob")   // キー"bob"のペアを削除
fmt.Println(len(user)) // 1</code></pre>
<p>deleteの仕様で覚えておきたいポイントは次の通りです。</p>
<ul>
<li>引数は<code>delete(マップ, キー)</code>の2つ。<strong>戻り値はない</strong></li>
<li><strong>存在しないキーを削除してもエラーにならない</strong>(何も起きないだけ)</li>
<li>削除後にそのキーで取得すると、未登録扱いになりゼロ値が返る</li>
</ul>
<pre><code>delete(user, "carol") // 未登録キーでもパニックしない
_, ok := user["bob"]
fmt.Println(ok)       // false(削除済みなので存在しない)</code></pre>
<p>「存在しないキーの削除が安全」という仕様のおかげで、削除前にカンマokで確認する必要はありません。消したいときは黙ってdeleteを呼べばよい、という潔い設計です。</p>
<table>
<tr><th>操作</th><th>書き方</th></tr>
<tr><td>登録・上書き</td><td><code>m[k] = v</code></td></tr>
<tr><td>取得</td><td><code>v := m[k]</code> / <code>v, ok := m[k]</code></td></tr>
<tr><td>削除</td><td><code>delete(m, k)</code></td></tr>
<tr><td>件数</td><td><code>len(m)</code></td></tr>
</table>
<p>これでmapの基本操作(CRUDと呼ばれる登録・取得・更新・削除)が一通りそろいました。削除が正しく行われたかは、lenの変化やカンマokで確認できます。</p>`,
      task: `<code>delete</code>を使って<code>user</code>から<code>"bob"</code>を削除してください。削除後の人数と、bobの存在チェックの結果が変わることを確認しましょう。`,
      code: `package main

import "fmt"

func main() {
	user := map[string]int{"alice": 20, "bob": 25}
	fmt.Println("削除前の人数:", len(user))

	// TODO: deleteでキー"bob"を削除する

	fmt.Println("削除後の人数:", len(user))

	_, ok := user["bob"]
	fmt.Println("bobは存在する?", ok)
}
`,
      solution: `package main

import "fmt"

func main() {
	user := map[string]int{"alice": 20, "bob": 25}
	fmt.Println("削除前の人数:", len(user))

	// delete(マップ, キー)で削除。戻り値はない
	delete(user, "bob")

	fmt.Println("削除後の人数:", len(user))

	_, ok := user["bob"]
	fmt.Println("bobは存在する?", ok)
}
`,
      hints: [
        `削除は組み込み関数deleteを使います。引数は「マップ」と「キー」の2つです。`,
        `delete(user, "bob") の1行を追加するだけです。戻り値はないので受け取る必要はありません。`
      ],
      expectedOutput: "bobは存在する? false"
    },
    {
      id: 56,
      title: "nilマップへの代入はパニック（エラー体験）",
      explanation: `<p>今回は<strong>わざと実行時エラー(パニック)を起こして</strong>、mapの重要な落とし穴を体験します。</p>
<p><code>var m map[string]int</code>のように宣言だけしたmapのゼロ値は<strong>nil</strong>です。nilマップは「対応表の実体がまだ存在しない」状態で、<strong>読み取りはできますが、書き込むとパニック</strong>になります。</p>
<pre><code>var score map[string]int
fmt.Println(score["数学"]) // 0(読み取りはゼロ値が返るだけでOK)
score["数学"] = 90         // パニック!
// panic: assignment to entry in nil map</code></pre>
<p><strong>パニック</strong>とは、プログラムの続行が不可能になり強制終了する実行時エラーです。コンパイルは通ってしまうため、実行して初めて発覚します。</p>
<p>ここがスライスとの大きな違いです。nilスライスはappendでそのまま育てられましたが、<strong>nilマップに書き込むことはできません</strong>。</p>
<table>
<tr><th></th><th>nilスライス</th><th>nilマップ</th></tr>
<tr><td>読み取り(len、取得)</td><td>できる</td><td>できる(ゼロ値が返る)</td></tr>
<tr><td>要素の追加</td><td>appendでできる</td><td><strong>パニック!</strong></td></tr>
</table>
<p>対策はシンプルで、<strong>書き込む前に必ずmakeかリテラルで初期化する</strong>ことです。</p>
<pre><code>score := make(map[string]int) // 実体を作ってから
score["数学"] = 90            // 書き込めばOK</code></pre>
<p>「varで宣言しただけのmapに書き込んでパニック」は、Go初心者が最も高い確率で踏むエラーの1つです。まず実行してパニックのメッセージを自分の目で読み、それから修正しましょう。エラーメッセージを読む力も大切なスキルです。</p>`,
      task: `まず実行して<code>panic: assignment to entry in nil map</code>を確認してください。その後、<code>make</code>で初期化するように修正してパニックを解消しましょう。`,
      code: `package main

import "fmt"

func main() {
	// varで宣言しただけのmapはnil(実体がない)
	var score map[string]int

	// nilマップへの代入は実行時パニックになる
	// TODO: まず実行してパニックを確認し、宣言をmakeでの初期化に修正する
	score["数学"] = 90
	score["英語"] = 75

	fmt.Println("数学:", score["数学"])
	fmt.Println("英語:", score["英語"])
}
`,
      solution: `package main

import "fmt"

func main() {
	// makeで実体を作ってから使えばパニックしない
	score := make(map[string]int)

	score["数学"] = 90
	score["英語"] = 75

	fmt.Println("数学:", score["数学"])
	fmt.Println("英語:", score["英語"])
}
`,
      hints: [
        `パニックのメッセージ「assignment to entry in nil map」は「nilマップへの書き込み」という意味です。書き込む前に実体を用意する必要があります。`,
        `var score map[string]int の行を score := make(map[string]int) に書き換えましょう。`
      ],
      expectedOutput: "数学: 90"
    },
    {
      id: 57,
      title: "rangeでmapを走査する（順序不定を観察）",
      explanation: `<p>mapの全ペアを処理するには、スライスと同じく<strong>for range</strong>を使います。ただし受け取るのは「インデックスと値」ではなく<strong>「キーと値」</strong>です。</p>
<pre><code>price := map[string]int{"apple": 150, "banana": 100, "cherry": 400}
for name, p := range price {
	fmt.Println(name, p)
}</code></pre>
<p>ここでmapの重要な性質が現れます。<strong>rangeでmapを走査する順序は保証されません</strong>。上のコードを何度か実行すると、表示順が毎回変わることがあります。</p>
<p>これは偶然ではなく、Goが<strong>意図的に順序をランダム化している</strong>ためです。「たまたま同じ順序で出てきたから」と順序に依存したコードを書いてしまうバグを防ぐため、言語仕様として順序に頼れない設計になっています。</p>
<table>
<tr><th></th><th>スライスのrange</th><th>mapのrange</th></tr>
<tr><td>受け取るもの</td><td>インデックスと値</td><td>キーと値</td></tr>
<tr><td>順序</td><td>常に先頭から末尾へ</td><td><strong>保証なし(毎回変わりうる)</strong></td></tr>
</table>
<p>一方で、<strong>順序に依存しない計算</strong>なら安心してrangeを使えます。合計・件数・最大値などは、どの順で足しても結果が同じだからです。キーだけが欲しいときは<code>for name := range price</code>と書けます。値だけ欲しいときはキーを<code>_</code>で無視します。</p>
<pre><code>total := 0
for _, p := range price {
	total += p // どの順でも合計は同じ
}</code></pre>
<p>「決まった順序で表示したい」場合の対処法は次のステップで学びます。まずは順序不定を自分の目で観察してください。</p>`,
      task: `何度か実行して表示順が変わりうることを観察したら、rangeで<code>price</code>の値の合計を計算して表示してください（合計は順序に関係なく同じ値になります）。`,
      code: `package main

import "fmt"

func main() {
	price := map[string]int{"apple": 150, "banana": 100, "cherry": 400}

	// 何度か実行すると表示順が変わることがある(順序は保証されない)
	for name, p := range price {
		fmt.Println(name, p)
	}

	// TODO: rangeで値の合計をtotalに計算する(キーは_で無視する)
	total := 0

	fmt.Println("合計:", total)
}
`,
      solution: `package main

import "fmt"

func main() {
	price := map[string]int{"apple": 150, "banana": 100, "cherry": 400}

	// 何度か実行すると表示順が変わることがある(順序は保証されない)
	for name, p := range price {
		fmt.Println(name, p)
	}

	// 合計は足す順序に関係なく同じ値になる
	total := 0
	for _, p := range price {
		total += p
	}

	fmt.Println("合計:", total)
}
`,
      hints: [
        `mapのrangeは「キー, 値」の2つを返します。値だけ使いたいときはキーを_で受け取ります。`,
        `for _, p := range price { total += p } の形です。合計は650になるはずです。`
      ],
      expectedOutput: "合計: 650"
    },
    {
      id: 58,
      title: "キーをソートして順序を安定させる",
      explanation: `<p>mapのrangeは順序不定でした。では「アルファベット順で一覧表示したい」ときはどうするか。Goの定番解は<strong>「キーをスライスに集めてソートし、その順にmapを引く」</strong>という2段構えです。</p>
<p>ソートには標準ライブラリの<strong>sortパッケージ</strong>を使います。importに追加すれば、<code>sort.Strings</code>で文字列スライスを昇順(辞書順)に並べ替えられます。</p>
<pre><code>import (
	"fmt"
	"sort"
)

keys := []string{"cherry", "apple", "banana"}
sort.Strings(keys)
fmt.Println(keys) // [apple banana cherry]</code></pre>
<p><code>sort.Strings</code>は渡したスライス<strong>そのものを並べ替える</strong>(戻り値で返すのではない)点に注意してください。intのスライスには<code>sort.Ints</code>を使います。</p>
<p>mapの安定表示は、この3手順で行います。</p>
<ol>
<li>rangeでmapの<strong>キーだけ</strong>をスライスに集める(<code>for k := range m</code>)</li>
<li><code>sort.Strings</code>でキーのスライスをソートする</li>
<li>ソート済みキーの順にrangeし、<code>m[k]</code>で値を引いて表示する</li>
</ol>
<pre><code>keys := []string{}
for k := range price {
	keys = append(keys, k)
}
sort.Strings(keys)
for _, k := range keys {
	fmt.Println(k, price[k])
}</code></pre>
<p>少し回りくどく感じるかもしれませんが、「mapは検索係、スライスは順序係」と役割分担させるのがGo流です。テスト出力やログなど、<strong>再現可能な出力</strong>が必要な場面で必ず使うテクニックなので、手を動かして覚えましょう。</p>`,
      task: `<code>sort.Strings</code>で<code>keys</code>を昇順に並べ替えて、mapの内容が常にアルファベット順で表示されるようにしてください。`,
      code: `package main

import (
	"fmt"
	"sort"
)

func main() {
	price := map[string]int{"cherry": 400, "apple": 150, "banana": 100}

	// 手順1: キーだけをスライスに集める
	keys := []string{}
	for k := range price {
		keys = append(keys, k)
	}

	// TODO: 手順2: sort.Stringsでkeysを昇順に並べ替える

	// 手順3: ソート済みキーの順に表示する
	for _, k := range keys {
		fmt.Println(k, price[k])
	}
}
`,
      solution: `package main

import (
	"fmt"
	"sort"
)

func main() {
	price := map[string]int{"cherry": 400, "apple": 150, "banana": 100}

	// 手順1: キーだけをスライスに集める
	keys := []string{}
	for k := range price {
		keys = append(keys, k)
	}

	// 手順2: キーを昇順(辞書順)に並べ替える
	sort.Strings(keys)

	// 手順3: ソート済みキーの順に表示する
	for _, k := range keys {
		fmt.Println(k, price[k])
	}
}
`,
      hints: [
        `sort.Stringsは文字列スライスを渡すと、そのスライス自体を昇順に並べ替えます。戻り値はありません。`,
        `TODOの位置に sort.Strings(keys) の1行を書くだけです。apple、banana、cherryの順に表示されれば成功です。`
      ],
      expectedOutput: "apple 150"
    },
    {
      id: 59,
      title: "単語カウント演習",
      explanation: `<p>mapの代表的な活用例である<strong>出現回数のカウント</strong>に挑戦します。単語のスライスを走査して、「単語→出現回数」のmapを作る演習です。</p>
<p>ここで、ステップ53で学んだ「存在しないキーはゼロ値」が<strong>便利な仕様</strong>として活きてきます。カウント処理はこの1行で書けるのです。</p>
<pre><code>count := make(map[string]int)
for _, w := range words {
	count[w]++ // 初めての単語でも動く!
}</code></pre>
<p>なぜ初めての単語でも動くのでしょうか。<code>count[w]++</code>は<code>count[w] = count[w] + 1</code>の省略形です。未登録の単語なら<code>count[w]</code>はゼロ値の0を返すので、<code>0 + 1 = 1</code>が登録されます。2回目以降は<code>1 + 1 = 2</code>、<code>2 + 1 = 3</code>と増えていきます。</p>
<table>
<tr><th>処理する単語</th><th>count["go"]の変化</th></tr>
<tr><td>"go"(1回目)</td><td>0(ゼロ値) + 1 → 1</td></tr>
<tr><td>"go"(2回目)</td><td>1 + 1 → 2</td></tr>
<tr><td>"go"(3回目)</td><td>2 + 1 → 3</td></tr>
</table>
<p>他の多くの言語では「キーがなければ初期化してから加算」という場合分けが必要ですが、Goではゼロ値の仕様が場合分けを消してくれます。</p>
<p>集計結果の表示には、前ステップで学んだ「キーを集めてソートして表示」をそのまま使います(表示部分は初期コードに用意済みです)。アクセスログの集計、アンケートの票数え、文字の頻度分析など、<strong>カウント処理は実務で最頻出のmapの使い方</strong>です。この2行のパターンを自分のものにしましょう。</p>`,
      task: `<code>words</code>をrangeで走査して、各単語の出現回数を<code>count</code>マップに集計してください。`,
      code: `package main

import (
	"fmt"
	"sort"
)

func main() {
	words := []string{"go", "cat", "go", "dog", "cat", "go"}

	count := make(map[string]int)
	// TODO: wordsをrangeで走査し、countに出現回数を集計する

	// 集計結果をキーのソート順で表示する(前ステップの復習)
	keys := []string{}
	for w := range count {
		keys = append(keys, w)
	}
	sort.Strings(keys)
	for _, w := range keys {
		fmt.Println(w, count[w])
	}
}
`,
      solution: `package main

import (
	"fmt"
	"sort"
)

func main() {
	words := []string{"go", "cat", "go", "dog", "cat", "go"}

	count := make(map[string]int)
	// 未登録キーはゼロ値0が返るので、いきなり++できる
	for _, w := range words {
		count[w]++
	}

	// 集計結果をキーのソート順で表示する(前ステップの復習)
	keys := []string{}
	for w := range count {
		keys = append(keys, w)
	}
	sort.Strings(keys)
	for _, w := range keys {
		fmt.Println(w, count[w])
	}
}
`,
      hints: [
        `「存在しないキーはゼロ値」の仕様のおかげで、未登録の単語かどうかの場合分けは不要です。`,
        `for _, w := range words { count[w]++ } の2行(実質1行)で集計できます。`,
        `正しく集計できると cat 2 / dog 1 / go 3 と表示されます。`
      ],
      expectedOutput: "go 3"
    },
    {
      id: 60,
      title: "総合演習：在庫マップの管理",
      explanation: `<p>第6章の総仕上げとして、商品の在庫を管理するプログラムを完成させます。mapの登録・カンマok・delete・ソート表示と、この章の全技術を総動員します。</p>
<p>最初に知っておきたいのは、<strong>mapを関数に渡すと、関数の中の変更が呼び出し元にも反映される</strong>ことです。mapの変数の実体は内部データへの参照(指し示す情報)のようなもので、関数に渡してもコピーされるのは参照だけ。中身のデータは共有されます(スライスが内部配列を共有していたのと似た仕組みです)。</p>
<pre><code>func addStock(stock map[string]int, name string, n int) {
	stock[name] += n // 呼び出し元のmapにも反映される
}</code></pre>
<p>今回実装する<code>sell</code>(販売)関数の仕様は次の通りです。</p>
<table>
<tr><th>状況</th><th>動作</th><th>戻り値</th></tr>
<tr><td>未登録の商品</td><td>何もしない</td><td>false</td></tr>
<tr><td>在庫が足りない</td><td>何もしない</td><td>false</td></tr>
<tr><td>在庫が足りる</td><td>在庫をn減らす</td><td>true</td></tr>
<tr><td>減らした結果0になった</td><td>deleteでキーごと削除</td><td>true</td></tr>
</table>
<p>処理の骨組みはこうなります。カンマokで存在確認と在庫確認を行い、問題があれば早めにfalseで抜ける(早期リターン)のがGoらしい書き方です。</p>
<pre><code>v, ok := stock[name]
if !ok || v &lt; n {
	return false // 未登録、または在庫不足
}
// ここに来たら売れる:在庫を減らし、0ならdelete</code></pre>
<p>「成功したかをboolで返し、失敗なら状態を変えない」という設計は、実務のAPIでも頻繁に見かける形です。在庫一覧の表示はソート済みキー方式で用意してあります。この章の集大成として完成させましょう。</p>`,
      task: `<code>sell</code>関数を実装してください。カンマokで在庫を確認し、<code>n</code>個以上あれば減らして<code>true</code>を、足りなければ何もせず<code>false</code>を返します。在庫が0になったら<code>delete</code>でキーごと削除してください。`,
      code: `package main

import (
	"fmt"
	"sort"
)

// 在庫を追加する(mapは関数に渡しても中身を共有する)
func addStock(stock map[string]int, name string, n int) {
	stock[name] += n
}

// 商品をn個売る。売れたらtrue、売れなければfalseを返す
func sell(stock map[string]int, name string, n int) bool {
	// TODO: カンマokで在庫を確認し、未登録または在庫不足ならfalseを返す
	// TODO: 在庫をn減らし、0になったらdeleteで削除してtrueを返す
	return false
}

// 在庫一覧をキーのソート順で表示する
func printStock(stock map[string]int) {
	keys := []string{}
	for k := range stock {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		fmt.Println(k, ":", stock[k])
	}
}

func main() {
	stock := make(map[string]int)
	addStock(stock, "りんご", 5)
	addStock(stock, "みかん", 3)
	addStock(stock, "バナナ", 2)

	fmt.Println("バナナ2個売れた?", sell(stock, "バナナ", 2))
	fmt.Println("りんご10個売れた?", sell(stock, "りんご", 10))

	fmt.Println("--- 在庫一覧 ---")
	printStock(stock)
}
`,
      solution: `package main

import (
	"fmt"
	"sort"
)

// 在庫を追加する(mapは関数に渡しても中身を共有する)
func addStock(stock map[string]int, name string, n int) {
	stock[name] += n
}

// 商品をn個売る。売れたらtrue、売れなければfalseを返す
func sell(stock map[string]int, name string, n int) bool {
	v, ok := stock[name]
	if !ok || v < n {
		// 未登録、または在庫不足なら何もしない(早期リターン)
		return false
	}

	stock[name] = v - n
	if stock[name] == 0 {
		// 在庫が尽きたらキーごと削除する
		delete(stock, name)
	}
	return true
}

// 在庫一覧をキーのソート順で表示する
func printStock(stock map[string]int) {
	keys := []string{}
	for k := range stock {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		fmt.Println(k, ":", stock[k])
	}
}

func main() {
	stock := make(map[string]int)
	addStock(stock, "りんご", 5)
	addStock(stock, "みかん", 3)
	addStock(stock, "バナナ", 2)

	fmt.Println("バナナ2個売れた?", sell(stock, "バナナ", 2))
	fmt.Println("りんご10個売れた?", sell(stock, "りんご", 10))

	fmt.Println("--- 在庫一覧 ---")
	printStock(stock)
}
`,
      hints: [
        `まず v, ok := stock[name] で取得し、if !ok || v < n { return false } で「売れないケース」を先に処理すると見通しがよくなります。`,
        `売れる場合は stock[name] = v - n で在庫を減らし、if stock[name] == 0 { delete(stock, name) } としてからtrueを返します。`,
        `正しく実装できると、バナナは売れて在庫一覧から消え、りんごは在庫不足で5個のまま残ります。`
      ],
      expectedOutput: "りんご : 5"
    }
  ]
});
