// 第15章：チャネル
registerChapter({
  number: 15,
  title: "チャネル",
  description: "ゴルーチン同士が安全にデータをやり取りするための仕組み「チャネル」を学びます。送受信の基本からclose、select文まで、Goの並行処理の中核を身につけます。",
  steps: [
    {
      id: 141,
      title: "チャネルの基本（作成・送信・受信）",
      explanation: `<p>前章ではゴルーチンとWaitGroupを学びましたが、ゴルーチンから計算結果を受け取る手段がありませんでした。その役割を担うのが<strong>チャネル</strong>（ゴルーチン間で値を送受信するための通信路）です。</p>
<p>チャネルは<code>make</code>で作成し、<code>&lt;-</code>演算子で送受信します。矢印の向きがデータの流れを表します。</p>
<pre><code>ch := make(chan int) // int型の値を運ぶチャネルを作成
ch &lt;- 10             // チャネルへ値を送信（chに10を入れる）
v := &lt;-ch            // チャネルから値を受信（chから取り出しvに入れる）</code></pre>
<table>
<tr><th>操作</th><th>書き方</th><th>覚え方</th></tr>
<tr><td>作成</td><td><code>make(chan 型)</code></td><td>スライスやマップと同じくmakeで作る</td></tr>
<tr><td>送信</td><td><code>ch &lt;- 値</code></td><td>矢印がチャネルに向かって入る</td></tr>
<tr><td>受信</td><td><code>値 := &lt;-ch</code></td><td>矢印がチャネルから出てくる</td></tr>
</table>
<p>典型的な使い方は「ゴルーチンが結果を送信し、mainが受信する」形です。</p>
<pre><code>ch := make(chan string)
go func() {
    ch &lt;- "処理結果" // 別ゴルーチンから送信
}()
msg := &lt;-ch          // mainで受信
fmt.Println(msg)</code></pre>
<p>マップやスライスを複数ゴルーチンで直接共有すると競合の危険がありましたが、チャネルは<strong>複数のゴルーチンから同時に使っても安全</strong>に設計されています。Goには「メモリを共有して通信するな、通信してメモリを共有せよ」という格言があり、チャネルはその中心的な道具です。</p>`,
      task: `TODOの2箇所を埋めてください。ゴルーチン内からチャネル<code>ch</code>へ文字列を送信し、mainで受信して表示します。`,
      code: `package main

import "fmt"

func main() {
	ch := make(chan string)

	go func() {
		// TODO: chに "こんにちは、チャネル" を送信する
	}()

	// TODO: chから受信してmsgに代入する
	msg := ""
	fmt.Println(msg)
}`,
      solution: `package main

import "fmt"

func main() {
	ch := make(chan string)

	go func() {
		// chに文字列を送信する
		ch <- "こんにちは、チャネル"
	}()

	// chから受信してmsgに代入する
	msg := <-ch
	fmt.Println(msg)
}`,
      hints: [
        `送信は「ch <- 値」、受信は「変数 := <-ch」です。矢印の向きでデータの流れが決まります。`,
        `ゴルーチン内に「ch <- "こんにちは、チャネル"」、mainの受信は「msg := <-ch」と書きます（msg := "" の行は置き換えます）。`
      ],
      expectedOutput: "こんにちは、チャネル"
    },
    {
      id: 142,
      title: "チャネルは同期する（送受信のブロック）",
      explanation: `<p>チャネルの最大の特徴は<strong>同期</strong>（複数の処理のタイミングを合わせること）です。バッファなしのチャネルでは、送信と受信は次のように動きます。</p>
<ul>
<li><strong>送信側</strong>：<code>ch &lt;- v</code>は、受信側が受け取るまでその場で<strong>ブロック</strong>（処理が一時停止して待つこと）する</li>
<li><strong>受信側</strong>：<code>&lt;-ch</code>は、送信側が値を送るまでブロックする</li>
</ul>
<p>つまり送信と受信は「待ち合わせ」をして、両者が揃った瞬間に値が受け渡されます。この性質のおかげで、前章の<code>sync.WaitGroup</code>を使わなくても「ゴルーチンの完了を待つ」ことができます。</p>
<pre><code>ch := make(chan int)
go func() {
    time.Sleep(30 * time.Millisecond) // 重い計算のつもり
    ch &lt;- 42                          // 計算が終わったら送信
}()
v := &lt;-ch // 送信されるまでここで待つ（＝完了待ちを兼ねる）
fmt.Println(v)</code></pre>
<p>mainは<code>&lt;-ch</code>の行で約30ミリ秒待たされ、ゴルーチンの送信と同時に動き出します。「値の受け渡し」と「タイミング合わせ」を1つの操作で行えるのがチャネルの強みです。</p>
<p>なお、複数のゴルーチンが同時に動いているとき、fmt.Printlnの出力順序は実行のたびに変わることがあります。判定に使えるのは「受信後に必ず最後に出る行」だけである点も意識してみてください。</p>`,
      task: `このコードはそのまま実行できます。実行して出力を観察したあと、<code>time.Sleep</code>の時間を<code>10 * time.Millisecond</code>に変えて再実行し、mainが受信まで待つ動きが変わらないことを確認してください。`,
      code: `package main

import (
	"fmt"
	"time"
)

func main() {
	ch := make(chan int)

	go func() {
		fmt.Println("ゴルーチン: 計算を開始します")
		time.Sleep(30 * time.Millisecond) // TODO: 10 * time.Millisecond に変えて再実行してみる
		ch <- 42
	}()

	fmt.Println("main: 受信を待ちます")
	v := <-ch // 送信されるまでここでブロックする
	fmt.Println("main: 受信しました:", v)
}`,
      solution: `package main

import (
	"fmt"
	"time"
)

func main() {
	ch := make(chan int)

	go func() {
		fmt.Println("ゴルーチン: 計算を開始します")
		time.Sleep(10 * time.Millisecond) // 待ち時間を短くしても動きは同じ
		ch <- 42
	}()

	fmt.Println("main: 受信を待ちます")
	v := <-ch // 送信されるまでここでブロックする
	fmt.Println("main: 受信しました:", v)
}`,
      hints: [
        `まずはそのまま実行し、「main: 受信しました: 42」が必ず最後に出ることを確認しましょう。`,
        `time.Sleepの引数を10 * time.Millisecondに書き換えるだけです。待ち時間が変わっても、mainが受信までブロックする性質は変わりません。`
      ],
      expectedOutput: "main: 受信しました: 42"
    },
    {
      id: 143,
      title: "デッドロックを体験して直す",
      explanation: `<p>チャネルのブロックする性質は便利ですが、誰も相手をしてくれない送受信を書くと、プログラム全体が永遠に止まります。これが<strong>デッドロック</strong>（すべてのゴルーチンが互いを待ち続けて進めなくなる状態）です。</p>
<p>Goのランタイムはこれを検出して、次のようなエラーで強制終了してくれます。</p>
<pre><code>fatal error: all goroutines are asleep - deadlock!</code></pre>
<p>「すべてのゴルーチンが眠っている（＝誰も動けない）」という意味です。典型例は、バッファなしチャネルへ<strong>mainだけで送信する</strong>コードです。</p>
<pre><code>func main() {
    ch := make(chan int)
    ch &lt;- 10          // 受信者がいないので永遠にブロック
    fmt.Println(&lt;-ch) // この行には到達しない
}</code></pre>
<p>送信<code>ch &lt;- 10</code>は受信者が現れるまでブロックしますが、受信する予定のmain自身が止まっているので、誰も助けに来られません。直し方は「送信と受信を別のゴルーチンに分ける」ことです。</p>
<pre><code>go func() {
    ch &lt;- 10 // 送信は別ゴルーチンで行う
}()
fmt.Println(&lt;-ch) // mainは受信に専念する</code></pre>
<p>デッドロックのエラーメッセージにはゴルーチンごとのスタックトレースも表示され、どの行で止まっているかが分かります。実務でも遭遇するエラーなので、ここで一度自分の目で見ておくことが大切です。</p>`,
      task: `まずこのコードをそのまま実行し、<code>fatal error: all goroutines are asleep - deadlock!</code>を確認してください。その後、送信をゴルーチンに移してデッドロックを解消してください。`,
      code: `package main

import "fmt"

func main() {
	ch := make(chan int)

	// このままだと受信者がいないままmainが送信でブロックし、デッドロックになる
	ch <- 10

	fmt.Println(<-ch)
}`,
      solution: `package main

import "fmt"

func main() {
	ch := make(chan int)

	// 修正: 送信を別ゴルーチンで行えば、mainは受信に進める
	go func() {
		ch <- 10
	}()

	fmt.Println(<-ch)
}`,
      hints: [
        `バッファなしチャネルの送信は、受信者が現れるまでブロックします。mainが送信で止まると、受信する人が誰もいなくなります。`,
        `「ch <- 10」を「go func() { ch <- 10 }()」のようにゴルーチンの中へ移動させましょう。`
      ],
      expectedOutput: "10"
    },
    {
      id: 144,
      title: "バッファ付きチャネル",
      explanation: `<p><code>make</code>の第2引数に容量を渡すと、<strong>バッファ付きチャネル</strong>（値を一時的にためておける置き場を持つチャネル）になります。</p>
<pre><code>ch := make(chan string, 2) // 容量2のバッファ付きチャネル
ch &lt;- "りんご"  // バッファに入るだけなのでブロックしない
ch &lt;- "みかん"  // これもブロックしない（2件目まではOK）
// ch &lt;- "ぶどう" // 3件目はバッファ満杯なので受信されるまでブロック</code></pre>
<p>バッファなしとの違いを整理します。</p>
<table>
<tr><th></th><th>バッファなし</th><th>バッファ付き（容量n）</th></tr>
<tr><td>作成</td><td><code>make(chan T)</code></td><td><code>make(chan T, n)</code></td></tr>
<tr><td>送信がブロックする条件</td><td>常に（受信者が来るまで）</td><td>バッファが満杯のとき</td></tr>
<tr><td>受信がブロックする条件</td><td>常に（送信者が来るまで）</td><td>バッファが空のとき</td></tr>
<tr><td>用途</td><td>確実な同期・待ち合わせ</td><td>送信側を先に進めたいとき</td></tr>
</table>
<p>バッファの状態は組み込み関数で確認できます。<code>len(ch)</code>は現在バッファに入っている件数、<code>cap(ch)</code>は容量を返します。スライスと同じ関数が使えるのは覚えやすいポイントです。</p>
<p>バッファ付きなら、前ステップでデッドロックになった「mainだけで送信してから受信する」コードも、容量の範囲内であれば動きます。ただしバッファは万能ではなく、容量を超えれば結局ブロックします。「とりあえず大きなバッファを付ける」のではなく、同期が必要ならバッファなしを選ぶのがGoらしい設計です。</p>`,
      task: `<code>make(chan string)</code>を容量2のバッファ付きチャネルに変更し、コンパイルが通って最後まで実行されるようにしてください。`,
      code: `package main

import "fmt"

func main() {
	// TODO: 容量2のバッファ付きチャネルに変更する（このままだと1件目の送信でデッドロック）
	ch := make(chan string)

	ch <- "りんご"
	ch <- "みかん"
	fmt.Println("バッファに2件入れました")

	fmt.Println(<-ch)
	fmt.Println(<-ch)
	fmt.Println("len:", len(ch), "cap:", cap(ch))
}`,
      solution: `package main

import "fmt"

func main() {
	// 容量2のバッファ付きチャネル。2件まではブロックせずに送信できる
	ch := make(chan string, 2)

	ch <- "りんご"
	ch <- "みかん"
	fmt.Println("バッファに2件入れました")

	fmt.Println(<-ch)
	fmt.Println(<-ch)
	fmt.Println("len:", len(ch), "cap:", cap(ch))
}`,
      hints: [
        `makeの第2引数に容量を渡すとバッファ付きチャネルになります。スライスのmake(型, 長さ)と似た形です。`,
        `make(chan string, 2)とすれば、受信者がいなくても2件までは送信できます。`
      ],
      expectedOutput: "len: 0 cap: 2"
    },
    {
      id: 145,
      title: "closeとカンマokでの受信",
      explanation: `<p>送信側が「もう送る値はない」と伝えるには、組み込み関数<code>close</code>を使います。</p>
<pre><code>close(ch) // これ以降、chへの送信はできない</code></pre>
<p>closeに関するルールを押さえましょう。</p>
<ul>
<li>closeするのは<strong>送信側の責任</strong>（受信側がcloseしてはいけない）</li>
<li>close済みチャネルへ送信すると<strong>panic</strong>になる</li>
<li>close済みチャネルからの受信はpanicにならず、<strong>ゼロ値が即座に返る</strong></li>
</ul>
<p>「ゼロ値が返る」と、本当に送られた0なのかcloseによる0なのか区別できません。そこでマップのカンマokイディオムと同じ形で、受信の第2戻り値を受け取ります。</p>
<pre><code>v, ok := &lt;-ch
// ok == true  : 送信された値を受信できた
// ok == false : チャネルはclose済みで、vはゼロ値</code></pre>
<table>
<tr><th>状況</th><th>v</th><th>ok</th></tr>
<tr><td>値が送信された</td><td>送信された値</td><td>true</td></tr>
<tr><td>close済みかつバッファ空</td><td>型のゼロ値</td><td>false</td></tr>
</table>
<p>なお、close済みでもバッファに残っている値は順番に受信でき、そのあいだ<code>ok</code>はtrueのままです。バッファが空になってはじめてfalseになります。closeは「蛇口を閉める」操作であり、「配管に残った水（バッファ内の値）」は最後まで流れてくる、とイメージすると覚えやすいです。</p>`,
      task: `TODOの受信をカンマokの形に書き換え、3回の受信で<code>ok</code>がどう変化するかを確認してください。3回目は<code>0 false</code>になるはずです。`,
      code: `package main

import "fmt"

func main() {
	ch := make(chan int, 3)
	ch <- 1
	ch <- 2
	close(ch)

	// TODO: 3回とも「v, ok := <-ch」の形で受信し、vとokを表示する
	v := <-ch
	fmt.Println(v)
	v = <-ch
	fmt.Println(v)
	v = <-ch
	fmt.Println(v)
}`,
      solution: `package main

import "fmt"

func main() {
	ch := make(chan int, 3)
	ch <- 1
	ch <- 2
	close(ch)

	// カンマokで受信すると、closeされたかどうかを判定できる
	v, ok := <-ch
	fmt.Println(v, ok)
	v, ok = <-ch
	fmt.Println(v, ok)
	v, ok = <-ch // close済みでバッファも空なのでゼロ値とfalse
	fmt.Println(v, ok)
}`,
      hints: [
        `マップの「v, ok := m[key]」と同じ形で、チャネルも「v, ok := <-ch」と受信できます。`,
        `1回目と2回目はバッファに残った1と2が受信できてokはtrue、3回目はバッファが空なので0とfalseになります。fmt.Println(v, ok)で両方表示しましょう。`
      ],
      expectedOutput: "0 false"
    },
    {
      id: 146,
      title: "rangeでチャネルを受信",
      explanation: `<p>「closeされるまで受信し続ける」処理は非常によく書くため、Goでは<code>for range</code>がチャネルに対応しています。</p>
<pre><code>for v := range ch {
    fmt.Println(v) // 値が届くたびに実行される
}
// chがcloseされてバッファも空になると、ループは自動的に終わる</code></pre>
<p>カンマokを使った手書きのループと比べてみましょう。次の2つは同じ意味です。</p>
<pre><code>// 手書き版
for {
    v, ok := &lt;-ch
    if !ok {
        break
    }
    fmt.Println(v)
}

// range版（こちらが推奨）
for v := range ch {
    fmt.Println(v)
}</code></pre>
<p>スライスのrangeと違い、チャネルのrangeで受け取れる変数は<strong>1つだけ</strong>（値のみ）です。インデックスに相当するものはありません。</p>
<p>ここで重要なのが<strong>closeを忘れるとどうなるか</strong>です。rangeはcloseされるまで受信を待ち続けるので、送信側がcloseしないと受信側はループから抜けられず、デッドロックになります。「送信し終わったら必ずclose」がrange受信とセットの作法です。送信をゴルーチンに任せ、mainがrangeで受け取る形が定番パターンです。</p>
<pre><code>go func() {
    for i := 1; i &lt;= 5; i++ {
        ch &lt;- i
    }
    close(ch) // 送り終わったら必ず閉じる
}()</code></pre>`,
      task: `送信側のゴルーチンにcloseを追加し、受信側の無限ループを<code>for v := range ch</code>の形に書き換えてください。`,
      code: `package main

import "fmt"

func main() {
	ch := make(chan int)

	go func() {
		for i := 1; i <= 5; i++ {
			ch <- i * i
		}
		// TODO: 送信が終わったのでchをcloseする
	}()

	// TODO: このループをfor v := range chに書き換える
	for {
		v, ok := <-ch
		if !ok {
			break
		}
		fmt.Println(v)
	}
	fmt.Println("受信完了")
}`,
      solution: `package main

import "fmt"

func main() {
	ch := make(chan int)

	go func() {
		for i := 1; i <= 5; i++ {
			ch <- i * i
		}
		close(ch) // closeしないと受信側のrangeが終わらない
	}()

	// closeされるまで受信し続ける
	for v := range ch {
		fmt.Println(v)
	}
	fmt.Println("受信完了")
}`,
      hints: [
        `rangeでチャネルを受信するループは、チャネルがcloseされたときに終了します。送信側のcloseが必須です。`,
        `ゴルーチンの送信ループの直後にclose(ch)を書き、受信側はfor v := range ch { fmt.Println(v) }に置き換えます。`
      ],
      expectedOutput: "受信完了"
    },
    {
      id: 147,
      title: "方向付きチャネル（chan<- と <-chan）",
      explanation: `<p>チャネルを関数の引数として渡すとき、型に矢印を付けると<strong>送信専用・受信専用</strong>に制限できます。これを<strong>方向付きチャネル</strong>と呼びます。</p>
<table>
<tr><th>型の書き方</th><th>意味</th><th>できる操作</th></tr>
<tr><td><code>chan int</code></td><td>双方向</td><td>送信・受信・close</td></tr>
<tr><td><code>chan&lt;- int</code></td><td>送信専用</td><td>送信・closeのみ</td></tr>
<tr><td><code>&lt;-chan int</code></td><td>受信専用</td><td>受信のみ</td></tr>
</table>
<p>矢印の位置は「chanに入れる」「chanから出す」と読むと覚えやすいです。</p>
<pre><code>// sendはchへ送信することしかできない
func send(ch chan&lt;- int, n int) {
    for i := 1; i &lt;= n; i++ {
        ch &lt;- i
    }
    close(ch) // closeは送信側の責任なので送信専用でも可能
}

// receiveはchから受信することしかできない
func receive(ch &lt;-chan int) int {
    sum := 0
    for v := range ch {
        sum += v
    }
    return sum
}</code></pre>
<p>双方向チャネルは方向付きに<strong>自動で変換</strong>されるので、呼び出し側は普通に<code>make(chan int)</code>で作って渡すだけです（逆方向、つまり方向付きから双方向への変換はできません）。</p>
<p>方向を付ける利点は安全性です。たとえば受信専用チャネルにうっかり送信やcloseを書くと<strong>コンパイルエラー</strong>になります。「この関数は送る側なのか受け取る側なのか」が型シグネチャだけで読み取れるため、実務のコードレビューでも重宝されます。関数にチャネルを渡すときは方向を付けるのがGoの慣習です。</p>`,
      task: `関数<code>send</code>と<code>receive</code>の引数の型に方向を付けてください。<code>send</code>は送信専用<code>chan&lt;- int</code>、<code>receive</code>は受信専用<code>&lt;-chan int</code>にします。`,
      code: `package main

import "fmt"

// TODO: chを送信専用（chan<- int）にする
func send(ch chan int, n int) {
	for i := 1; i <= n; i++ {
		ch <- i
	}
	close(ch)
}

// TODO: chを受信専用（<-chan int）にする
func receive(ch chan int) int {
	sum := 0
	for v := range ch {
		sum += v
	}
	return sum
}

func main() {
	ch := make(chan int)
	go send(ch, 10)
	fmt.Println("合計:", receive(ch))
}`,
      solution: `package main

import "fmt"

// chは送信専用。受信しようとするとコンパイルエラーになる
func send(ch chan<- int, n int) {
	for i := 1; i <= n; i++ {
		ch <- i
	}
	close(ch)
}

// chは受信専用。送信やcloseはコンパイルエラーになる
func receive(ch <-chan int) int {
	sum := 0
	for v := range ch {
		sum += v
	}
	return sum
}

func main() {
	ch := make(chan int)
	go send(ch, 10)
	fmt.Println("合計:", receive(ch))
}`,
      hints: [
        `送信専用はchan<- int（chanに入れる方向）、受信専用は<-chan int（chanから出す方向）です。`,
        `引数の型を書き換えるだけで、mainは変更不要です。双方向チャネルは方向付きの引数に自動で変換されます。`
      ],
      expectedOutput: "合計: 55"
    },
    {
      id: 148,
      title: "selectの基本",
      explanation: `<p>複数のチャネルを同時に待ちたいときに使うのが<strong>select文</strong>です。switch文に似た見た目ですが、条件ではなく<strong>チャネル操作</strong>を並べます。</p>
<pre><code>select {
case msg := &lt;-ch1:
    fmt.Println("ch1から受信:", msg)
case msg := &lt;-ch2:
    fmt.Println("ch2から受信:", msg)
}</code></pre>
<p>selectの動作ルールは次のとおりです。</p>
<ul>
<li>いずれかのcaseが<strong>実行可能になるまでブロック</strong>する</li>
<li>実行可能なcaseが1つなら、それを実行する</li>
<li>複数が同時に実行可能なら、<strong>ランダムに1つ</strong>選ばれる（上から順ではない点に注意）</li>
<li>1つのcaseを実行したらselect全体が終わる（switchと同じで1回きり）</li>
</ul>
<p>「複数回待ちたい」ときはforループでselectを囲みます。2つのゴルーチンからの完了報告を、早い順に受け取る例を見てみましょう。</p>
<pre><code>for i := 0; i &lt; 2; i++ {
    select {
    case msg := &lt;-fast:
        fmt.Println(msg)
    case msg := &lt;-slow:
        fmt.Println(msg)
    }
}</code></pre>
<p>単純に<code>&lt;-fast</code>、<code>&lt;-slow</code>と順に受信すると、fastが先に終わっていてもslowの結果をどちらが先か気にせず待つ順番が固定されます。selectを使えば「<strong>先に届いたほうから</strong>処理する」ことができ、複数の非同期処理を効率よくさばけます。これは次章で学ぶタイムアウト処理やキャンセル処理の土台になる、並行処理の要の構文です。</p>`,
      task: `TODOの部分にselect文を完成させてください。<code>fast</code>と<code>slow</code>のどちらから届いてもメッセージを表示できるように、caseを2つ書きます。`,
      code: `package main

import (
	"fmt"
	"time"
)

func main() {
	fast := make(chan string)
	slow := make(chan string)

	go func() {
		time.Sleep(10 * time.Millisecond)
		fast <- "速い処理が完了"
	}()
	go func() {
		time.Sleep(40 * time.Millisecond)
		slow <- "遅い処理が完了"
	}()

	for i := 0; i < 2; i++ {
		// TODO: selectでfastとslowの両方を待ち、届いたメッセージを表示する
	}
}`,
      solution: `package main

import (
	"fmt"
	"time"
)

func main() {
	fast := make(chan string)
	slow := make(chan string)

	go func() {
		time.Sleep(10 * time.Millisecond)
		fast <- "速い処理が完了"
	}()
	go func() {
		time.Sleep(40 * time.Millisecond)
		slow <- "遅い処理が完了"
	}()

	for i := 0; i < 2; i++ {
		// 先に届いたほうのcaseが実行される
		select {
		case msg := <-fast:
			fmt.Println(msg)
		case msg := <-slow:
			fmt.Println(msg)
		}
	}
}`,
      hints: [
        `select { case ... : case ... : } の形で、caseにはチャネルの受信操作を書きます。`,
        `case msg := <-fast: と case msg := <-slow: の2つのcaseを書き、それぞれfmt.Println(msg)します。ループが2周するので両方のメッセージが表示されます。`
      ],
      expectedOutput: "遅い処理が完了"
    },
    {
      id: 149,
      title: "selectとdefault（ノンブロッキング）",
      explanation: `<p>select文に<code>default</code>を付けると、動作が大きく変わります。<strong>どのcaseもすぐに実行できないとき、待たずにdefaultが実行される</strong>のです。これを<strong>ノンブロッキング</strong>（処理を止めずに先へ進む）操作と呼びます。</p>
<pre><code>select {
case v := &lt;-ch:
    fmt.Println("受信:", v)
default:
    fmt.Println("値がまだ来ていないので、他の仕事をします")
}</code></pre>
<table>
<tr><th></th><th>defaultなし</th><th>defaultあり</th></tr>
<tr><td>caseが実行可能</td><td>そのcaseを実行</td><td>そのcaseを実行</td></tr>
<tr><td>どのcaseも実行不可</td><td>実行可能になるまでブロック</td><td>defaultを即実行して先へ進む</td></tr>
</table>
<p>用途の代表例は「値が来ていたら処理し、来ていなければ別の仕事をする」ポーリング（定期的な様子見）や、「バッファに空きがあれば送る、満杯なら諦める」ノンブロッキング送信です。</p>
<pre><code>select {
case ch &lt;- v:
    fmt.Println("送信できました")
default:
    fmt.Println("バッファ満杯のため送信をスキップ")
}</code></pre>
<p>注意点として、<code>for</code>ループの中でdefault付きselectを回し続けると、CPUを無駄に消費する「ビジーループ」になりがちです。実務では、本当に待たずに進む必要がある場面に限って使い、単に待てばよい場面ではdefaultなしのselectや通常の受信を使うのが定石です。</p>`,
      task: `2つのselect文それぞれにdefaultケースを追加してください。1回目は値が届いていないので<code>値なし: 待たずに次へ進みます</code>、2回目は送信済みなので<code>受信: 100</code>が表示されるようにします。`,
      code: `package main

import "fmt"

func main() {
	ch := make(chan int, 1)

	// 1回目: まだ何も送信されていない
	select {
	case v := <-ch:
		fmt.Println("受信:", v)
		// TODO: defaultを追加して "値なし: 待たずに次へ進みます" と表示する
	}

	ch <- 100

	// 2回目: 送信済みなのでcaseが実行されるはず
	select {
	case v := <-ch:
		fmt.Println("受信:", v)
		// TODO: こちらにもdefaultを追加して "値なし" と表示する
	}
}`,
      solution: `package main

import "fmt"

func main() {
	ch := make(chan int, 1)

	// 1回目: まだ何も送信されていないのでdefaultが実行される
	select {
	case v := <-ch:
		fmt.Println("受信:", v)
	default:
		fmt.Println("値なし: 待たずに次へ進みます")
	}

	ch <- 100

	// 2回目: バッファに値があるのでcaseが実行される
	select {
	case v := <-ch:
		fmt.Println("受信:", v)
	default:
		fmt.Println("値なし")
	}
}`,
      hints: [
        `defaultはswitch文と同じ書き方で、caseの後に「default:」として追加します。`,
        `defaultがあると、受信できないときにブロックせずdefaultの処理へ進みます。1回目はdefault側、2回目はcase側が実行されれば正解です。`
      ],
      expectedOutput: "受信: 100"
    },
    {
      id: 150,
      title: "総合演習：ワーカーからの結果収集",
      explanation: `<p>この章の総仕上げとして、複数のワーカー（仕事を処理するゴルーチン）から結果を集める定番構成を組み立てます。使う道具はすべて学習済みです。</p>
<ul>
<li><strong>jobsチャネル</strong>：mainからワーカーへ仕事を配る（ワーカーから見て受信専用<code>&lt;-chan int</code>）</li>
<li><strong>resultsチャネル</strong>：ワーカーからmainへ結果を返す（ワーカーから見て送信専用<code>chan&lt;- int</code>）</li>
<li><strong>sync.WaitGroup</strong>：全ワーカーの終了を待つ</li>
</ul>
<p>処理の流れは次のとおりです。</p>
<ol>
<li>ワーカーを3つ起動する（それぞれ<code>wg.Add(1)</code>）</li>
<li>mainがjobsに仕事（数値1〜10）を送信し、<strong>closeする</strong>（ワーカーのrangeを終わらせるため）</li>
<li>各ワーカーはjobsをrangeで受信し、二乗をresultsへ送信。仕事がなくなったら<code>wg.Done()</code></li>
<li>mainは<code>wg.Wait()</code>で全ワーカーの終了を待ち、resultsをcloseする</li>
<li>resultsをrangeで受信して合計する</li>
</ol>
<pre><code>func worker(jobs &lt;-chan int, results chan&lt;- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for n := range jobs {
        results &lt;- n * n
    }
}</code></pre>
<p>ポイントは<strong>closeのタイミング</strong>です。jobsはmainが送り終えた時点でcloseできますが、resultsは「全ワーカーが送り終えた」ことを<code>wg.Wait()</code>で確認してからcloseします。ワーカーが動いているうちにcloseすると、close済みチャネルへの送信でpanicになります。複数の送信者がいるチャネルは、WaitGroupで全員の完了を確認してから閉じる。これは次章のパターンでも繰り返し登場する重要な作法です。</p>`,
      task: `TODOの3箇所を埋めて完成させてください。(1)jobsへ1〜10を送信してclose、(2)wg.Wait()の後にresultsをclose、(3)resultsをrangeで合計します。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func worker(jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for n := range jobs {
		results <- n * n // 仕事: 二乗を計算して結果を送信
	}
}

func main() {
	jobs := make(chan int, 10)
	results := make(chan int, 10)
	var wg sync.WaitGroup

	for i := 0; i < 3; i++ {
		wg.Add(1)
		go worker(jobs, results, &wg)
	}

	// TODO: (1) jobsに1から10までを送信し、送信し終えたらcloseする

	// TODO: (2) 全ワーカーの終了を待ってから、resultsをcloseする

	// TODO: (3) resultsをrangeで受信してsumに合計する
	sum := 0

	fmt.Println("二乗の合計:", sum)
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func worker(jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for n := range jobs {
		results <- n * n // 仕事: 二乗を計算して結果を送信
	}
}

func main() {
	jobs := make(chan int, 10)
	results := make(chan int, 10)
	var wg sync.WaitGroup

	for i := 0; i < 3; i++ {
		wg.Add(1)
		go worker(jobs, results, &wg)
	}

	// (1) 仕事を配り終えたらjobsをclose（ワーカーのrangeが終了する）
	for n := 1; n <= 10; n++ {
		jobs <- n
	}
	close(jobs)

	// (2) 全ワーカーの送信完了を確認してからresultsをclose
	wg.Wait()
	close(results)

	// (3) 集まった結果を合計する
	sum := 0
	for v := range results {
		sum += v
	}

	fmt.Println("二乗の合計:", sum)
}`,
      hints: [
        `jobsへの送信はforループで「jobs <- n」、終わったらclose(jobs)です。closeしないとワーカーのrangeが終わらず、wg.Wait()でデッドロックします。`,
        `resultsのcloseは必ずwg.Wait()の後に。ワーカーがまだ送信中にcloseするとpanicになります。`,
        `最後はfor v := range results { sum += v } で合計します。resultsがclose済みなのでループは自動で終わります。`
      ],
      expectedOutput: "二乗の合計: 385"
    }
  ]
});
