// 第4章：関数
registerChapter({
  number: 4,
  title: "関数",
  description: "処理に名前を付けて再利用する「関数」を学びます。複数の値を返せる仕組みやdeferなど、Goならではの特徴も身につけます。",
  steps: [
    {
      id: 31,
      title: "funcの定義と呼び出し",
      explanation: `<p>ここまでのコードはすべて<code>func main()</code>の中に書いてきました。実はこの<code>main</code>こそが<strong>関数</strong>です。関数とは<strong>処理のまとまりに名前を付けたもの</strong>で、名前を呼ぶ（呼び出す）ことで何度でも同じ処理を実行できます。</p>
<p>Goでは<code>func</code>キーワードで関数を定義します。</p>
<pre><code>func greet() {
    fmt.Println("こんにちは")
}

func main() {
    greet() // 関数名()で呼び出す
    greet() // 何度でも呼べる
}</code></pre>
<p>定義の形は「<code>func 関数名() { 処理 }</code>」です。呼び出すときは「<code>関数名()</code>」と書きます。丸括弧を忘れると呼び出しになりません。</p>
<p>いくつか重要なルールがあります。</p>
<ul>
<li>関数は<strong>関数の外側（パッケージのトップレベル）</strong>に定義します。<code>main</code>の中に<code>func greet() { }</code>を直接書くことはできません（関数を値として扱う方法は後の章で学びます）</li>
<li>定義を書く<strong>位置は呼び出しより後でも構いません</strong>。Goはファイル全体を見てから解決するので、<code>main</code>を上に、部品となる関数を下に書くスタイルがよく使われます</li>
<li>プログラムの実行は必ず<code>main</code>関数から始まります。定義しただけで呼び出していない関数は実行されません</li>
</ul>
<p>関数に切り出す利点は「同じコードを繰り返し書かなくて済む」ことだけではありません。処理に<strong>名前が付く</strong>ことで、コードが文章のように読めるようになります。リーダブルコードの中心的なテクニックであり、良い関数名を付ける習慣はこの先ずっと役立ちます。</p>`,
      task: `「Go言語を学ぼう」と表示する関数<code>sayGo</code>を定義し、<code>main</code>関数から呼び出してください。`,
      code: `package main

import "fmt"

// TODO: 「Go言語を学ぼう」と表示する関数sayGoをここに定義する

func main() {
	fmt.Println("開始")
	// TODO: sayGoを呼び出す
}
`,
      solution: `package main

import "fmt"

func sayGo() {
	fmt.Println("Go言語を学ぼう")
}

func main() {
	fmt.Println("開始")
	sayGo()
}
`,
      hints: [
        `関数の定義は「func sayGo() { }」の形で、mainの外側（同じ並び）に書きます。`,
        `関数の中身は fmt.Println("Go言語を学ぼう") の1行です。`,
        `mainの中から「sayGo()」と括弧付きで呼び出すと実行されます。`
      ],
      expectedOutput: "Go言語を学ぼう"
    },
    {
      id: 32,
      title: "引数（型の後置記法・同型引数のまとめ書き）",
      explanation: `<p>関数に外から値を渡すには<strong>引数（ひきすう）</strong>を使います。関数名の後ろの丸括弧の中に「<code>名前 型</code>」の形で宣言します。</p>
<pre><code>func add(a int, b int) {
    fmt.Println("合計:", a+b)
}

func main() {
    add(3, 5) // 合計: 8
}</code></pre>
<p>変数宣言（<code>var x int</code>）と同じく、Goでは<strong>型を名前の後ろに書きます</strong>（型の後置記法）。C言語系の<code>int a</code>とは逆なので最初は戸惑いますが、「aはint」と左から右に自然に読める語順です。</p>
<p>さらにGoには便利な省略記法があります。<strong>同じ型の引数が並ぶときは、型を最後の1回だけ書けばよい</strong>のです。</p>
<pre><code>// この2つはまったく同じ意味
func add(a int, b int) { }
func add(a, b int) { }</code></pre>
<p><code>func calc(a, b int, rate float64)</code>のように、型が変わる位置でだけ型を書くこともできます。標準ライブラリでも多用される書き方なので、読めるようにしておきましょう。</p>
<p>用語を2つ整理します。定義側に書く変数（<code>a</code>や<code>b</code>）を<strong>仮引数（パラメータ）</strong>、呼び出し側で渡す実際の値（<code>3</code>や<code>5</code>）を<strong>実引数</strong>と呼びます。呼び出し時には実引数の値が仮引数に<strong>コピー</strong>されるため、関数の中で仮引数を書き換えても呼び出し側の変数は変化しません（値渡し）。</p>
<p>引数の数と型は厳密にチェックされます。<code>add(3)</code>のように数が足りなくても、<code>add(3.5, 1.2)</code>のように型が合わなくてもコンパイルエラーです。この厳格さが実行前にバグを見つけてくれます。</p>`,
      task: `2つの整数を受け取り「積: 24」の形で掛け算の結果を表示する関数<code>multiply</code>を定義し、<code>multiply(4, 6)</code>と呼び出してください。同型引数のまとめ書き（<code>a, b int</code>）を使うこと。`,
      code: `package main

import "fmt"

func add(a, b int) {
	fmt.Println("合計:", a+b)
}

// TODO: 2つの整数の積を「積: 24」の形で表示する関数multiplyを定義する
// （引数はまとめ書き a, b int を使う）

func main() {
	add(3, 5)
	// TODO: multiply(4, 6) を呼び出す
}
`,
      solution: `package main

import "fmt"

func add(a, b int) {
	fmt.Println("合計:", a+b)
}

func multiply(a, b int) {
	fmt.Println("積:", a*b)
}

func main() {
	add(3, 5)
	multiply(4, 6)
}
`,
      hints: [
        `addの定義をそっくり参考にできます。関数名と演算子と表示する文字列を変えるだけです。`,
        `同じ型の引数2つは「func multiply(a, b int)」のように型を1回だけ書けます。`,
        `掛け算は a*b、表示は fmt.Println("積:", a*b) です。4×6なので「積: 24」と出れば正解です。`
      ],
      expectedOutput: "積: 24"
    },
    {
      id: 33,
      title: "戻り値",
      explanation: `<p>前のステップの<code>add</code>は結果を自分で表示していましたが、これでは「計算結果を別の計算に使う」ことができません。関数が計算結果を<strong>呼び出し元に返す</strong>仕組みが<strong>戻り値（もどりち）</strong>です。</p>
<p>戻り値の型は、引数の丸括弧の<strong>後ろ</strong>に書きます。値を返すには<code>return</code>を使います。</p>
<pre><code>func square(n int) int {
    return n * n
}

func main() {
    result := square(9)
    fmt.Println("9の2乗:", result) // 9の2乗: 81
}</code></pre>
<p>「<code>func square(n int) int</code>」は「intを1つ受け取り、intを1つ返す関数square」と読みます。呼び出し側では<code>square(9)</code>という式全体が値<code>81</code>になるので、変数に代入したり、<code>square(square(3))</code>のように別の関数の引数にしたりできます。</p>
<p><code>return</code>にはもう1つの役割があります。<strong>そこで関数の実行を打ち切る</strong>ことです。returnより後ろの行は実行されません。これを利用して、条件を満たさないケースを先頭で返してしまう<strong>早期リターン</strong>という書き方がGoでは好まれます。</p>
<pre><code>func abs(n int) int {
    if n &lt; 0 {
        return -n // 負ならここで終わり
    }
    return n // ここに来るのは0以上のときだけ
}</code></pre>
<p>戻り値の型を宣言した関数は、<strong>すべての実行経路で必ず値を返さなければ</strong>コンパイルエラーになります。「表示する関数」より「値を返す関数」のほうが、テストしやすく再利用もしやすいため、実務では戻り値中心の設計が基本になります。</p>`,
      task: `整数を受け取って2乗を返す関数<code>square</code>を完成させ、<code>main</code>で<code>square(9)</code>の結果を受け取って「9の2乗: 81」と表示してください。`,
      code: `package main

import "fmt"

// TODO: 戻り値の型intを宣言し、n*nをreturnで返す
func square(n int) {
	fmt.Println(n * n)
}

func main() {
	// TODO: square(9)の戻り値を変数resultで受け取り、「9の2乗: 81」と表示する
	square(9)
}
`,
      solution: `package main

import "fmt"

func square(n int) int {
	return n * n
}

func main() {
	result := square(9)
	fmt.Println("9の2乗:", result)
}
`,
      hints: [
        `戻り値の型は引数の括弧の後ろに書きます。「func square(n int) int {」となります。`,
        `関数の中はfmt.Printlnではなく「return n * n」に書き換えます。`,
        `呼び出し側は「result := square(9)」で受け取り、fmt.Println("9の2乗:", result) で表示します。`
      ],
      expectedOutput: "9の2乗: 81"
    },
    {
      id: 34,
      title: "複数戻り値（Goの特徴）",
      explanation: `<p>多くの言語では関数が返せる値は1つだけですが、Goの関数は<strong>複数の値を一度に返せます</strong>。これはGoを象徴する機能の1つです。</p>
<p>戻り値が複数あるときは、型の並びを丸括弧で囲みます。</p>
<pre><code>func divmod(a, b int) (int, int) {
    return a / b, a % b
}

func main() {
    q, r := divmod(17, 5)
    fmt.Println("商:", q, "余り:", r) // 商: 3 余り: 2
}</code></pre>
<p>「<code>(int, int)</code>」が「intを2つ返す」という宣言で、<code>return</code>にもカンマ区切りで2つの値を書きます。受け取る側も<code>q, r :=</code>とカンマ区切りで、<strong>宣言した数と同じ数の変数</strong>で受け取ります。</p>
<p>「片方しか使わない」場合はどうするのでしょうか。使わない変数があるとコンパイルエラーになるのがGoでした。そこで登場するのが<strong>ブランク識別子<code>_</code></strong>（アンダースコア）です。<code>_</code>に代入された値は捨てられ、未使用エラーにもなりません。</p>
<pre><code>q, _ := divmod(17, 5) // 余りは要らない
_, r := divmod(17, 5) // 商は要らない</code></pre>
<p>複数戻り値が最も活躍するのが<strong>エラー処理</strong>です。Goの標準ライブラリの関数の多くは「本来の結果」と「エラー」の2つを返し、呼び出し側は<code>result, err := ...</code>と受け取ってerrを判定します。例外（try-catch）を持たないGoは、この複数戻り値でエラーを普通の値として扱うのです。詳しくはエラー処理の章で学びますが、「2つ返す・2つ受け取る」という今回の形がその土台になります。</p>`,
      task: `割り算の商と余りを同時に返す関数<code>divmod</code>を完成させてください。<code>main</code>では<code>divmod(17, 5)</code>の2つの戻り値を受け取り、「商: 3 余り: 2」と表示します。`,
      code: `package main

import "fmt"

// TODO: 戻り値の宣言を(int, int)にして、商a/bと余りa%bの2つを返す
func divmod(a, b int) int {
	return a / b
}

func main() {
	// TODO: 2つの戻り値をq, rで受け取り、「商: 3 余り: 2」と表示する
	q := divmod(17, 5)
	fmt.Println("商:", q)
}
`,
      solution: `package main

import "fmt"

func divmod(a, b int) (int, int) {
	return a / b, a % b
}

func main() {
	q, r := divmod(17, 5)
	fmt.Println("商:", q, "余り:", r)
}
`,
      hints: [
        `戻り値が2つのときは型を丸括弧で囲んで「(int, int)」と書きます。`,
        `returnもカンマ区切りで「return a / b, a % b」と2つの値を返します。`,
        `受け取り側は「q, r := divmod(17, 5)」です。表示はfmt.Println("商:", q, "余り:", r) とします。`
      ],
      expectedOutput: "商: 3 余り: 2"
    },
    {
      id: 35,
      title: "名前付き戻り値",
      explanation: `<p>Goでは戻り値に<strong>あらかじめ名前を付けておく</strong>ことができます。これを<strong>名前付き戻り値</strong>と呼びます。</p>
<pre><code>func rectangle(w, h int) (area, perimeter int) {
    area = w * h
    perimeter = (w + h) * 2
    return // 裸のreturn：area, perimeterが自動的に返る
}</code></pre>
<p>名前付き戻り値には次の性質があります。</p>
<ul>
<li>関数の先頭で<strong>その型のゼロ値に初期化された変数</strong>として使い始められる（intなら0）。宣言は不要で、<code>=</code>で代入する点に注意（<code>:=</code>で再宣言しない）</li>
<li>値を指定しない<code>return</code>（<strong>裸のreturn</strong>と呼ばれます）を書くと、その時点の名前付き戻り値の値が自動的に返される</li>
<li>関数のシグネチャ（定義の1行目）を見るだけで、<strong>各戻り値が何を意味するのか</strong>が分かる</li>
</ul>
<p>特に3つ目がこの機能の本命です。<code>(int, int)</code>とだけ書かれた関数では「1つ目は何？2つ目は何？」が定義を読まないと分かりませんが、<code>(area, perimeter int)</code>なら一目瞭然です。<strong>同じ型の値を複数返す関数のドキュメント</strong>として機能します。</p>
<p>一方で注意点もあります。裸のreturnは短い関数なら便利ですが、長い関数で使うと「結局何が返るのか」を目で追うのが大変になります。Goコミュニティでも「名前付き戻り値は意味の説明として使い、<strong>長い関数では裸のreturnを避けて明示的に<code>return area, perimeter</code>と書く</strong>」というスタイルが推奨されています。まずは「名前を付けられる」「裸のreturnで返せる」という仕組みを理解し、乱用しない感覚を身につけましょう。</p>`,
      task: `長方形の面積と周囲の長さを返す関数<code>rectangle</code>を、名前付き戻り値<code>(area, perimeter int)</code>を使う形に書き換え、裸のreturnで返してください。出力は「面積: 15 周囲: 16」です。`,
      code: `package main

import "fmt"

// TODO: 戻り値を名前付きの (area, perimeter int) に変え、
// 関数内では area と perimeter に代入して裸のreturnで返す
func rectangle(w, h int) (int, int) {
	return w * h, (w + h) * 2
}

func main() {
	a, p := rectangle(5, 3)
	fmt.Println("面積:", a, "周囲:", p)
}
`,
      solution: `package main

import "fmt"

func rectangle(w, h int) (area, perimeter int) {
	area = w * h
	perimeter = (w + h) * 2
	return
}

func main() {
	a, p := rectangle(5, 3)
	fmt.Println("面積:", a, "周囲:", p)
}
`,
      hints: [
        `戻り値の宣言を「(area, perimeter int)」に変えます。引数のまとめ書きと同じ要領で名前と型を書きます。`,
        `関数の中では area = w * h のように「=」で代入します。areaはすでに宣言済みなので := は使いません。`,
        `最後に値を書かずに「return」とだけ書くと、その時点のareaとperimeterが返ります。`
      ],
      expectedOutput: "面積: 15 周囲: 16"
    },
    {
      id: 36,
      title: "可変長引数（...int）",
      explanation: `<p>「2個でも5個でも、好きな個数の値を渡したい」——そんな関数を作れるのが<strong>可変長引数</strong>です。型の前に<code>...</code>（ドット3つ）を付けて宣言します。</p>
<pre><code>func sum(nums ...int) int {
    total := 0
    for i := 0; i &lt; len(nums); i++ {
        total += nums[i]
    }
    return total
}

func main() {
    fmt.Println(sum(1, 2))          // 3
    fmt.Println(sum(1, 2, 3, 4, 5)) // 15
    fmt.Println(sum())              // 0個でもOK
}</code></pre>
<p>関数の中では、渡された値の並びに対して次の操作ができます。</p>
<ul>
<li><code>len(nums)</code>：受け取った値の<strong>個数</strong>を返す（0個なら0）</li>
<li><code>nums[i]</code>：<strong>i番目の値</strong>を取り出す（先頭は0番目。<code>nums[0]</code>が最初の値）</li>
</ul>
<p>番号が0から始まる点に注意してください。個数が<code>len(nums)</code>のとき、有効な番号は<code>0</code>から<code>len(nums)-1</code>までです。だからforの条件は<code>i &lt;= len(nums)</code>ではなく<code>i &lt; len(nums)</code>になります。</p>
<p>可変長引数のルールも押さえておきましょう。</p>
<ul>
<li>可変長にできるのは<strong>最後の引数だけ</strong>。<code>func f(label string, nums ...int)</code>は可能ですが、<code>...</code>の後ろに別の引数は置けません</li>
<li>1つの関数に<code>...</code>を2つ以上は使えません</li>
</ul>
<p>実は皆さんはすでに可変長引数のお世話になっています。<code>fmt.Println("a", 1, true)</code>のように何個でも値を渡せるのは、Printlnが可変長引数で定義されているからです。なお、受け取った<code>nums</code>の正体は「スライス」というデータ構造ですが、詳しくは後の章で学ぶので今は深入りしなくて大丈夫です。</p>`,
      task: `可変長引数で任意個の整数を受け取り、合計を返す関数<code>sum</code>を完成させてください。<code>main</code>で<code>sum(1, 2, 3, 4, 5)</code>の結果を「合計: 15」と表示します。`,
      code: `package main

import "fmt"

// TODO: forループでnumsの値をすべてtotalに足し込む
func sum(nums ...int) int {
	total := 0
	return total
}

func main() {
	fmt.Println("合計:", sum(1, 2, 3, 4, 5))
}
`,
      solution: `package main

import "fmt"

func sum(nums ...int) int {
	total := 0
	for i := 0; i < len(nums); i++ {
		total += nums[i]
	}
	return total
}

func main() {
	fmt.Println("合計:", sum(1, 2, 3, 4, 5))
}
`,
      hints: [
        `個数はlen(nums)で分かるので、第3章で学んだ「for i := 0; i < len(nums); i++」の形が使えます。`,
        `i番目の値はnums[i]で取り出せます。番号は0から始まります。`,
        `ループの中で「total += nums[i]」と足し込み、最後にtotalを返します。1+2+3+4+5=15です。`
      ],
      expectedOutput: "合計: 15"
    },
    {
      id: 37,
      title: "deferの基本",
      explanation: `<p><strong>defer</strong>（ディファー：延期する）は、<strong>関数呼び出しをその関数が終わる直前まで遅らせる</strong>Go独特の文です。</p>
<pre><code>func main() {
    defer fmt.Println("後片付け")
    fmt.Println("処理中")
}
// 出力：
// 処理中
// 後片付け</code></pre>
<p><code>defer</code>を付けた行は書かれた場所ではすぐに実行されず、<strong>関数を抜ける直前</strong>に実行されます。上の例では、mainの実行が終わる直前に「後片付け」が表示されます。</p>
<p>何のための機能でしょうか。プログラムには「使い始めたら、最後に必ず後始末が要る」ものがたくさんあります（ファイルを開いたら閉じる、ロックを取ったら解放する等）。deferを使うと、<strong>資源を確保した直後に後始末を予約する</strong>という書き方ができます。</p>
<pre><code>// 後の章で学ぶ実務の定番パターン（雰囲気だけ）
f := open()
defer f.close() // 開いた直後に「閉じる」を予約
// ここから先、fを使う長い処理が続いても閉じ忘れない</code></pre>
<p>確保と解放のコードが隣り合うので<strong>解放し忘れが起きにくく</strong>、途中に<code>return</code>が何個あっても、<strong>どの経路で関数を抜けるときも必ず実行される</strong>のが強力な点です。早期リターンを多用するGoのスタイルとdeferは相性抜群です。</p>
<p>1つ重要な仕様があります。deferする関数の<strong>引数はdeferの行を通過した時点で評価（確定）</strong>されます。実行だけが後回しになるのであって、引数の値まで後で決まるわけではありません。</p>
<pre><code>x := 1
defer fmt.Println("deferされたx:", x) // この時点のx=1で確定
x = 100
// mainの最後に「deferされたx: 1」と表示される（100ではない）</code></pre>`,
      task: `「後片付け」と表示する行に<code>defer</code>を付けて、「開始」「処理中」の後、mainの最後に「後片付け」と表示されるようにしてください。まず初期コードをそのまま実行して、出力順の違いを観察するのがおすすめです。`,
      code: `package main

import "fmt"

func main() {
	fmt.Println("開始")
	// TODO: この行にdeferを付けて、mainの最後に実行されるようにする
	fmt.Println("後片付け")
	fmt.Println("処理中")
}
`,
      solution: `package main

import "fmt"

func main() {
	fmt.Println("開始")
	defer fmt.Println("後片付け")
	fmt.Println("処理中")
}
`,
      hints: [
        `まずそのまま実行すると「開始」「後片付け」「処理中」の順で表示されます。この順番をdeferで変えます。`,
        `行の先頭にdeferを付けて「defer fmt.Println("後片付け")」とします。`,
        `deferを付けた呼び出しは関数を抜ける直前に実行されるので、出力は「開始」「処理中」「後片付け」の順になります。`
      ],
      expectedOutput: "後片付け"
    },
    {
      id: 38,
      title: "deferの実行順序（LIFO）",
      explanation: `<p>1つの関数の中で<code>defer</code>を複数回使うと、どの順番で実行されるのでしょうか。答えは<strong>後に登録したものから先に実行</strong>です。この順序を<strong>LIFO</strong>（Last In, First Out：後入れ先出し）と呼びます。</p>
<pre><code>func main() {
    defer fmt.Println("1番目に登録")
    defer fmt.Println("2番目に登録")
    defer fmt.Println("3番目に登録")
    fmt.Println("通常処理")
}
// 出力：
// 通常処理
// 3番目に登録
// 2番目に登録
// 1番目に登録</code></pre>
<p>deferされた呼び出しは<strong>スタック</strong>（積み上げ式の置き場。皿を積んで上から取るイメージ）に積まれていき、関数を抜けるときに上から順に取り出されます。だから登録の逆順になるのです。</p>
<p>この逆順は偶然ではなく、<strong>後始末の正しい順序</strong>そのものです。資源Aを確保してから資源Bを確保した場合、解放はB→Aの順で行うのが原則です（Bの処理がAに依存しているかもしれないため）。ネストした資源の後始末を書くと自然に正しい順序になります。</p>
<pre><code>a := openA()
defer a.close() // 後で実行される（2番目に解放）
b := openB(a)
defer b.close() // 先に実行される（1番目に解放）</code></pre>
<p>確保の順序と逆の順序で解放される——deferのLIFOはこの原則を自動で守ってくれる設計なのです。</p>
<p>なお、deferは<code>for</code>ループの中で使うと注意が必要です。deferは「関数を抜けるとき」まで実行されないため、ループ1万回で1万個のdeferが溜まります。ループ内の後始末は関数に切り出すのが定石ですが、これは実務で出会ったときに思い出せれば十分です。</p>`,
      task: `3つの<code>defer</code>を追加して、通常処理の後に「3番目に登録」「2番目に登録」「1番目に登録」の順（登録の逆順）で表示されるプログラムを完成させてください。`,
      code: `package main

import "fmt"

func main() {
	// TODO: 「1番目に登録」「2番目に登録」「3番目に登録」の順に
	// 3つのdefer fmt.Println(...)を書く
	fmt.Println("通常処理")
	// 実行して、表示が登録の逆順（3→2→1）になることを確認する
}
`,
      solution: `package main

import "fmt"

func main() {
	defer fmt.Println("1番目に登録")
	defer fmt.Println("2番目に登録")
	defer fmt.Println("3番目に登録")
	fmt.Println("通常処理")
}
`,
      hints: [
        `defer fmt.Println("1番目に登録") のような行を3つ、上から1番目→2番目→3番目の順に並べます。`,
        `deferはスタックに積まれるので、実行は積んだ順の逆（3番目→2番目→1番目）になります。`,
        `出力の1行目は「通常処理」です。deferはすべてmainを抜ける直前にまとめて実行されます。`
      ],
      expectedOutput: "1番目に登録"
    },
    {
      id: 39,
      title: "再帰関数（階乗）",
      explanation: `<p><strong>再帰関数</strong>とは、<strong>自分自身を呼び出す関数</strong>のことです。「同じ形のより小さい問題」に分解できる処理を、驚くほど簡潔に書けます。</p>
<p>定番の例が<strong>階乗</strong>です。nの階乗（n!と書く）は1からnまでの整数をすべて掛けた値で、5! = 5×4×3×2×1 = 120です。ここで構造に注目すると、<strong>5! = 5 × 4!</strong>、つまり「nの階乗はn×(n-1)の階乗」という、自分自身を使った定義になっています。これをそのままコードにします。</p>
<pre><code>func factorial(n int) int {
    if n &lt;= 1 {
        return 1 // 基底ケース：これ以上分解しない
    }
    return n * factorial(n-1) // 再帰ケース：小さい問題に任せる
}</code></pre>
<p>再帰関数は必ず2つの部分でできています。</p>
<table>
<tr><th>部分</th><th>役割</th><th>例</th></tr>
<tr><td><strong>基底ケース</strong></td><td>再帰を止める条件。自分を呼ばずに値を返す</td><td><code>n &lt;= 1</code>なら1を返す</td></tr>
<tr><td><strong>再帰ケース</strong></td><td>問題を小さくして自分を呼ぶ</td><td><code>n * factorial(n-1)</code></td></tr>
</table>
<p><code>factorial(3)</code>の動きを追うと、<code>3 * factorial(2)</code> → <code>3 * (2 * factorial(1))</code> → <code>3 * (2 * 1)</code> = 6 という流れです。呼び出しが積み重なり、基底ケースに達した瞬間から順に値が確定して戻っていきます。</p>
<p><strong>基底ケースを忘れる（または到達できない）と無限に自分を呼び続け</strong>、スタックオーバーフロー（呼び出しの積み重ねがあふれるエラー）でプログラムが落ちます。無限ループのbreakと同じで、「必ず止まるか？」「呼び出すたびに問題は小さくなっているか？」の確認が再帰の生命線です。再帰はループでも書き換えられますが、後の章で扱うツリー構造の探索など、再帰のほうが圧倒的に自然な問題も多くあります。</p>`,
      task: `階乗を計算する再帰関数<code>factorial</code>を完成させてください。基底ケース（<code>n &lt;= 1</code>なら1を返す）と再帰ケースを書き、「5! = 120」と表示されれば成功です。`,
      code: `package main

import "fmt"

func factorial(n int) int {
	// TODO: 基底ケース：nが1以下なら1を返す
	// TODO: 再帰ケース：n * factorial(n-1) を返す
	return 0
}

func main() {
	fmt.Println("5! =", factorial(5))
}
`,
      solution: `package main

import "fmt"

func factorial(n int) int {
	if n <= 1 {
		return 1
	}
	return n * factorial(n-1)
}

func main() {
	fmt.Println("5! =", factorial(5))
}
`,
      hints: [
        `まず止まる条件（基底ケース）から書きます。「if n <= 1 { return 1 }」です。`,
        `基底ケースの後に「return n * factorial(n-1)」と書くと、自分より1小さい階乗に残りを任せられます。`,
        `factorial(5)は5*4*3*2*1=120になります。return 0の行は不要になるので削除してください。`
      ],
      expectedOutput: "5! = 120"
    },
    {
      id: 40,
      title: "総合演習（摂氏・華氏変換関数群）",
      explanation: `<p>第4章の総仕上げとして、温度変換を行う<strong>関数群</strong>を作ります。日本で使う摂氏（℃）とアメリカなどで使う華氏（℉）の間には、次の変換式があります。</p>
<table>
<tr><th>変換</th><th>式</th></tr>
<tr><td>摂氏→華氏</td><td>F = C × 9 ÷ 5 + 32</td></tr>
<tr><td>華氏→摂氏</td><td>C = (F − 32) × 5 ÷ 9</td></tr>
</table>
<p>検算に使える代表値も覚えておきましょう。水の凝固点は摂氏0度＝華氏32度、沸点は摂氏100度＝華氏212度です。</p>
<p>今回は温度を<code>float64</code>で扱います。第2章で学んだ通り、整数同士の割り算は小数部が切り捨てられるので、<code>9/5</code>ではなく<code>9.0/5.0</code>と小数で書くのが安全です。関数の形は「float64を受け取りfloat64を返す」になります。</p>
<pre><code>func cToF(c float64) float64 {
    return c*9.0/5.0 + 32.0
}</code></pre>
<p>表示には<code>fmt.Printf</code>と書式指定<code>%.1f</code>（小数第1位まで表示）を使うと、桁が揃って読みやすくなります。</p>
<pre><code>fmt.Printf("摂氏%.1f度は華氏%.1f度\\n", 100.0, cToF(100.0))</code></pre>
<p>この演習のポイントは、<strong>変換ロジックを関数に閉じ込める</strong>ことです。式をmainに直接書けば動きはしますが、関数にすることで「変換式が正しいか」を1か所だけ確認すれば済み、何度でも再利用できます。逆方向の変換<code>fToC</code>を作ったら、<code>fToC(cToF(25.0))</code>が25に戻ることを確かめる——つまり<strong>往復変換で検算する</strong>のも実務的なテクニックです。小さくても「入力を受け取り、計算し、値を返す」純粋な関数の集まりは、この後学ぶテストとも相性が良い設計です。</p>`,
      task: `摂氏→華氏の<code>cToF</code>を参考に、華氏→摂氏の変換関数<code>fToC</code>を定義してください。<code>main</code>のTODOを埋めて「華氏32.0度は摂氏0.0度」という行も表示されるようにします。`,
      code: `package main

import "fmt"

// 摂氏を華氏に変換する
func cToF(c float64) float64 {
	return c*9.0/5.0 + 32.0
}

// TODO: 華氏を摂氏に変換する関数fToCを定義する（式：(f - 32) × 5 ÷ 9）

func main() {
	fmt.Printf("摂氏%.1f度は華氏%.1f度\\n", 100.0, cToF(100.0))
	// TODO: fToCを使って「華氏32.0度は摂氏0.0度」と表示する
}
`,
      solution: `package main

import "fmt"

// 摂氏を華氏に変換する
func cToF(c float64) float64 {
	return c*9.0/5.0 + 32.0
}

// 華氏を摂氏に変換する
func fToC(f float64) float64 {
	return (f - 32.0) * 5.0 / 9.0
}

func main() {
	fmt.Printf("摂氏%.1f度は華氏%.1f度\\n", 100.0, cToF(100.0))
	fmt.Printf("華氏%.1f度は摂氏%.1f度\\n", 32.0, fToC(32.0))
}
`,
      hints: [
        `fToCはcToFと同じ形で、式だけ逆変換にします。「func fToC(f float64) float64 { ... }」です。`,
        `変換式は「return (f - 32.0) * 5.0 / 9.0」です。引き算を括弧で先に計算させるのを忘れずに。`,
        `表示はcToFの行を参考に、fmt.Printf("華氏%.1f度は摂氏%.1f度\\n", 32.0, fToC(32.0)) と書きます。華氏32度は摂氏0度です。`
      ],
      expectedOutput: "華氏32.0度は摂氏0.0度"
    }
  ]
});
