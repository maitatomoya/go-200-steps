// 第19章：発展トピック
registerChapter({
  number: 19,
  title: "発展トピック",
  description: "iotaの応用やスライスの内部構造、deferやrecoverの罠など、Goを深く理解するための発展的な知識を学びます。",
  steps: [
    {
      id: 181,
      title: "iotaの応用（ビットフラグと列挙）",
      explanation: `<p><code>iota</code>（定数宣言の中で0から自動的に増える連番）は、単純な連番だけでなく<strong>ビットフラグ</strong>の定義にも活用できます。ビットフラグとは、1つの整数の各ビット（2進数の桁）を「ある/なし」のスイッチとして使うテクニックで、権限管理などで広く使われます。</p>
<pre><code>const (
    Read    Permission = 1 &lt;&lt; iota // 1（2進数で001）
    Write                          // 2（010）
    Execute                        // 4（100）
)</code></pre>
<p><code>1 &lt;&lt; iota</code>は「1をiotaビット左にずらす」という意味で、1、2、4、8…と2の累乗が並びます。各値のビット位置が重ならないため、<code>|</code>（ビットOR）で複数のフラグを合成し、<code>&amp;</code>（ビットAND）で特定のフラグが立っているか調べられます。</p>
<pre><code>p := Read | Write        // 両方のフラグを立てる（001+010=011）
if p&amp;Write != 0 {        // Writeビットが立っているか判定
    fmt.Println("書き込み可能")
}</code></pre>
<p>さらに<code>String()</code>メソッドを定義すると、<code>fmt.Println</code>が自動的にそれを呼び出し、数値の代わりに人間が読める表記で表示されます。これは第13章で学んだ<code>fmt.Stringer</code>インターフェースの実践です。</p>
<table>
<tr><th>演算</th><th>意味</th><th>例</th></tr>
<tr><td><code>a | b</code></td><td>フラグを合成する</td><td><code>Read | Write</code>→3</td></tr>
<tr><td><code>a &amp; b</code></td><td>フラグの有無を調べる</td><td><code>p &amp; Write != 0</code></td></tr>
<tr><td><code>a &amp;^ b</code></td><td>フラグを取り消す</td><td><code>p &amp;^ Write</code></td></tr>
</table>`,
      task: `<code>String()</code>メソッドのTODO部分を実装し、<code>Write</code>と<code>Execute</code>のフラグが立っていたらそれぞれ「W」「X」を追加するようにしてください。`,
      code: `package main

import "fmt"

type Permission uint8

const (
	Read    Permission = 1 << iota // 1
	Write                          // 2
	Execute                        // 4
)

func (p Permission) String() string {
	s := ""
	if p&Read != 0 {
		s += "R"
	}
	// TODO: Writeフラグが立っていたら "W" を追加する
	// TODO: Executeフラグが立っていたら "X" を追加する
	if s == "" {
		return "なし"
	}
	return s
}

func main() {
	p := Read | Write
	fmt.Println("権限:", p)
	p |= Execute
	fmt.Println("追加後:", p)
	fmt.Println("Writeあり?", p&Write != 0)
}`,
      solution: `package main

import "fmt"

type Permission uint8

const (
	Read    Permission = 1 << iota // 1
	Write                          // 2
	Execute                        // 4
)

func (p Permission) String() string {
	s := ""
	if p&Read != 0 {
		s += "R"
	}
	if p&Write != 0 {
		s += "W"
	}
	if p&Execute != 0 {
		s += "X"
	}
	if s == "" {
		return "なし"
	}
	return s
}

func main() {
	p := Read | Write
	fmt.Println("権限:", p)
	p |= Execute
	fmt.Println("追加後:", p)
	fmt.Println("Writeあり?", p&Write != 0)
}`,
      hints: [
        `Readの判定と同じパターンを、WriteとExecuteに対しても繰り返します。`,
        `if p&Write != 0 { s += "W" } のように、ビットANDの結果が0でないかを調べます。`
      ],
      expectedOutput: "追加後: RWX"
    },
    {
      id: 182,
      title: "型定義type vs 型エイリアス=",
      explanation: `<p>Goには既存の型から新しい名前を作る方法が2つあり、見た目は似ていますが意味が大きく異なります。</p>
<pre><code>type Celsius float64 // 型定義：float64を元にした「別の新しい型」
type Number = int    // 型エイリアス：intの「別名」（同じ型）</code></pre>
<p><strong>型定義</strong>（<code>=</code>なし）は、元の型と同じ内部構造を持つ<strong>まったく別の型</strong>を作ります。別の型なので<code>float64</code>の変数にそのまま代入するとコンパイルエラーになり、<code>float64(temp)</code>のような明示的な型変換が必要です。この「面倒さ」こそが利点で、摂氏と華氏を取り違えるようなバグをコンパイル時に防げます。また、型定義した型には独自のメソッドを追加できます。</p>
<p><strong>型エイリアス</strong>（<code>=</code>あり）は単なる別名で、<code>Number</code>と<code>int</code>は完全に同じ型として扱われます。変換は不要ですが、メソッドを追加することもできません。エイリアスは主に大規模なコードベースで型を別パッケージへ移行する際の互換性維持に使われ、日常のコードで使う場面は限られます。</p>
<table>
<tr><th></th><th>型定義 <code>type A B</code></th><th>型エイリアス <code>type A = B</code></th></tr>
<tr><td>元の型との関係</td><td>別の型（変換が必要）</td><td>同一の型（変換不要）</td></tr>
<tr><td>メソッド追加</td><td>できる</td><td>できない</td></tr>
<tr><td>主な用途</td><td>意味のある型を作る</td><td>移行時の互換性維持</td></tr>
</table>
<p>迷ったら型定義を選ぶのが基本です。標準ライブラリの<code>time.Duration</code>（int64の型定義）が好例で、「ただの数値」に意味とメソッドを与えています。</p>`,
      task: `このコードはコンパイルエラーになります。エラーメッセージを確認し、<code>Celsius</code>型の値を<code>float64</code>に明示的に変換して修正してください。`,
      code: `package main

import "fmt"

type Celsius float64 // 型定義：新しい型を作る
type Number = int    // 型エイリアス：intの別名

func (c Celsius) Describe() string {
	if c >= 30 {
		return "暑い"
	}
	return "快適"
}

func main() {
	temp := Celsius(31.5)
	var f float64 = temp // コンパイルエラー：型が違う
	fmt.Println("気温:", f, "度 →", temp.Describe())

	var n Number = 10
	var i int = n // エイリアスは同じ型なので変換不要
	fmt.Println("合計:", n+i)
}`,
      solution: `package main

import "fmt"

type Celsius float64 // 型定義：新しい型を作る
type Number = int    // 型エイリアス：intの別名

func (c Celsius) Describe() string {
	if c >= 30 {
		return "暑い"
	}
	return "快適"
}

func main() {
	temp := Celsius(31.5)
	var f float64 = float64(temp) // 型定義は明示的な変換が必要
	fmt.Println("気温:", f, "度 →", temp.Describe())

	var n Number = 10
	var i int = n // エイリアスは同じ型なので変換不要
	fmt.Println("合計:", n+i)
}`,
      hints: [
        `型定義で作った型は、元の型とは別物として扱われます。代入には明示的な型変換が必要です。`,
        `float64(temp) のように書くと、Celsius型の値をfloat64型に変換できます。`
      ],
      expectedOutput: "気温: 31.5 度 → 暑い"
    },
    {
      id: 183,
      title: "無名構造体と無名関数の活用場面",
      explanation: `<p>Goでは構造体や関数に名前を付けずにその場で定義できます。「一度しか使わないもの」に名前を付けない選択は、コードの見通しを良くする実践的なテクニックです。</p>
<p><strong>無名構造体</strong>は、型の定義と値の作成を同時に行います。設定値のまとまりや、テストコードのテーブル駆動テスト（第17章で学んだ、入力と期待値の表でテストする手法）で頻繁に登場します。</p>
<pre><code>config := struct {
    Host string
    Port int
}{Host: "localhost", Port: 8080}</code></pre>
<p>その場限りのデータ構造のためにパッケージレベルの型を増やさずに済み、「この構造はここでしか使わない」という意図が読み手に伝わります。</p>
<p><strong>無名関数</strong>（関数リテラル）は第10章で学んだクロージャの基礎でもあります。変数に代入して使うほか、関数の引数としてその場で渡すのが典型的な使い方です。</p>
<pre><code>doubled := apply([]int{1, 2, 3}, func(n int) int { return n * 2 })</code></pre>
<p>「関数を受け取る関数」（高階関数）と組み合わせると、処理の骨格（ループなど）と具体的な変換ロジックを分離できます。</p>
<table>
<tr><th>使う場面</th><th>向いている書き方</th></tr>
<tr><td>複数箇所で使うデータ構造</td><td>名前付きのtype定義</td></tr>
<tr><td>その場限りの設定・テストデータ</td><td>無名構造体</td></tr>
<tr><td>複数箇所から呼ぶ処理</td><td>名前付き関数</td></tr>
<tr><td>引数として1回だけ渡す処理</td><td>無名関数</td></tr>
</table>`,
      task: `TODO部分を実装してください。(1)無名構造体<code>config</code>に<code>Port: 8080</code>を追加し、(2)<code>apply</code>に渡す無名関数を「値を2倍にする」処理にします。`,
      code: `package main

import "fmt"

// apply はスライスの各要素に関数fを適用した新しいスライスを返す
func apply(nums []int, f func(int) int) []int {
	result := make([]int, 0, len(nums))
	for _, n := range nums {
		result = append(result, f(n))
	}
	return result
}

func main() {
	// TODO: フィールドPort（int型、値8080）を追加する
	config := struct {
		Host string
	}{Host: "localhost"}
	fmt.Println("接続先:", config.Host)

	// TODO: 無名関数を「nを2倍にして返す」処理に書き換える
	doubled := apply([]int{1, 2, 3}, func(n int) int { return n })
	fmt.Println("2倍:", doubled)
}`,
      solution: `package main

import "fmt"

// apply はスライスの各要素に関数fを適用した新しいスライスを返す
func apply(nums []int, f func(int) int) []int {
	result := make([]int, 0, len(nums))
	for _, n := range nums {
		result = append(result, f(n))
	}
	return result
}

func main() {
	config := struct {
		Host string
		Port int
	}{Host: "localhost", Port: 8080}
	fmt.Printf("接続先: %s:%d\\n", config.Host, config.Port)

	doubled := apply([]int{1, 2, 3}, func(n int) int { return n * 2 })
	fmt.Println("2倍:", doubled)
}`,
      hints: [
        `無名構造体は、struct{...}の中にフィールドを追加し、直後の{...}で初期値を与えます。型定義と初期化の両方を変更する必要があります。`,
        `無名関数の本体を return n * 2 に変えると、各要素が2倍になります。`
      ],
      expectedOutput: "2倍: [2 4 6]"
    },
    {
      id: 184,
      title: "ラベル付きbreak/continueの実践",
      explanation: `<p>二重ループの内側から「外側のループごと抜けたい」場面はよくあります。しかし通常の<code>break</code>は<strong>いちばん内側のループしか</strong>抜けられません。そこで使うのが<strong>ラベル付きbreak</strong>です。</p>
<pre><code>search:
for i := 0; i &lt; 3; i++ {
    for j := 0; j &lt; 3; j++ {
        if found {
            break search // 外側のループごと抜ける
        }
    }
}</code></pre>
<p>ラベルは「<code>ラベル名:</code>」の形でfor文の直前に書きます。<code>break search</code>とすると、ラベルが付いたループ全体を一気に抜けられます。同様に<code>continue search</code>と書けば「外側のループの次の周回へ進む」という意味になります（内側のループは中断されます）。</p>
<p>ラベルを使わない場合は、次のように「見つかったフラグ」を管理する必要があります。</p>
<pre><code>found := false
for i := 0; i &lt; 3 &amp;&amp; !found; i++ {
    for j := 0; j &lt; 3; j++ {
        if hit { found = true; break }
    }
}</code></pre>
<p>フラグ方式は条件式が複雑になり、breakとフラグ更新の対応を読み手が追う必要があります。二重ループからの脱出という限られた場面では、ラベル付きbreakのほうが意図が明確です。ただしラベルの多用はコードの流れを追いにくくするため、「二重ループからの脱出」以外では原則使わないのがよい習慣です。関数に切り出して<code>return</code>で抜ける設計も有力な代替手段です。</p>`,
      task: `このコードの<code>break</code>は内側のループしか抜けないため、8を発見した後も探索が続いてしまいます。ラベル<code>search:</code>を外側のforの直前に付け、<code>break search</code>で探索全体を終了させてください。`,
      code: `package main

import "fmt"

func main() {
	grid := [][]int{
		{1, 3, 5},
		{2, 8, 4},
		{7, 6, 9},
	}
	target := 8

	// TODO: 外側のforにラベル search: を付け、break searchに変える
	for i, row := range grid {
		for j, v := range row {
			fmt.Printf("確認中: grid[%d][%d]\\n", i, j)
			if v == target {
				fmt.Printf("発見: grid[%d][%d] = %d\\n", i, j, v)
				break // これでは内側のループしか抜けない
			}
		}
	}
	fmt.Println("探索終了")
}`,
      solution: `package main

import "fmt"

func main() {
	grid := [][]int{
		{1, 3, 5},
		{2, 8, 4},
		{7, 6, 9},
	}
	target := 8

search:
	for i, row := range grid {
		for j, v := range row {
			fmt.Printf("確認中: grid[%d][%d]\\n", i, j)
			if v == target {
				fmt.Printf("発見: grid[%d][%d] = %d\\n", i, j, v)
				break search // 外側のループごと抜ける
			}
		}
	}
	fmt.Println("探索終了")
}`,
      hints: [
        `ラベルは「search:」のように、対象のfor文の直前の行に書きます。`,
        `break search と書くと、searchラベルが付いたループ全体を抜けます。修正後は「確認中」の行が5回だけ表示されるはずです。`
      ],
      expectedOutput: "発見: grid[1][1] = 8"
    },
    {
      id: 185,
      title: "goroutineリークの概念と防ぎ方",
      explanation: `<p><strong>goroutineリーク</strong>とは、終了する手段のないgoroutineが残り続け、メモリを消費し続ける問題です。goroutineは軽量ですが、チャネルの受信待ちなどでブロックしたまま誰からも送信されなければ、プログラムが終わるまで永遠に解放されません。長時間動くサーバーでは深刻な問題になります。</p>
<pre><code>go func() {
    for {
        v := &lt;-jobs // 誰も送らなくなったら永遠にここで待つ＝リーク
        fmt.Println(v)
    }
}()</code></pre>
<p>対策の定番が、第16章で学んだ<strong>doneチャネル</strong>パターンです。<code>select</code>（複数のチャネル操作を同時に待つ文）で仕事用チャネルと終了通知用チャネルの両方を待ち、終了通知が来たら<code>return</code>でgoroutineを確実に終わらせます。</p>
<pre><code>select {
case j := &lt;-jobs:
    // 仕事を処理
case &lt;-done:
    return // 終了通知を受けてgoroutineを解放
}</code></pre>
<p>終了通知には<code>close(done)</code>を使うのが慣例です。closeされたチャネルからの受信は即座に成立する（ゼロ値が返る）ため、複数のgoroutineに一斉に終了を知らせることができます。チャネルの型を<code>chan struct{}</code>（空構造体）にするのは「値そのものに意味はなく、通知だけが目的」という意図の表明です。</p>
<p>設計の指針は「<strong>goroutineを起動するときは、それがどう終わるかを必ず決めておく</strong>」ことです。Go 1.22時点でも、この規律はGoの並行処理の基本原則です。</p>`,
      task: `<code>worker</code>関数の<code>select</code>に<code>done</code>チャネルの受信ケースを追加してください。受信したら「ワーカー: 停止します」と表示し、<code>stopped</code>に通知してから<code>return</code>します。`,
      code: `package main

import "fmt"

func worker(jobs <-chan int, done <-chan struct{}, stopped chan<- struct{}) {
	for {
		select {
		case j := <-jobs:
			fmt.Println("処理中:", j)
			// TODO: case <-done: を追加する
			// 「ワーカー: 停止します」と表示し、
			// stopped <- struct{}{} で通知してから return する
		}
	}
}

func main() {
	jobs := make(chan int)
	done := make(chan struct{})
	stopped := make(chan struct{})

	go worker(jobs, done, stopped)

	for i := 1; i <= 3; i++ {
		jobs <- i
	}
	close(done) // 終了を通知する
	<-stopped   // ワーカーの終了を待つ
	fmt.Println("goroutineを解放して終了")
}`,
      solution: `package main

import "fmt"

func worker(jobs <-chan int, done <-chan struct{}, stopped chan<- struct{}) {
	for {
		select {
		case j := <-jobs:
			fmt.Println("処理中:", j)
		case <-done:
			fmt.Println("ワーカー: 停止します")
			stopped <- struct{}{}
			return
		}
	}
}

func main() {
	jobs := make(chan int)
	done := make(chan struct{})
	stopped := make(chan struct{})

	go worker(jobs, done, stopped)

	for i := 1; i <= 3; i++ {
		jobs <- i
	}
	close(done) // 終了を通知する
	<-stopped   // ワーカーの終了を待つ
	fmt.Println("goroutineを解放して終了")
}`,
      hints: [
        `selectには複数のcaseを並べられます。jobsのcaseと同じ階層にdoneのcaseを追加します。`,
        `case <-done: の中で、メッセージ表示→stoppedへの送信→returnの順に書きます。closeされたチャネルからの受信は即座に成立します。`
      ],
      expectedOutput: "goroutineを解放して終了"
    },
    {
      id: 186,
      title: "スライスの内部構造とappendの罠",
      explanation: `<p>スライスの内部は「配列へのポインタ・長さ（len）・容量（cap）」の3点セットです。この構造を知らないと、<strong>appendが元のデータを上書きする</strong>という有名な罠にはまります。</p>
<pre><code>a := []int{1, 2, 3, 4, 5}
b := a[:3]          // len=3, cap=5（aと同じ配列を共有）
b = append(b, 99)   // 空き容量があるので同じ配列に書き込む
fmt.Println(a)      // [1 2 3 99 5] ← a[3]が上書きされた！</code></pre>
<p>ポイントは<code>a[:3]</code>で作ったスライス<code>b</code>が、<strong>aと同じ配列を共有している</strong>ことです。<code>append</code>は「容量に空きがあればその場に書き、なければ新しい配列を確保してコピーする」動きをします。<code>b</code>はlen=3、cap=5なので空きがあり、共有中の配列の4番目（<code>a[3]</code>の位置）に99を書き込んでしまうのです。</p>
<p>安全にコピーを作る方法は主に2つあります。</p>
<pre><code>// 方法1: copyで独立したスライスを作る
c := make([]int, 3)
copy(c, a[:3])

// 方法2: フルスライス式で容量を制限する
d := a[:3:3] // len=3, cap=3。appendすると必ず新配列が作られる</code></pre>
<p>フルスライス式<code>a[low:high:max]</code>の3つ目の値は容量の上限を指定します。cap=lenにしておけば、appendは必ず新しい配列を確保するため、元の配列が書き換わることはありません。</p>
<table>
<tr><th>方法</th><th>特徴</th></tr>
<tr><td><code>copy</code>＋<code>make</code></td><td>その場で完全に独立。意図が明確</td></tr>
<tr><td><code>a[:3:3]</code></td><td>コピーは遅延（append時）。書き方が簡潔</td></tr>
</table>`,
      task: `このコードは<code>append</code>が配列を共有しているため<code>a[3]</code>を上書きしてしまいます。<code>make</code>と<code>copy</code>で独立したスライス<code>c</code>を作ってからappendするよう修正し、<code>a</code>が変化しないことを確認してください。`,
      code: `package main

import "fmt"

func main() {
	a := []int{1, 2, 3, 4, 5}

	b := a[:3]
	fmt.Println("len(b):", len(b), "cap(b):", cap(b))

	// TODO: bに直接appendするとaが書き換わってしまう。
	// make([]int, 3)で新しいスライスcを作り、copy(c, a[:3])で
	// コピーしてから、cにappendするよう修正する
	b = append(b, 99)
	fmt.Println("a:", a) // [1 2 3 99 5] になってしまう！
	fmt.Println("b:", b)
}`,
      solution: `package main

import "fmt"

func main() {
	a := []int{1, 2, 3, 4, 5}

	b := a[:3]
	fmt.Println("len(b):", len(b), "cap(b):", cap(b))

	// copyで独立したスライスを作れば、appendしても安全
	c := make([]int, 3)
	copy(c, a[:3])
	c = append(c, 99)
	fmt.Println("a:", a) // 元のまま
	fmt.Println("c:", c)
}`,
      hints: [
        `bはaと同じ配列を共有しています。cap(b)が5（空きがある）ことが上書きの原因です。`,
        `c := make([]int, 3) で長さ3のスライスを作り、copy(c, a[:3]) で値を写してから c = append(c, 99) とします。`
      ],
      expectedOutput: "a: [1 2 3 4 5]"
    },
    {
      id: 187,
      title: "文字列の不変性とバイト列変換のコスト",
      explanation: `<p>Goの文字列（string）は<strong>不変（イミュータブル）</strong>です。一度作った文字列の中身は変更できず、<code>s[0] = 'H'</code>のような代入はコンパイルエラーになります。不変であるおかげで、文字列は安心して共有・比較でき、マップのキーにも使えます。</p>
<p>内容を変更したいときは、いったん<code>[]byte</code>（バイトスライス）に変換します。</p>
<pre><code>s := "hello"
b := []byte(s)   // コピーが発生する
b[0] = 'H'
result := string(b) // ここでもコピーが発生する</code></pre>
<p>重要なのは、<code>[]byte(s)</code>と<code>string(b)</code>の変換では原則<strong>毎回メモリのコピーが発生する</strong>ことです。不変性を守るため、変換後のバイト列を書き換えても元の文字列に影響しないよう、独立した領域が確保されるのです。短い文字列なら問題になりませんが、大きなデータやループ内での変換はパフォーマンス低下の原因になります。</p>
<p>特に注意すべきは<code>+=</code>による文字列連結の繰り返しです。文字列は不変なので、連結のたびに「新しい文字列を丸ごと作り直す」ことになり、回数が増えるほど急激に遅くなります。この用途には<code>strings.Builder</code>を使います。</p>
<pre><code>var sb strings.Builder
for i := 0; i &lt; 1000; i++ {
    sb.WriteString("Go!") // 内部バッファに追記するだけ（コピー最小限）
}
result := sb.String()</code></pre>
<table>
<tr><th>操作</th><th>コスト</th></tr>
<tr><td><code>s += t</code> をループで繰り返す</td><td>毎回全体を作り直す（遅い）</td></tr>
<tr><td><code>strings.Builder</code></td><td>内部バッファへ追記（速い）</td></tr>
</table>`,
      task: `このコードは<code>s[0] = 'H'</code>がコンパイルエラーになります。<code>[]byte</code>に変換してから先頭を書き換えるよう修正し、さらにTODO部分で<code>strings.Builder</code>を使って「Go!」を3回連結してください。`,
      code: `package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "hello"
	s[0] = 'H' // コンパイルエラー：文字列は不変
	fmt.Println(s)

	// TODO: strings.Builderを使い、ループで "Go!" を3回
	// WriteStringして連結し、sb.String()を表示する
	var sb strings.Builder
	fmt.Println("連結結果:", sb.String())
}`,
      solution: `package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "hello"
	b := []byte(s) // 変換時にコピーが発生する
	b[0] = 'H'
	fmt.Println(string(b), "/", s) // 元のsは変わらない

	// 大量の連結はstrings.Builderが効率的
	var sb strings.Builder
	for i := 0; i < 3; i++ {
		sb.WriteString("Go!")
	}
	fmt.Println("連結結果:", sb.String())
}`,
      hints: [
        `文字列は直接書き換えられません。b := []byte(s) でバイトスライスに変換すれば要素を変更できます。`,
        `sb.WriteString("Go!") をforループで3回呼び、最後に sb.String() で文字列を取り出します。`
      ],
      expectedOutput: "連結結果: Go!Go!Go!"
    },
    {
      id: 188,
      title: "deferの評価タイミングの罠",
      explanation: `<p><code>defer</code>には初心者がほぼ必ず一度ははまる罠があります。それは「<strong>deferした関数の引数は、defer文を書いたその時点で評価（確定）される</strong>」というルールです。実行だけが関数の終了時まで遅延され、引数の値は遅延されません。</p>
<pre><code>x := 1
defer fmt.Println("結果:", x) // この時点で x=1 が確定する
x = 100
// 関数終了時に「結果: 1」と表示される（100ではない！）</code></pre>
<p>「関数の最後にxの最終値を表示したい」つもりで書くと、期待とずれた結果になります。最終的な値を参照したい場合は、引数で渡すのではなく<strong>クロージャ（外側の変数を捕まえる無名関数）</strong>にします。</p>
<pre><code>defer func() {
    fmt.Println("結果:", x) // 実行時のxを参照するので100
}()</code></pre>
<p>クロージャは変数そのものを参照するため、defer後に変更された値が反映されます。この違いは、処理時間の計測など実務のイディオムで重要になります。</p>
<pre><code>// 誤り：開始時刻との差がdefer文の時点で計算されてしまう
defer fmt.Println(time.Since(start))
// 正しい：終了時に計算される
defer func() { fmt.Println(time.Since(start)) }()</code></pre>
<p>もう1つの基本ルールとして、複数のdeferは<strong>LIFO（後入れ先出し）</strong>、つまり後に書いたものから先に実行されることも思い出してください。「引数は即時評価、実行は遅延、順序は逆順」の3点セットで覚えましょう。</p>`,
      task: `「最終値:」の行で<code>x</code>の最終値100を表示したいのに、1が表示されてしまいます。deferをクロージャ形式<code>defer func() { ... }()</code>に書き換えて修正してください。`,
      code: `package main

import "fmt"

func main() {
	x := 1

	// TODO: このdeferは書いた時点のx（=1）を表示してしまう。
	// クロージャ形式に書き換えて、最終値の100が表示されるようにする
	defer fmt.Println("最終値:", x)

	x = 100
	fmt.Println("処理完了 x =", x)
}`,
      solution: `package main

import "fmt"

func main() {
	x := 1

	// クロージャは実行時のxを参照するため、最終値が表示される
	defer func() {
		fmt.Println("最終値:", x)
	}()

	x = 100
	fmt.Println("処理完了 x =", x)
}`,
      hints: [
        `defer fmt.Println(x) は、defer文を通過した瞬間のxの値を確定させてしまいます。`,
        `defer func() { fmt.Println("最終値:", x) }() のように無名関数で包むと、実行時（main終了時）のxが参照されます。`
      ],
      expectedOutput: "最終値: 100"
    },
    {
      id: 189,
      title: "recoverを使った安全なハンドラ",
      explanation: `<p>第14章で学んだとおり、<code>panic</code>（回復不能なエラーでプログラムを停止させる仕組み）が起きると、通常はプログラム全体が異常終了します。しかし「1つの処理の失敗で全体を止めたくない」場面があります。たとえばWebサーバーでは、1リクエストの処理中のパニックでサーバー全体が落ちては困ります。そこで使うのが<code>recover</code>です。</p>
<p><code>recover</code>はdefer内で呼ぶと、発生中のパニックを捕まえて通常の実行に戻します。定番パターンは<strong>名前付き戻り値</strong>と組み合わせ、パニックをエラーに変換して返す形です。</p>
<pre><code>func safeRun() (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("パニックから回復: %v", r)
        }
    }()
    // パニックの可能性がある処理
    return nil
}</code></pre>
<p>ポイントは3つあります。</p>
<ul>
<li><code>recover()</code>は<strong>deferされた関数の中で直接呼んだときだけ</strong>有効。通常のコードの途中で呼んでもnilが返るだけです</li>
<li>パニックが起きていないときは<code>recover()</code>はnilを返すため、<code>if r := recover(); r != nil</code>の判定が必要です</li>
<li>戻り値<code>err</code>に代入するには、名前付き戻り値（<code>(err error)</code>）が必要です。deferの実行は戻り値の確定後なので、名前がないと書き換えられません</li>
</ul>
<p>注意点として、recoverの乱用は禁物です。Goの基本は<code>error</code>を返す明示的なエラー処理であり、recoverは「予期しないパニックから境界（リクエストハンドラなど）を守る最後の砦」として使います。</p>`,
      task: `<code>safeDivide</code>のTODO部分に、deferとrecoverを使ったパニック回復処理を実装してください。回復したら名前付き戻り値<code>err</code>にエラーを代入します。`,
      code: `package main

import "fmt"

// safeDivide はゼロ除算のパニックをエラーに変換して返す
func safeDivide(a, b int) (result int, err error) {
	// TODO: defer + recover でパニックを捕まえ、
	// err = fmt.Errorf("パニックから回復: %v", r) を設定する

	result = a / b // bが0だとパニックが起きる
	return result, nil
}

func main() {
	if r, err := safeDivide(10, 2); err == nil {
		fmt.Println("10 / 2 =", r)
	}
	if _, err := safeDivide(5, 0); err != nil {
		fmt.Println("エラー:", err)
	}
	fmt.Println("プログラムは正常に継続")
}`,
      solution: `package main

import "fmt"

// safeDivide はゼロ除算のパニックをエラーに変換して返す
func safeDivide(a, b int) (result int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("パニックから回復: %v", r)
		}
	}()

	result = a / b // bが0だとパニックが起きる
	return result, nil
}

func main() {
	if r, err := safeDivide(10, 2); err == nil {
		fmt.Println("10 / 2 =", r)
	}
	if _, err := safeDivide(5, 0); err != nil {
		fmt.Println("エラー:", err)
	}
	fmt.Println("プログラムは正常に継続")
}`,
      hints: [
        `recoverはdeferされた無名関数の中で呼ぶ必要があります。関数の先頭にdefer func() { ... }() を書きます。`,
        `if r := recover(); r != nil { err = fmt.Errorf("パニックから回復: %v", r) } とすると、名前付き戻り値errが書き換わり、呼び出し側にエラーが返ります。`
      ],
      expectedOutput: "プログラムは正常に継続"
    },
    {
      id: 190,
      title: "総合演習：信号機シミュレータ（状態機械）",
      explanation: `<p>この章の総まとめとして<strong>状態機械（ステートマシン）</strong>を実装します。状態機械とは「有限個の状態と、状態間の遷移ルール」でシステムの振る舞いを表現する設計手法です。信号機はその典型例で、赤→青→黄→赤…と決まった順序で遷移します。ゲームのキャラクター状態、注文のステータス管理など、実務でも頻出の考え方です。</p>
<p>Goで状態機械を作るときの定番構成は、この章で学んだ知識の組み合わせです。</p>
<table>
<tr><th>部品</th><th>使う知識</th></tr>
<tr><td>状態の定義</td><td>型定義＋iotaによる列挙（181、182）</td></tr>
<tr><td>状態の表示</td><td>String()メソッド（181）</td></tr>
<tr><td>遷移ルール</td><td>メソッド＋switch文</td></tr>
</table>
<pre><code>type Signal int

const (
    Red Signal = iota
    Green
    Yellow
)

func (s Signal) Next() Signal {
    switch s {
    case Red:
        return Green
    case Green:
        return Yellow
    default:
        return Red
    }
}</code></pre>
<p>遷移ルールを<code>Next()</code>メソッドとして状態型に持たせることで、「次の状態の決定ロジック」が1箇所に集まります。呼び出す側は<code>s = s.Next()</code>と書くだけでよく、遷移ルールの変更（たとえば「黄→全赤→赤」の追加）があってもmain側の修正は不要です。このように<strong>データ（状態）とルール（遷移）を型にまとめる</strong>のがGoらしい設計です。</p>
<p>状態ごとの属性（点灯時間など）も同様にメソッドで表現できます。switch文が状態の数だけ並ぶのは状態機械の自然な形であり、恐れる必要はありません。</p>`,
      task: `信号機の状態機械を完成させてください。<code>Next()</code>は赤→青→黄→赤の順に遷移し、<code>Duration()</code>は赤30秒・青25秒・黄5秒を返すようにTODO部分を実装します。`,
      code: `package main

import "fmt"

type Signal int

const (
	Red Signal = iota
	Green
	Yellow
)

func (s Signal) String() string {
	switch s {
	case Red:
		return "赤"
	case Green:
		return "青"
	case Yellow:
		return "黄"
	}
	return "不明"
}

// Next は次の信号の状態を返す（赤→青→黄→赤の順）
func (s Signal) Next() Signal {
	// TODO: switchで遷移ルールを実装する
	return Red
}

// Duration は各状態の点灯時間（秒）を返す（赤30・青25・黄5）
func (s Signal) Duration() int {
	// TODO: switchで点灯時間を返す
	return 0
}

func main() {
	s := Red
	total := 0
	for i := 1; i <= 6; i++ {
		fmt.Printf("%d: %v（%d秒）\\n", i, s, s.Duration())
		total += s.Duration()
		s = s.Next()
	}
	fmt.Println("合計時間:", total, "秒")
}`,
      solution: `package main

import "fmt"

type Signal int

const (
	Red Signal = iota
	Green
	Yellow
)

func (s Signal) String() string {
	switch s {
	case Red:
		return "赤"
	case Green:
		return "青"
	case Yellow:
		return "黄"
	}
	return "不明"
}

// Next は次の信号の状態を返す（赤→青→黄→赤の順）
func (s Signal) Next() Signal {
	switch s {
	case Red:
		return Green
	case Green:
		return Yellow
	default:
		return Red
	}
}

// Duration は各状態の点灯時間（秒）を返す（赤30・青25・黄5）
func (s Signal) Duration() int {
	switch s {
	case Red:
		return 30
	case Green:
		return 25
	default:
		return 5
	}
}

func main() {
	s := Red
	total := 0
	for i := 1; i <= 6; i++ {
		fmt.Printf("%d: %v（%d秒）\\n", i, s, s.Duration())
		total += s.Duration()
		s = s.Next()
	}
	fmt.Println("合計時間:", total, "秒")
}`,
      hints: [
        `Next()はString()と同じ構造のswitch文です。case Redのときreturn Green、というように遷移先を返します。`,
        `Duration()も同様に、case Redでreturn 30、case Greenでreturn 25、defaultでreturn 5とします。6回の合計は30+25+5+30+25+5=120秒になるはずです。`
      ],
      expectedOutput: "合計時間: 120 秒"
    }
  ]
});
