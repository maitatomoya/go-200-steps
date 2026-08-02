// 第12章：ジェネリクス
registerChapter({
  number: 12,
  title: "ジェネリクス",
  description: "Go 1.18で導入されたジェネリクス（型パラメータ）を学びます。型ごとの重複コードをなくし、slicesやmapsといった標準パッケージも使いこなせるようになります。",
  steps: [
    {
      id: 111,
      title: "なぜジェネリクスが必要か（型ごとの重複関数）",
      explanation: `<p>「2つの値のうち大きい方を返す関数」を書いてみましょう。int用ならすぐ書けます。では、float64でも同じことをしたくなったら？</p>
<pre><code>func maxInt(a, b int) int {
    if a > b {
        return a
    }
    return b
}

func maxFloat64(a, b float64) float64 {
    if a > b {
        return a
    }
    return b
}</code></pre>
<p>中身のロジックは完全に同じなのに、<strong>型が違うだけで関数を丸ごとコピーする</strong>はめになりました。int64用、string用…と増えるたびにコピーが必要で、ロジックを修正するときは全部の関数を直さなければなりません。これが「型ごとの重複コード」問題です。</p>
<p>Go 1.18より前は、この問題への対処法は主に2つでした。</p>
<ul>
<li>型ごとに関数を複製する（上の例。安全だが重複だらけ）</li>
<li><code>interface{}</code>で何でも受け取る（重複はないが、型の保証が失われ実行時エラーの危険がある）</li>
</ul>
<p>どちらも一長一短でした。そこでGo 1.18で導入されたのが<strong>ジェネリクス（generics：型をパラメータとして受け取る仕組み）</strong>です。「ロジックは1つ、対応する型は複数」を型安全なまま実現できます。</p>
<p>このステップではまず、あえてジェネリクスを使わずに重複コードを書いて「不便さ」を体感します。次のステップでこれが1つの関数にまとまる気持ちよさを味わってください。なお、重複が2〜3箇所程度で今後も増えない見込みなら、無理にジェネリクスを使わずコピーで済ませる判断もGoでは普通です。道具の必要性を理解してから使うのが上達の近道です。</p>`,
      task: `<code>maxInt</code>を参考に、float64版の<code>maxFloat64</code>関数を追加して、コメントアウトされている出力行を有効にしてください。「同じロジックのコピー」であることを体感しましょう。`,
      code: `package main

import "fmt"

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// TODO: maxIntと同じロジックでfloat64版のmaxFloat64を書く

func main() {
	fmt.Println("int:", maxInt(10, 20))

	// TODO: 下の行のコメントを外す
	// fmt.Println("float64:", maxFloat64(2.5, 3.5))
}
`,
      solution: `package main

import "fmt"

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// ロジックは同じなのに型が違うだけで丸ごとコピーが必要になる
func maxFloat64(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}

func main() {
	fmt.Println("int:", maxInt(10, 20))
	fmt.Println("float64:", maxFloat64(2.5, 3.5))
}
`,
      hints: [
        `maxIntをコピーして、関数名とすべてのintをfloat64に置き換えるだけです。`,
        `func maxFloat64(a, b float64) float64 { ... } という形になります。この「コピーの面倒さ」が次のステップで解消されます。`
      ],
      expectedOutput: "float64: 3.5"
    },
    {
      id: 112,
      title: "型パラメータの構文 func Max[T ...]",
      explanation: `<p>前ステップの重複コードを、ジェネリクスで1つの関数にまとめましょう。関数名の直後に<strong>角括弧で型パラメータ</strong>を書くのが新しい構文です。</p>
<pre><code>func Max[T int | float64](a, b T) T {
    if a > b {
        return a
    }
    return b
}</code></pre>
<p>構文を分解すると次のようになります。</p>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td><code>[T int | float64]</code></td><td>型パラメータの宣言。「Tはintまたはfloat64のどちらか」</td></tr>
<tr><td><code>T</code></td><td>型パラメータ名。慣習的にT（Typeの頭文字）やK、Vを使う</td></tr>
<tr><td><code>int | float64</code></td><td>制約（constraint）。Tに入れられる型の範囲。|は「または」</td></tr>
<tr><td><code>(a, b T) T</code></td><td>引数も戻り値も同じ型Tになる</td></tr>
</table>
<p>呼び出す側は普通の関数とほぼ同じです。</p>
<pre><code>fmt.Println(Max(10, 20))   // 20（Tはintと推論される）
fmt.Println(Max(2.5, 3.5)) // 3.5（Tはfloat64と推論される）</code></pre>
<p>引数から「Tはintだな」とコンパイラが自動で判断してくれます。これを<strong>型推論</strong>といいます（詳しくはステップ117で扱います）。</p>
<p>重要なのは、これが<code>interface{}</code>と違って<strong>型安全</strong>であることです。<code>Max("a", "b")</code>のように制約にない型を渡すと、実行時ではなく<strong>コンパイル時に</strong>エラーになります。また、<code>Max(10, 20)</code>の戻り値はちゃんと<code>int</code>型なので、型変換なしでそのまま計算に使えます。「ロジックは1つ、型チェックはコンパイラにお任せ」がジェネリクスの本質です。</p>`,
      task: `型パラメータを使った<code>Max</code>関数を完成させてください。制約は<code>int | float64</code>とし、int同士とfloat64同士の両方で呼び出して出力します。`,
      code: `package main

import "fmt"

// TODO: 型パラメータ[T int | float64]を追加してジェネリック関数にする
func Max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func main() {
	fmt.Println("整数:", Max(10, 20))

	// TODO: 下の行のコメントを外す（Maxがジェネリックになれば動く）
	// fmt.Println("実数:", Max(2.5, 3.5))
}
`,
      solution: `package main

import "fmt"

// [T int | float64]で「Tはintまたはfloat64」という制約付き型パラメータを宣言する
func Max[T int | float64](a, b T) T {
	if a > b {
		return a
	}
	return b
}

func main() {
	fmt.Println("整数:", Max(10, 20))
	fmt.Println("実数:", Max(2.5, 3.5))
}
`,
      hints: [
        `関数名の直後に[T int | float64]を挿入し、引数と戻り値の型をすべてTに変えます。`,
        `func Max[T int | float64](a, b T) T { ... } という形です。呼び出し側は変更不要です。`
      ],
      expectedOutput: "実数: 3.5"
    },
    {
      id: 113,
      title: "制約interfaceを自作する（Number制約）",
      explanation: `<p><code>[T int | float64]</code>のように制約を毎回書くのは冗長ですし、複数の関数で同じ制約を使い回したくなります。そこでGoでは<strong>制約をinterfaceとして定義</strong>できます。</p>
<pre><code>type Number interface {
    ~int | ~int64 | ~float64
}

func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}</code></pre>
<p>これまで学んだinterfaceは「メソッドの集まり」でしたが、ジェネリクスの制約として使うinterfaceには<strong>型の集合</strong>を書けます。<code>Number</code>は「int・int64・float64のどれか」を表す制約になります。</p>
<h4>チルダ（~）の意味</h4>
<p><code>~int</code>の<code>~</code>は「<strong>基底型（underlying type：定義の元になっている型）がintである型すべて</strong>」を意味します。たとえば<code>type Score int</code>と独自型を定義した場合、</p>
<ul>
<li><code>int</code>だけの制約 → <code>Score</code>は使えない（intそのものではないため）</li>
<li><code>~int</code>の制約 → <code>Score</code>も使える（基底型がintのため）</li>
</ul>
<pre><code>type Score int
scores := []Score{80, 90}
fmt.Println(Sum(scores)) // 170（~intのおかげでScoreも渡せる）</code></pre>
<p>自作の制約を書くときは、独自型もカバーできる<code>~</code>付きにしておくのが定石です。なお、準標準ライブラリのgolang.org/x/expには同様の<code>constraints.Ordered</code>などが定義されていますが、この講座では仕組みを理解するために自作します（標準ライブラリだけで完結する利点もあります）。</p>
<p><code>var total T</code>にも注目してください。Tのゼロ値（intなら0、float64なら0.0）で初期化されるので、どの型でも正しく合計を計算し始められます。</p>`,
      task: `制約interface<code>Number</code>を<code>~int | ~int64 | ~float64</code>で定義し、<code>Sum</code>関数の制約に使ってください。int・float64・独自型Scoreの3種類のスライスで合計を出力します。`,
      code: `package main

import "fmt"

// TODO: ~int | ~int64 | ~float64 を型の集合とする制約interface Numberを定義する

// TODO: 制約をNumberに変更する
func Sum[T int](nums []T) T {
	var total T
	for _, n := range nums {
		total += n
	}
	return total
}

type Score int

func main() {
	fmt.Println("intの合計:", Sum([]int{10, 20, 30}))

	// TODO: 下の2行のコメントを外す
	// fmt.Println("float64の合計:", Sum([]float64{1.5, 2.5}))
	// fmt.Println("Scoreの合計:", Sum([]Score{80, 90}))
}
`,
      solution: `package main

import "fmt"

// 制約interfaceには「型の集合」を書ける
// ~intは「基底型がintである型すべて」を意味する
type Number interface {
	~int | ~int64 | ~float64
}

func Sum[T Number](nums []T) T {
	// var total T はTのゼロ値（0や0.0）で初期化される
	var total T
	for _, n := range nums {
		total += n
	}
	return total
}

type Score int

func main() {
	fmt.Println("intの合計:", Sum([]int{10, 20, 30}))
	fmt.Println("float64の合計:", Sum([]float64{1.5, 2.5}))

	// Scoreの基底型はintなので、~int制約のおかげで渡せる
	fmt.Println("Scoreの合計:", Sum([]Score{80, 90}))
}
`,
      hints: [
        `type Number interface { ~int | ~int64 | ~float64 } のように、interfaceの中に型の集合を書きます。`,
        `Sumの型パラメータを[T Number]に変えます。~がないとScore型（基底型がintの独自型）が使えなくなる点に注意してください。`
      ],
      expectedOutput: "intの合計: 60"
    },
    {
      id: 114,
      title: "anyとcomparable",
      explanation: `<p>Goには最初から用意されている組み込みの制約が2つあります。<code>any</code>と<code>comparable</code>です。</p>
<table>
<tr><th>制約</th><th>意味</th><th>できること</th></tr>
<tr><td><code>any</code></td><td>すべての型（interface{}の別名）</td><td>代入・受け渡しのみ（演算や比較は不可）</td></tr>
<tr><td><code>comparable</code></td><td>==と!=で比較できる型</td><td>等値比較。mapのキーにもできる</td></tr>
</table>
<p><code>any</code>は「どんな型でもよい」という最も緩い制約です。型に対して何も要求しないため、Tの値同士を<code>==</code>で比較したり<code>+</code>で足したりはできません。「受け取って、保持して、返す」だけの処理に向いています。</p>
<pre><code>// 最初の要素を返すだけなら、Tに何の能力も要求しない
func First[T any](s []T) T {
    return s[0]
}</code></pre>
<p>一方、「スライスの中から特定の値を探す」には<code>==</code>での比較が必要です。そこで<code>comparable</code>の出番です。</p>
<pre><code>func IndexOf[T comparable](s []T, target T) int {
    for i, v := range s {
        if v == target {
            return i
        }
    }
    return -1
}</code></pre>
<p>これを<code>[T any]</code>にすると、<code>v == target</code>の行がコンパイルエラーになります。<strong>制約は「Tに対して何ができるか」をコンパイラに伝える契約</strong>なのです。比較したいならcomparable、足し算したいなら前ステップのNumberのような数値制約、何もしないならany——と、処理に必要な最小限の制約を選ぶのが設計のコツです。</p>
<p>ちなみにintやstringはcomparableですが、スライスや関数は<code>==</code>で比較できないためcomparableではありません。<code>IndexOf([][]int{...}, ...)</code>のような呼び出しはコンパイル時に弾かれます。</p>`,
      task: `<code>IndexOf</code>関数の制約が<code>any</code>になっているためコンパイルエラーになります。エラーメッセージを確認し、正しい制約に直して実行してください。`,
      code: `package main

import "fmt"

// このままだと v == target の行でコンパイルエラーになる
// invalid operation: v == target (incomparable types in type set)
// TODO: 制約をanyから適切なものに変更する
func IndexOf[T any](s []T, target T) int {
	for i, v := range s {
		if v == target {
			return i
		}
	}
	return -1
}

func main() {
	fruits := []string{"apple", "banana", "cherry"}
	fmt.Println("bananaの位置:", IndexOf(fruits, "banana"))
	fmt.Println("grapeの位置:", IndexOf(fruits, "grape"))

	nums := []int{10, 20, 30}
	fmt.Println("30の位置:", IndexOf(nums, 30))
}
`,
      solution: `package main

import "fmt"

// ==で比較するのでcomparable制約が必要
// anyのままだと「Tが比較可能である保証がない」とコンパイラに怒られる
func IndexOf[T comparable](s []T, target T) int {
	for i, v := range s {
		if v == target {
			return i
		}
	}
	return -1
}

func main() {
	fruits := []string{"apple", "banana", "cherry"}
	fmt.Println("bananaの位置:", IndexOf(fruits, "banana"))
	fmt.Println("grapeの位置:", IndexOf(fruits, "grape"))

	nums := []int{10, 20, 30}
	fmt.Println("30の位置:", IndexOf(nums, 30))
}
`,
      hints: [
        `関数の中で v == target と比較しています。==が使える保証をコンパイラに伝える制約は何だったでしょうか。`,
        `[T any]を[T comparable]に変更するだけで動きます。`
      ],
      expectedOutput: "bananaの位置: 1"
    },
    {
      id: 115,
      title: "ジェネリックなスライス操作関数（Map・Filterを自作）",
      explanation: `<p>他の言語でおなじみの<code>map</code>（全要素を変換）と<code>filter</code>（条件に合う要素だけ抽出）を、ジェネリクスで自作してみましょう。関数を引数に取る「高階関数」とジェネリクスの組み合わせです。</p>
<pre><code>// Map：[]Tの各要素にfを適用して[]Uを作る
func Map[T, U any](s []T, f func(T) U) []U {
    result := make([]U, 0, len(s))
    for _, v := range s {
        result = append(result, f(v))
    }
    return result
}

// Filter：fがtrueを返す要素だけを集める
func Filter[T any](s []T, f func(T) bool) []T {
    result := make([]T, 0)
    for _, v := range s {
        if f(v) {
            result = append(result, v)
        }
    }
    return result
}</code></pre>
<p>Mapのポイントは型パラメータが<strong>2つ</strong>あることです。<code>[T, U any]</code>のTが入力の要素型、Uが出力の要素型です。TとUが別の型でもよいので、「intのスライス→stringのスライス」のような変換もできます。</p>
<pre><code>nums := []int{1, 2, 3, 4, 5}
doubled := Map(nums, func(n int) int { return n * 2 })
// [2 4 6 8 10]

labels := Map(nums, func(n int) string { return strconv.Itoa(n) + "個" })
// [1個 2個 3個 4個 5個]（int→stringの変換）

evens := Filter(nums, func(n int) bool { return n%2 == 0 })
// [2 4]</code></pre>
<p><code>make([]U, 0, len(s))</code>は「長さ0、容量len(s)」でスライスを作るイディオムです。結果の要素数が最大len(s)だと分かっているので、あらかじめ容量を確保してappend時の再割り当てを防いでいます。</p>
<p>なおGoの標準ライブラリにはMap・Filterはあえて用意されていません（forループで十分読みやすいという設計思想のため）。それでも自作できる力は、ジェネリクスの理解度を測るよい試金石です。</p>`,
      task: `<code>Filter</code>関数を完成させてください。<code>Map</code>の実装を参考に、条件関数<code>f</code>がtrueを返す要素だけを結果に追加します。完成したら偶数の抽出結果が出力されます。`,
      code: `package main

import "fmt"

func Map[T, U any](s []T, f func(T) U) []U {
	result := make([]U, 0, len(s))
	for _, v := range s {
		result = append(result, f(v))
	}
	return result
}

func Filter[T any](s []T, f func(T) bool) []T {
	result := make([]T, 0)
	// TODO: sの各要素vについて、f(v)がtrueならresultに追加する
	return result
}

func main() {
	nums := []int{1, 2, 3, 4, 5}

	doubled := Map(nums, func(n int) int { return n * 2 })
	fmt.Println("2倍:", doubled)

	evens := Filter(nums, func(n int) bool { return n%2 == 0 })
	fmt.Println("偶数:", evens)
}
`,
      solution: `package main

import "fmt"

// Tが入力の要素型、Uが出力の要素型。別の型でもよい
func Map[T, U any](s []T, f func(T) U) []U {
	result := make([]U, 0, len(s))
	for _, v := range s {
		result = append(result, f(v))
	}
	return result
}

// 条件関数fがtrueを返した要素だけを集める
func Filter[T any](s []T, f func(T) bool) []T {
	result := make([]T, 0)
	for _, v := range s {
		if f(v) {
			result = append(result, v)
		}
	}
	return result
}

func main() {
	nums := []int{1, 2, 3, 4, 5}

	doubled := Map(nums, func(n int) int { return n * 2 })
	fmt.Println("2倍:", doubled)

	evens := Filter(nums, func(n int) bool { return n%2 == 0 })
	fmt.Println("偶数:", evens)
}
`,
      hints: [
        `Mapと同じようにfor rangeで回しますが、appendする前にif f(v)の判定を挟みます。`,
        `for _, v := range s { if f(v) { result = append(result, v) } } と書きます。`
      ],
      expectedOutput: "偶数: [2 4]"
    },
    {
      id: 116,
      title: "ジェネリック型（Stack[T]）",
      explanation: `<p>ジェネリクスは関数だけでなく<strong>型（構造体）にも使えます</strong>。どんな型の値でも積めるスタック（後入れ先出しのデータ構造。積んだ順と逆の順で取り出す）を作ってみましょう。</p>
<pre><code>type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(v T) {
    s.items = append(s.items, v)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false // 空のときはゼロ値とfalseを返す
    }
    v := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return v, true
}</code></pre>
<p>ポイントを整理します。</p>
<ul>
<li><strong>型定義</strong>：<code>type Stack[T any] struct</code>と、型名の直後に型パラメータを書く</li>
<li><strong>メソッド</strong>：レシーバは<code>(s *Stack[T])</code>と書く。メソッド側で新たに制約は書けず、型定義の制約を引き継ぐ</li>
<li><strong>ゼロ値の返し方</strong>：<code>return nil, false</code>とは書けない（Tがintかもしれないため）。<code>var zero T</code>でTのゼロ値を作って返すのが定石</li>
<li><strong>使うとき</strong>：<code>var s Stack[int]</code>のように具体的な型を指定してから使う</li>
</ul>
<pre><code>var s Stack[int]
s.Push(10)
s.Push(20)
v, ok := s.Pop()
fmt.Println(v, ok) // 20 true（最後に積んだものが先に出る）

var names Stack[string] // string版も同じ型定義から作れる
names.Push("Go")</code></pre>
<p>Popが<code>(T, bool)</code>の2値を返すのは、mapのカンマokイディオムと同じ発想です。「空のスタックからPopした」ことを呼び出し側が安全に検知できます。ジェネリック型は、キュー・連結リスト・キャッシュなど「中身の型だけが違うデータ構造」を1回だけ書けば済むようにしてくれます。</p>`,
      task: `<code>Pop</code>メソッドを完成させてください。空なら「Tのゼロ値とfalse」を、要素があれば「末尾の要素とtrue」を返します（末尾の要素はスライスからも取り除きます）。`,
      code: `package main

import "fmt"

type Stack[T any] struct {
	items []T
}

func (s *Stack[T]) Push(v T) {
	s.items = append(s.items, v)
}

func (s *Stack[T]) Pop() (T, bool) {
	// TODO: 空ならTのゼロ値とfalseを返す（ヒント：var zero T）

	// TODO: 末尾の要素を取り出し、スライスを1つ短くして、要素とtrueを返す
	var zero T
	return zero, false
}

func main() {
	var s Stack[int]
	s.Push(10)
	s.Push(20)
	s.Push(30)

	v, ok := s.Pop()
	fmt.Println("Pop:", v, ok)

	v, ok = s.Pop()
	fmt.Println("Pop:", v, ok)
}
`,
      solution: `package main

import "fmt"

// 型名の直後に型パラメータを書くとジェネリック型になる
type Stack[T any] struct {
	items []T
}

func (s *Stack[T]) Push(v T) {
	s.items = append(s.items, v)
}

func (s *Stack[T]) Pop() (T, bool) {
	if len(s.items) == 0 {
		// Tのゼロ値はvar宣言で作るのが定石（nilとは書けない）
		var zero T
		return zero, false
	}
	v := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return v, true
}

func main() {
	var s Stack[int]
	s.Push(10)
	s.Push(20)
	s.Push(30)

	// 後入れ先出しなので、最後に積んだ30が先に出る
	v, ok := s.Pop()
	fmt.Println("Pop:", v, ok)

	v, ok = s.Pop()
	fmt.Println("Pop:", v, ok)
}
`,
      hints: [
        `まずif len(s.items) == 0で空チェックをします。空のときはvar zero Tで作ったゼロ値とfalseを返します。`,
        `末尾の要素はs.items[len(s.items)-1]、取り除くのはs.items = s.items[:len(s.items)-1]です。`,
        `10、20、30の順に積んだので、Popは30、20の順に出てくるはずです。`
      ],
      expectedOutput: "Pop: 30 true"
    },
    {
      id: 117,
      title: "型推論（明示指定が必要な場面）",
      explanation: `<p>これまで<code>Max(10, 20)</code>のように、型パラメータを書かずにジェネリック関数を呼んできました。コンパイラが引数から「Tはintだ」と自動で判断してくれるからです。これを<strong>型推論（type inference）</strong>といいます。しかし、推論が効かない場面が2つあります。</p>
<h4>場面1：引数から型が決まらない</h4>
<pre><code>func Zero[T any]() T {
    var zero T
    return zero
}

z := Zero()      // コンパイルエラー：Tを推論する手がかりがない
z := Zero[int]() // OK：明示的に指定する（0が返る）</code></pre>
<p>引数がない（または引数にTが登場しない）関数では、コンパイラはTを知りようがありません。このときは<code>Zero[int]()</code>のように<strong>角括弧で型引数を明示</strong>します。</p>
<h4>場面2：引数同士で推論が食い違う</h4>
<pre><code>Max(1, 2.5) // コンパイルエラー！
// default type int of 1 does not match ... float64</code></pre>
<p><code>1</code>からは「Tはint」、<code>2.5</code>からは「Tはfloat64」と推論され、矛盾してしまうのです。解決策は2つあります。</p>
<ul>
<li><code>Max[float64](1, 2.5)</code> — 型を明示する。1はfloat64の1.0として扱われる</li>
<li><code>Max(1.0, 2.5)</code> — 引数を揃えて推論できるようにする</li>
</ul>
<p>まとめると、<strong>「推論できるときは書かない、できないときだけ書く」</strong>がGoの流儀です。<code>Max[int](10, 20)</code>と書いても間違いではありませんが、冗長なので普段は省略します。エラーメッセージに「cannot infer T」や「does not match」と出たら、型引数の明示を検討しましょう。</p>`,
      task: `2箇所のコンパイルエラーを型引数の明示で修正してください。(1)<code>Zero()</code>は<code>[int]</code>を明示、(2)<code>Max(1, 2.5)</code>は<code>[float64]</code>を明示して動くようにします。`,
      code: `package main

import "fmt"

func Max[T int | float64](a, b T) T {
	if a > b {
		return a
	}
	return b
}

func Zero[T any]() T {
	var zero T
	return zero
}

func main() {
	// TODO: コンパイルエラー「cannot infer T」を型引数の明示で直す
	fmt.Println("intのゼロ値:", Zero())

	// TODO: intとfloat64で推論が食い違うエラーを[float64]の明示で直す
	fmt.Println("実数のMax:", Max(1, 2.5))
}
`,
      solution: `package main

import "fmt"

func Max[T int | float64](a, b T) T {
	if a > b {
		return a
	}
	return b
}

func Zero[T any]() T {
	var zero T
	return zero
}

func main() {
	// 引数がないのでTを推論できない。角括弧で明示する
	fmt.Println("intのゼロ値:", Zero[int]())

	// [float64]を明示すれば1もfloat64の1.0として扱われる
	fmt.Println("実数のMax:", Max[float64](1, 2.5))
}
`,
      hints: [
        `型引数は関数名の直後に角括弧で書きます。Zero[int]()のような形です。`,
        `Max[float64](1, 2.5)と明示すると、整数リテラルの1もfloat64として解釈されます。`
      ],
      expectedOutput: "実数のMax: 2.5"
    },
    {
      id: 118,
      title: "slicesパッケージ（Contains・Sort・Max）",
      explanation: `<p>ジェネリクスの導入によって、Go 1.21から標準ライブラリに<code>slices</code>パッケージが加わりました。これまで自作していたスライス操作が、型を問わず1行で書けます。まさに「ジェネリクスの成果物」です。</p>
<table>
<tr><th>関数</th><th>役割</th><th>備考</th></tr>
<tr><td><code>slices.Contains(s, v)</code></td><td>vが含まれるか</td><td>要素がcomparableであること</td></tr>
<tr><td><code>slices.Index(s, v)</code></td><td>vの位置（なければ-1）</td><td>ステップ114で自作したものと同じ</td></tr>
<tr><td><code>slices.Sort(s)</code></td><td>昇順に並べ替え（破壊的）</td><td>要素が順序付け可能であること</td></tr>
<tr><td><code>slices.Max(s)</code> / <code>slices.Min(s)</code></td><td>最大値／最小値</td><td>空スライスはpanicする</td></tr>
<tr><td><code>slices.Reverse(s)</code></td><td>逆順にする（破壊的）</td><td></td></tr>
</table>
<pre><code>import "slices"

nums := []int{3, 1, 4, 1, 5}
fmt.Println(slices.Contains(nums, 4)) // true
fmt.Println(slices.Index(nums, 4))    // 2

slices.Sort(nums)
fmt.Println(nums) // [1 1 3 4 5]（元のスライス自体が並べ替わる）

fmt.Println(slices.Max(nums)) // 5</code></pre>
<p>注意点をいくつか挙げます。</p>
<ul>
<li><code>slices.Sort</code>は<strong>破壊的</strong>（元のスライスを直接変更する）です。元の順序を残したい場合は<code>slices.Clone(s)</code>でコピーしてからソートします</li>
<li><code>slices.Max</code>・<code>slices.Min</code>は空スライスに対してpanic（実行時の強制終了）するので、事前にlenをチェックしましょう</li>
<li>従来の<code>sort.Ints(nums)</code>もまだ使えますが、int専用です。ジェネリックな<code>slices.Sort</code>はint・float64・stringなどどの型のスライスにも同じ書き方で使えます</li>
</ul>
<p>ステップ114〜115で自作したIndexOfやContains相当が標準で提供されている——「仕組みを理解した上で標準ライブラリに乗る」のが理想的な学び方です。</p>`,
      task: `<code>slices</code>パッケージを使って、(1)4が含まれるかContains、(2)昇順ソートした結果、(3)最大値、を出力してください。`,
      code: `package main

import (
	"fmt"
	"slices"
)

func main() {
	nums := []int{3, 1, 4, 1, 5}

	// TODO: slices.Containsで4が含まれるか出力する
	fmt.Println("Contains 4:", false)

	// TODO: slices.Sortでnumsを昇順に並べ替える

	fmt.Println("Sort後:", nums)

	// TODO: slices.Maxで最大値を出力する
	fmt.Println("Max:", 0)
}
`,
      solution: `package main

import (
	"fmt"
	"slices"
)

func main() {
	nums := []int{3, 1, 4, 1, 5}

	fmt.Println("Contains 4:", slices.Contains(nums, 4))

	// Sortは元のスライスを直接並べ替える（破壊的）
	slices.Sort(nums)

	fmt.Println("Sort後:", nums)

	// Maxは空スライスだとpanicするので実務ではlenチェックを忘れずに
	fmt.Println("Max:", slices.Max(nums))
}
`,
      hints: [
        `slices.Containsとslices.Maxは値を返しますが、slices.Sortは戻り値がなく元のスライスを直接変更します。`,
        `slices.Contains(nums, 4)、slices.Sort(nums)、slices.Max(nums)の3つを使います。`
      ],
      expectedOutput: "Sort後: [1 1 3 4 5]"
    },
    {
      id: 119,
      title: "mapsパッケージ（Keys相当の自作とmaps.Equal）",
      explanation: `<p>スライスの<code>slices</code>と対になる、map用のジェネリックなユーティリティが<code>maps</code>パッケージです。Go 1.22時点の主な関数を見てみましょう。</p>
<table>
<tr><th>関数</th><th>役割</th></tr>
<tr><td><code>maps.Equal(m1, m2)</code></td><td>2つのmapのキーと値がすべて等しいか</td></tr>
<tr><td><code>maps.Clone(m)</code></td><td>mapのコピーを作る</td></tr>
<tr><td><code>maps.DeleteFunc(m, f)</code></td><td>条件に合う要素を削除する</td></tr>
</table>
<p>mapは<code>==</code>で比較できない（コンパイルエラーになる）ため、<code>maps.Equal</code>は地味に貴重な存在です。テストで「期待するmapと一致するか」を確認するときに重宝します。</p>
<h4>Keysは自作する（Go 1.22時点）</h4>
<p>「mapのキー一覧をスライスで欲しい」はよくある要望ですが、Go 1.22の標準mapsパッケージにはまだありません（Go 1.23で追加された<code>maps.Keys</code>はイテレータという別の仕組みを返します）。ジェネリクスの練習も兼ねて自作しましょう。</p>
<pre><code>func Keys[K comparable, V any](m map[K]V) []K {
    keys := make([]K, 0, len(m))
    for k := range m {
        keys = append(keys, k)
    }
    return keys
}</code></pre>
<p>型パラメータに注目してください。<strong>mapのキーは==で比較できる型に限られる</strong>というGoの仕様があるため、Kには<code>comparable</code>制約が必須です。値Vは何でもよいので<code>any</code>です。この制約の選び方はステップ114の復習になっています。</p>
<p>もう1つ重要な注意点：<strong>mapのイテレーション順序は毎回ランダム</strong>です。取り出したキー一覧の順序を安定させたいときは、前ステップの<code>slices.Sort</code>と組み合わせるのが定番パターンです。</p>
<pre><code>keys := Keys(stock)
slices.Sort(keys) // ソートして順序を確定させる
fmt.Println(keys)</code></pre>`,
      task: `ジェネリック関数<code>Keys</code>を完成させ、取り出したキーを<code>slices.Sort</code>でソートして出力してください。さらに<code>maps.Equal</code>で2つのmapを比較した結果も出力します。`,
      code: `package main

import (
	"fmt"
	"maps"
	"slices"
)

// TODO: 型パラメータの制約を正しく設定する（キーはmapのキーになれる型に限る）
func Keys[K any, V any](m map[K]V) []K {
	keys := make([]K, 0, len(m))
	// TODO: for rangeでmのキーをkeysに集める
	return keys
}

func main() {
	stock := map[string]int{"banana": 3, "apple": 5, "cherry": 2}

	keys := Keys(stock)
	slices.Sort(keys)
	fmt.Println("キー一覧:", keys)

	other := map[string]int{"apple": 5, "banana": 3, "cherry": 2}
	fmt.Println("Equal:", maps.Equal(stock, other))
}
`,
      solution: `package main

import (
	"fmt"
	"maps"
	"slices"
)

// mapのキーは==で比較できる型に限られるため、Kはcomparable制約にする
func Keys[K comparable, V any](m map[K]V) []K {
	keys := make([]K, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

func main() {
	stock := map[string]int{"banana": 3, "apple": 5, "cherry": 2}

	// mapのイテレーション順はランダムなので、ソートして順序を確定させる
	keys := Keys(stock)
	slices.Sort(keys)
	fmt.Println("キー一覧:", keys)

	// mapは==で比較できないので、maps.Equalを使う
	other := map[string]int{"apple": 5, "banana": 3, "cherry": 2}
	fmt.Println("Equal:", maps.Equal(stock, other))
}
`,
      hints: [
        `mapのキー型に使える型はcomparableな型だけです。[K comparable, V any]とします。`,
        `キーだけ欲しいときは for k := range m { keys = append(keys, k) } と書きます（値は省略できます）。`
      ],
      expectedOutput: "キー一覧: [apple banana cherry]"
    },
    {
      id: 120,
      title: "総合演習：ジェネリックなコレクションユーティリティ",
      explanation: `<p>この章の総仕上げとして、これまで作ってきたジェネリックな部品（Filter・Map・Sum）を組み合わせ、商品データを集計するプログラムを完成させます。</p>
<p>登場する部品を振り返りましょう。</p>
<table>
<tr><th>部品</th><th>型パラメータ</th><th>学んだステップ</th></tr>
<tr><td><code>Filter[T any]</code></td><td>条件に合う要素を抽出</td><td>115</td></tr>
<tr><td><code>Map[T, U any]</code></td><td>要素を別の型に変換</td><td>115</td></tr>
<tr><td><code>Sum[T Number]</code></td><td>数値の合計</td><td>113</td></tr>
<tr><td><code>slices.Max</code></td><td>最大値</td><td>118</td></tr>
</table>
<p>処理の流れは「構造体のスライスを、絞り込み、変換し、集計する」というデータ処理の王道パターンです。</p>
<pre><code>type Product struct {
    Name  string
    Price int
}

products := []Product{ ... }

// 1. Filterで150円以上の商品に絞り込む
expensive := Filter(products, func(p Product) bool { return p.Price >= 150 })

// 2. MapでProduct→string（名前だけ）に変換する
names := Map(expensive, func(p Product) string { return p.Name })

// 3. MapでProduct→int（価格だけ）に変換してSumで合計する
prices := Map(products, func(p Product) int { return p.Price })
total := Sum(prices)</code></pre>
<p>注目してほしいのは、<strong>Filter・Map・Sumは一切変更せずに、Product型という「作ったときには存在しなかった型」に対して動く</strong>ことです。これがジェネリクスの真価です。ユーティリティを書く人は型を知らなくてよく、使う人は自分の型で型安全に使える——この分業が成立します。</p>
<p>また、MapでProductからintのスライスを取り出してからSumに渡す、という<strong>部品の連携</strong>も味わってください。小さな汎用部品を組み合わせて大きな処理を作るのは、Goに限らないプログラミングの普遍的な設計手法です。</p>`,
      task: `TODOの3箇所を完成させてください。(1)<code>Filter</code>で150円以上の商品を抽出、(2)<code>Map</code>でその商品名一覧を作成、(3)<code>Map</code>と<code>Sum</code>で全商品の合計金額を計算します。`,
      code: `package main

import (
	"fmt"
	"slices"
)

type Number interface {
	~int | ~int64 | ~float64
}

func Sum[T Number](nums []T) T {
	var total T
	for _, n := range nums {
		total += n
	}
	return total
}

func Map[T, U any](s []T, f func(T) U) []U {
	result := make([]U, 0, len(s))
	for _, v := range s {
		result = append(result, f(v))
	}
	return result
}

func Filter[T any](s []T, f func(T) bool) []T {
	result := make([]T, 0)
	for _, v := range s {
		if f(v) {
			result = append(result, v)
		}
	}
	return result
}

type Product struct {
	Name  string
	Price int
}

func main() {
	products := []Product{
		{Name: "apple", Price: 120},
		{Name: "banana", Price: 80},
		{Name: "cherry", Price: 200},
		{Name: "melon", Price: 500},
	}

	// TODO: (1) Filterで150円以上の商品だけをexpensiveに抽出する
	expensive := products

	// TODO: (2) Mapでexpensiveから商品名（string）の一覧namesを作る
	names := []string{}

	fmt.Println("150円以上:", names)

	// TODO: (3) Mapで全商品の価格（int）一覧pricesを作り、Sumで合計する
	prices := []int{0}
	total := Sum(prices)

	fmt.Println("合計金額:", total)
	fmt.Println("最高値:", slices.Max(prices))
	_ = expensive
}
`,
      solution: `package main

import (
	"fmt"
	"slices"
)

type Number interface {
	~int | ~int64 | ~float64
}

func Sum[T Number](nums []T) T {
	var total T
	for _, n := range nums {
		total += n
	}
	return total
}

func Map[T, U any](s []T, f func(T) U) []U {
	result := make([]U, 0, len(s))
	for _, v := range s {
		result = append(result, f(v))
	}
	return result
}

func Filter[T any](s []T, f func(T) bool) []T {
	result := make([]T, 0)
	for _, v := range s {
		if f(v) {
			result = append(result, v)
		}
	}
	return result
}

type Product struct {
	Name  string
	Price int
}

func main() {
	products := []Product{
		{Name: "apple", Price: 120},
		{Name: "banana", Price: 80},
		{Name: "cherry", Price: 200},
		{Name: "melon", Price: 500},
	}

	// (1) 150円以上の商品に絞り込む
	expensive := Filter(products, func(p Product) bool { return p.Price >= 150 })

	// (2) Product→stringの変換で商品名一覧を作る
	names := Map(expensive, func(p Product) string { return p.Name })

	fmt.Println("150円以上:", names)

	// (3) Product→intの変換で価格一覧を作り、合計する
	prices := Map(products, func(p Product) int { return p.Price })
	total := Sum(prices)

	fmt.Println("合計金額:", total)
	fmt.Println("最高値:", slices.Max(prices))
}
`,
      hints: [
        `Filterには「Productを受け取ってboolを返す関数」を、Mapには「Productを受け取って変換後の値を返す関数」を渡します。`,
        `例：Filter(products, func(p Product) bool { return p.Price >= 150 })。Mapも同じ形で戻り値の型だけ変わります。`,
        `価格は120+80+200+500なので、合計金額は900になるはずです。_ = expensive の行は不要になるので削除しましょう。`
      ],
      expectedOutput: "合計金額: 900"
    }
  ]
});
