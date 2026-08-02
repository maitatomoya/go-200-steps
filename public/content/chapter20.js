// 第20章：総合演習
registerChapter({
  number: 20,
  title: "総合演習",
  description: "第1〜19章で学んだ知識を組み合わせて、実践的な10個のプログラムを完成させる卒業章です。",
  steps: [
    {
      id: 191,
      title: "じゃんけん判定（定数＋switch）",
      explanation: `<p>ここからは総合演習です。各ステップで「どの章の知識を組み合わせるか」を意識しながら取り組みましょう。最初はじゃんけんの勝敗判定です。</p>
<h4>使う知識の整理</h4>
<table>
<tr><th>知識</th><th>学んだ章</th><th>この課題での役割</th></tr>
<tr><td>型定義＋iota</td><td>第4章・第19章</td><td>手（グー・チョキ・パー）を型で表現</td></tr>
<tr><td>switch文</td><td>第5章</td><td>勝敗パターンの分岐</td></tr>
<tr><td>String()メソッド</td><td>第13章</td><td>手を日本語で表示</td></tr>
</table>
<h4>設計の考え方</h4>
<p>じゃんけんの手を<code>int</code>や<code>string</code>のまま扱うと、「3」や「ぐー」のような不正な値が混入してもコンパイラは検出できません。<code>type Hand int</code>と型定義して定数を用意すれば、手として意味のある値だけを扱う意図がコードに表れます。</p>
<p>勝敗判定は「勝ちになる組み合わせ」を列挙するのが素直です。switchのcaseはカンマ区切りで複数の条件を並べられます。</p>
<pre><code>switch {
case a == Rock &amp;&amp; b == Scissors,
    a == Scissors &amp;&amp; b == Paper:
    return "勝ち"
}</code></pre>
<p>条件のないswitch（<code>switch {</code>）は、if-else if の連鎖を見やすく書ける形で、最初に真になったcaseが実行されます。「あいこ→勝ち→それ以外は負け」の順に判定すると、負けの条件を書かずに済み、漏れのないロジックになります。判定関数を<code>judge(a, b Hand) string</code>として独立させておくと、main側はデータ（対戦の組み合わせ）を並べてループするだけになり、テストもしやすくなります。</p>`,
      task: `<code>judge</code>関数のTODO部分を実装してください。あいこの判定は実装済みなので、「勝ち」になる3つの組み合わせをswitchで判定し、どれにも当てはまらなければ「負け」を返します。`,
      code: `package main

import "fmt"

type Hand int

const (
	Rock     Hand = iota // グー
	Paper                // パー
	Scissors             // チョキ
)

func (h Hand) String() string {
	switch h {
	case Rock:
		return "グー"
	case Paper:
		return "パー"
	default:
		return "チョキ"
	}
}

// judge は自分の手aと相手の手bを比べて結果を返す
func judge(a, b Hand) string {
	if a == b {
		return "あいこ"
	}
	// TODO: 勝ちになる3つの組み合わせをswitchで判定する
	// グーはチョキに勝つ / チョキはパーに勝つ / パーはグーに勝つ
	// どれでもなければ "負け" を返す
	return "負け"
}

func main() {
	pairs := [][2]Hand{
		{Rock, Scissors},
		{Paper, Scissors},
		{Scissors, Scissors},
	}
	for _, p := range pairs {
		fmt.Printf("%v vs %v → %s\\n", p[0], p[1], judge(p[0], p[1]))
	}
}`,
      solution: `package main

import "fmt"

type Hand int

const (
	Rock     Hand = iota // グー
	Paper                // パー
	Scissors             // チョキ
)

func (h Hand) String() string {
	switch h {
	case Rock:
		return "グー"
	case Paper:
		return "パー"
	default:
		return "チョキ"
	}
}

// judge は自分の手aと相手の手bを比べて結果を返す
func judge(a, b Hand) string {
	if a == b {
		return "あいこ"
	}
	switch {
	case a == Rock && b == Scissors,
		a == Scissors && b == Paper,
		a == Paper && b == Rock:
		return "勝ち"
	}
	return "負け"
}

func main() {
	pairs := [][2]Hand{
		{Rock, Scissors},
		{Paper, Scissors},
		{Scissors, Scissors},
	}
	for _, p := range pairs {
		fmt.Printf("%v vs %v → %s\\n", p[0], p[1], judge(p[0], p[1]))
	}
}`,
      hints: [
        `条件なしのswitch { } は、if-else ifの連鎖を見やすく書ける形です。caseに論理式を書けます。`,
        `case a == Rock && b == Scissors: return "勝ち" のような判定を3パターン書くか、カンマ区切りで1つのcaseにまとめます。`
      ],
      expectedOutput: "グー vs チョキ → 勝ち"
    },
    {
      id: 192,
      title: "成績集計（スライス＋マップ）",
      explanation: `<p>テストの点数一覧から、平均点・評価分布・最高得点者を集計します。データ集計はスライスとマップの最も実践的な組み合わせです。</p>
<h4>使う知識の整理</h4>
<table>
<tr><th>知識</th><th>学んだ章</th><th>この課題での役割</th></tr>
<tr><td>スライスとrange</td><td>第6章・第7章</td><td>点数一覧の走査</td></tr>
<tr><td>マップ</td><td>第8章</td><td>評価（A/B/C）ごとの人数カウント</td></tr>
<tr><td>条件なしswitch</td><td>第5章</td><td>点数から評価への変換</td></tr>
</table>
<h4>設計の考え方</h4>
<p>集計処理の基本形は「<strong>1回のループで複数の集計を同時に進める</strong>」ことです。合計・評価カウント・最大値の探索は、いずれも要素を1つずつ見れば計算できるので、ループを分ける必要はありません。</p>
<p>マップでのカウントは、Goでは非常に簡潔に書けます。存在しないキーへのアクセスはゼロ値（intなら0）を返すため、事前の初期化なしで<code>counts["A"]++</code>と書けます。</p>
<pre><code>counts := map[string]int{}
counts["A"]++ // キーがなくても0から始まるので安全</code></pre>
<p>1つ注意すべきは<strong>マップの出力順</strong>です。マップのrangeは順序が保証されないため、結果表示では「A→B→C」の順序をスライスで固定して取り出します。これは第8章で学んだ「順序が必要ならキーの順序を自分で管理する」原則の実践です。</p>
<pre><code>for _, g := range []string{"A", "B", "C"} {
    fmt.Printf("%s評価: %d人\\n", g, counts[g])
}</code></pre>
<p>最高点の探索は「暫定1位のインデックスを持ちながら更新する」定石パターンです。名前と点数が別々のスライスにあるため、インデックスで対応づけます。</p>`,
      task: `TODO部分を2つ実装してください。(1)ループ内で点数に応じて<code>counts</code>の"A"（80点以上）・"B"（70点以上）・"C"（それ未満）をカウントする。(2)最高点の学生のインデックス<code>best</code>を求める。`,
      code: `package main

import "fmt"

func main() {
	names := []string{"佐藤", "鈴木", "高橋", "田中", "伊藤"}
	scores := []int{85, 62, 74, 91, 58}

	total := 0
	counts := map[string]int{}
	for _, s := range scores {
		total += s
		// TODO: 条件なしswitchで評価をカウントする
		// 80点以上→counts["A"]++、70点以上→counts["B"]++、
		// それ未満→counts["C"]++
	}
	avg := float64(total) / float64(len(scores))
	fmt.Printf("平均点: %.1f\\n", avg)

	// mapの順序は不定なので、表示順をスライスで固定する
	for _, g := range []string{"A", "B", "C"} {
		fmt.Printf("%s評価: %d人\\n", g, counts[g])
	}

	// TODO: 最高点の学生のインデックスbestを求める
	// （暫定1位bestを0で初期化し、より高い点数が見つかったら更新）
	best := 0
	fmt.Printf("最高点: %s（%d点）\\n", names[best], scores[best])
}`,
      solution: `package main

import "fmt"

func main() {
	names := []string{"佐藤", "鈴木", "高橋", "田中", "伊藤"}
	scores := []int{85, 62, 74, 91, 58}

	total := 0
	counts := map[string]int{}
	for _, s := range scores {
		total += s
		switch {
		case s >= 80:
			counts["A"]++
		case s >= 70:
			counts["B"]++
		default:
			counts["C"]++
		}
	}
	avg := float64(total) / float64(len(scores))
	fmt.Printf("平均点: %.1f\\n", avg)

	// mapの順序は不定なので、表示順をスライスで固定する
	for _, g := range []string{"A", "B", "C"} {
		fmt.Printf("%s評価: %d人\\n", g, counts[g])
	}

	// 最高点の学生を探す（暫定1位のインデックスを更新していく）
	best := 0
	for i, s := range scores {
		if s > scores[best] {
			best = i
		}
	}
	fmt.Printf("最高点: %s（%d点）\\n", names[best], scores[best])
}`,
      hints: [
        `評価分けは switch { case s >= 80: ... case s >= 70: ... default: ... } の形です。上から順に判定されるので、80以上を先に書きます。`,
        `最高点探索は for i, s := range scores のループで、if s > scores[best] { best = i } と更新します。`
      ],
      expectedOutput: "最高点: 田中（91点）"
    },
    {
      id: 193,
      title: "在庫管理（構造体＋メソッド＋マップ）",
      explanation: `<p>商品名と個数を管理する在庫システムを作ります。データ（マップ）を構造体で包み、操作をメソッドとして提供する——小さいながらも実務のコード設計の縮図です。</p>
<h4>使う知識の整理</h4>
<table>
<tr><th>知識</th><th>学んだ章</th><th>この課題での役割</th></tr>
<tr><td>構造体</td><td>第11章</td><td>在庫データを1つの型にまとめる</td></tr>
<tr><td>ポインタレシーバのメソッド</td><td>第12章</td><td>在庫の追加・払い出し操作</td></tr>
<tr><td>マップ</td><td>第8章</td><td>商品名→個数の対応</td></tr>
<tr><td>エラーを返す関数</td><td>第14章</td><td>在庫不足を呼び出し側に伝える</td></tr>
</table>
<h4>設計の考え方</h4>
<p>マップを直接<code>main</code>でいじるのではなく、<code>Inventory</code>構造体の中に隠して、操作はメソッド経由に限定します。こうすると「在庫がマイナスにならない」といったルールをメソッド内で一元的に守れます。データと不変条件（守るべきルール）を1つの型に閉じ込めるのは、クリーンな設計の基本です。</p>
<p>もう1つの重要ポイントは<strong>コンストラクタ関数</strong>です。マップのゼロ値はnilで、nilマップへの書き込みはパニックになります（第8章）。そこで<code>NewInventory()</code>でマップを初期化済みの構造体を返し、利用者が未初期化の状態に触れないようにします。</p>
<pre><code>func NewInventory() *Inventory {
    return &amp;Inventory{items: map[string]int{}}
}</code></pre>
<p>払い出し（Remove）は失敗しうる操作なので、<code>error</code>を返す設計にします。「在庫が足りなければエラーを返し、在庫は変更しない」という仕様により、呼び出し側はエラー処理を強制され、静かにデータが壊れることを防げます。</p>`,
      task: `<code>Remove</code>と<code>Stock</code>メソッドのTODO部分を実装してください。<code>Remove</code>は在庫不足なら「（商品名）の在庫が足りません」というエラーを返して在庫を変更せず、足りていれば減らします。`,
      code: `package main

import (
	"errors"
	"fmt"
)

type Inventory struct {
	items map[string]int
}

// NewInventory は初期化済みの在庫を返す（nilマップ対策）
func NewInventory() *Inventory {
	return &Inventory{items: map[string]int{}}
}

// Add は商品をn個追加する
func (inv *Inventory) Add(name string, n int) {
	inv.items[name] += n
}

// Remove は商品をn個払い出す。在庫不足ならエラーを返す
func (inv *Inventory) Remove(name string, n int) error {
	// TODO: 在庫がn未満なら errors.New(name + "の在庫が足りません")
	// を返す。足りていれば在庫を減らしてnilを返す
	return nil
}

// Stock は現在の在庫数を返す
func (inv *Inventory) Stock(name string) int {
	// TODO: マップから在庫数を返す
	return 0
}

func main() {
	inv := NewInventory()
	inv.Add("りんご", 10)
	inv.Add("みかん", 5)

	if err := inv.Remove("りんご", 3); err != nil {
		fmt.Println("エラー:", err)
	}
	if err := inv.Remove("みかん", 8); err != nil {
		fmt.Println("エラー:", err)
	}
	fmt.Println("りんごの在庫:", inv.Stock("りんご"))
	fmt.Println("みかんの在庫:", inv.Stock("みかん"))
}`,
      solution: `package main

import (
	"errors"
	"fmt"
)

type Inventory struct {
	items map[string]int
}

// NewInventory は初期化済みの在庫を返す（nilマップ対策）
func NewInventory() *Inventory {
	return &Inventory{items: map[string]int{}}
}

// Add は商品をn個追加する
func (inv *Inventory) Add(name string, n int) {
	inv.items[name] += n
}

// Remove は商品をn個払い出す。在庫不足ならエラーを返す
func (inv *Inventory) Remove(name string, n int) error {
	if inv.items[name] < n {
		return errors.New(name + "の在庫が足りません")
	}
	inv.items[name] -= n
	return nil
}

// Stock は現在の在庫数を返す
func (inv *Inventory) Stock(name string) int {
	return inv.items[name]
}

func main() {
	inv := NewInventory()
	inv.Add("りんご", 10)
	inv.Add("みかん", 5)

	if err := inv.Remove("りんご", 3); err != nil {
		fmt.Println("エラー:", err)
	}
	if err := inv.Remove("みかん", 8); err != nil {
		fmt.Println("エラー:", err)
	}
	fmt.Println("りんごの在庫:", inv.Stock("りんご"))
	fmt.Println("みかんの在庫:", inv.Stock("みかん"))
}`,
      hints: [
        `Removeでは先に在庫チェックを行い、不足ならエラーを返して処理を打ち切ります（早期リターン）。`,
        `if inv.items[name] < n { return errors.New(...) } の後に inv.items[name] -= n と return nil を書きます。Stockは return inv.items[name] の1行です。`
      ],
      expectedOutput: "りんごの在庫: 7"
    },
    {
      id: 194,
      title: "テキスト統計（strings＋マップ＋ソート）",
      explanation: `<p>文章を単語に分割して出現回数を数え、アルファベット順に表示します。ログ解析や自然言語処理の第一歩となる、頻出の処理パターンです。</p>
<h4>使う知識の整理</h4>
<table>
<tr><th>知識</th><th>学んだ章</th><th>この課題での役割</th></tr>
<tr><td>stringsパッケージ</td><td>第9章</td><td>文章の単語分割（Fields）</td></tr>
<tr><td>マップでのカウント</td><td>第8章</td><td>単語→出現回数</td></tr>
<tr><td>sortパッケージ</td><td>第15章</td><td>キーの順序を固定して表示</td></tr>
</table>
<h4>設計の考え方</h4>
<p>処理は「分割→集計→整列→出力」の4段階に分けて考えます。それぞれ1つの道具が対応する、責務の分かりやすい構成です。</p>
<p>単語分割には<code>strings.Fields</code>を使います。<code>Split(s, " ")</code>と違い、連続する空白やタブをまとめて区切りとして扱うため、余分な空文字列が混ざりません。</p>
<pre><code>words := strings.Fields("go  is   fun") // ["go", "is", "fun"]</code></pre>
<p>集計は前ステップ同様、ゼロ値の性質を活かした<code>counts[w]++</code>です。</p>
<p>最大のポイントは<strong>出力順の固定</strong>です。マップのrangeは実行のたびに順序が変わるため、そのまま出力すると結果が安定しません。定石は「キーだけをスライスに集めてソートし、その順でマップを引く」方法です。</p>
<pre><code>keys := make([]string, 0, len(counts))
for k := range counts {
    keys = append(keys, k)
}
sort.Strings(keys)
for _, k := range keys {
    fmt.Println(k, counts[k])
}</code></pre>
<p>この「キー収集→ソート→順に参照」の3ステップは、マップの内容を人に見せるあらゆる場面で使う基本イディオムなので、手が覚えるまで書いて身につけましょう。</p>`,
      task: `TODO部分を実装してください。(1)<code>counts</code>マップで各単語の出現回数を数える。(2)キーをスライスに集めて<code>sort.Strings</code>でソートし、その順で「単語: N回」と表示する。`,
      code: `package main

import (
	"fmt"
	"sort"
	"strings"
)

func main() {
	text := "go is simple go is fast go is fun"
	words := strings.Fields(text) // 空白で単語に分割

	counts := map[string]int{}
	// TODO: 各単語の出現回数をcountsに集計する

	// TODO: キーをスライスに集め、sort.Stringsでソートしてから
	// 「単語: N回」の形式で順に表示する

	fmt.Println("総単語数:", len(words), "/ 種類:", len(counts))
}`,
      solution: `package main

import (
	"fmt"
	"sort"
	"strings"
)

func main() {
	text := "go is simple go is fast go is fun"
	words := strings.Fields(text) // 空白で単語に分割

	counts := map[string]int{}
	for _, w := range words {
		counts[w]++
	}

	// マップの順序は不定なので、キーをソートして順序を固定する
	keys := make([]string, 0, len(counts))
	for k := range counts {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		fmt.Printf("%s: %d回\\n", k, counts[k])
	}

	fmt.Println("総単語数:", len(words), "/ 種類:", len(counts))
}`,
      hints: [
        `集計は for _, w := range words { counts[w]++ } の2行で書けます。`,
        `for k := range counts でキーだけを取り出してスライスにappendし、sort.Strings(keys)で並べ替えてから表示ループを回します。`
      ],
      expectedOutput: "go: 3回"
    },
    {
      id: 195,
      title: "エラー処理付き計算パイプライン（複数戻り値＋ラップ）",
      explanation: `<p>「失敗しうる処理を複数段つなげる」パイプラインを、Go流のエラー処理で組み立てます。各段でエラーに文脈を積み重ね、最後に原因を判定する——実務のエラー処理の縮図です。</p>
<h4>使う知識の整理</h4>
<table>
<tr><th>知識</th><th>学んだ章</th><th>この課題での役割</th></tr>
<tr><td>複数戻り値と早期リターン</td><td>第10章・第14章</td><td>各段の失敗を即座に伝播</td></tr>
<tr><td>%wによるエラーラップ</td><td>第14章</td><td>どの段で失敗したかの文脈追加</td></tr>
<tr><td>errors.Is</td><td>第14章</td><td>ラップされていても根本原因を判定</td></tr>
</table>
<h4>設計の考え方</h4>
<p>パイプラインの各段は「値とerrorを返し、エラーなら即return」という同じ形の繰り返しです。このとき<strong>そのままerrを返すのではなく、<code>%w</code>で包んで文脈を足す</strong>のがポイントです。</p>
<pre><code>h1, err := half(n)
if err != nil {
    return 0, fmt.Errorf("1段目: %w", err)
}</code></pre>
<p>こうすると最終的なエラーメッセージは「1段目: half(7): 奇数は半分にできません」のように、外側から内側へ失敗の経路が読める形になります。<code>%v</code>ではなく<code>%w</code>を使うことで、元のエラーが「包まれたまま保持」される点が重要です。</p>
<p>根本原因の判定には<code>errors.Is</code>を使います。番兵エラー（あらかじめ<code>var ErrOdd = errors.New(...)</code>として定義しておく比較用のエラー値）に対して、何重にラップされていても一致を調べられます。</p>
<pre><code>if errors.Is(err, ErrOdd) {
    // 文字列比較ではなく、エラーの同一性で判定できる
}</code></pre>
<p>エラーメッセージの文字列を<code>==</code>や<code>strings.Contains</code>で比較するのは壊れやすいアンチパターンです。ラップと<code>errors.Is</code>の組み合わせが、Go 1.13以降の標準的なエラー設計です。</p>`,
      task: `<code>pipeline</code>関数のTODO部分を実装してください。<code>half</code>を2回適用し、エラー時はそれぞれ「1段目: 」「2段目: 」の文脈を<code>%w</code>で付けて返します。mainの<code>errors.Is</code>判定も完成させてください。`,
      code: `package main

import (
	"errors"
	"fmt"
)

// ErrOdd は「奇数だった」ことを表す番兵エラー
var ErrOdd = errors.New("奇数は半分にできません")

// half は偶数を半分にする。奇数ならErrOddをラップして返す
func half(n int) (int, error) {
	if n%2 != 0 {
		return 0, fmt.Errorf("half(%d): %w", n, ErrOdd)
	}
	return n / 2, nil
}

// pipeline はhalfを2回適用する
func pipeline(n int) (int, error) {
	// TODO: half(n)を呼び、エラーなら "1段目: %w" でラップして返す
	// TODO: 結果に対して再度halfを呼び、エラーなら "2段目: %w" で
	// ラップして返す。成功したら最終結果を返す
	return 0, nil
}

func main() {
	for _, n := range []int{20, 10, 7} {
		result, err := pipeline(n)
		if err != nil {
			fmt.Println("失敗:", err)
			// TODO: errors.IsでErrOddが原因か判定し、
			// そうなら「→ 原因は奇数です」と表示する
			continue
		}
		fmt.Printf("%d → %d\\n", n, result)
	}
}`,
      solution: `package main

import (
	"errors"
	"fmt"
)

// ErrOdd は「奇数だった」ことを表す番兵エラー
var ErrOdd = errors.New("奇数は半分にできません")

// half は偶数を半分にする。奇数ならErrOddをラップして返す
func half(n int) (int, error) {
	if n%2 != 0 {
		return 0, fmt.Errorf("half(%d): %w", n, ErrOdd)
	}
	return n / 2, nil
}

// pipeline はhalfを2回適用する
func pipeline(n int) (int, error) {
	h1, err := half(n)
	if err != nil {
		return 0, fmt.Errorf("1段目: %w", err)
	}
	h2, err := half(h1)
	if err != nil {
		return 0, fmt.Errorf("2段目: %w", err)
	}
	return h2, nil
}

func main() {
	for _, n := range []int{20, 10, 7} {
		result, err := pipeline(n)
		if err != nil {
			fmt.Println("失敗:", err)
			if errors.Is(err, ErrOdd) {
				fmt.Println("→ 原因は奇数です")
			}
			continue
		}
		fmt.Printf("%d → %d\\n", n, result)
	}
}`,
      hints: [
        `各段は「値, err := half(...)」→「if err != nil { ラップして return }」の同じ形の繰り返しです。`,
        `ラップは fmt.Errorf("1段目: %w", err) のように%wを使います。判定は if errors.Is(err, ErrOdd) { ... } です。10は1段目成功（5）、2段目で失敗するはずです。`
      ],
      expectedOutput: "20 → 5"
    },
    {
      id: 196,
      title: "図書館の貸出管理（構造体＋インターフェース）",
      explanation: `<p>本の貸出・返却を管理するシステムを作ります。「貸出できるもの」をインターフェースとして抽象化することで、将来DVDや雑誌が増えても図書館側のコードを変えずに済む設計を体験します。</p>
<h4>使う知識の整理</h4>
<table>
<tr><th>知識</th><th>学んだ章</th><th>この課題での役割</th></tr>
<tr><td>構造体とポインタレシーバ</td><td>第11章・第12章</td><td>本の状態（貸出中か）の管理</td></tr>
<tr><td>インターフェース</td><td>第13章</td><td>「貸出できるもの」の抽象化</td></tr>
<tr><td>エラーを返すメソッド</td><td>第14章</td><td>貸出中の二重貸出を防ぐ</td></tr>
</table>
<h4>設計の考え方</h4>
<p>ポイントは、<code>Library</code>が<code>Book</code>という具体型ではなく<code>Lendable</code>インターフェースのスライスを持つことです。</p>
<pre><code>type Lendable interface {
    Lend() error
    Return()
    Name() string
}

type Library struct {
    items []Lendable // 具体型を知らない
}</code></pre>
<p>Libraryは「名前で探して、貸出を試みる」ことしか知りません。相手が本かDVDかは関係なく、<code>Lendable</code>を満たす型なら何でも管理できます。これが第13章で学んだ「<strong>利用側が必要な振る舞いだけをインターフェースに定義する</strong>」というGoの設計思想です。</p>
<p>もう1つの注意点はレシーバの種類です。<code>Lend()</code>は<code>Borrowed</code>フィールドを書き換えるため、<strong>ポインタレシーバ</strong>でなければなりません。値レシーバにするとコピーに対する変更となり、貸出状態が保存されません。そのためLibraryに登録するのも<code>&amp;Book{...}</code>とポインタにする必要があります。</p>
<p>二重貸出の防止は、Lend内で状態を確認してエラーを返すことで実現します。状態チェックと状態変更を同じメソッド内で行うことで、ルールの抜け道をなくしています。</p>`,
      task: `<code>Lend</code>メソッドと<code>Borrow</code>メソッドのTODO部分を実装してください。<code>Lend</code>は貸出中なら「（タイトル）は貸出中です」のエラーを返し、<code>Borrow</code>はタイトルが一致した本の貸出を試みて結果を表示します。`,
      code: `package main

import "fmt"

// Lendable は貸出できるものの振る舞いを定義する
type Lendable interface {
	Lend() error
	Return()
	Name() string
}

type Book struct {
	Title    string
	Borrowed bool
}

// Lend は貸出処理を行う。すでに貸出中ならエラーを返す
func (b *Book) Lend() error {
	// TODO: b.Borrowedがtrueなら
	// fmt.Errorf("%sは貸出中です", b.Title) を返す。
	// そうでなければBorrowedをtrueにしてnilを返す
	return nil
}

func (b *Book) Return() { b.Borrowed = false }

func (b *Book) Name() string { return b.Title }

type Library struct {
	items []Lendable
}

// Borrow はタイトルが一致するものを探して貸出を試みる
func (l *Library) Borrow(title string) {
	for _, item := range l.items {
		if item.Name() == title {
			// TODO: item.Lend()を呼び、エラーなら「失敗: エラー内容」、
			// 成功なら「貸出成功: タイトル」と表示してreturnする
			return
		}
	}
	fmt.Println("見つかりません:", title)
}

func main() {
	lib := &Library{items: []Lendable{
		&Book{Title: "Go入門"},
		&Book{Title: "並行処理の基礎"},
	}}
	lib.Borrow("Go入門")
	lib.Borrow("Go入門") // 2回目は貸出中エラー
	lib.Borrow("存在しない本")
}`,
      solution: `package main

import "fmt"

// Lendable は貸出できるものの振る舞いを定義する
type Lendable interface {
	Lend() error
	Return()
	Name() string
}

type Book struct {
	Title    string
	Borrowed bool
}

// Lend は貸出処理を行う。すでに貸出中ならエラーを返す
func (b *Book) Lend() error {
	if b.Borrowed {
		return fmt.Errorf("%sは貸出中です", b.Title)
	}
	b.Borrowed = true
	return nil
}

func (b *Book) Return() { b.Borrowed = false }

func (b *Book) Name() string { return b.Title }

type Library struct {
	items []Lendable
}

// Borrow はタイトルが一致するものを探して貸出を試みる
func (l *Library) Borrow(title string) {
	for _, item := range l.items {
		if item.Name() == title {
			if err := item.Lend(); err != nil {
				fmt.Println("失敗:", err)
				return
			}
			fmt.Println("貸出成功:", title)
			return
		}
	}
	fmt.Println("見つかりません:", title)
}

func main() {
	lib := &Library{items: []Lendable{
		&Book{Title: "Go入門"},
		&Book{Title: "並行処理の基礎"},
	}}
	lib.Borrow("Go入門")
	lib.Borrow("Go入門") // 2回目は貸出中エラー
	lib.Borrow("存在しない本")
}`,
      hints: [
        `Lendは「状態チェック→エラーor状態変更」の早期リターン型です。Borrowedフィールドを書き換えるのでポインタレシーバである点に注目してください。`,
        `Borrowでは if err := item.Lend(); err != nil { fmt.Println("失敗:", err); return } と書き、その後に成功メッセージを表示します。`
      ],
      expectedOutput: "失敗: Go入門は貸出中です"
    },
    {
      id: 197,
      title: "Shapeインターフェースで多態（面積計算）",
      explanation: `<p>インターフェースによる<strong>多態（ポリモーフィズム）</strong>の定番課題です。長方形と円という異なる型を「面積を計算できるもの」として同一視し、1つのループで合計面積を求めます。</p>
<h4>使う知識の整理</h4>
<table>
<tr><th>知識</th><th>学んだ章</th><th>この課題での役割</th></tr>
<tr><td>インターフェース</td><td>第13章</td><td>異なる図形の同一視</td></tr>
<tr><td>値レシーバのメソッド</td><td>第12章</td><td>各図形の面積計算</td></tr>
<tr><td>mathパッケージ</td><td>第9章</td><td>円周率math.Pi</td></tr>
</table>
<h4>設計の考え方</h4>
<pre><code>type Shape interface {
    Area() float64
    Name() string
}</code></pre>
<p>Goのインターフェースは<strong>暗黙的に満たされる</strong>のが特徴です。<code>Rectangle</code>や<code>Circle</code>は「Shapeを実装します」と宣言する必要がなく、<code>Area()</code>と<code>Name()</code>を持ってさえいれば自動的に<code>Shape</code>として扱えます。新しい図形（三角形など）を追加するときも、既存コードには一切手を入れず、新しい型とメソッドを書くだけで済みます。これが「拡張に開いていて、修正に閉じている」設計です。</p>
<p>合計計算のループは、相手の具体的な型をまったく気にしません。</p>
<pre><code>shapes := []Shape{Rectangle{W: 3, H: 4}, Circle{R: 2}}
total := 0.0
for _, s := range shapes {
    total += s.Area() // どの型かはループは知らない
}</code></pre>
<p>今回のメソッドは状態を変更しないため、<strong>値レシーバ</strong>で十分です（前ステップのLendとの対比に注目してください）。浮動小数点数の表示には<code>%.2f</code>（小数点以下2桁）を使い、桁数を固定して読みやすくします。円の面積には<code>math.Pi</code>を使いましょう。</p>`,
      task: `<code>Circle</code>型に<code>Area()</code>と<code>Name()</code>メソッドを実装して、<code>Shape</code>インターフェースを満たすようにしてください。面積は<code>math.Pi * r * r</code>、名前は「円」を返します。`,
      code: `package main

import (
	"fmt"
	"math"
)

type Shape interface {
	Area() float64
	Name() string
}

type Rectangle struct{ W, H float64 }

func (r Rectangle) Area() float64 { return r.W * r.H }
func (r Rectangle) Name() string  { return "長方形" }

type Circle struct{ R float64 }

// TODO: CircleにArea()メソッドを実装する（math.Pi * R * R）

// TODO: CircleにName()メソッドを実装する（"円"を返す）

func main() {
	shapes := []Shape{
		Rectangle{W: 3, H: 4},
		Circle{R: 2}, // Shapeを満たしていないとここでコンパイルエラー
		Rectangle{W: 5, H: 6},
	}
	total := 0.0
	for _, s := range shapes {
		fmt.Printf("%s: %.2f\\n", s.Name(), s.Area())
		total += s.Area()
	}
	fmt.Printf("合計面積: %.2f\\n", total)
}`,
      solution: `package main

import (
	"fmt"
	"math"
)

type Shape interface {
	Area() float64
	Name() string
}

type Rectangle struct{ W, H float64 }

func (r Rectangle) Area() float64 { return r.W * r.H }
func (r Rectangle) Name() string  { return "長方形" }

type Circle struct{ R float64 }

func (c Circle) Area() float64 { return math.Pi * c.R * c.R }
func (c Circle) Name() string  { return "円" }

func main() {
	shapes := []Shape{
		Rectangle{W: 3, H: 4},
		Circle{R: 2},
		Rectangle{W: 5, H: 6},
	}
	total := 0.0
	for _, s := range shapes {
		fmt.Printf("%s: %.2f\\n", s.Name(), s.Area())
		total += s.Area()
	}
	fmt.Printf("合計面積: %.2f\\n", total)
}`,
      hints: [
        `Rectangleのメソッド定義と同じ形で、レシーバをCircleにした2つのメソッドを書きます。`,
        `func (c Circle) Area() float64 { return math.Pi * c.R * c.R } のように書きます。実装すると宣言なしで自動的にShapeを満たします。`
      ],
      expectedOutput: "合計面積: 54.57"
    },
    {
      id: 198,
      title: "簡易スタックマシン（スライス＋switch）",
      explanation: `<p>逆ポーランド記法（RPN：演算子を数値の後ろに書く記法。「2 3 +」は「2+3」の意味）の式を計算する、小さなスタックマシンを作ります。電卓、仮想マシン、コンパイラの基礎となる由緒正しい題材です。</p>
<h4>使う知識の整理</h4>
<table>
<tr><th>知識</th><th>学んだ章</th><th>この課題での役割</th></tr>
<tr><td>スライスのappendと切り詰め</td><td>第6章・第19章</td><td>スタックのpush/pop</td></tr>
<tr><td>switch文</td><td>第5章</td><td>トークン（字句）の種類による分岐</td></tr>
<tr><td>strconv.Atoi</td><td>第9章</td><td>文字列から数値への変換</td></tr>
<tr><td>エラー処理</td><td>第14章</td><td>不正な式の検出</td></tr>
</table>
<h4>設計の考え方</h4>
<p>Goには専用のスタック型はなく、スライスで表現するのが慣例です。</p>
<pre><code>stack = append(stack, n)         // push：末尾に積む
top := stack[len(stack)-1]       // 末尾を見る
stack = stack[:len(stack)-1]     // pop：末尾を切り詰める</code></pre>
<p>アルゴリズムは単純明快です。トークンを順に見て、<strong>数値ならpush、演算子なら2つpopして計算結果をpush</strong>。式が正しければ最後にスタックへ1つだけ値が残り、それが答えです。</p>
<p>注意点はpopの順序です。「a - b」を計算するとき、先にpopされるのは後に積まれた<code>b</code>です。順序を逆にすると引き算と掛け算以外は気づきにくいバグになります。</p>
<pre><code>b := stack[len(stack)-1] // 2番目のオペランド
a := stack[len(stack)-2] // 1番目のオペランド
stack = stack[:len(stack)-2]</code></pre>
<p>また、不正な入力（オペランド不足、数値でも演算子でもないトークン）を検出してエラーを返すことで、パニックせず安全に失敗するプログラムになります。「2 3 + 4 *」は(2+3)×4=20と計算されるはずです。</p>`,
      task: `<code>evalRPN</code>の演算子ケースのTODO部分を実装してください。スタックから2つの値をpop（bが先、aが後）し、演算子に応じて計算した結果をpushします。`,
      code: `package main

import (
	"fmt"
	"strconv"
)

// evalRPN は逆ポーランド記法のトークン列を計算する
func evalRPN(tokens []string) (int, error) {
	stack := []int{}
	for _, t := range tokens {
		switch t {
		case "+", "-", "*":
			if len(stack) < 2 {
				return 0, fmt.Errorf("オペランドが足りません: %s", t)
			}
			// TODO: bとaをpopする（末尾がb、その手前がa）
			// スタックを2つ分切り詰め、演算子に応じて
			// a+b / a-b / a*b を計算してpushする
		default:
			n, err := strconv.Atoi(t)
			if err != nil {
				return 0, fmt.Errorf("不正なトークン: %s", t)
			}
			stack = append(stack, n) // 数値はpush
		}
	}
	if len(stack) != 1 {
		return 0, fmt.Errorf("式が不完全です")
	}
	return stack[0], nil
}

func main() {
	// (2 + 3) * 4 を逆ポーランド記法にすると 2 3 + 4 *
	tokens := []string{"2", "3", "+", "4", "*"}
	result, err := evalRPN(tokens)
	if err != nil {
		fmt.Println("エラー:", err)
		return
	}
	fmt.Println("計算結果:", result)
}`,
      solution: `package main

import (
	"fmt"
	"strconv"
)

// evalRPN は逆ポーランド記法のトークン列を計算する
func evalRPN(tokens []string) (int, error) {
	stack := []int{}
	for _, t := range tokens {
		switch t {
		case "+", "-", "*":
			if len(stack) < 2 {
				return 0, fmt.Errorf("オペランドが足りません: %s", t)
			}
			b := stack[len(stack)-1] // 後に積まれた方が2番目のオペランド
			a := stack[len(stack)-2]
			stack = stack[:len(stack)-2]
			var r int
			switch t {
			case "+":
				r = a + b
			case "-":
				r = a - b
			case "*":
				r = a * b
			}
			stack = append(stack, r)
		default:
			n, err := strconv.Atoi(t)
			if err != nil {
				return 0, fmt.Errorf("不正なトークン: %s", t)
			}
			stack = append(stack, n) // 数値はpush
		}
	}
	if len(stack) != 1 {
		return 0, fmt.Errorf("式が不完全です")
	}
	return stack[0], nil
}

func main() {
	// (2 + 3) * 4 を逆ポーランド記法にすると 2 3 + 4 *
	tokens := []string{"2", "3", "+", "4", "*"}
	result, err := evalRPN(tokens)
	if err != nil {
		fmt.Println("エラー:", err)
		return
	}
	fmt.Println("計算結果:", result)
}`,
      hints: [
        `popは「末尾の値を読む→スライスを切り詰める」の2段階です。b := stack[len(stack)-1]、a := stack[len(stack)-2]、stack = stack[:len(stack)-2] と書きます。`,
        `計算はswitch文をネストして、"+"ならa+b、"-"ならa-b、"*"ならa*bを変数rに入れ、stack = append(stack, r) でpushします。`
      ],
      expectedOutput: "計算結果: 20"
    },
    {
      id: 199,
      title: "並列ワードカウント（ゴルーチン＋チャネル＋WaitGroup）",
      explanation: `<p>複数行のテキストを行ごとにgoroutineで並列処理し、単語数を集計します。「分割→並列処理→集約」は、並行処理の最も基本的で実用的なパターン（fan-out/fan-in）です。</p>
<h4>使う知識の整理</h4>
<table>
<tr><th>知識</th><th>学んだ章</th><th>この課題での役割</th></tr>
<tr><td>goroutine</td><td>第16章</td><td>各行の処理を並列化</td></tr>
<tr><td>バッファ付きチャネル</td><td>第16章</td><td>各goroutineの結果の回収</td></tr>
<tr><td>sync.WaitGroup</td><td>第16章</td><td>全goroutineの完了待ち</td></tr>
<tr><td>strings.Fields</td><td>第9章</td><td>行の単語分割</td></tr>
</table>
<h4>設計の考え方</h4>
<p>この構成には並行処理の重要な約束事が詰まっています。</p>
<ul>
<li><strong>WaitGroupの3点セット</strong>：起動前に<code>wg.Add(1)</code>、goroutine内の先頭で<code>defer wg.Done()</code>、回収前に<code>wg.Wait()</code>。Addをgoroutineの中に書くと、Waitが先に通過してしまう競合が起きえます</li>
<li><strong>バッファ付きチャネル</strong>：<code>make(chan int, len(lines))</code>と行数分のバッファを確保しておけば、送信側は受信を待たずに結果を置いて終了できます</li>
<li><strong>closeしてからrange</strong>：全goroutineの完了後に<code>close(results)</code>すると、<code>for c := range results</code>がバッファの中身を読み切って自然に終了します</li>
</ul>
<pre><code>wg.Wait()      // 全員の完了を待つ
close(results) // もう送信は来ないと宣言する
for c := range results {
    total += c // 集約
}</code></pre>
<p>大事な注意点として、goroutineの<strong>実行順序は毎回変わる</strong>ため、途中経過を表示すると出力順は不定になります。しかし合計値は足し算の順序によらず同じなので、<strong>最終結果だけは決定的</strong>です。並行処理では「途中は非決定的でも、集約結果は決定的」になるよう設計するのが定石です。</p>`,
      task: `TODO部分を実装してください。(1)<code>countWords</code>は行の単語数を<code>results</code>チャネルに送信する（<code>defer wg.Done()</code>を忘れずに）。(2)mainのループで<code>wg.Add(1)</code>してからgoroutineを起動する。`,
      code: `package main

import (
	"fmt"
	"strings"
	"sync"
)

// countWords は1行の単語数を数えてresultsに送る
func countWords(line string, results chan<- int, wg *sync.WaitGroup) {
	// TODO: defer wg.Done() を書き、
	// strings.Fieldsで単語に分割した数をresultsに送信する
}

func main() {
	lines := []string{
		"go is expressive and clean",
		"concurrency is not parallelism",
		"channels orchestrate goroutines",
		"do not communicate by sharing memory",
	}

	results := make(chan int, len(lines)) // バッファ付きチャネル
	var wg sync.WaitGroup

	for _, line := range lines {
		// TODO: wg.Add(1)してから、goでcountWordsを起動する
		_ = line
	}

	wg.Wait()      // 全goroutineの完了を待つ
	close(results) // これでrangeが終了できる

	total := 0
	for c := range results {
		total += c
	}
	fmt.Println("処理した行数:", len(lines))
	fmt.Println("合計単語数:", total)
}`,
      solution: `package main

import (
	"fmt"
	"strings"
	"sync"
)

// countWords は1行の単語数を数えてresultsに送る
func countWords(line string, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	results <- len(strings.Fields(line))
}

func main() {
	lines := []string{
		"go is expressive and clean",
		"concurrency is not parallelism",
		"channels orchestrate goroutines",
		"do not communicate by sharing memory",
	}

	results := make(chan int, len(lines)) // バッファ付きチャネル
	var wg sync.WaitGroup

	for _, line := range lines {
		wg.Add(1)
		go countWords(line, results, &wg)
	}

	wg.Wait()      // 全goroutineの完了を待つ
	close(results) // これでrangeが終了できる

	total := 0
	for c := range results {
		total += c
	}
	fmt.Println("処理した行数:", len(lines))
	fmt.Println("合計単語数:", total)
}`,
      hints: [
        `countWordsの中身は defer wg.Done() と results <- len(strings.Fields(line)) の2行です。`,
        `mainのループでは wg.Add(1) を書いてから go countWords(line, results, &wg) と起動します（_ = line は削除）。WaitGroupはポインタで渡す点に注意してください。`
      ],
      expectedOutput: "合計単語数: 18"
    },
    {
      id: 200,
      title: "卒業課題：家計簿ミニアプリ",
      explanation: `<p>いよいよ最終ステップです。支出の登録・カテゴリ別集計・レポート出力を備えた家計簿ミニアプリを完成させます。これまで学んだ知識の集大成です。</p>
<h4>使う知識の整理</h4>
<table>
<tr><th>知識</th><th>学んだ章</th><th>この課題での役割</th></tr>
<tr><td>構造体のスライス</td><td>第6章・第11章</td><td>支出明細（Entry）の記録</td></tr>
<tr><td>ポインタレシーバのメソッド</td><td>第12章</td><td>Ledgerへの登録・集計・出力</td></tr>
<tr><td>マップでの集計</td><td>第8章</td><td>カテゴリ→合計金額</td></tr>
<tr><td>キーのソート</td><td>第15章</td><td>レポートの表示順の固定</td></tr>
<tr><td>Printfの書式指定</td><td>第3章</td><td>金額の桁揃え</td></tr>
</table>
<h4>設計の考え方</h4>
<p>このアプリは3層の責務に分かれています。</p>
<ol>
<li><strong>記録</strong>：<code>Add</code>は明細をスライスに追記するだけ。元データを加工せずに残すことで、後からどんな集計でも作れます</li>
<li><strong>集計</strong>：<code>Summary</code>は明細からカテゴリ別合計のマップを毎回作ります。「元データと集計結果を別に持つ」ことで、二重管理による不整合を避けます</li>
<li><strong>表示</strong>：<code>Report</code>は集計結果を整形して出力します。マップの順序は不定なので、キーをソートしてから表示するのは第194ステップで身につけたイディオムです</li>
</ol>
<pre><code>type Entry struct {
    Category string
    Name     string
    Amount   int
}

type Ledger struct {
    entries []Entry
}</code></pre>
<p>「記録・集計・表示を分ける」構造は、データベースを使う実務アプリでもそのまま通用する考え方です。ここまでの200ステップで、あなたは変数からgoroutineまでGoの主要機能を一通り使えるようになりました。次の一歩は、標準ライブラリのドキュメントを読みながら自分の作りたいものを作ることです。おめでとうございます、そして良いGoライフを！</p>`,
      task: `<code>Summary</code>と<code>Report</code>のTODO部分を実装してください。<code>Summary</code>はカテゴリ別合計のマップを返し、<code>Report</code>はキーをソートして「カテゴリ 金額円」を表示し、最後に「合計: N円」を出力します。`,
      code: `package main

import (
	"fmt"
	"sort"
)

// Entry は1件の支出明細
type Entry struct {
	Category string
	Name     string
	Amount   int
}

// Ledger は家計簿本体
type Ledger struct {
	entries []Entry
}

// Add は支出を1件登録する
func (l *Ledger) Add(category, name string, amount int) {
	l.entries = append(l.entries, Entry{Category: category, Name: name, Amount: amount})
}

// Summary はカテゴリ別の合計金額マップを返す
func (l *Ledger) Summary() map[string]int {
	m := map[string]int{}
	// TODO: 全明細をループして、カテゴリごとにAmountを合計する
	return m
}

// Report は集計結果を整形して表示する
func (l *Ledger) Report() {
	sum := l.Summary()
	fmt.Println("===== 家計簿レポート =====")
	// TODO: sumのキーをスライスに集めてsort.Stringsでソートし、
	// 「カテゴリ 金額円」の形式で表示しながら総合計totalを計算する
	total := 0
	fmt.Printf("合計: %d円\\n", total)
}

func main() {
	l := &Ledger{}
	l.Add("食費", "ランチ", 900)
	l.Add("交通費", "電車", 440)
	l.Add("食費", "スーパー", 3200)
	l.Add("娯楽", "映画", 1900)
	l.Add("交通費", "バス", 220)
	l.Report()
}`,
      solution: `package main

import (
	"fmt"
	"sort"
)

// Entry は1件の支出明細
type Entry struct {
	Category string
	Name     string
	Amount   int
}

// Ledger は家計簿本体
type Ledger struct {
	entries []Entry
}

// Add は支出を1件登録する
func (l *Ledger) Add(category, name string, amount int) {
	l.entries = append(l.entries, Entry{Category: category, Name: name, Amount: amount})
}

// Summary はカテゴリ別の合計金額マップを返す
func (l *Ledger) Summary() map[string]int {
	m := map[string]int{}
	for _, e := range l.entries {
		m[e.Category] += e.Amount
	}
	return m
}

// Report は集計結果を整形して表示する
func (l *Ledger) Report() {
	sum := l.Summary()
	fmt.Println("===== 家計簿レポート =====")
	// マップの順序は不定なので、キーをソートして表示順を固定する
	keys := make([]string, 0, len(sum))
	for k := range sum {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	total := 0
	for _, k := range keys {
		fmt.Printf("%s %d円\\n", k, sum[k])
		total += sum[k]
	}
	fmt.Printf("合計: %d円\\n", total)
}

func main() {
	l := &Ledger{}
	l.Add("食費", "ランチ", 900)
	l.Add("交通費", "電車", 440)
	l.Add("食費", "スーパー", 3200)
	l.Add("娯楽", "映画", 1900)
	l.Add("交通費", "バス", 220)
	l.Report()
}`,
      hints: [
        `Summaryは for _, e := range l.entries { m[e.Category] += e.Amount } の集計イディオムです。`,
        `Reportは第194ステップと同じ「キー収集→sort.Strings→順に表示」の流れです。表示しながら total += sum[k] で総合計も計算します。食費4100円、交通費660円、娯楽1900円、合計6660円になるはずです。`
      ],
      expectedOutput: "合計: 6660円"
    }
  ]
});
