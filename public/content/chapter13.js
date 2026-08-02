// 第13章：クロージャと高階関数
registerChapter({
  number: 13,
  title: "クロージャと高階関数",
  description: "Goでは関数そのものが値として扱えます。関数を変数に入れ、引数で渡し、関数から関数を返し、環境を記憶するクロージャまでを学びます。",
  steps: [
    {
      id: 121,
      title: "関数は値（変数に代入）",
      explanation: `<p>Goでは<strong>関数は「第一級の値（first-class value）」</strong>です。つまり、intやstringと同じように、関数を変数に代入したり、あとで呼び出したりできます。</p>
<pre><code>func double(x int) int {
    return x * 2
}

func main() {
    f := double        // 関数を変数に代入（()を付けない！）
    fmt.Println(f(10)) // 20
}</code></pre>
<p>ポイントは<code>f := double</code>のように<strong>括弧を付けずに関数名だけを書く</strong>ことです。<code>f := double(10)</code>と書くと「呼び出した結果のint」が代入されてしまいます。</p>
<p>また、名前を持たない<strong>無名関数（関数リテラル）</strong>もその場で作れます。</p>
<pre><code>g := func(x int) int { return x + 1 }
fmt.Println(g(10)) // 11</code></pre>
<p>変数fの型は<code>func(int) int</code>です。「intを受け取りintを返す関数」という型で、シグネチャ（引数と戻り値の並び）が同じ関数なら同じ型として扱えます。</p>
<table>
<tr><th>書き方</th><th>意味</th></tr>
<tr><td><code>f := double</code></td><td>関数そのものを代入（fの型はfunc(int) int）</td></tr>
<tr><td><code>f := double(10)</code></td><td>呼び出した結果を代入（fの型はint）</td></tr>
<tr><td><code>func(x int) int { ... }</code></td><td>無名関数（その場で定義）</td></tr>
</table>
<p>この「関数を値として扱える」性質が、この章で学ぶ高階関数やクロージャの土台になります。</p>`,
      task: `<code>double</code>を変数<code>f</code>に代入して<code>f(10)</code>の結果を出力してください。さらに「xに1を足して返す無名関数」を変数<code>g</code>に代入し、<code>g(10)</code>の結果も出力してください。`,
      code: `package main

import "fmt"

func double(x int) int {
	return x * 2
}

func main() {
	// TODO: doubleを変数fに代入して、f(10)の結果を出力する

	// TODO: xに1を足して返す無名関数を変数gに代入して、g(10)の結果を出力する

	fmt.Println("関数は値です")
}`,
      solution: `package main

import "fmt"

func double(x int) int {
	return x * 2
}

func main() {
	// 関数名だけを書くと関数そのものが代入される
	f := double
	fmt.Println(f(10))

	// 無名関数はその場で定義して代入できる
	g := func(x int) int { return x + 1 }
	fmt.Println(g(10))

	fmt.Println("関数は値です")
}`,
      hints: [
        `関数を変数に代入するときは、関数名のあとに()を付けません。`,
        `無名関数はfunc(x int) int { return x + 1 }のように、名前なしでその場に書けます。`
      ],
      expectedOutput: "20"
    },
    {
      id: 122,
      title: "関数を引数に取る（高階関数）",
      explanation: `<p>関数が値であるということは、<strong>関数を別の関数の引数として渡せる</strong>ということです。関数を受け取ったり返したりする関数を<strong>高階関数（higher-order function）</strong>と呼びます。</p>
<pre><code>// fを「各要素に適用する処理」として受け取る
func apply(nums []int, f func(int) int) []int {
    result := make([]int, 0, len(nums))
    for _, n := range nums {
        result = append(result, f(n))
    }
    return result
}</code></pre>
<p>引数<code>f func(int) int</code>の部分に注目してください。「fという名前で、func(int) int型の値を受け取る」という宣言です。呼び出す側は、この型に合う関数なら何でも渡せます。</p>
<pre><code>doubled := apply(nums, func(n int) int { return n * 2 })
squared := apply(nums, func(n int) int { return n * n })</code></pre>
<p>高階関数の利点は、<strong>「繰り返しの枠組み」と「各要素への処理」を分離できる</strong>ことです。ループの書き方は1回だけapplyに書き、処理内容だけを差し替えられます。他言語のmapやfilterに相当するパターンで、Goでは標準の<code>sort.Slice</code>（比較関数を渡す）や<code>strings.Map</code>などで日常的に使われています。</p>
<table>
<tr><th>役割</th><th>担当</th></tr>
<tr><td>ループ・スライス構築などの枠組み</td><td>高階関数（apply）側</td></tr>
<tr><td>各要素をどう変換するか</td><td>渡す関数（呼び出し側）</td></tr>
</table>`,
      task: `<code>apply</code>に「値を2倍にする無名関数」を渡して<code>doubled</code>を作り、出力してください。余裕があれば「値を2乗する無名関数」でも試してみましょう。`,
      code: `package main

import "fmt"

// applyはスライスの各要素にfを適用した新しいスライスを返す
func apply(nums []int, f func(int) int) []int {
	result := make([]int, 0, len(nums))
	for _, n := range nums {
		result = append(result, f(n))
	}
	return result
}

func main() {
	nums := []int{1, 2, 3}
	// TODO: applyに「2倍にする無名関数」を渡してdoubledに代入する
	doubled := nums
	fmt.Println(doubled)
}`,
      solution: `package main

import "fmt"

// applyはスライスの各要素にfを適用した新しいスライスを返す
func apply(nums []int, f func(int) int) []int {
	result := make([]int, 0, len(nums))
	for _, n := range nums {
		result = append(result, f(n))
	}
	return result
}

func main() {
	nums := []int{1, 2, 3}
	// 「各要素をどう変換するか」だけを無名関数で渡す
	doubled := apply(nums, func(n int) int { return n * 2 })
	fmt.Println(doubled)
}`,
      hints: [
        `applyの第2引数にはfunc(int) int型の関数を渡します。無名関数をその場に書けます。`,
        `apply(nums, func(n int) int { return n * 2 })のように呼び出します。`
      ],
      expectedOutput: "[2 4 6]"
    },
    {
      id: 123,
      title: "関数を返す関数",
      explanation: `<p>高階関数のもうひとつの形が<strong>「関数を返す関数」</strong>です。戻り値の型に<code>func(int) int</code>のような関数型を書きます。</p>
<pre><code>// factor倍する関数を「作って返す」関数
func multiplier(factor int) func(int) int {
    return func(x int) int {
        return x * factor
    }
}

func main() {
    triple := multiplier(3) // 「3倍する関数」ができる
    fmt.Println(triple(5))  // 15
    ten := multiplier(10)   // 「10倍する関数」もできる
    fmt.Println(ten(5))     // 50
}</code></pre>
<p>注目すべきは、返された無名関数の中で<strong>外側の引数factorを使っている</strong>点です。multiplierの実行はreturnで終わっているのに、返された関数はfactorの値を覚え続けています。この仕組みが次のステップで学ぶ「クロージャ」です。</p>
<p>「関数を作る関数」は<strong>ファクトリ関数</strong>とも呼ばれ、次のような場面で活躍します。</p>
<ul>
<li>設定値だけが違う似た処理を量産する（3倍する関数、10倍する関数……）</li>
<li>ログのプレフィックスやAPIのベースURLなど、共通設定を焼き込んだ関数を作る</li>
<li>HTTPハンドラに設定を渡す（実務で頻出のパターン）</li>
</ul>
<p>呼び出し方の<code>multiplier(3)(5)</code>のように、返ってきた関数をすぐ呼ぶことも文法上は可能ですが、通常は変数に受けてから使う方が読みやすくなります。</p>`,
      task: `<code>multiplier</code>が「xをfactor倍して返す無名関数」を返すように実装してください。実装後、<code>triple(5)</code>が15になることを確認しましょう。`,
      code: `package main

import "fmt"

// multiplierは「factor倍する関数」を返す
func multiplier(factor int) func(int) int {
	// TODO: xをfactor倍して返す無名関数を返す
	return nil
}

func main() {
	triple := multiplier(3)
	fmt.Println(triple(5))
	ten := multiplier(10)
	fmt.Println(ten(5))
}`,
      solution: `package main

import "fmt"

// multiplierは「factor倍する関数」を返す
func multiplier(factor int) func(int) int {
	// 返される関数は外側の引数factorを覚えている（クロージャ）
	return func(x int) int {
		return x * factor
	}
}

func main() {
	triple := multiplier(3)
	fmt.Println(triple(5))
	ten := multiplier(10)
	fmt.Println(ten(5))
}`,
      hints: [
        `return文で無名関数そのものを返します。返す関数の型はfunc(int) intです。`,
        `return func(x int) int { return x * factor }のように、無名関数の中で外側のfactorをそのまま使えます。`
      ],
      expectedOutput: "15"
    },
    {
      id: 124,
      title: "クロージャ（環境のキャプチャ）",
      explanation: `<p><strong>クロージャ（closure）</strong>とは、<strong>自分の外側にある変数を「参照」として捕まえた（キャプチャした）関数</strong>のことです。Goの無名関数は、定義された場所から見える変数を自由に使えます。</p>
<pre><code>func main() {
    message := "こんにちは"
    greet := func(name string) {
        // 外側の変数messageをキャプチャしている
        fmt.Println(message + "、" + name + "さん")
    }
    greet("田中")       // こんにちは、田中さん
    message = "おはよう" // 外側で書き換えると……
    greet("佐藤")       // おはよう、佐藤さん ←変更が反映される！
}</code></pre>
<p>重要なのは、クロージャがキャプチャするのは<strong>値のコピーではなく変数そのもの（参照）</strong>だという点です。だから外側で<code>message</code>を書き換えると、クロージャが見る値も変わります。逆に、クロージャの中で変数を書き換えれば外側にも反映されます。</p>
<table>
<tr><th>方式</th><th>挙動</th></tr>
<tr><td>引数で渡す</td><td>呼び出し時点の値のコピーを受け取る</td></tr>
<tr><td>キャプチャする</td><td>変数そのものを共有する（あとの変更も見える）</td></tr>
</table>
<p>「関数」と「その関数が生まれた環境（変数たち）」がセットで閉じ込められる、というイメージからclosure（閉包）と呼ばれます。便利な反面、意図しない共有によるバグの原因にもなるため、この違いを意識することがとても大切です（第14章のゴルーチンで再登場します）。</p>`,
      task: `まずそのまま実行して、<code>message</code>の変更が2回目の<code>greet</code>に反映されることを確認してください。次に<code>message = "おはよう"</code>を別の挨拶（例：「こんばんは」）に変えて再実行してみましょう。`,
      code: `package main

import "fmt"

func main() {
	message := "こんにちは"

	// greetは外側の変数messageをキャプチャするクロージャ
	greet := func(name string) {
		fmt.Println(message + "、" + name + "さん")
	}

	greet("田中")

	// 外側でmessageを書き換える
	message = "おはよう"

	// クロージャは「変数そのもの」を見ているので、変更後の値が使われる
	greet("佐藤")
}`,
      solution: `package main

import "fmt"

func main() {
	message := "こんにちは"

	// greetは外側の変数messageをキャプチャするクロージャ
	greet := func(name string) {
		fmt.Println(message + "、" + name + "さん")
	}

	greet("田中")

	// 外側でmessageを書き換える
	message = "おはよう"

	// クロージャは「変数そのもの」を見ているので、変更後の値が使われる
	greet("佐藤")
}`,
      hints: [
        `このステップはまず実行して挙動を観察しましょう。クロージャは変数のコピーではなく変数そのものを見ています。`,
        `2回目のgreetの出力が「おはよう、佐藤さん」になるのは、キャプチャした変数messageの最新の値が読まれるためです。`
      ],
      expectedOutput: "おはよう、佐藤さん"
    },
    {
      id: 125,
      title: "クロージャでカウンタを作る",
      explanation: `<p>クロージャの代表的な応用が<strong>「状態を持つ関数」＝カウンタ</strong>です。前ステップの「変数そのものをキャプチャする」性質と、ステップ123の「関数を返す関数」を組み合わせます。</p>
<pre><code>func newCounter() func() int {
    count := 0 // この変数がクロージャに閉じ込められる
    return func() int {
        count++
        return count
    }
}

func main() {
    c1 := newCounter()
    fmt.Println(c1()) // 1
    fmt.Println(c1()) // 2
    c2 := newCounter()
    fmt.Println(c2()) // 1 ←c2は別のcountを持つ！
}</code></pre>
<p>ここで起きていることを整理します。</p>
<ol>
<li><code>newCounter()</code>を呼ぶたびに、<strong>新しいcount変数</strong>が作られる</li>
<li>返されたクロージャがそのcountをキャプチャし、呼ばれるたびに増やす</li>
<li>通常、ローカル変数は関数が終わると消えるが、<strong>クロージャが参照している限り生き続ける</strong>（Goのコンパイラが自動でヒープ（長生きする変数の置き場所）に移す）</li>
</ol>
<p>c1とc2がそれぞれ独立したcountを持つ点が重要です。つまりクロージャは<strong>「外から直接触れない専用の状態＋それを操作する関数」</strong>を作る手段であり、構造体を定義するほどでもない小さな状態管理に向いています。連番ID生成器や、呼び出し回数の記録などによく使われるパターンです。</p>`,
      task: `返す無名関数の中身を実装し、呼ばれるたびに<code>count</code>を1増やして返すカウンタを完成させてください。<code>c1</code>と<code>c2</code>が独立して数えることも確認しましょう。`,
      code: `package main

import "fmt"

// newCounterは呼ばれるたびに1ずつ増える数を返す関数を作る
func newCounter() func() int {
	count := 0
	return func() int {
		// TODO: countを1増やしてから返す
		return 0
	}
}

func main() {
	c1 := newCounter()
	fmt.Println(c1())
	fmt.Println(c1())

	c2 := newCounter()
	fmt.Println(c2())

	fmt.Println(c1())
}`,
      solution: `package main

import "fmt"

// newCounterは呼ばれるたびに1ずつ増える数を返す関数を作る
func newCounter() func() int {
	count := 0
	return func() int {
		// キャプチャしたcountはnewCounter終了後も生き続ける
		count++
		return count
	}
}

func main() {
	c1 := newCounter()
	fmt.Println(c1())
	fmt.Println(c1())

	// c2は新しいnewCounter呼び出しなので、別のcountを持つ
	c2 := newCounter()
	fmt.Println(c2())

	// c1のcountはc2の影響を受けず3になる
	fmt.Println(c1())
}`,
      hints: [
        `無名関数の中でcount++してからreturn countします。countはキャプチャされているので消えません。`,
        `正しく実装できていれば出力は上から1、2、1、3になります。c2()が1に戻るのは、newCounterを呼ぶたびに新しいcountが作られるためです。`
      ],
      expectedOutput: "3"
    },
    {
      id: 126,
      title: "ループ変数とクロージャ（Go 1.22での挙動変更）",
      explanation: `<p>ループの中でクロージャを作るコードは、Goの歴史上もっとも有名な「ハマりどころ」でした。<strong>Go 1.22でこの挙動が言語仕様レベルで変更された</strong>ので、新旧両方を知っておきましょう。</p>
<pre><code>funcs := []func(){}
for i := 0; i &lt; 3; i++ {
    funcs = append(funcs, func() {
        fmt.Println("i =", i)
    })
}
for _, f := range funcs {
    f() // さて何が出る？
}</code></pre>
<table>
<tr><th>バージョン</th><th>ループ変数iの扱い</th><th>上の出力</th></tr>
<tr><td>Go 1.21以前</td><td>ループ全体で1個の変数を共有</td><td>i = 3 が3回（ループ終了時の値）</td></tr>
<tr><td><strong>Go 1.22以降</strong></td><td><strong>1周ごとに新しい変数が作られる</strong></td><td>i = 0、i = 1、i = 2</td></tr>
</table>
<p>Go 1.21以前は、3つのクロージャがすべて<strong>同じ1つのi</strong>をキャプチャしていたため、ループ終了後に呼ぶと全員が最終値の3を見てしまいました。これを避けるために<code>i := i</code>と書いてループ内に変数をコピーするイディオムが広く使われていました。</p>
<pre><code>for i := 0; i &lt; 3; i++ {
    i := i // Go 1.21以前で必要だったおまじない（1.22では不要）
    funcs = append(funcs, func() { fmt.Println(i) })
}</code></pre>
<p>Go 1.22以降は各周回のiが別の変数になるため、素直に書いたコードが直感どおりに動きます。ただし、<strong>古いコードやブログ記事では旧挙動を前提にした解説が多い</strong>ので、go.modのgoディレクティブが1.22以上かどうかで挙動が変わる点は覚えておきましょう。</p>`,
      task: `まずそのまま実行して、Go 1.22では<code>i = 0</code>、<code>i = 1</code>、<code>i = 2</code>と出力されることを確認してください。そのうえで、Go 1.21以前なら何が出力されたかを解説で確認しましょう。`,
      code: `package main

import "fmt"

func main() {
	// クロージャをスライスにためて、ループが終わってから呼ぶ
	funcs := []func(){}
	for i := 0; i < 3; i++ {
		funcs = append(funcs, func() {
			fmt.Println("i =", i)
		})
	}

	for _, f := range funcs {
		f()
	}
}`,
      solution: `package main

import "fmt"

func main() {
	// クロージャをスライスにためて、ループが終わってから呼ぶ
	funcs := []func(){}
	for i := 0; i < 3; i++ {
		// Go 1.22からは1周ごとにiが新しい変数になるため、
		// 各クロージャはその周回のiを覚える（i := i は不要）
		funcs = append(funcs, func() {
			fmt.Println("i =", i)
		})
	}

	for _, f := range funcs {
		f()
	}
}`,
      hints: [
        `そのまま実行して出力を観察してください。Go 1.22ではループ変数が1周ごとに別の変数になります。`,
        `Go 1.21以前では3つのクロージャが同じiを共有していたため「i = 3」が3回出力されていました。旧コードで見かけるi := iはその対策です。`
      ],
      expectedOutput: "i = 2"
    },
    {
      id: 127,
      title: "即時実行関数とdeferとの組み合わせ",
      explanation: `<p>無名関数は定義と同時に呼び出すことができます。これを<strong>即時実行関数</strong>と呼び、末尾に<code>()</code>を付けて書きます。</p>
<pre><code>func() {
    fmt.Println("定義してすぐ実行")
}() // ←この()で即座に呼び出す</code></pre>
<p>この形が特に活躍するのが<code>defer</code>（関数終了時に実行を遅延させる文）との組み合わせです。ここで重要な違いがあります。</p>
<table>
<tr><th>書き方</th><th>値が決まるタイミング</th></tr>
<tr><td><code>defer fmt.Println(x)</code></td><td><strong>defer文を書いた時点</strong>（引数は即座に評価される）</td></tr>
<tr><td><code>defer func() { fmt.Println(x) }()</code></td><td><strong>実際に実行される時点</strong>（クロージャがxをキャプチャ）</td></tr>
</table>
<pre><code>x := 1
defer fmt.Println("引数:", x)            // 1で確定
defer func() { fmt.Println("閉包:", x) }() // 実行時のxを見る
x = 100
// 関数終了時 → 「閉包: 100」「引数: 1」の順で出力
// （deferは後に登録したものから実行される）</code></pre>
<p>deferの引数はdefer文の時点で評価されてしまうため、<strong>「関数終了時の最新の値」を使いたいならクロージャで包む</strong>必要があります。このパターンは、エラー変数を関数終了時に確認するログ処理や、複数の後片付けをまとめる場面で頻出します。なお<code>defer func() { ... }()</code>の末尾の<code>()</code>を忘れると「deferには関数呼び出しが必要」というコンパイルエラーになるので注意しましょう。</p>`,
      task: `クロージャを使った<code>defer</code>を追加して、関数終了時点の<code>x</code>（=100）を「deferクロージャ: 100」と出力させてください。既存の<code>defer fmt.Println</code>との出力の違いを観察しましょう。`,
      code: `package main

import "fmt"

func main() {
	// 即時実行関数：定義してすぐ呼び出す
	func() {
		fmt.Println("即時実行関数の中")
	}()

	x := 1

	// 引数はこの時点のx（=1）で確定する
	defer fmt.Println("defer引数:", x)

	// TODO: クロージャを使ったdeferを追加して、
	// 実行時点のxを「deferクロージャ: 100」と出力する

	x = 100
	fmt.Println("mainの最後:", x)
}`,
      solution: `package main

import "fmt"

func main() {
	// 即時実行関数：定義してすぐ呼び出す
	func() {
		fmt.Println("即時実行関数の中")
	}()

	x := 1

	// 引数はこの時点のx（=1）で確定する
	defer fmt.Println("defer引数:", x)

	// クロージャはxそのものをキャプチャするので、実行時の値100が出る
	defer func() {
		fmt.Println("deferクロージャ:", x)
	}()

	x = 100
	fmt.Println("mainの最後:", x)
}`,
      hints: [
        `defer func() { ... }() の形で、無名関数を定義して即座にdeferに登録します。末尾の()を忘れずに。`,
        `クロージャの中でfmt.Println("deferクロージャ:", x)と書けば、実行されるのはmain終了時なので、そのときのx（100）が出力されます。`
      ],
      expectedOutput: "deferクロージャ: 100"
    },
    {
      id: 128,
      title: "コールバックパターン",
      explanation: `<p><strong>コールバック（callback）</strong>とは、「あとで呼び出してもらうために渡しておく関数」のことです。ステップ122の高階関数の応用で、<strong>処理の節目で呼ばれる関数を外から差し込む</strong>設計パターンです。</p>
<pre><code>// 各要素の処理時にonEach、全件完了時にonDoneを呼ぶ
func processNumbers(nums []int, onEach func(int), onDone func(int)) {
    sum := 0
    for _, n := range nums {
        onEach(n) // 節目ごとに呼び出す（コールバック）
        sum += n
    }
    onDone(sum) // 完了時に呼び出す
}</code></pre>
<p>processNumbersは「いつ何を通知するか」だけを決めており、<strong>通知を受けて何をするかは呼び出し側の自由</strong>です。画面に表示する、ログに残す、集計する……processNumbersを一切変更せずに挙動を差し替えられます。</p>
<pre><code>processNumbers(nums,
    func(n int) { fmt.Println("処理中:", n) },
    func(total int) { fmt.Println("合計:", total) },
)</code></pre>
<p>Goの標準ライブラリにも多くの実例があります。</p>
<ul>
<li><code>strings.Map(mapping func(rune) rune, s string)</code>：各文字の変換規則をコールバックで渡す</li>
<li><code>sort.Slice(x any, less func(i, j int) bool)</code>：比較ルールをコールバックで渡す</li>
<li><code>http.HandlerFunc</code>：リクエストが来たときに呼ばれる処理を渡す</li>
</ul>
<p>「枠組みは共通、細部だけ差し替えたい」ときの定番手段として覚えておきましょう。</p>`,
      task: `<code>processNumbers</code>に2つの無名関数を渡してください。1つ目は各値を「処理中: 値」と出力する関数、2つ目は合計を「合計: 値」と出力する関数です。`,
      code: `package main

import "fmt"

// processNumbersは各要素の処理時にonEach、完了時にonDoneを呼ぶ
func processNumbers(nums []int, onEach func(int), onDone func(int)) {
	sum := 0
	for _, n := range nums {
		onEach(n)
		sum += n
	}
	onDone(sum)
}

func main() {
	nums := []int{10, 20, 30}
	// TODO: processNumbersを呼び出す。
	// 第2引数：nを「処理中: n」と出力する無名関数
	// 第3引数：totalを「合計: total」と出力する無名関数
}`,
      solution: `package main

import "fmt"

// processNumbersは各要素の処理時にonEach、完了時にonDoneを呼ぶ
func processNumbers(nums []int, onEach func(int), onDone func(int)) {
	sum := 0
	for _, n := range nums {
		onEach(n)
		sum += n
	}
	onDone(sum)
}

func main() {
	nums := []int{10, 20, 30}
	// 「何をするか」はコールバックとして外から渡す
	processNumbers(nums,
		func(n int) { fmt.Println("処理中:", n) },
		func(total int) { fmt.Println("合計:", total) },
	)
}`,
      hints: [
        `processNumbers(nums, 関数1, 関数2)の形で、引数の位置に無名関数を直接書けます。`,
        `1つ目はfunc(n int) { fmt.Println("処理中:", n) }のような形です。2つ目も同じ要領で書きましょう。`
      ],
      expectedOutput: "合計: 60"
    },
    {
      id: 129,
      title: "関数型を定義する（type Handler func(string) error）",
      explanation: `<p><code>func(string) error</code>のような関数型を引数や戻り値のあちこちに書くと、コードが読みにくくなります。Goでは<code>type</code>で<strong>関数型に名前を付ける</strong>ことができます。</p>
<pre><code>// 「文字列を受け取り、エラーを返すかもしれない処理」に名前を付ける
type Handler func(string) error

func run(h Handler, input string) {
    if err := h(input); err != nil {
        fmt.Println("エラー:", err)
        return
    }
    fmt.Println("成功:", input)
}</code></pre>
<p>構造体に名前を付けるのと同じ感覚で、<strong>シグネチャが一致する関数はすべてHandler型として扱えます</strong>。明示的な変換は不要です。</p>
<pre><code>var h Handler = func(s string) error {
    if s == "" {
        return errors.New("入力が空です")
    }
    return nil
}</code></pre>
<p>関数型に名前を付けるメリットは3つあります。</p>
<ul>
<li><strong>可読性</strong>：<code>func(h Handler)</code>は<code>func(h func(string) error)</code>より意図が伝わる</li>
<li><strong>ドキュメント性</strong>：型にコメントを書けば「この関数は何をする役割か」を説明できる</li>
<li><strong>拡張性</strong>：関数型にもメソッドを定義できる（<code>http.HandlerFunc</code>はこの技法の代表例で、関数をインターフェースに適合させるために使われています）</li>
</ul>
<p>実務のGoコードでは、ミドルウェア、オプション設定（Functional Options）、イベント処理などで関数型の定義が多用されます。</p>`,
      task: `関数型<code>Handler</code>（<code>func(string) error</code>）を定義し、<code>run</code>の引数の型を<code>Handler</code>に変更してください。そのまま実行して、成功とエラーの両方の出力を確認しましょう。`,
      code: `package main

import (
	"errors"
	"fmt"
)

// TODO: Handlerという名前の関数型（func(string) error）を定義する

// TODO: 第1引数の型をHandlerに変更する
func run(h func(string) error, input string) {
	if err := h(input); err != nil {
		fmt.Println("エラー:", err)
		return
	}
	fmt.Println("成功:", input)
}

func main() {
	// TODO: 変数checkの型をHandlerにする
	var check func(string) error = func(s string) error {
		if s == "" {
			return errors.New("入力が空です")
		}
		return nil
	}

	run(check, "hello")
	run(check, "")
}`,
      solution: `package main

import (
	"errors"
	"fmt"
)

// Handlerは文字列を検証し、問題があればエラーを返す処理の型
type Handler func(string) error

func run(h Handler, input string) {
	if err := h(input); err != nil {
		fmt.Println("エラー:", err)
		return
	}
	fmt.Println("成功:", input)
}

func main() {
	// シグネチャが一致する関数はそのままHandler型として扱える
	var check Handler = func(s string) error {
		if s == "" {
			return errors.New("入力が空です")
		}
		return nil
	}

	run(check, "hello")
	run(check, "")
}`,
      hints: [
        `type Handler func(string) error と書くと、関数のシグネチャに名前を付けられます。`,
        `runの引数はh Handlerに、mainの変数はvar check Handler = ...に書き換えます。中身の無名関数はそのままで型が一致します。`
      ],
      expectedOutput: "エラー: 入力が空です"
    },
    {
      id: 130,
      title: "総合演習：バリデータ関数の合成",
      explanation: `<p>この章の総仕上げとして、<strong>複数の検証関数を1つに合成するバリデータ</strong>を作ります。使う道具はすべて学習済みです。</p>
<table>
<tr><th>使う知識</th><th>学んだステップ</th></tr>
<tr><td>関数型の定義（type Validator func(string) error）</td><td>129</td></tr>
<tr><td>関数を返す関数（maxLengthが設定値を焼き込む）</td><td>123</td></tr>
<tr><td>クロージャ（合成結果がvalidatorsを覚える）</td><td>124</td></tr>
<tr><td>可変長引数（...Validator）</td><td>関数の章</td></tr>
</table>
<p>目標は、個々のルールを小さな関数として書き、<code>combine</code>で連結することです。</p>
<pre><code>func combine(validators ...Validator) Validator {
    return func(s string) error {
        for _, v := range validators {
            if err := v(s); err != nil {
                return err // 最初に失敗したエラーを返す
            }
        }
        return nil // 全部通ればOK
    }
}</code></pre>
<p>combineが返すのは「渡されたバリデータを順に実行するクロージャ」です。合成後も型はValidatorのままなので、<strong>合成結果をさらに別のcombineに渡す</strong>こともできます。この「同じ型を受け取り同じ型を返すことで、部品を自由に組み合わせられる」設計は、関数合成の本質です。</p>
<pre><code>check := combine(notEmpty, maxLength(8), noSpace)
err := check("hello world") // 順番に検証され、最初のエラーが返る</code></pre>
<p>実務では、フォーム入力の検証、HTTPミドルウェアの連結、オプション設定の適用など、まったく同じ形のコードが登場します。小さな関数を組み合わせて大きな振る舞いを作る感覚を、ここでつかんでおきましょう。</p>`,
      task: `<code>combine</code>を実装してください。渡されたバリデータを順に実行し、最初のエラーを返す（すべて通ればnilを返す）<code>Validator</code>を返します。実行して4つの入力の判定結果を確認しましょう。`,
      code: `package main

import (
	"errors"
	"fmt"
	"strings"
)

// Validatorは文字列を検証し、問題があればエラーを返す
type Validator func(string) error

func notEmpty(s string) error {
	if s == "" {
		return errors.New("空文字は許可されていません")
	}
	return nil
}

// maxLengthは「max文字以内か検証する関数」を作って返す
func maxLength(max int) Validator {
	return func(s string) error {
		if len([]rune(s)) > max {
			return fmt.Errorf("%d文字以内で入力してください", max)
		}
		return nil
	}
}

func noSpace(s string) error {
	if strings.Contains(s, " ") {
		return errors.New("スペースは使えません")
	}
	return nil
}

// TODO: combineを実装する。
// 渡されたバリデータを順に実行し、最初のエラーを返す。
// すべて通ればnilを返すValidatorを返す。
func combine(validators ...Validator) Validator {
	return nil
}

func main() {
	check := combine(notEmpty, maxLength(8), noSpace)

	inputs := []string{"gopher", "", "go lang", "verylongusername"}
	for _, in := range inputs {
		if err := check(in); err != nil {
			fmt.Println(in, "-> NG:", err)
		} else {
			fmt.Println(in, "-> OK")
		}
	}
}`,
      solution: `package main

import (
	"errors"
	"fmt"
	"strings"
)

// Validatorは文字列を検証し、問題があればエラーを返す
type Validator func(string) error

func notEmpty(s string) error {
	if s == "" {
		return errors.New("空文字は許可されていません")
	}
	return nil
}

// maxLengthは「max文字以内か検証する関数」を作って返す
func maxLength(max int) Validator {
	return func(s string) error {
		if len([]rune(s)) > max {
			return fmt.Errorf("%d文字以内で入力してください", max)
		}
		return nil
	}
}

func noSpace(s string) error {
	if strings.Contains(s, " ") {
		return errors.New("スペースは使えません")
	}
	return nil
}

// combineは複数のバリデータを順に実行する1つのバリデータに合成する
func combine(validators ...Validator) Validator {
	// 返すクロージャはvalidatorsをキャプチャしている
	return func(s string) error {
		for _, v := range validators {
			if err := v(s); err != nil {
				return err
			}
		}
		return nil
	}
}

func main() {
	check := combine(notEmpty, maxLength(8), noSpace)

	inputs := []string{"gopher", "", "go lang", "verylongusername"}
	for _, in := range inputs {
		if err := check(in); err != nil {
			fmt.Println(in, "-> NG:", err)
		} else {
			fmt.Println(in, "-> OK")
		}
	}
}`,
      hints: [
        `combineは「Validatorを返す関数」です。返す無名関数の中でvalidatorsをforでループします。`,
        `ループ内でif err := v(s); err != nil { return err }とし、ループを抜けたらreturn nilします。`,
        `正しく実装できると、gopherはOK、空文字・go lang（スペース）・verylongusername（長すぎ）はNGになります。`
      ],
      expectedOutput: "gopher -> OK"
    }
  ]
});
