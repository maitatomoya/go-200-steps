// 第5章：配列とスライス
registerChapter({
  number: 5,
  title: "配列とスライス",
  description: "固定長の配列と、Goで最もよく使う可変長のスライスを学びます。appendやcap、内部配列の共有といったスライス特有の仕組みを体験します。",
  steps: [
    {
      id: 41,
      title: "配列の宣言と固定長という性質",
      explanation: `<p>複数の値をまとめて扱う最も基本的な仕組みが<strong>配列</strong>です。Goの配列は<strong>固定長</strong>、つまり作成時に決めた長さを後から変えることができません。</p>
<pre><code>var a [3]int            // 長さ3のint配列。全要素はゼロ値(0)
b := [3]int{10, 20, 30} // 宣言と同時に初期化
fmt.Println(a[0])       // インデックス(添字)は0から始まる
fmt.Println(len(b))     // 3(組み込み関数lenで長さを取得)</code></pre>
<p>重要なのは、<strong>長さが型の一部</strong>だという点です。<code>[3]int</code>と<code>[5]int</code>は別の型なので、互いに代入できません。</p>
<p>また、配列は<strong>値型</strong>です。別の変数に代入すると全要素がコピーされ、コピー先を変更しても元の配列は変わりません。</p>
<pre><code>x := [3]int{1, 2, 3}
y := x      // 全要素がコピーされる
y[0] = 100
fmt.Println(x[0]) // 1のまま(xは影響を受けない)</code></pre>
<table>
<tr><th>特徴</th><th>内容</th></tr>
<tr><td>長さ</td><td>固定。型の一部になる</td></tr>
<tr><td>初期値</td><td>各要素は型のゼロ値</td></tr>
<tr><td>代入</td><td>全要素がコピーされる(値型)</td></tr>
</table>
<p>固定長という性質は不便に見えますが、次のステップで学ぶ<strong>スライス</strong>の土台として配列を理解しておくことが大切です。実務では配列を直接使う場面は少なく、ほとんどの場合スライスを使います。</p>`,
      task: `<code>a[2]</code>に<code>30</code>を代入して、配列の全要素と長さを表示してください。`,
      code: `package main

import "fmt"

func main() {
	// 長さ3のint配列。各要素はゼロ値(0)で初期化される
	var a [3]int
	a[0] = 10
	a[1] = 20
	// TODO: a[2]に30を代入する

	fmt.Println("配列:", a)
	fmt.Println("長さ:", len(a))
}
`,
      solution: `package main

import "fmt"

func main() {
	// 長さ3のint配列。各要素はゼロ値(0)で初期化される
	var a [3]int
	a[0] = 10
	a[1] = 20
	a[2] = 30

	fmt.Println("配列:", a)
	fmt.Println("長さ:", len(a))
}
`,
      hints: [
        `配列の要素には「変数名[インデックス]」でアクセスします。インデックスは0から始まるので、3番目の要素はa[2]です。`,
        `a[0] = 10 と同じ書き方で、a[2]に30を代入しましょう。`
      ],
      expectedOutput: "配列: [10 20 30]"
    },
    {
      id: 42,
      title: "スライスの基本（宣言・リテラル）",
      explanation: `<p>Goで「複数の値の並び」を扱うとき、実際に使うのはほぼ<strong>スライス</strong>です。スライスは配列と違って<strong>長さを自由に変えられる</strong>可変長のデータ構造です。</p>
<pre><code>var s []int              // int型のスライス(まだ要素なし)
t := []int{2, 4, 6}      // スライスリテラルで作成
u := []string{"a", "b"}  // 文字列のスライス</code></pre>
<p>見た目のポイントは<strong>角かっこの中に長さを書かない</strong>ことです。<code>[3]int</code>は配列、<code>[]int</code>はスライスと、この違いだけで別物になります。</p>
<table>
<tr><th></th><th>配列</th><th>スライス</th></tr>
<tr><td>書き方</td><td><code>[3]int{1, 2, 3}</code></td><td><code>[]int{1, 2, 3}</code></td></tr>
<tr><td>長さ</td><td>固定</td><td>可変(appendで伸ばせる)</td></tr>
<tr><td>実務での使用頻度</td><td>低い</td><td>非常に高い</td></tr>
</table>
<p><code>var s []int</code>のように宣言だけした場合、スライスのゼロ値は<strong>nil</strong>(何も指していない状態)になります。nilスライスでも<code>len(s)</code>は0を返し、後述のappendも問題なく使えるので、空のスライスの出発点としてよく使われます。</p>
<pre><code>var s []int
fmt.Println(s == nil) // true
fmt.Println(len(s))   // 0</code></pre>
<p>要素へのアクセスや<code>len</code>の使い方は配列と同じです。まずはスライスリテラルで値を作ることに慣れましょう。</p>`,
      task: `スライスリテラルを使って、<code>2, 4, 6</code>の3要素を持つ<code>[]int</code>を変数<code>nums</code>に代入してください。`,
      code: `package main

import "fmt"

func main() {
	// 配列:型に長さが含まれる
	arr := [3]string{"Go", "Java", "Python"}

	// TODO: スライスリテラルで 2, 4, 6 を持つ[]intを作り、numsに代入する
	var nums []int

	fmt.Println("配列:", arr)
	fmt.Println("スライス:", nums)
	fmt.Println("要素数:", len(nums))
}
`,
      solution: `package main

import "fmt"

func main() {
	// 配列:型に長さが含まれる
	arr := [3]string{"Go", "Java", "Python"}

	// スライスリテラル:長さを書かない
	nums := []int{2, 4, 6}

	fmt.Println("配列:", arr)
	fmt.Println("スライス:", nums)
	fmt.Println("要素数:", len(nums))
}
`,
      hints: [
        `スライスリテラルは配列リテラルとほぼ同じ書き方ですが、角かっこの中に長さを書きません。`,
        `var nums []int の行を、:= を使ったスライスリテラルの代入に書き換えましょう。`
      ],
      expectedOutput: "スライス: [2 4 6]"
    },
    {
      id: 43,
      title: "appendで要素を追加する",
      explanation: `<p>スライスに要素を追加するには組み込み関数<strong>append</strong>を使います。これがスライスを「可変長」たらしめる中心的な機能です。</p>
<pre><code>var todo []string
todo = append(todo, "牛乳を買う")        // 1件追加
todo = append(todo, "掃除", "洗濯")      // 複数まとめて追加も可能
fmt.Println(todo) // [牛乳を買う 掃除 洗濯]</code></pre>
<p>最重要ポイントは、<strong>appendは新しいスライスを返す</strong>ということです。元のスライスを直接書き換えるのではなく、要素を追加した結果を戻り値として返すので、必ず<code>todo = append(todo, ...)</code>のように<strong>結果を受け取り直す</strong>必要があります。</p>
<pre><code>// よくある間違い:戻り値を受け取らない
append(todo, "ゴミ出し") // コンパイルエラー(appendの結果が未使用)</code></pre>
<p>Goは「関数の戻り値を使い忘れている」ことをエラーで教えてくれるため、この間違いはすぐ気づけます。</p>
<p>なぜ戻り値を返す設計なのかというと、追加によってスライスの内部データが別の場所に引っ越すことがあるからです。この仕組みは次のステップのcap(容量)で詳しく観察します。</p>
<p>nilスライス(<code>var todo []string</code>)に対してもappendはそのまま使えます。「空で始めてappendで育てる」のはGoの定番パターンなので、体で覚えてしまいましょう。</p>`,
      task: `<code>append</code>を使って<code>todo</code>に<code>"Goの勉強"</code>を追加してください。`,
      code: `package main

import "fmt"

func main() {
	var todo []string // nilスライスから始める
	todo = append(todo, "牛乳を買う")
	todo = append(todo, "掃除をする")
	// TODO: appendで"Goの勉強"を追加する

	fmt.Println(todo)
	fmt.Println("件数:", len(todo))
}
`,
      solution: `package main

import "fmt"

func main() {
	var todo []string // nilスライスから始める
	todo = append(todo, "牛乳を買う")
	todo = append(todo, "掃除をする")
	// appendの結果は必ず受け取り直す
	todo = append(todo, "Goの勉強")

	fmt.Println(todo)
	fmt.Println("件数:", len(todo))
}
`,
      hints: [
        `appendは「追加した結果の新しいスライス」を返します。戻り値を元の変数に代入し直すのを忘れずに。`,
        `上の2行と同じ形で、todo = append(todo, "Goの勉強") と書きます。`
      ],
      expectedOutput: "[牛乳を買う 掃除をする Goの勉強]"
    },
    {
      id: 44,
      title: "lenとcap（appendで容量が伸びる様子）",
      explanation: `<p>スライスには2つの「大きさ」があります。<strong>len(長さ)</strong>は今入っている要素数、<strong>cap(容量)</strong>は内部に確保されているメモリに入る最大要素数です。</p>
<pre><code>s := []int{1, 2, 3}
fmt.Println(len(s)) // 3
fmt.Println(cap(s)) // 3</code></pre>
<p>スライスの正体は、<strong>内部配列(データの実体)を指し示す小さな管理情報</strong>です。管理情報には「先頭位置・len・cap」の3つが入っています。</p>
<p>appendで要素を追加するとき、capに余裕があれば内部配列の空きにそのまま書き込みます。しかし<strong>capが足りなくなると、より大きな内部配列を新しく確保してデータを引っ越し</strong>ます。だからappendは新しいスライスを返すのです。</p>
<table>
<tr><th>操作</th><th>capに余裕あり</th><th>capが満杯</th></tr>
<tr><td>append</td><td>空きに書き込む(高速)</td><td>大きい配列を確保して全要素をコピー</td></tr>
</table>
<p>容量の拡張は「不足のたびに1つずつ」ではなく、<strong>まとめて倍程度に増やす</strong>戦略が取られます。こうすることでコピーの回数を減らし、平均的には高速に追加できるようになっています(拡張の具体的な幅はGoのバージョンにより変わる可能性があり、仕様で保証されてはいません)。</p>
<p>実行してlenとcapの変化を観察してみましょう。lenは1ずつ増えるのに、capは飛び飛びに増えることが確認できます。</p>`,
      task: `コードを実行してlenとcapの変化を確認したら、さらに2回<code>append</code>して、そのたびにlenとcapを表示してください。`,
      code: `package main

import "fmt"

func main() {
	s := []int{1, 2, 3}
	fmt.Println("len =", len(s), "cap =", cap(s))

	s = append(s, 4)
	fmt.Println("len =", len(s), "cap =", cap(s))

	// TODO: さらに2回appendして、そのたびにlenとcapを表示する
}
`,
      solution: `package main

import "fmt"

func main() {
	s := []int{1, 2, 3}
	fmt.Println("len =", len(s), "cap =", cap(s))

	s = append(s, 4)
	fmt.Println("len =", len(s), "cap =", cap(s))

	// capに余裕がある間はlenだけが増え、満杯になるとcapがまとめて増える
	s = append(s, 5)
	fmt.Println("len =", len(s), "cap =", cap(s))

	s = append(s, 6)
	fmt.Println("len =", len(s), "cap =", cap(s))
}
`,
      hints: [
        `lenは要素数、capは内部配列に入る最大数です。appendのたびに両方を表示すると変化が見えます。`,
        `s = append(s, 5) の後に fmt.Println("len =", len(s), "cap =", cap(s)) を書く、を2セット追加しましょう。`
      ],
      expectedOutput: "len = 3 cap = 3"
    },
    {
      id: 45,
      title: "makeでスライスを作る",
      explanation: `<p>組み込み関数<strong>make</strong>を使うと、<strong>長さや容量をあらかじめ指定して</strong>スライスを作れます。</p>
<pre><code>a := make([]int, 3)     // len=3、cap=3。要素はゼロ値(0)
b := make([]int, 0, 5)  // len=0、cap=5。空だが5個分の場所を確保済み</code></pre>
<p>2つの形の違いを整理しましょう。</p>
<table>
<tr><th>書き方</th><th>len</th><th>cap</th><th>用途</th></tr>
<tr><td><code>make([]int, 3)</code></td><td>3</td><td>3</td><td>最初から3要素(ゼロ値)を使いたい</td></tr>
<tr><td><code>make([]int, 0, 5)</code></td><td>0</td><td>5</td><td>空から始めてappendで詰める</td></tr>
</table>
<p><code>make([]int, 0, 5)</code>が便利なのは、<strong>追加する要素数の見当がついている</strong>場面です。前ステップで見たように、capが足りなくなると内部配列の引っ越し(確保とコピー)が発生します。最初から必要な容量を確保しておけば、cap内のappendでは引っ越しが起きず効率的です。</p>
<pre><code>// 100件入れると分かっているなら
result := make([]int, 0, 100)
for i := 0; i &lt; 100; i++ {
	result = append(result, i*2) // 引っ越しが発生しない
}</code></pre>
<p>ありがちな間違いは、<code>make([]int, 5)</code>で作ってからappendしてしまうことです。この場合len=5(ゼロ値が5個)の後ろに追加されるため、<code>[0 0 0 0 0 10]</code>のような意図しない結果になります。「appendで詰めるなら長さは0にする」と覚えておきましょう。</p>`,
      task: `<code>make</code>を使って、長さ0・容量5のスライス<code>b</code>を作ってください。`,
      code: `package main

import "fmt"

func main() {
	// 長さ3のスライス。要素はゼロ値で埋まる
	a := make([]int, 3)
	fmt.Println(a, "len =", len(a), "cap =", cap(a))

	// TODO: makeで長さ0・容量5のスライスを作る
	b := make([]int, 0)

	b = append(b, 10)
	fmt.Println(b, "len =", len(b), "cap =", cap(b))
}
`,
      solution: `package main

import "fmt"

func main() {
	// 長さ3のスライス。要素はゼロ値で埋まる
	a := make([]int, 3)
	fmt.Println(a, "len =", len(a), "cap =", cap(a))

	// 長さ0・容量5:空だが5個分の場所を確保済み
	b := make([]int, 0, 5)

	b = append(b, 10)
	fmt.Println(b, "len =", len(b), "cap =", cap(b))
}
`,
      hints: [
        `makeは第2引数が長さ、第3引数が容量です。容量を指定するときは3つの引数を渡します。`,
        `make([]int, 0) を make([]int, 0, 5) に書き換えましょう。appendしてもcapが5のままなことを確認してください。`
      ],
      expectedOutput: "[10] len = 1 cap = 5"
    },
    {
      id: 46,
      title: "部分スライスs[1:3]と内部配列の共有",
      explanation: `<p>スライスから一部分を切り出すには<strong>スライス式</strong><code>s[開始:終了]</code>を使います。<strong>開始インデックスは含み、終了インデックスは含まない</strong>のがルールです。</p>
<pre><code>s := []int{10, 20, 30, 40, 50}
sub := s[1:3]  // インデックス1と2 → [20 30]
fmt.Println(s[:2]) // 先頭から:[10 20]
fmt.Println(s[3:]) // 末尾まで:[40 50]</code></pre>
<p>ここに、スライス最大の注意点があります。部分スライスは<strong>データをコピーしません</strong>。元のスライスと<strong>同じ内部配列を共有</strong>し、見る範囲だけが違う「別の窓」を作るイメージです。</p>
<pre><code>sub[0] = 999
fmt.Println(sub) // [999 30]
fmt.Println(s)   // [10 999 30 40 50] ← 元も変わる!</code></pre>
<p><code>sub[0]</code>と<code>s[1]</code>は内部配列上の同じ場所を指しているため、片方を書き換えるともう片方にも反映されます。</p>
<table>
<tr><th>操作</th><th>データのコピー</th><th>変更の影響</th></tr>
<tr><td><code>s[1:3]</code>(部分スライス)</td><td>されない</td><td>元のスライスに及ぶ</td></tr>
<tr><td>後で学ぶ<code>copy</code></td><td>される</td><td>独立する</td></tr>
</table>
<p>この共有はコピーを避けられるので高速ですが、「切り出した側をいじったら元データが壊れていた」というバグの原因にもなります。実務でも頻出の落とし穴なので、ここで実際に体験しておきましょう。</p>`,
      task: `実行して<code>sub</code>への代入が元の<code>s</code>にも反映されることを確認したら、<code>s[2:4]</code>を切り出して変数<code>t</code>に入れ、表示するコードを追加してください。`,
      code: `package main

import "fmt"

func main() {
	s := []int{10, 20, 30, 40, 50}
	sub := s[1:3] // インデックス1から2まで(3は含まない)
	fmt.Println("sub =", sub)

	// 部分スライスの要素を書き換えると…
	sub[0] = 999

	fmt.Println("sub =", sub)
	fmt.Println("s   =", s) // 元のsも変わっている!

	// TODO: s[2:4]を変数tに切り出して表示する
}
`,
      solution: `package main

import "fmt"

func main() {
	s := []int{10, 20, 30, 40, 50}
	sub := s[1:3] // インデックス1から2まで(3は含まない)
	fmt.Println("sub =", sub)

	// 部分スライスの要素を書き換えると…
	sub[0] = 999

	fmt.Println("sub =", sub)
	fmt.Println("s   =", s) // 元のsも変わっている!

	// s[2:4]はインデックス2と3 → [30 40]
	t := s[2:4]
	fmt.Println("t   =", t)
}
`,
      hints: [
        `スライス式s[a:b]は「インデックスaからb-1まで」を切り出します。b番目の要素は含まれません。`,
        `t := s[2:4] と書いてfmt.Printlnで表示しましょう。インデックス2と3の要素、つまり[30 40]になるはずです。`
      ],
      expectedOutput: "s   = [10 999 30 40 50]"
    },
    {
      id: 47,
      title: "rangeでスライスを走査する",
      explanation: `<p>スライスの全要素を順に処理するには<strong>for range</strong>を使います。第3章で学んだforの仲間で、スライス走査の決定版です。</p>
<pre><code>fruits := []string{"りんご", "みかん", "ぶどう"}
for i, f := range fruits {
	fmt.Println(i, f) // iはインデックス、fは要素の値
}
// 0 りんご
// 1 みかん
// 2 ぶどう</code></pre>
<p>rangeは毎回<strong>「インデックス」と「その位置の要素のコピー」</strong>の2つを返します。値だけが欲しくてインデックスが不要なときは、<strong>ブランク識別子</strong><code>_</code>(アンダースコア)で受け取って無視します。</p>
<pre><code>total := 0
for _, p := range prices {
	total += p // 値だけ使う
}</code></pre>
<p>Goは未使用変数をコンパイルエラーにするため、「使わないけど受け取る場所は必要」という場面で<code>_</code>が活躍します。逆にインデックスだけ欲しい場合は<code>for i := range prices</code>と値の受け取りを省略できます。</p>
<table>
<tr><th>書き方</th><th>受け取るもの</th></tr>
<tr><td><code>for i, v := range s</code></td><td>インデックスと値</td></tr>
<tr><td><code>for i := range s</code></td><td>インデックスのみ</td></tr>
<tr><td><code>for _, v := range s</code></td><td>値のみ</td></tr>
</table>
<p>1つ注意点として、rangeの<code>v</code>は要素の<strong>コピー</strong>なので、<code>v</code>に代入しても元のスライスは変わりません。元を書き換えたいときは<code>s[i] = ...</code>とインデックス経由で代入します。</p>`,
      task: `<code>for range</code>とブランク識別子<code>_</code>を使って、<code>prices</code>の合計を<code>total</code>に計算してください。`,
      code: `package main

import "fmt"

func main() {
	fruits := []string{"りんご", "みかん", "ぶどう"}

	// インデックスと値の両方を受け取る
	for i, f := range fruits {
		fmt.Println(i, f)
	}

	// TODO: インデックスを_で無視して、値だけで合計を計算する
	prices := []int{100, 80, 300}
	total := 0

	fmt.Println("合計:", total)
}
`,
      solution: `package main

import "fmt"

func main() {
	fruits := []string{"りんご", "みかん", "ぶどう"}

	// インデックスと値の両方を受け取る
	for i, f := range fruits {
		fmt.Println(i, f)
	}

	// インデックスは不要なので_で無視する
	prices := []int{100, 80, 300}
	total := 0
	for _, p := range prices {
		total += p
	}

	fmt.Println("合計:", total)
}
`,
      hints: [
        `rangeはインデックスと値の2つを返します。使わない方は_で受け取るとコンパイルエラーになりません。`,
        `for _, p := range prices { total += p } の形です。`
      ],
      expectedOutput: "合計: 480"
    },
    {
      id: 48,
      title: "スライスのコピー（copy関数と代入の違い）",
      explanation: `<p>ステップ46で見たように、スライスは代入しても<strong>内部配列を共有</strong>します。代入でコピーされるのは「先頭位置・len・cap」の管理情報だけだからです。</p>
<pre><code>original := []int{1, 2, 3}
shared := original   // 管理情報のコピー。データは共有
shared[0] = 100
fmt.Println(original) // [100 2 3] ← 元も変わる</code></pre>
<p>データごと独立した複製が欲しいときは、組み込み関数<strong>copy</strong>を使います。<code>copy(コピー先, コピー元)</code>の順で渡し、実際にコピーできた要素数を返します。</p>
<pre><code>independent := make([]int, len(original)) // コピー先の場所を確保
n := copy(independent, original)          // 要素を複製
fmt.Println(n) // 3(コピーできた要素数)</code></pre>
<p>重要なのは、<strong>コピー先の長さの分しかコピーされない</strong>ことです。copyは「コピー先のlen」と「コピー元のlen」の小さい方までしか書き込まないため、コピー先を<code>make</code>で十分な長さにしておく必要があります。<code>var d []int</code>(len=0)に対してcopyしても1件もコピーされません。これは初心者が必ず一度は踏む罠です。</p>
<table>
<tr><th></th><th>代入(=)</th><th>copy関数</th></tr>
<tr><td>コピーされるもの</td><td>管理情報のみ</td><td>要素データ</td></tr>
<tr><td>内部配列</td><td>共有される</td><td>独立する</td></tr>
<tr><td>片方を変更すると</td><td>もう片方にも影響</td><td>影響しない</td></tr>
</table>
<p>「共有でよいのか、独立させたいのか」を意識して使い分けるのが、スライスを安全に扱うコツです。</p>`,
      task: `<code>copy</code>関数を使って、<code>original</code>の要素を<code>independent</code>に複製してください。複製後に<code>independent[0]</code>を書き換えても<code>original</code>が変わらないことを確認しましょう。`,
      code: `package main

import "fmt"

func main() {
	original := []int{1, 2, 3}

	// 代入は管理情報のコピー。内部配列は共有される
	shared := original
	shared[0] = 100
	fmt.Println("original =", original) // 共有なので[100 2 3]に変わる

	// TODO: copy関数でoriginalの要素をindependentに複製する
	independent := make([]int, len(original))

	independent[0] = 999
	fmt.Println("original =", original)
	fmt.Println("independent =", independent)
}
`,
      solution: `package main

import "fmt"

func main() {
	original := []int{1, 2, 3}

	// 代入は管理情報のコピー。内部配列は共有される
	shared := original
	shared[0] = 100
	fmt.Println("original =", original) // 共有なので[100 2 3]に変わる

	// copyで要素データを複製する(コピー先の長さ分だけコピーされる)
	independent := make([]int, len(original))
	copy(independent, original)

	independent[0] = 999
	fmt.Println("original =", original)
	fmt.Println("independent =", independent)
}
`,
      hints: [
        `copyは copy(コピー先, コピー元) の順で引数を渡します。コピー先は十分な長さで確保済みであることが必要です。`,
        `makeの直後に copy(independent, original) を1行追加するだけです。`
      ],
      expectedOutput: "independent = [999 2 3]"
    },
    {
      id: 49,
      title: "多次元スライス",
      explanation: `<p>スライスの要素にスライスを入れると、表(行と列)のような<strong>多次元のデータ</strong>を表現できます。<code>[][]int</code>は「intのスライス」のスライス、つまり2次元スライスです。</p>
<pre><code>grid := [][]int{
	{1, 2, 3},
	{4, 5, 6},
}
fmt.Println(grid[0])    // [1 2 3](1行目)
fmt.Println(grid[1][2]) // 6(2行目の3列目)</code></pre>
<p>アクセスは<code>grid[行][列]</code>の2段階です。<code>grid[1]</code>で2行目のスライスを取り出し、さらに<code>[2]</code>でその中の要素を取り出す、と考えると分かりやすいでしょう。</p>
<p>行の追加は通常のappendと同じです。追加するのは「1行分のスライス」なので、<code>[]int{...}</code>を渡します。</p>
<pre><code>grid = append(grid, []int{7, 8, 9}) // 3行目を追加</code></pre>
<p>全要素の走査は<strong>rangeの二重ループ</strong>が定番です。外側で行を、内側でその行の要素を取り出します。</p>
<pre><code>for _, row := range grid {   // rowは1行分のスライス
	for _, v := range row {  // vは各要素
		fmt.Print(v, " ")
	}
	fmt.Println()
}</code></pre>
<p>注意点として、Goの2次元スライスは「行ごとに独立したスライス」の集まりなので、<strong>行ごとに長さが違っても構いません</strong>(ジャグ配列と呼ばれます)。行列計算のような均一な表を扱うときは、全行を同じ長さで作るよう自分で保証する必要があります。</p>`,
      task: `<code>append</code>で<code>grid</code>に3行目<code>{7, 8, 9}</code>を追加してください。追加後、各行の合計が表示されます。`,
      code: `package main

import "fmt"

func main() {
	grid := [][]int{
		{1, 2, 3},
		{4, 5, 6},
	}

	// TODO: appendで3行目 {7, 8, 9} を追加する

	// 各行の合計を計算する
	for _, row := range grid {
		sum := 0
		for _, v := range row {
			sum += v
		}
		fmt.Println(row, "行の合計:", sum)
	}
}
`,
      solution: `package main

import "fmt"

func main() {
	grid := [][]int{
		{1, 2, 3},
		{4, 5, 6},
	}

	// 追加するのは1行分のスライス
	grid = append(grid, []int{7, 8, 9})

	// 各行の合計を計算する
	for _, row := range grid {
		sum := 0
		for _, v := range row {
			sum += v
		}
		fmt.Println(row, "行の合計:", sum)
	}
}
`,
      hints: [
        `gridの要素の型は[]intです。appendに渡すのも[]int{7, 8, 9}という1行分のスライスになります。`,
        `grid = append(grid, []int{7, 8, 9}) と書きます。appendの結果を受け取り直すのを忘れずに。`
      ],
      expectedOutput: "[7 8 9] 行の合計: 24"
    },
    {
      id: 50,
      title: "総合演習：成績スライスの集計",
      explanation: `<p>第5章の総仕上げとして、テストの点数が入ったスライスを集計するプログラムを完成させます。使うのはこの章で学んだ知識と、第4章までの関数の知識だけです。</p>
<p>実装するのは次の3つの集計です。</p>
<table>
<tr><th>集計</th><th>考え方</th></tr>
<tr><td>平均点</td><td>rangeで合計を出し、要素数で割る</td></tr>
<tr><td>最高点</td><td>先頭の値を仮の最大とし、rangeでより大きい値が出たら更新</td></tr>
<tr><td>平均点以上の人数</td><td>rangeで1人ずつ平均と比較して数える</td></tr>
</table>
<p>ポイントを2つ確認しておきましょう。1つ目は<strong>整数どうしの割り算</strong>です。<code>386 / 5</code>は77になってしまい小数点以下が消えます。平均のような値は<code>float64(sum) / float64(len(scores))</code>のように、割る前にfloat64へ変換します。</p>
<pre><code>func average(scores []int) float64 {
	sum := 0
	for _, s := range scores {
		sum += s
	}
	return float64(sum) / float64(len(scores))
}</code></pre>
<p>2つ目は<strong>最大値の探し方</strong>です。「最初の要素を仮のチャンピオンにして、勝負させながら更新する」という定番パターンを使います。</p>
<pre><code>m := scores[0]
for _, s := range scores {
	if s &gt; m {
		m = s
	}
}</code></pre>
<p>スライスを関数の引数として渡す・集計してreturnする、という流れは実務のコードでも毎日のように登場します。自分の手で完成させて、この章を締めくくりましょう。</p>`,
      task: `<code>average</code>関数と<code>maxScore</code>関数のTODOを実装して、平均点・最高点・平均点以上の人数を正しく表示させてください。`,
      code: `package main

import "fmt"

// 平均点を計算する関数
func average(scores []int) float64 {
	// TODO: rangeで合計を計算し、float64に変換してから平均を返す
	return 0
}

// 最高点を返す関数
func maxScore(scores []int) int {
	m := scores[0]
	// TODO: rangeで走査し、mより大きい値が見つかったらmを更新する
	return m
}

func main() {
	scores := []int{72, 85, 91, 60, 78}

	avg := average(scores)
	fmt.Printf("平均点: %.1f\\n", avg)
	fmt.Println("最高点:", maxScore(scores))

	// 平均点以上の人数を数える
	count := 0
	for _, s := range scores {
		if float64(s) >= avg {
			count++
		}
	}
	fmt.Println("平均点以上:", count, "人")
}
`,
      solution: `package main

import "fmt"

// 平均点を計算する関数
func average(scores []int) float64 {
	sum := 0
	for _, s := range scores {
		sum += s
	}
	// 整数のまま割ると小数点以下が消えるので、先にfloat64へ変換する
	return float64(sum) / float64(len(scores))
}

// 最高点を返す関数
func maxScore(scores []int) int {
	m := scores[0]
	for _, s := range scores {
		if s > m {
			m = s
		}
	}
	return m
}

func main() {
	scores := []int{72, 85, 91, 60, 78}

	avg := average(scores)
	fmt.Printf("平均点: %.1f\\n", avg)
	fmt.Println("最高点:", maxScore(scores))

	// 平均点以上の人数を数える
	count := 0
	for _, s := range scores {
		if float64(s) >= avg {
			count++
		}
	}
	fmt.Println("平均点以上:", count, "人")
}
`,
      hints: [
        `averageでは、まずintの変数sumにrangeで合計を集め、最後にfloat64(sum) / float64(len(scores))を返します。`,
        `maxScoreは「仮の最大値mと各要素を比べて、大きければ入れ替える」パターンです。if s > m { m = s } をrangeの中に書きます。`,
        `点数が[72 85 91 60 78]なら、平均は77.2、最高点は91になるはずです。`
      ],
      expectedOutput: "平均点: 77.2"
    }
  ]
});
