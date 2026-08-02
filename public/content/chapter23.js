// 第23章：よくあるエラー：関数とメソッド
registerChapter({
  number: 23,
  title: "よくあるエラー：関数とメソッド",
  description: "引数の数ミスや戻り値の受け損ねといったコンパイルエラーから、値レシーバやシャドーイングが引き起こす「静かなバグ」まで、関数とメソッドにまつわる典型的な10のエラーを読み解いて修正します。",
  steps: [
    {
      id: 221,
      title: "引数の数が合わない（not enough / too many arguments）",
      explanation: `<p>この章では、関数とメソッドにまつわる「よくあるエラー」を実際に起こし、エラーメッセージを読んで修正する訓練をします。最初は最も基本的な、引数の数の不一致です。</p>
<h4>エラーメッセージの読み方</h4>
<p>2つの整数を受け取る<code>add(a, b int)</code>に、引数を1個だけ・3個渡すと、次のエラーが出ます。</p>
<pre><code>./main.go:8:29: not enough arguments in call to add
	have (number)
	want (int, int)
./main.go:9:35: too many arguments in call to add
	have (number, number, number)
	want (int, int)</code></pre>
<p>読み方のポイントは3つあります。</p>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td><code>./main.go:8:29</code></td><td>ファイル名:行番号:桁番号。まずここを見て場所を特定する</td></tr>
<tr><td><code>have (number)</code></td><td>「あなたが渡したもの」。numberは型が確定する前の数値リテラルという意味</td></tr>
<tr><td><code>want (int, int)</code></td><td>「関数が要求しているもの」。関数定義のシグネチャ（引数と戻り値の型の並び）がそのまま出る</td></tr>
</table>
<p><code>have</code>（現状）と<code>want</code>（期待）の対比は、Goのコンパイルエラーで繰り返し登場する形式です。この2行を見比べる癖をつけると、型関連のエラーの大半は原因がすぐに分かります。</p>
<h4>典型的な修正パターン</h4>
<ul>
<li>呼び出し側の引数を関数定義に合わせる（今回のケース）</li>
<li>関数定義の方が古い場合は、シグネチャを呼び出し側に合わせて変更する</li>
<li>引数が多くなりすぎている場合は、構造体1つにまとめる設計も検討する</li>
</ul>`,
      task: `2か所の<code>add</code>の呼び出しを、エラーメッセージの<code>want (int, int)</code>に合うように修正してください。1つ目は<code>3</code>と<code>4</code>の合計、2つ目は<code>1</code>と<code>2</code>の合計を出力します。`,
      code: `package main

import "fmt"

// add は2つの整数の合計を返す
func add(a, b int) int {
	return a + b
}

func main() {
	fmt.Println("合計:", add(3))       // 引数が足りない
	fmt.Println("合計:", add(1, 2, 3)) // 引数が多すぎる
}`,
      solution: `package main

import "fmt"

// add は2つの整数の合計を返す
func add(a, b int) int {
	return a + b
}

func main() {
	fmt.Println("合計:", add(3, 4)) // 引数を2つに修正
	fmt.Println("合計:", add(1, 2)) // 余分な引数を削除
}`,
      hints: [
        `エラーの have は「渡したもの」、want は「関数が求めるもの」。want (int, int) なので引数はちょうど2つ必要です。`,
        `1つ目は add(3, 4)、2つ目は add(1, 2) のように、整数を2つずつ渡します。`
      ],
      expectedOutput: "合計: 7"
    },
    {
      id: 222,
      title: "複数の戻り値を1つの変数で受けてしまう",
      explanation: `<p>Goの関数は<code>(int, error)</code>のように複数の値を返せます。第10章で学んだとおり、失敗しうる関数は「結果とエラー」の2つを返すのが定石です。ところが受け取る側の変数が1つだけだと、コンパイルエラーになります。</p>
<h4>エラーメッセージの読み方</h4>
<pre><code>./main.go:17:12: assignment mismatch: 1 variable but divide returns 2 values</code></pre>
<p><code>assignment mismatch</code>は「代入の不一致」。続く部分が具体的で、「変数は1個なのに、divideは2個の値を返す」と個数のズレをそのまま教えてくれます。関数名（divide）が入っているので、どの呼び出しが問題かもすぐ分かります。</p>
<h4>なぜ起きるか</h4>
<p>他の言語（PythonやJavaScriptなど）では戻り値を1つだけ受け取って残りを無視できることがありますが、Goでは<strong>戻り値の個数と受け取る変数の個数は必ず一致</strong>させる必要があります。これは「エラーを見落とさせない」というGoの設計思想の表れです。</p>
<h4>典型的な修正パターン</h4>
<table>
<tr><th>パターン</th><th>書き方</th><th>使いどころ</th></tr>
<tr><td>両方受け取る</td><td><code>result, err := divide(10, 3)</code></td><td>基本形。errは必ず検査する</td></tr>
<tr><td>片方を捨てる</td><td><code>result, _ := divide(10, 3)</code></td><td>ブランク識別子<code>_</code>で明示的に無視。エラーの無視は原則避ける（次のステップで学ぶ罠）</td></tr>
</table>
<p>受け取った<code>err</code>を使わないとそれはそれで「declared and not used」エラーになるため、<code>if err != nil</code>の検査まで書くのがGoの基本形です。</p>`,
      task: `<code>divide</code>の戻り値を<code>result</code>と<code>err</code>の2つの変数で受け取り、<code>err</code>が<code>nil</code>でなければエラーを表示して<code>return</code>するように修正してください。`,
      code: `package main

import (
	"errors"
	"fmt"
)

// divide はaをbで割った商を返す。bが0ならエラーを返す
func divide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("0で割ることはできません")
	}
	return a / b, nil
}

func main() {
	result := divide(10, 3) // 戻り値は2つあるのに変数は1つ
	fmt.Println("10 ÷ 3 =", result)
}`,
      solution: `package main

import (
	"errors"
	"fmt"
)

// divide はaをbで割った商を返す。bが0ならエラーを返す
func divide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("0で割ることはできません")
	}
	return a / b, nil
}

func main() {
	result, err := divide(10, 3) // 2つの変数で受け取る
	if err != nil {
		fmt.Println("エラー:", err)
		return
	}
	fmt.Println("10 ÷ 3 =", result)
}`,
      hints: [
        `divideは(int, error)の2つを返すので、受け取る変数も2つ必要です。`,
        `result, err := divide(10, 3) と書き、続けて if err != nil でエラーを検査します。`
      ],
      expectedOutput: "10 ÷ 3 = 3"
    },
    {
      id: 223,
      title: "エラーを_で捨てると0が混入する",
      explanation: `<p>前のステップで学んだブランク識別子<code>_</code>を使うと、エラーを受け取らずに捨てられます。コンパイルは通りますが、これが<strong>コンパイルエラーより厄介な「静かなバグ」</strong>を生みます。</p>
<h4>何が起きるか</h4>
<p><code>strconv.Atoi</code>（文字列を整数に変換する関数）は、変換に失敗すると<strong>0とエラー</strong>を返します。エラーを捨てると、失敗の証拠が消えて0だけが残ります。</p>
<pre><code>n, _ := strconv.Atoi("9O") // "9O"は英字のオー入りで変換失敗
// n は 0。エラーは捨てたので誰も気づかない</code></pre>
<p>今回のコードでは、点数リストに紛れ込んだ<code>"9O"</code>（数字のゼロではなく英字のオー）が0点として合計に加算され、平均点が本来の75点ではなく50点と表示されます。<strong>エラーメッセージは一切出ず、結果の数値だけが静かに間違う</strong>のがこのバグの怖さです。</p>
<h4>なぜ危険か</h4>
<ul>
<li>プログラムは「正常終了」するため、テストや目視で気づきにくい</li>
<li>0という値は合計・平均・件数などの集計結果を汚染する</li>
<li>原因の行（変換箇所）と症状の行（表示箇所）が離れていて追跡しづらい</li>
</ul>
<h4>典型的な修正パターン</h4>
<table>
<tr><th>方針</th><th>書き方</th></tr>
<tr><td>スキップして続行</td><td><code>if err != nil { 警告を出してcontinue }</code></td></tr>
<tr><td>即座に中断</td><td><code>if err != nil { return err }</code>（関数に切り出した場合）</td></tr>
</table>
<p>どちらを選ぶかは要件次第ですが、「エラーを受け取り、必ず何らかの対応をする」ことが共通の原則です。</p>`,
      task: `<code>strconv.Atoi</code>のエラーを<code>err</code>で受け取り、失敗したら警告を表示して<code>continue</code>でスキップするよう修正してください。平均は変換に成功した件数<code>valid</code>で割って計算します。`,
      code: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	scores := []string{"80", "9O", "70"} // "9O"は英字のオー入りの不正データ
	total := 0
	for _, s := range scores {
		n, _ := strconv.Atoi(s) // エラーを捨てている！失敗すると n は 0
		total += n
	}
	// "9O"が0点として混入し、平均が75ではなく50になってしまう
	fmt.Println("平均点:", total/len(scores))
}`,
      solution: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	scores := []string{"80", "9O", "70"} // "9O"は英字のオー入りの不正データ
	total := 0
	valid := 0 // 変換に成功した件数
	for _, s := range scores {
		n, err := strconv.Atoi(s)
		if err != nil {
			fmt.Println("警告: 変換できない値をスキップ:", s)
			continue
		}
		total += n
		valid++
	}
	fmt.Println("平均点:", total/valid)
}`,
      hints: [
        `_ を err に変えてエラーを受け取り、if err != nil で失敗を検出します。`,
        `失敗した要素は集計に入れないので、成功件数を数えるvalidを用意し、平均は total/valid で求めます。`
      ],
      expectedOutput: "平均点: 75"
    },
    {
      id: 224,
      title: "値レシーバのメソッドで値が変わらない",
      explanation: `<p>第8章で学んだレシーバ（メソッドが操作する対象）には、値レシーバ<code>(c Counter)</code>とポインタレシーバ<code>(c *Counter)</code>の2種類がありました。この選択を間違えると、<strong>コンパイルは通るのに変更が反映されない</strong>バグになります。</p>
<h4>何が起きるか</h4>
<pre><code>func (c Counter) Increment() { // 値レシーバ
	c.n++ // cは呼び出し元のコピー。コピーを増やしても元は変わらない
}</code></pre>
<p>値レシーバのメソッドが受け取る<code>c</code>は、呼び出し元の構造体の<strong>コピー</strong>です。関数に値を渡すとコピーされるのと同じ仕組みで、メソッド内で<code>c.n++</code>してもコピーが増えるだけで、呼び出し元の<code>c</code>は変わりません。3回<code>Increment()</code>を呼んでも結果は0のままです。エラーは出ないので、テストで「値が増えていない」ことに気づくまで発見が遅れがちです。</p>
<h4>値レシーバとポインタレシーバの使い分け</h4>
<table>
<tr><th>レシーバ</th><th>受け取るもの</th><th>使いどころ</th></tr>
<tr><td><code>(c Counter)</code></td><td>コピー</td><td>読み取り専用のメソッド（String()など）</td></tr>
<tr><td><code>(c *Counter)</code></td><td>元の値を指すポインタ</td><td>フィールドを変更するメソッド、コピーコストが大きい構造体</td></tr>
</table>
<h4>修正と設計の指針</h4>
<p>フィールドを変更するメソッドは必ずポインタレシーバにします。また、1つの型のメソッドの中に値レシーバとポインタレシーバが混在すると混乱のもとなので、<strong>1つでも変更系メソッドがあれば全メソッドをポインタレシーバに統一する</strong>のがGoコミュニティの慣習です。</p>`,
      task: `<code>Increment</code>メソッドのレシーバをポインタレシーバに変更して、カウントが正しく3になるように修正してください。`,
      code: `package main

import "fmt"

type Counter struct {
	n int
}

// Increment はカウントを1増やす（つもりだが増えない）
func (c Counter) Increment() {
	c.n++ // cはコピーなので、呼び出し元のCounterは変わらない
}

func main() {
	var c Counter
	c.Increment()
	c.Increment()
	c.Increment()
	fmt.Println("カウント:", c.n) // 3のはずが0になる
}`,
      solution: `package main

import "fmt"

type Counter struct {
	n int
}

// Increment はカウントを1増やす
func (c *Counter) Increment() {
	c.n++ // ポインタ経由なので呼び出し元のCounterが変わる
}

func main() {
	var c Counter
	c.Increment() // ポインタレシーバのメソッドは (&c).Increment() と自動解釈される
	c.Increment()
	c.Increment()
	fmt.Println("カウント:", c.n)
}`,
      hints: [
        `値レシーバはコピーを受け取るので、メソッド内の変更は呼び出し元に届きません。`,
        `func (c *Counter) Increment() のように、レシーバの型に*を付けます。呼び出し側のc.Increment()はそのままで動きます。`
      ],
      expectedOutput: "カウント: 3"
    },
    {
      id: 225,
      title: "ループ内deferの罠",
      explanation: `<p><code>defer</code>は「関数の終了直前に実行を予約する」文でした。ここで重要なのは、予約が実行されるのは<strong>ブロックの終わりではなく、関数（func）の終わり</strong>だという点です。ループの中でdeferを使うと、この違いが罠になります。</p>
<h4>何が起きるか</h4>
<pre><code>for i := 1; i &lt;= 3; i++ {
	acquire(i)       // リソースを確保
	defer release(i) // 各周回の終わりに解放……されない！
}</code></pre>
<p>「各周回の終わりに解放される」と期待しがちですが、実際には3つのdeferがすべて<strong>main関数が終わる直前まで溜め込まれ</strong>、LIFO（後入れ先出し：最後に予約したものが最初に実行される順序）でまとめて実行されます。実行結果を見ると、確保が3連続で走ったあと、関数の最後で解放が3→2→1の逆順に走っており、リソースを最大3個同時に抱えていたことが分かります。</p>
<p>ファイルやデータベース接続でこれをやると、ループが1万回まわれば1万個のファイルを開きっぱなしにすることになり、「too many open files」のような実行時エラーの原因になります。</p>
<h4>典型的な修正パターン</h4>
<p>ループ本体を無名関数（その場で定義して即実行する関数）で包みます。deferは「関数の終わり」に実行されるので、無名関数が1周ごとに終わるたびにdeferも実行されます。</p>
<pre><code>for i := 1; i &lt;= 3; i++ {
	func() {
		acquire(i)
		defer release(i) // この無名関数の終わり＝各周回の終わりに実行される
	}() // 定義してすぐ呼び出す
}</code></pre>
<p>実務では、ループ本体を名前付きの関数に切り出す方が読みやすくなることも多いです（処理に名前が付き、テストもしやすくなります）。</p>`,
      task: `ループ本体を無名関数<code>func() { ... }()</code>で包み、各周回の終わりに<code>release(i)</code>が実行されるように修正してください。修正後は「最大同時確保数: 1」になります。`,
      code: `package main

import "fmt"

var held, maxHeld int // 現在確保中の数と、同時確保数の最大値

func acquire(i int) {
	held++
	if held > maxHeld {
		maxHeld = held
	}
	fmt.Printf("リソース%dを確保\\n", i)
}

func release(i int) {
	held--
	fmt.Printf("リソース%dを解放\\n", i)
}

func main() {
	for i := 1; i <= 3; i++ {
		acquire(i)
		defer release(i) // 各周回の終わりに解放される……わけではない！
	}
	fmt.Println("最大同時確保数:", maxHeld) // 1のはずが3になる
}`,
      solution: `package main

import "fmt"

var held, maxHeld int // 現在確保中の数と、同時確保数の最大値

func acquire(i int) {
	held++
	if held > maxHeld {
		maxHeld = held
	}
	fmt.Printf("リソース%dを確保\\n", i)
}

func release(i int) {
	held--
	fmt.Printf("リソース%dを解放\\n", i)
}

func main() {
	for i := 1; i <= 3; i++ {
		func() {
			acquire(i)
			defer release(i) // 無名関数の終わり＝各周回の終わりに実行される
		}() // 定義してすぐ実行する
	}
	fmt.Println("最大同時確保数:", maxHeld)
}`,
      hints: [
        `deferが実行されるのはループの各周回の終わりではなく、関数の終わりです。「関数の終わり」を1周ごとに作れないか考えてみましょう。`,
        `ループ本体を func() { ... }() で包むと、その無名関数が1周ごとに終わるので、deferも1周ごとに実行されます。`
      ],
      expectedOutput: "最大同時確保数: 1"
    },
    {
      id: 226,
      title: "名前付き戻り値が:=でシャドーイングされる",
      explanation: `<p>第22章で学んだ<code>:=</code>によるシャドーイング（内側のスコープで同名の新しい変数を作ってしまい、外側の変数が隠れること）は、<strong>名前付き戻り値</strong>と組み合わさると特に発見しづらいバグになります。</p>
<h4>何が起きるか</h4>
<pre><code>func sumAll(values []string) (total int, err error) {
	for _, s := range values {
		n, err := strconv.Atoi(s) // ← :=が「新しいerr」を作る
		if err != nil {
			break // 外のerrに設定したつもりが、設定されていない
		}
		total += n
	}
	return // 外のerrは一度も代入されず、常にnilで返る
}</code></pre>
<p><code>n</code>が新しい変数なので<code>:=</code>は文法上正しく、コンパイルは通ります。しかし<code>err</code>はループ内スコープの新しい変数になり、名前付き戻り値の<code>err</code>とは別物です。呼び出し元には常に<code>nil</code>が返り、「abc」で変換に失敗してもエラーは報告されず、途中までの合計（10）が正常な顔をして返ってきます。</p>
<h4>見つけ方と修正パターン</h4>
<ul>
<li><strong>見つけ方</strong>：名前付き戻り値のある関数内の<code>:=</code>には注意。<code>go vet</code>や各種リンター（静的解析ツール）のshadow検査も有効です</li>
<li><strong>修正1</strong>：新しい変数だけを<code>var</code>で宣言し、<code>=</code>で代入する（今回の模範解答）</li>
<li><strong>修正2</strong>：名前付き戻り値をやめて、<code>return 0, err</code>のように明示的に返す</li>
</ul>
<pre><code>var n int
n, err = strconv.Atoi(s) // =なら既存のerr（名前付き戻り値）に代入される</code></pre>
<p>名前付き戻り値は便利な反面この罠があるため、実務では「短い関数でのみ使う」「deferで戻り値を書き換えるときに使う」など限定的に使うのが無難です。</p>`,
      task: `ループ内の<code>:=</code>によるシャドーイングを解消してください。<code>var n int</code>を宣言してから<code>n, err = strconv.Atoi(s)</code>と<code>=</code>で代入し、エラー時は「「値」を数値に変換できません」という形のエラーを設定して<code>return</code>します。`,
      code: `package main

import (
	"fmt"
	"strconv"
)

// sumAll は文字列スライスの合計を返す。変換に失敗したらエラーを返す（つもり）
func sumAll(values []string) (total int, err error) {
	for _, s := range values {
		n, err := strconv.Atoi(s) // :=が新しいerrを作ってしまう（シャドーイング）
		if err != nil {
			break // 外側のerrに設定したつもりでループを抜けている
		}
		total += n
	}
	return
}

func main() {
	total, err := sumAll([]string{"10", "abc", "30"})
	if err != nil {
		fmt.Println("エラー:", err)
		return
	}
	fmt.Println("合計:", total) // エラーになるはずが「合計: 10」と表示される
}`,
      solution: `package main

import (
	"fmt"
	"strconv"
)

// sumAll は文字列スライスの合計を返す。変換に失敗したらエラーを返す
func sumAll(values []string) (total int, err error) {
	for _, s := range values {
		var n int
		n, err = strconv.Atoi(s) // =なら名前付き戻り値のerrに代入される
		if err != nil {
			err = fmt.Errorf("「%s」を数値に変換できません", s)
			return
		}
		total += n
	}
	return
}

func main() {
	total, err := sumAll([]string{"10", "abc", "30"})
	if err != nil {
		fmt.Println("エラー:", err)
		return
	}
	fmt.Println("合計:", total)
}`,
      hints: [
        `n, err := は「nもerrも新しく作る」宣言です。内側で作られたerrは、名前付き戻り値のerrとは別の変数になります。`,
        `先にvar n intと宣言しておけば、n, err = strconv.Atoi(s) と=（代入）が使え、外のerrが更新されます。`,
        `エラーメッセージの組み立てにはfmt.Errorf("「%s」を数値に変換できません", s)が使えます。`
      ],
      expectedOutput: "「abc」を数値に変換できません"
    },
    {
      id: 227,
      title: "スライスを可変長引数に渡すとき...を忘れる",
      explanation: `<p>第4章で学んだ可変長引数（<code>nums ...int</code>のように任意個の引数を受け取る仕組み）に、スライスをそのまま渡すとコンパイルエラーになります。</p>
<h4>エラーメッセージの読み方</h4>
<pre><code>./main.go:16:29: cannot use data (variable of type []int) as int value in argument to sum</code></pre>
<p><code>cannot use A as B</code>は型不一致エラーの定型文です。今回の内容を分解すると：</p>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td><code>data (variable of type []int)</code></td><td>渡したのは[]int型（intのスライス）の変数data</td></tr>
<tr><td><code>as int value</code></td><td>しかし要求されているのはint型の値1個</td></tr>
<tr><td><code>in argument to sum</code></td><td>場所はsumの引数</td></tr>
</table>
<p>「スライスなのだから可変長引数にそのまま入るはず」と思いがちですが、<code>sum(data)</code>と書くと「dataという<strong>1個の値</strong>を最初のintとして渡す」と解釈されるため、[]intとintの型不一致になるのです。</p>
<h4>修正パターン：...で展開する</h4>
<pre><code>sum(data...) // スライスの要素を展開して渡す</code></pre>
<p>スライス名の直後に<code>...</code>を付けると、要素が展開されて可変長引数に渡ります。定義側の<code>...int</code>（任意個受け取る）と呼び出し側の<code>data...</code>（展開して渡す）で、同じ記号が逆の役割をしている点に注意してください。</p>
<p>この形は標準ライブラリでも頻出です。たとえば<code>append(dst, src...)</code>はスライス連結の定番イディオムで、<code>...</code>を忘れると今回と同じ形のエラーが出ます。</p>`,
      task: `<code>sum(data)</code>の呼び出しを、スライスを展開して渡す形に修正してください。`,
      code: `package main

import "fmt"

// sum は任意個の整数の合計を返す
func sum(nums ...int) int {
	total := 0
	for _, n := range nums {
		total += n
	}
	return total
}

func main() {
	data := []int{10, 20, 30, 40}
	fmt.Println("合計:", sum(data)) // []intをintとして渡そうとしてエラー
}`,
      solution: `package main

import "fmt"

// sum は任意個の整数の合計を返す
func sum(nums ...int) int {
	total := 0
	for _, n := range nums {
		total += n
	}
	return total
}

func main() {
	data := []int{10, 20, 30, 40}
	fmt.Println("合計:", sum(data...)) // ...で要素を展開して渡す
}`,
      hints: [
        `sum(data)は「data全体を1個のintとして渡す」という意味に解釈されてしまいます。`,
        `スライス名の直後に...を付けると、要素が展開されて可変長引数に渡ります。`
      ],
      expectedOutput: "合計: 100"
    },
    {
      id: 228,
      title: "メソッド値はレシーバをコピーする",
      explanation: `<p>Goではメソッドを<code>show := p.Show</code>のように変数へ代入できます。これを<strong>メソッド値</strong>と呼びます。コールバックとして関数に渡すときなどに便利ですが、値レシーバのメソッドで作ると罠があります。</p>
<h4>何が起きるか</h4>
<pre><code>p := Player{name: "Gopher"}
show := p.Show   // ← この瞬間のpのコピーがshowに束縛される
p.AddScore(50)   // pのスコアを50に更新
show()           // 「Gopher: 50点」のはずが「Gopher: 0点」</code></pre>
<p><code>Show</code>が値レシーバ<code>(p Player)</code>の場合、<code>show := p.Show</code>と書いた<strong>その瞬間</strong>に<code>p</code>のコピーが作られ、<code>show</code>に閉じ込められます。あとから元の<code>p</code>を更新しても、<code>show()</code>が表示するのは束縛時の古いコピーです。ステップ224の「値レシーバはコピー」という性質が、メソッド値では「いつのコピーか」という時間差の問題として現れるわけです。</p>
<h4>修正パターン</h4>
<table>
<tr><th>方法</th><th>内容</th><th>効果</th></tr>
<tr><td>ポインタレシーバにする</td><td><code>func (p *Player) Show()</code></td><td>メソッド値には&amp;pが束縛されるため、以後の更新も見える（模範解答）</td></tr>
<tr><td>束縛を遅らせる</td><td>更新が終わってから<code>show := p.Show</code>する</td><td>束縛時点のコピーで十分な場合に有効</td></tr>
<tr><td>クロージャで包む</td><td><code>show := func() { p.Show() }</code></td><td>呼び出しのたびに現在のpを参照する</td></tr>
</table>
<p>ポインタレシーバなら、コピーされるのは「ポインタ」だけなので、どのタイミングで呼んでも常に最新の<code>p</code>が表示されます。ステップ224で触れた「変更系メソッドがあるならレシーバを統一する」慣習に従っていれば、この罠は自然に回避できます。</p>`,
      task: `<code>Show</code>メソッドのレシーバをポインタレシーバに変更して、<code>show()</code>が更新後のスコア（50点）を表示するように修正してください。`,
      code: `package main

import "fmt"

type Player struct {
	name  string
	score int
}

// Show は現在のスコアを表示する
func (p Player) Show() {
	fmt.Printf("%s: %d点\\n", p.name, p.score)
}

// AddScore はスコアを加算する
func (p *Player) AddScore(n int) {
	p.score += n
}

func main() {
	p := Player{name: "Gopher"}
	show := p.Show // この瞬間のpのコピーがshowに束縛される
	p.AddScore(50)
	show() // 「Gopher: 50点」のはずが「Gopher: 0点」と表示される
}`,
      solution: `package main

import "fmt"

type Player struct {
	name  string
	score int
}

// Show は現在のスコアを表示する
func (p *Player) Show() {
	fmt.Printf("%s: %d点\\n", p.name, p.score)
}

// AddScore はスコアを加算する
func (p *Player) AddScore(n int) {
	p.score += n
}

func main() {
	p := Player{name: "Gopher"}
	show := p.Show // ポインタレシーバなら&pが束縛される
	p.AddScore(50)
	show() // 最新のpを参照するので「Gopher: 50点」になる
}`,
      hints: [
        `show := p.Show とした瞬間に、値レシーバならpのコピーが固定されます。あとからpを変えてもコピーには反映されません。`,
        `func (p *Player) Show() とポインタレシーバにすれば、showにはpへのポインタが束縛され、呼び出し時点の最新の値が表示されます。`
      ],
      expectedOutput: "Gopher: 50点"
    },
    {
      id: 229,
      title: "クロージャが共有するループ変数",
      explanation: `<p>第13章で学んだクロージャ（外側の変数を参照し続ける関数）は、変数の「値」ではなく<strong>「変数そのもの」を捕まえます</strong>。ループで使う変数と組み合わせると、Goの歴史上最も有名な罠のひとつになります。</p>
<h4>何が起きるか</h4>
<pre><code>i := 0 // ループの外で宣言
for i &lt; 3 {
	funcs = append(funcs, func() {
		fmt.Println("番号:", i) // 3つのクロージャが「同じi」を共有
	})
	i++
}
// あとで呼ぶと、すべて「番号: 3」</code></pre>
<p>3つのクロージャはそれぞれ「作られた時点のiの値（0、1、2）」を覚えているように見えますが、実際は<strong>3つとも同じ変数iを指している</strong>ため、呼び出す頃にはループ終了後の値3が見えます。</p>
<h4>Go1.21以前と1.22の違い</h4>
<table>
<tr><th>書き方</th><th>Go1.21以前</th><th>Go1.22以降</th></tr>
<tr><td><code>for i := 0; i &lt; 3; i++</code></td><td>iは全周回で共有→罠になる</td><td><strong>周回ごとに新しいi</strong>→罠が解消</td></tr>
<tr><td>ループ外で宣言した変数</td><td>共有→罠になる</td><td>共有→<strong>今も罠のまま</strong></td></tr>
</table>
<p>Go1.22の言語仕様変更で「forで宣言したループ変数は周回ごとに別の変数」になり、古典的な罠の多くは解消されました。しかし今回のコードのように<strong>ループの外で宣言した変数</strong>は今でも共有されるため、同じバグが起きます。1.21以前のコードを読むときや、この形のループを書くときのために、仕組みを理解しておくことが大切です。</p>
<h4>修正パターン</h4>
<ul>
<li><code>for i := 0; i &lt; 3; i++</code>の形にする（Go1.22以降は周回ごとに新しい変数になる。模範解答）</li>
<li>古いGoでも安全な書き方：ループ内で<code>i := i</code>とコピーする、またはクロージャの引数として渡す</li>
</ul>`,
      task: `ループを<code>for i := 0; i &lt; 3; i++</code>の形に書き換えて、各クロージャが自分の周回の値（0、1、2）を表示するように修正してください。`,
      code: `package main

import "fmt"

func main() {
	funcs := []func(){}
	i := 0 // ループの外で宣言した変数
	for i < 3 {
		funcs = append(funcs, func() {
			fmt.Println("番号:", i) // 3つのクロージャが同じiを共有する
		})
		i++
	}
	for _, f := range funcs {
		f() // すべて「番号: 3」になってしまう
	}
}`,
      solution: `package main

import "fmt"

func main() {
	funcs := []func(){}
	for i := 0; i < 3; i++ { // forで宣言した変数はGo1.22から周回ごとに別物
		funcs = append(funcs, func() {
			fmt.Println("番号:", i) // 各クロージャが自分の周回のiを捕まえる
		})
	}
	for _, f := range funcs {
		f()
	}
}`,
      hints: [
        `クロージャは変数の値ではなく変数そのものを捕まえます。ループの外で宣言したiは1個しかないので、3つのクロージャ全部が同じiを見ています。`,
        `Go1.22以降、for i := 0; i < 3; i++ と書けばiは周回ごとに新しい変数になり、各クロージャが別々の値を捕まえます。`
      ],
      expectedOutput: "番号: 0"
    },
    {
      id: 230,
      title: "総合演習：関数まわりのバグを直す",
      explanation: `<p>この章の総合演習です。1つのプログラムに、この章で学んだバグが3つ仕込まれています。実際のデバッグと同じように、<strong>コンパイルエラー→実行時エラー→論理バグ</strong>の順に一つずつ潰していきましょう。</p>
<h4>デバッグの進め方</h4>
<ol>
<li><strong>まずコンパイルエラーを全部読む</strong>。最初に出るのは次の2つです。
<pre><code>./main.go:35:8: assignment mismatch: 1 variable but strconv.Atoi returns 2 values
./main.go:39:32: cannot use vals (variable of type []int) as int value in argument to max</code></pre>
1つ目はステップ222（複数戻り値の受け損ね）、2つ目はステップ227（<code>...</code>忘れ）で見た形です。</li>
<li><strong>コンパイルが通ったら実行する</strong>。すると今度は実行時パニックが出ます。
<pre><code>panic: runtime error: integer divide by zero</code></pre>
平均を<code>st.total/st.count</code>で計算していますが、<code>st.count</code>が0のままです。なぜでしょうか？　<code>Add</code>メソッドを見ると値レシーバになっており、ステップ224の「値レシーバのメソッドで値が変わらない」バグです。集計されなかった結果、0除算という<strong>別の場所・別の種類のエラー</strong>として表面化しています。</li>
<li><strong>原因と症状は離れている</strong>ことを意識する。パニックの行（平均の計算）を眺めていても原因（Addのレシーバ）には辿り着けません。「countが0なのはなぜか→Addが効いていないのはなぜか」と、値の流れを遡るのがデバッグの基本です。</li>
</ol>
<h4>修正の要点</h4>
<ul>
<li><code>strconv.Atoi</code>の戻り値は2つ受け取り、エラーは検査してスキップする（ステップ223の教訓：捨てない）</li>
<li><code>max(vals...)</code>と展開して渡す</li>
<li><code>Add</code>をポインタレシーバ<code>(s *Stats)</code>にする</li>
</ul>`,
      task: `3つのバグ（<code>strconv.Atoi</code>の戻り値の受け損ね、<code>max</code>への<code>...</code>忘れ、<code>Add</code>の値レシーバ）をすべて修正して、最高点95と平均点83が表示されるようにしてください。エラーになった文字列は警告を出してスキップします。`,
      code: `package main

import (
	"fmt"
	"strconv"
)

// Stats は点数の合計と件数を集計する
type Stats struct {
	total, count int
}

// Add は点数を集計に加える
func (s Stats) Add(v int) { // バグ3：値レシーバなので集計されない
	s.total += v
	s.count++
}

// max は任意個の整数の最大値を返す
func max(nums ...int) int {
	m := nums[0]
	for _, n := range nums {
		if n > m {
			m = n
		}
	}
	return m
}

func main() {
	scores := []string{"70", "85", "95"}
	var st Stats
	vals := []int{}
	for _, s := range scores {
		n := strconv.Atoi(s) // バグ1：戻り値は2つある
		st.Add(n)
		vals = append(vals, n)
	}
	fmt.Println("最高点:", max(vals)) // バグ2：...を忘れている
	fmt.Println("平均点:", st.total/st.count)
}`,
      solution: `package main

import (
	"fmt"
	"strconv"
)

// Stats は点数の合計と件数を集計する
type Stats struct {
	total, count int
}

// Add は点数を集計に加える
func (s *Stats) Add(v int) { // 修正3：ポインタレシーバで呼び出し元を更新
	s.total += v
	s.count++
}

// max は任意個の整数の最大値を返す
func max(nums ...int) int {
	m := nums[0]
	for _, n := range nums {
		if n > m {
			m = n
		}
	}
	return m
}

func main() {
	scores := []string{"70", "85", "95"}
	var st Stats
	vals := []int{}
	for _, s := range scores {
		n, err := strconv.Atoi(s) // 修正1：2つの戻り値を受け取る
		if err != nil {
			fmt.Println("警告: 変換できない値をスキップ:", s)
			continue
		}
		st.Add(n)
		vals = append(vals, n)
	}
	fmt.Println("最高点:", max(vals...)) // 修正2：...で展開して渡す
	fmt.Println("平均点:", st.total/st.count)
}`,
      hints: [
        `まずコンパイルエラーを2つ直します。strconv.Atoiは(int, error)を返すので2変数で受け取り、maxにはvals...と展開して渡します。`,
        `コンパイルが通ると0除算パニックが出ます。st.countが0のまま、つまりAddの変更が反映されていません。レシーバの種類を確認しましょう。`,
        `Addをfunc (s *Stats) Add(v int)に変えれば集計が効き、平均点が計算できるようになります。`
      ],
      expectedOutput: "平均点: 83"
    }
  ]
});
