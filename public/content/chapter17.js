// 第17章：標準ライブラリ実践
registerChapter({
  number: 17,
  title: "標準ライブラリ実践",
  description: "sort・slices・time・math・encoding/json・regexpといった定番の標準ライブラリを実践的に使いこなし、実務で頻出するデータ処理を体験します。",
  steps: [
    {
      id: 161,
      title: "sortパッケージ（Ints、Strings、Slice）",
      explanation: `<p>Goの標準ライブラリ<code>sort</code>パッケージは、スライスの並べ替え（ソート）を提供します。実務のデータ処理では「集めて、並べ替えて、表示する」という流れが非常に多く、ソートは最頻出の操作のひとつです。</p>
<h4>基本の3つの関数</h4>
<table>
<tr><th>関数</th><th>対象</th><th>並び順</th></tr>
<tr><td><code>sort.Ints(s)</code></td><td><code>[]int</code></td><td>昇順（小さい順）</td></tr>
<tr><td><code>sort.Strings(s)</code></td><td><code>[]string</code></td><td>辞書順</td></tr>
<tr><td><code>sort.Slice(s, less)</code></td><td>任意のスライス</td><td>自分で定義</td></tr>
</table>
<p>注意点として、これらの関数は<strong>スライスをその場で並べ替える（破壊的変更）</strong>ことです。新しいスライスを返すのではなく、渡したスライス自身の順序が変わります。</p>
<pre><code>nums := []int{5, 2, 8}
sort.Ints(nums)
fmt.Println(nums) // [2 5 8] 元のスライスが変わる</code></pre>
<h4>sort.Sliceで自由な並び順</h4>
<p><code>sort.Slice</code>は第2引数に「i番目の要素はj番目の要素より前に来るべきか」を返す関数（less関数と呼びます）を渡します。<code>true</code>を返すとiがjより前に置かれます。</p>
<pre><code>// 降順（大きい順）にする例
sort.Slice(nums, func(i, j int) bool {
    return nums[i] &gt; nums[j]
})</code></pre>
<p>昇順なら<code>nums[i] &lt; nums[j]</code>、降順なら<code>nums[i] &gt; nums[j]</code>と覚えましょう。less関数はクロージャなので、外側のスライス<code>nums</code>をそのまま参照できます。</p>`,
      task: `<code>sort.Strings</code>で<code>names</code>を辞書順に、<code>sort.Slice</code>で<code>scores</code>を降順（大きい順）に並べ替えてください。`,
      code: `package main

import (
	"fmt"
	"sort"
)

func main() {
	nums := []int{5, 2, 8, 1, 3}
	sort.Ints(nums)
	fmt.Println(nums)

	names := []string{"banana", "apple", "cherry"}
	// TODO: namesを辞書順にソートする
	fmt.Println(names)

	scores := []int{70, 90, 50}
	// TODO: sort.Sliceでscoresを降順にソートする
	fmt.Println(scores)
}
`,
      solution: `package main

import (
	"fmt"
	"sort"
)

func main() {
	nums := []int{5, 2, 8, 1, 3}
	sort.Ints(nums)
	fmt.Println(nums)

	names := []string{"banana", "apple", "cherry"}
	// 文字列スライスを辞書順にソートする
	sort.Strings(names)
	fmt.Println(names)

	scores := []int{70, 90, 50}
	// less関数でscores[i] > scores[j]を返すと降順になる
	sort.Slice(scores, func(i, j int) bool {
		return scores[i] > scores[j]
	})
	fmt.Println(scores)
}
`,
      hints: [
        `文字列スライスのソートは<code>sort.Strings(names)</code>の1行で完了します。`,
        `<code>sort.Slice</code>の第2引数は<code>func(i, j int) bool</code>型の関数です。降順にしたいので「iの要素がjの要素より大きいならtrue」を返します。`
      ],
      expectedOutput: "[90 70 50]"
    },
    {
      id: 162,
      title: "sort.Sliceで構造体スライスをソート",
      explanation: `<p>実務のソート対象は数値の一覧よりも「ユーザー一覧を年齢順に」「商品一覧を価格順に」のような<strong>構造体スライス</strong>であることが圧倒的に多いです。<code>sort.Slice</code>はless関数の中で任意のフィールドを比較できるので、構造体のソートに最適です。</p>
<pre><code>type User struct {
    Name string
    Age  int
}

users := []User{
    {"Tanaka", 31},
    {"Sato", 18},
}
// 年齢の昇順
sort.Slice(users, func(i, j int) bool {
    return users[i].Age &lt; users[j].Age
})</code></pre>
<h4>複数キーでのソート</h4>
<p>「まず年齢順、同じ年齢なら名前順」のような複数条件は、less関数の中で第1キーが等しい場合だけ第2キーを比較します。</p>
<pre><code>sort.Slice(users, func(i, j int) bool {
    if users[i].Age != users[j].Age {
        return users[i].Age &lt; users[j].Age
    }
    return users[i].Name &lt; users[j].Name
})</code></pre>
<h4>安定ソートについて</h4>
<p><code>sort.Slice</code>は「等しい要素の元の順序」を保証しません（不安定ソート）。等しい要素の順序を保ちたい場合は<code>sort.SliceStable</code>を使います。帳票や画面表示など「表示順が毎回同じであってほしい」場面ではSliceStableや複数キー比較で順序を確定させるのが実務の定石です。</p>`,
      task: `less関数を完成させて、<code>users</code>を年齢（Age）の昇順に並べ替えてください。同じ年齢はいないため単一キーの比較で構いません。`,
      code: `package main

import (
	"fmt"
	"sort"
)

type User struct {
	Name string
	Age  int
}

func main() {
	users := []User{
		{"Tanaka", 31},
		{"Sato", 18},
		{"Suzuki", 25},
	}

	// TODO: 年齢の昇順になるようにless関数を完成させる
	sort.Slice(users, func(i, j int) bool {
		return false // ここを書き換える
	})

	for _, u := range users {
		fmt.Println(u.Name, u.Age)
	}
}
`,
      solution: `package main

import (
	"fmt"
	"sort"
)

type User struct {
	Name string
	Age  int
}

func main() {
	users := []User{
		{"Tanaka", 31},
		{"Sato", 18},
		{"Suzuki", 25},
	}

	// Ageフィールド同士を比較すると年齢順になる
	sort.Slice(users, func(i, j int) bool {
		return users[i].Age < users[j].Age
	})

	for _, u := range users {
		fmt.Println(u.Name, u.Age)
	}
}
`,
      hints: [
        `less関数の中では<code>users[i]</code>と<code>users[j]</code>の比較したいフィールドを比べます。`,
        `年齢の昇順なら<code>users[i].Age &lt; users[j].Age</code>を返します。`
      ],
      expectedOutput: "Sato 18"
    },
    {
      id: 163,
      title: "slicesパッケージの活用（Index、Reverse、SortFunc）",
      explanation: `<p>Go 1.21で標準ライブラリに追加された<code>slices</code>パッケージは、ジェネリクス（型パラメータ）を活かした汎用のスライス操作を提供します。従来<code>sort</code>パッケージや自作ループで書いていた処理の多くが1行で書けるようになりました。</p>
<h4>よく使う関数</h4>
<table>
<tr><th>関数</th><th>働き</th><th>戻り値</th></tr>
<tr><td><code>slices.Index(s, v)</code></td><td>vが最初に現れる位置を探す</td><td>見つからなければ-1</td></tr>
<tr><td><code>slices.Contains(s, v)</code></td><td>vが含まれるか調べる</td><td>bool</td></tr>
<tr><td><code>slices.Reverse(s)</code></td><td>並びをその場で逆順にする</td><td>なし（破壊的変更）</td></tr>
<tr><td><code>slices.Sort(s)</code></td><td>昇順ソート</td><td>なし（破壊的変更）</td></tr>
<tr><td><code>slices.SortFunc(s, cmp)</code></td><td>比較関数でソート</td><td>なし（破壊的変更）</td></tr>
</table>
<p><code>slices.SortFunc</code>の比較関数は<code>sort.Slice</code>のless関数（boolを返す）と違い、<strong>intを返す</strong>点に注意してください。「aがbより前なら負、同じなら0、後なら正」を返します。</p>
<pre><code>// 文字列の長さが短い順にソート
slices.SortFunc(words, func(a, b string) int {
    return len(a) - len(b)
})</code></pre>
<p>importは<code>"slices"</code>と書くだけです。新しいコードでは、単純な昇順ソートや検索は<code>slices</code>パッケージ、インデックス2つで比較したい複雑なケースは<code>sort.Slice</code>、と使い分けるのが現在の主流です。</p>`,
      task: `<code>slices.Index</code>で<code>"cherry"</code>の位置を求め、<code>slices.SortFunc</code>で<code>words</code>を文字列の長さが短い順に並べ替え、最後に<code>slices.Reverse</code>で<code>nums</code>を逆順にしてください。`,
      code: `package main

import (
	"fmt"
	"slices"
)

func main() {
	fruits := []string{"apple", "banana", "cherry"}
	// TODO: "cherry"の位置を求めるように直す（今は"apple"を探している）
	idx := slices.Index(fruits, "apple")
	fmt.Println("位置:", idx)

	words := []string{"banana", "kiwi", "apple", "fig"}
	// TODO: slices.SortFuncで文字列の長さが短い順にソートする
	fmt.Println(words)

	nums := []int{1, 2, 3, 4, 5}
	// TODO: slices.Reverseで逆順にする
	fmt.Println(nums)
}
`,
      solution: `package main

import (
	"fmt"
	"slices"
)

func main() {
	fruits := []string{"apple", "banana", "cherry"}
	// 一致する要素のインデックスを返す（なければ-1）
	idx := slices.Index(fruits, "cherry")
	fmt.Println("位置:", idx)

	words := []string{"banana", "kiwi", "apple", "fig"}
	// 比較関数は負・0・正のintを返す。len(a)-len(b)なら短い順になる
	slices.SortFunc(words, func(a, b string) int {
		return len(a) - len(b)
	})
	fmt.Println(words)

	nums := []int{1, 2, 3, 4, 5}
	// その場で逆順に並べ替える
	slices.Reverse(nums)
	fmt.Println(nums)
}
`,
      hints: [
        `<code>slices.Index(fruits, "cherry")</code>は見つかった位置のint、見つからなければ-1を返します。`,
        `<code>SortFunc</code>の比較関数はboolではなくintを返します。短い順なら<code>len(a) - len(b)</code>を返せばOKです。`,
        `<code>slices.Reverse(nums)</code>は戻り値がなく、numsそのものを逆順にします。`
      ],
      expectedOutput: "[fig kiwi apple banana]"
    },
    {
      id: 164,
      title: "timeパッケージの基本（Duration、演算）",
      explanation: `<p><code>time</code>パッケージは日付・時刻・経過時間を扱います。このステップではまず<strong>Duration（経過時間・期間）</strong>を学びます。</p>
<p><code>time.Duration</code>は「時間の長さ」を表す型で、実体はナノ秒を表すint64です。<code>time.Second</code>や<code>time.Minute</code>といった定数に数値を掛けて作ります。</p>
<pre><code>d := 90 * time.Minute
fmt.Println(d)           // 1h30m0s（読みやすい形式で表示される）
fmt.Println(d.Hours())   // 1.5（float64）
fmt.Println(d.Minutes()) // 90</code></pre>
<h4>主な定数と変換メソッド</h4>
<table>
<tr><th>定数</th><th>意味</th><th>変換メソッド</th></tr>
<tr><td><code>time.Second</code></td><td>1秒</td><td><code>d.Seconds()</code></td></tr>
<tr><td><code>time.Minute</code></td><td>1分</td><td><code>d.Minutes()</code></td></tr>
<tr><td><code>time.Hour</code></td><td>1時間</td><td><code>d.Hours()</code></td></tr>
</table>
<p>Durationは数値なので、足し算や比較がそのままできます。</p>
<pre><code>total := 2*time.Hour + 30*time.Minute
fmt.Println(total)      // 2h30m0s
fmt.Println(total &gt; d)  // true（比較演算子が使える）</code></pre>
<p>なお<code>time.Now()</code>で現在時刻を取得できますが、実行するたびに値が変わるため、この教材の自動判定では使いません。テストのしやすさの観点でも「現在時刻に依存するコードは検証しづらい」というのは実務で重要な感覚です。時刻を引数で受け取る設計にすると、テストで固定時刻を渡せるようになります。</p>`,
      task: `<code>d</code>を90分のDurationとして作り、そのまま表示、時間単位（Hours）、分単位（Minutes）で表示してください。さらに2時間30分の<code>total</code>を作り、<code>total &gt; d</code>の結果を表示してください。`,
      code: `package main

import (
	"fmt"
	"time"
)

func main() {
	// TODO: 90分のDurationを作る（time.Minuteを使う）
	d := 0 * time.Minute
	fmt.Println(d)
	fmt.Println(d.Hours())
	fmt.Println(d.Minutes())

	// TODO: 2時間30分のDurationを作る（足し算で組み立てる）
	total := 0 * time.Hour
	fmt.Println(total)
	fmt.Println(total > d)
}
`,
      solution: `package main

import (
	"fmt"
	"time"
)

func main() {
	// 数値 * time.MinuteでDurationを作れる
	d := 90 * time.Minute
	fmt.Println(d)
	fmt.Println(d.Hours())
	fmt.Println(d.Minutes())

	// Durationは足し算で組み立てられる
	total := 2*time.Hour + 30*time.Minute
	fmt.Println(total)
	fmt.Println(total > d)
}
`,
      hints: [
        `90分は<code>90 * time.Minute</code>と書きます。定数に整数を掛けるだけです。`,
        `2時間30分は<code>2*time.Hour + 30*time.Minute</code>のように足し算で作れます。Duration同士は<code>&gt;</code>で比較できます。`
      ],
      expectedOutput: "1h30m0s"
    },
    {
      id: 165,
      title: "time.TimeのフォーマットとParse（固定日時を使う）",
      explanation: `<p>日時を文字列にしたり、文字列から日時を読み取ったりする操作は実務で頻出です。Goの日時フォーマットは他言語と大きく違う独特の方式なので、ここでしっかり押さえましょう。</p>
<h4>基準日時「2006-01-02 15:04:05」</h4>
<p>Goでは<code>YYYY-MM-DD</code>のような記号ではなく、<strong>「2006年1月2日15時4分5秒」という決まった基準日時をそのまま書いてレイアウトを表現</strong>します。アメリカ式表記で1月2日3時(15時)4分5秒2006年、つまり1・2・3・4・5・6と並ぶ覚え方です。</p>
<table>
<tr><th>レイアウト</th><th>意味</th><th>出力例</th></tr>
<tr><td><code>2006</code></td><td>年（4桁）</td><td>2024</td></tr>
<tr><td><code>01</code></td><td>月（2桁）</td><td>05</td></tr>
<tr><td><code>02</code></td><td>日（2桁）</td><td>01</td></tr>
<tr><td><code>15</code></td><td>時（24時間制）</td><td>09</td></tr>
<tr><td><code>04</code></td><td>分</td><td>30</td></tr>
<tr><td><code>05</code></td><td>秒</td><td>00</td></tr>
</table>
<pre><code>t := time.Date(2024, 5, 1, 9, 30, 0, 0, time.UTC)
fmt.Println(t.Format("2006-01-02 15:04")) // 2024-05-01 09:30
fmt.Println(t.Format("2006年01月02日"))    // 2024年05月01日</code></pre>
<p><code>time.Date(年, 月, 日, 時, 分, 秒, ナノ秒, タイムゾーン)</code>は固定の日時を作る関数です。実行のたびに変わる<code>time.Now()</code>と違い、いつ実行しても同じ値になるため、学習やテストに向いています。</p>
<h4>Parse：文字列から日時へ</h4>
<pre><code>parsed, err := time.Parse("2006-01-02", "2024-12-25")
if err != nil {
    fmt.Println("解析失敗:", err)
    return
}
fmt.Println(parsed.Year(), parsed.Month(), parsed.Day())</code></pre>
<p><code>Parse</code>は失敗する可能性がある（不正な文字列が来る）ためerrorを返します。エラー処理を忘れないようにしましょう。</p>`,
      task: `固定日時<code>t</code>を<code>"2006-01-02 15:04"</code>形式でフォーマットして表示し、さらに<code>time.Parse</code>で文字列<code>"2024-12-25"</code>を解析して年・月・日を表示してください。`,
      code: `package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Date(2024, 5, 1, 9, 30, 0, 0, time.UTC)
	// TODO: "2006-01-02 15:04"のレイアウトでフォーマットして表示する
	fmt.Println(t)

	// TODO: "2006-01-02"のレイアウトで"2024-12-25"をParseする
	// エラーの場合はメッセージを表示してreturnすること
	fmt.Println("Parseの結果をここに表示")
}
`,
      solution: `package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Date(2024, 5, 1, 9, 30, 0, 0, time.UTC)
	// レイアウトは基準日時「2006-01-02 15:04:05」の並びで書く
	fmt.Println(t.Format("2006-01-02 15:04"))

	// Parseは(レイアウト, 対象文字列)の順で渡す
	parsed, err := time.Parse("2006-01-02", "2024-12-25")
	if err != nil {
		fmt.Println("解析失敗:", err)
		return
	}
	fmt.Println(parsed.Year(), parsed.Month(), parsed.Day())
}
`,
      hints: [
        `フォーマットは<code>t.Format("2006-01-02 15:04")</code>のように、基準日時をそのままレイアウト文字列にします。`,
        `<code>time.Parse(レイアウト, 文字列)</code>は<code>(time.Time, error)</code>の2値を返すので、errのチェックが必要です。`
      ],
      expectedOutput: "2024-05-01 09:30"
    },
    {
      id: 166,
      title: "mathパッケージ（Abs、Max、Sqrt、丸め）",
      explanation: `<p><code>math</code>パッケージは数学関数を提供します。重要な特徴は、<strong>ほぼすべての関数がfloat64を受け取りfloat64を返す</strong>ことです。intを渡したい場合は<code>float64(n)</code>で変換します。</p>
<h4>よく使う関数</h4>
<table>
<tr><th>関数</th><th>働き</th><th>例</th></tr>
<tr><td><code>math.Abs(x)</code></td><td>絶対値</td><td>Abs(-3.5) → 3.5</td></tr>
<tr><td><code>math.Max(x, y)</code></td><td>大きい方</td><td>Max(3, 7) → 7</td></tr>
<tr><td><code>math.Min(x, y)</code></td><td>小さい方</td><td>Min(3, 7) → 3</td></tr>
<tr><td><code>math.Sqrt(x)</code></td><td>平方根</td><td>Sqrt(2) → 1.414...</td></tr>
<tr><td><code>math.Pow(x, y)</code></td><td>xのy乗</td><td>Pow(2, 10) → 1024</td></tr>
</table>
<h4>丸め関数の違い</h4>
<p>小数を整数に丸める関数は3種類あり、挙動の違いを正確に知らないとバグの原因になります。</p>
<table>
<tr><th>関数</th><th>働き</th><th>3.7</th><th>3.2</th><th>-2.5</th></tr>
<tr><td><code>math.Floor</code></td><td>切り捨て（小さい方の整数へ）</td><td>3</td><td>3</td><td>-3</td></tr>
<tr><td><code>math.Ceil</code></td><td>切り上げ（大きい方の整数へ）</td><td>4</td><td>4</td><td>-2</td></tr>
<tr><td><code>math.Round</code></td><td>四捨五入（0から遠い方へ）</td><td>4</td><td>3</td><td>-3</td></tr>
</table>
<p><code>math.Round(2.5)</code>は3になります（0から遠い方に丸める方式）。銀行丸め（偶数丸め）が必要な場合は<code>math.RoundToEven</code>を使います。</p>
<pre><code>fmt.Println(math.Sqrt(2))      // 1.4142135623730951
fmt.Println(math.Floor(3.7))   // 3
fmt.Println(math.Max(3, 7))    // 7（引数も戻り値もfloat64）</code></pre>
<p>なおGo 1.21からは組み込み関数<code>max</code>・<code>min</code>も使えます。intのまま比較したいときは組み込み関数、float64の計算の流れの中では<code>math.Max</code>、と使い分けます。</p>`,
      task: `mathパッケージを使って、-3.5の絶対値、3と7の大きい方、2の平方根、3.7の切り捨て、3.2の切り上げ、2.5の四捨五入を順に表示してください。`,
      code: `package main

import (
	"fmt"
	"math"
)

func main() {
	// TODO: それぞれmathパッケージの関数に置き換える
	fmt.Println(-3.5)      // 絶対値にする
	fmt.Println(0)         // 3と7の大きい方にする
	fmt.Println(0)         // 2の平方根にする
	fmt.Println(3.7)       // 切り捨てにする
	fmt.Println(3.2)       // 切り上げにする
	fmt.Println(2.5)       // 四捨五入にする
	_ = math.Pi            // mathを使うための仮の行。完成したら消してよい
}
`,
      solution: `package main

import (
	"fmt"
	"math"
)

func main() {
	// mathパッケージの関数はfloat64を受け取りfloat64を返す
	fmt.Println(math.Abs(-3.5))
	fmt.Println(math.Max(3, 7))
	fmt.Println(math.Sqrt(2))
	fmt.Println(math.Floor(3.7))
	fmt.Println(math.Ceil(3.2))
	fmt.Println(math.Round(2.5))
}
`,
      hints: [
        `絶対値は<code>math.Abs(-3.5)</code>、平方根は<code>math.Sqrt(2)</code>です。`,
        `切り捨ては<code>Floor</code>、切り上げは<code>Ceil</code>、四捨五入は<code>Round</code>です。`,
        `未使用importはコンパイルエラーになります。mathの関数を使い始めたら仮の行<code>_ = math.Pi</code>は削除しましょう。`
      ],
      expectedOutput: "1.4142135623730951"
    },
    {
      id: 167,
      title: "encoding/jsonでMarshal（構造体をJSONへ）",
      explanation: `<p>JSON（JavaScript Object Notation）はWeb APIや設定ファイルで最も広く使われるデータ形式です。<code>encoding/json</code>パッケージの<code>json.Marshal</code>は、Goの値をJSON文字列（正確にはバイト列<code>[]byte</code>）に変換します。</p>
<pre><code>type Book struct {
    Title string
    Price int
}

b := Book{Title: "Go入門", Price: 2800}
data, err := json.Marshal(b)
if err != nil {
    fmt.Println("変換失敗:", err)
    return
}
fmt.Println(string(data)) // {"Title":"Go入門","Price":2800}</code></pre>
<h4>重要なルール：エクスポートされたフィールドだけが対象</h4>
<p><code>json.Marshal</code>が変換するのは<strong>大文字で始まるフィールドだけ</strong>です。小文字始まりのフィールドはJSONに含まれません（パッケージ外から見えないため）。出力のキー名は、フィールド名がそのまま使われます。</p>
<h4>構造体タグについて</h4>
<p>実際のGoコードでは、フィールドの後ろに<code>json:"title"</code>という文字列を<strong>バッククォート記号（<code>&#96;</code>）で囲んで</strong>付けることで、JSONのキー名を小文字などに変更できます。これを構造体タグと呼びます。</p>
<pre><code>// 実際のコードではこう書く（&#96;はバッククォート）
// Title string &#96;json:"title"&#96;
// → 出力が {"title":...} になる</code></pre>
<p>このほか<code>json:"price,omitempty"</code>（ゼロ値なら省略）などのオプションもあります。この教材の実行環境の都合でタグは使わず、フィールド名がそのままキーになる形で練習しますが、実務ではタグでキー名を指定するのが一般的、と覚えておいてください。</p>
<p>Marshalの結果は<code>[]byte</code>なので、表示するときは<code>string(data)</code>と変換します。スライスやマップもそのままJSON配列・オブジェクトに変換できます。</p>`,
      task: `<code>Book</code>構造体の値を<code>json.Marshal</code>でJSONに変換し、<code>string()</code>で文字列にして表示してください。エラー処理も書きましょう。`,
      code: `package main

import (
	"encoding/json"
	"fmt"
)

type Book struct {
	Title string
	Price int
	Tags  []string
}

func main() {
	b := Book{Title: "Go入門", Price: 2800, Tags: []string{"Go", "初心者"}}

	// TODO: json.MarshalでbをJSONに変換し、文字列にして表示する
	// 戻り値は([]byte, error)の2つ
	fmt.Println(b)
	_ = json.Valid // jsonパッケージを使うための仮の行。完成したら消してよい
}
`,
      solution: `package main

import (
	"encoding/json"
	"fmt"
)

type Book struct {
	Title string
	Price int
	Tags  []string
}

func main() {
	b := Book{Title: "Go入門", Price: 2800, Tags: []string{"Go", "初心者"}}

	// Marshalは([]byte, error)を返す
	data, err := json.Marshal(b)
	if err != nil {
		fmt.Println("変換失敗:", err)
		return
	}
	// []byteはstring()で文字列に変換して表示する
	fmt.Println(string(data))
}
`,
      hints: [
        `<code>data, err := json.Marshal(b)</code>のように2つの戻り値を受け取ります。`,
        `<code>data</code>は<code>[]byte</code>型なので、<code>fmt.Println(string(data))</code>で文字列として表示します。`
      ],
      expectedOutput: "{\"Title\":\"Go入門\",\"Price\":2800,\"Tags\":[\"Go\",\"初心者\"]}"
    },
    {
      id: 168,
      title: "encoding/jsonでUnmarshal（JSONを構造体へ）",
      explanation: `<p><code>json.Unmarshal</code>はMarshalの逆で、JSONのバイト列をGoの構造体に読み込みます。Web APIのレスポンス処理など、外部から受け取ったデータを扱う場面の基本操作です。</p>
<pre><code>type User struct {
    Name  string
    Age   int
    Email string
}

data := []byte("{\\"name\\":\\"Sato\\",\\"age\\":28}")
var u User
err := json.Unmarshal(data, &amp;u)
if err != nil {
    fmt.Println("解析失敗:", err)
    return
}
fmt.Println(u.Name, u.Age) // Sato 28</code></pre>
<h4>押さえるべき3つのポイント</h4>
<ol>
<li><strong>第2引数はポインタ</strong>：<code>&amp;u</code>のように渡します。Unmarshalが構造体の中身を書き換えるためです。ポインタを渡し忘れるとエラーになります。</li>
<li><strong>キーとフィールドの対応は大文字小文字を区別しない</strong>：JSONの<code>"name"</code>はフィールド<code>Name</code>に自動で対応します。タグなしでも小文字キーのJSONを読めるのはこのためです。</li>
<li><strong>対応するキーがないフィールドはゼロ値のまま</strong>：JSONに<code>email</code>がなければ<code>u.Email</code>は空文字列<code>""</code>のままです。エラーにはなりません。</li>
</ol>
<h4>JSON配列はスライスへ</h4>
<pre><code>data := []byte("[{\\"name\\":\\"A\\"},{\\"name\\":\\"B\\"}]")
var users []User
err := json.Unmarshal(data, &amp;users)</code></pre>
<p>「存在しないキーはゼロ値になる」仕様は便利な反面、キー名の打ち間違いに気づきにくいという落とし穴でもあります。読み込み後に必須フィールドが空でないか検証する習慣をつけると、実務で堅牢なコードになります。</p>`,
      task: `<code>json.Unmarshal</code>でJSONデータを<code>User</code>構造体に読み込み、名前・年齢・メールを表示してください。第2引数にはポインタを渡すことに注意してください。`,
      code: `package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	Name  string
	Age   int
	Email string
}

func main() {
	data := []byte("{\\"name\\":\\"Sato\\",\\"age\\":28,\\"email\\":\\"sato@example.com\\"}")

	var u User
	// TODO: json.Unmarshalでdataをuに読み込む（ポインタを渡す）
	_ = data       // dataを使うための仮の行。完成したら消してよい
	_ = json.Valid // jsonを使うための仮の行。完成したら消してよい

	fmt.Println(u.Name, u.Age)
	fmt.Println("メール:", u.Email)
}
`,
      solution: `package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	Name  string
	Age   int
	Email string
}

func main() {
	data := []byte("{\\"name\\":\\"Sato\\",\\"age\\":28,\\"email\\":\\"sato@example.com\\"}")

	var u User
	// 第2引数は書き込み先のポインタ。キーは大文字小文字を区別せず対応する
	err := json.Unmarshal(data, &u)
	if err != nil {
		fmt.Println("解析失敗:", err)
		return
	}

	fmt.Println(u.Name, u.Age)
	fmt.Println("メール:", u.Email)
}
`,
      hints: [
        `<code>err := json.Unmarshal(data, &amp;u)</code>のように、第2引数に<code>&amp;</code>を付けてポインタを渡します。`,
        `JSONのキー<code>"name"</code>は小文字ですが、フィールド<code>Name</code>に自動で対応します（大文字小文字を区別しないため）。`
      ],
      expectedOutput: "Sato 28"
    },
    {
      id: 169,
      title: "regexpの基本（MatchString、FindAllString）",
      explanation: `<p>正規表現（regular expression）は「文字列のパターン」を表す記法で、検索・検証・抽出に使います。Goでは<code>regexp</code>パッケージが提供します。</p>
<h4>基本の使い方</h4>
<pre><code>re := regexp.MustCompile("[0-9]+")
fmt.Println(re.MatchString("order-123"))          // true
fmt.Println(re.FindAllString("a1 b22 c333", -1))  // [1 22 333]</code></pre>
<p><code>regexp.MustCompile</code>はパターンを解析して<code>*regexp.Regexp</code>を作ります。パターンが不正なら<strong>panic</strong>します。パターンが固定文字列ならMustCompile、ユーザー入力など実行時に決まるなら（errorを返す）<code>regexp.Compile</code>を使うのが慣習です。コンパイルはコストがかかるため、ループの中ではなく一度だけ行うのが定石です。</p>
<h4>よく使うパターン記法</h4>
<table>
<tr><th>記法</th><th>意味</th><th>例</th></tr>
<tr><td><code>[0-9]</code></td><td>数字1文字</td><td>"5"にマッチ</td></tr>
<tr><td><code>[a-z]+</code></td><td>小文字英字の1回以上の繰り返し</td><td>"abc"にマッチ</td></tr>
<tr><td><code>.</code></td><td>任意の1文字</td><td>"a"にも"7"にもマッチ</td></tr>
<tr><td><code>^ と $</code></td><td>先頭・末尾</td><td>^go$は"go"だけにマッチ</td></tr>
<tr><td><code>?</code></td><td>直前の0回か1回</td><td>colou?rは"color"と"colour"</td></tr>
</table>
<h4>主なメソッド</h4>
<ul>
<li><code>re.MatchString(s)</code>：マッチする部分があるかをboolで返す</li>
<li><code>re.FindString(s)</code>：最初にマッチした部分を返す</li>
<li><code>re.FindAllString(s, n)</code>：マッチした部分をn個まで全部返す。<strong>-1ですべて</strong></li>
<li><code>re.ReplaceAllString(s, repl)</code>：マッチ部分を置換する</li>
</ul>
<p>なお<code>\\d</code>（数字）のようにバックスラッシュを含むパターンは、通常の文字列リテラルでは<code>"\\\\d"</code>と二重に書く必要があるため、実際のGoコードではバッククォート記号（<code>&#96;</code>）で囲む生文字列リテラルで書くのが一般的です。この教材では<code>[0-9]</code>のようにバックスラッシュ不要の記法を使います。</p>`,
      task: `パターン<code>"[0-9]+"</code>をコンパイルし、<code>MatchString</code>で<code>"order-123"</code>に数字が含まれるか判定し、<code>FindAllString</code>で<code>"a1 b22 c333"</code>から数字をすべて抽出してください。`,
      code: `package main

import (
	"fmt"
	"regexp"
)

func main() {
	// TODO: "[0-9]+"（数字の1回以上の繰り返し）をMustCompileでコンパイルする

	// TODO: MatchStringで"order-123"を判定して表示する
	fmt.Println(false)

	// TODO: FindAllStringで"a1 b22 c333"から数字をすべて抽出して表示する
	fmt.Println([]string{})

	_ = regexp.QuoteMeta // regexpを使うための仮の行。完成したら消してよい
}
`,
      solution: `package main

import (
	"fmt"
	"regexp"
)

func main() {
	// パターンが固定ならMustCompileを使う（不正なパターンならpanic）
	re := regexp.MustCompile("[0-9]+")

	// マッチする部分があるかどうか
	fmt.Println(re.MatchString("order-123"))

	// 第2引数-1で、マッチした部分をすべて取り出す
	fmt.Println(re.FindAllString("a1 b22 c333", -1))
}
`,
      hints: [
        `<code>re := regexp.MustCompile("[0-9]+")</code>でコンパイル済みの正規表現オブジェクトを作ります。`,
        `<code>re.FindAllString("a1 b22 c333", -1)</code>の第2引数-1は「上限なし（すべて）」の意味です。`
      ],
      expectedOutput: "[1 22 333]"
    },
    {
      id: 170,
      title: "総合演習：JSONデータの集計レポート",
      explanation: `<p>この章の総まとめとして、実務でよくある「JSONで受け取った売上データを集計してレポートを出す」処理を作ります。使うのはすべてこの章で学んだ道具です。</p>
<h4>処理の流れ</h4>
<ol>
<li><code>json.Unmarshal</code>でJSON配列を構造体スライス<code>[]Sale</code>に読み込む</li>
<li>ループで各商品の売上金額（単価×数量）と合計を計算する</li>
<li><code>sort.Slice</code>で売上金額の大きい順に並べ替える</li>
<li><code>fmt.Printf</code>で整形して表示する</li>
</ol>
<pre><code>type Sale struct {
    Product string
    Price   int
    Qty     int
}

var sales []Sale
err := json.Unmarshal(data, &amp;sales)</code></pre>
<p>集計値は「商品名と金額」を持つ小さな構造体のスライスに詰めるとソートしやすくなります。</p>
<pre><code>type Result struct {
    Product string
    Amount  int
}

results := make([]Result, 0, len(sales))
for _, s := range sales {
    results = append(results, Result{s.Product, s.Price * s.Qty})
}
sort.Slice(results, func(i, j int) bool {
    return results[i].Amount &gt; results[j].Amount
})</code></pre>
<p>このように「入力の形（Sale）」と「出力の形（Result）」を別の構造体にするのは、実務でも見通しを良くする定番の設計です。mapで集計する方法もありますが、mapはイテレーション順が不定なため、順序が重要なレポートではスライス＋ソートが確実です。</p>`,
      task: `JSONを<code>[]Sale</code>に読み込み、各商品の売上金額（Price×Qty）を計算して金額の大きい順に「商品名 金額円」を表示し、最後に「合計: 合計金額円」を表示してください。`,
      code: `package main

import (
	"encoding/json"
	"fmt"
	"sort"
)

type Sale struct {
	Product string
	Price   int
	Qty     int
}

type Result struct {
	Product string
	Amount  int
}

func main() {
	data := []byte("[{\\"product\\":\\"apple\\",\\"price\\":120,\\"qty\\":3},{\\"product\\":\\"banana\\",\\"price\\":80,\\"qty\\":5},{\\"product\\":\\"cherry\\",\\"price\\":300,\\"qty\\":2},{\\"product\\":\\"melon\\",\\"price\\":500,\\"qty\\":1}]")

	// TODO: 1. json.Unmarshalで[]Saleに読み込む（エラー処理も書く）

	// TODO: 2. 各商品のPrice*Qtyを計算してResultのスライスに詰め、合計も計算する

	// TODO: 3. sort.SliceでAmountの大きい順にソートする

	// TODO: 4. 「商品名 金額円」を1行ずつ表示し、最後に「合計: 合計金額円」を表示する
	fmt.Println("=== 売上レポート ===")
	_ = data
	_ = sort.Search // sortを使うための仮の行。完成したら消してよい
	_ = json.Valid  // jsonを使うための仮の行。完成したら消してよい
}
`,
      solution: `package main

import (
	"encoding/json"
	"fmt"
	"sort"
)

type Sale struct {
	Product string
	Price   int
	Qty     int
}

type Result struct {
	Product string
	Amount  int
}

func main() {
	data := []byte("[{\\"product\\":\\"apple\\",\\"price\\":120,\\"qty\\":3},{\\"product\\":\\"banana\\",\\"price\\":80,\\"qty\\":5},{\\"product\\":\\"cherry\\",\\"price\\":300,\\"qty\\":2},{\\"product\\":\\"melon\\",\\"price\\":500,\\"qty\\":1}]")

	// 1. JSON配列を構造体スライスに読み込む
	var sales []Sale
	if err := json.Unmarshal(data, &sales); err != nil {
		fmt.Println("解析失敗:", err)
		return
	}

	// 2. 売上金額と合計を計算する
	total := 0
	results := make([]Result, 0, len(sales))
	for _, s := range sales {
		amount := s.Price * s.Qty
		results = append(results, Result{Product: s.Product, Amount: amount})
		total += amount
	}

	// 3. 金額の大きい順にソートする
	sort.Slice(results, func(i, j int) bool {
		return results[i].Amount > results[j].Amount
	})

	// 4. レポートを表示する
	fmt.Println("=== 売上レポート ===")
	for _, r := range results {
		fmt.Printf("%s %d円\\n", r.Product, r.Amount)
	}
	fmt.Printf("合計: %d円\\n", total)
}
`,
      hints: [
        `まず<code>var sales []Sale</code>を宣言し、<code>json.Unmarshal(data, &amp;sales)</code>で読み込みます。JSONのキーは小文字ですが自動で対応します。`,
        `合計は<code>total += s.Price * s.Qty</code>のようにループの中で加算します。`,
        `降順ソートは<code>results[i].Amount &gt; results[j].Amount</code>をless関数で返します。表示は<code>fmt.Printf("%s %d円\\n", ...)</code>が便利です。`
      ],
      expectedOutput: "合計: 1860円"
    }
  ]
});
