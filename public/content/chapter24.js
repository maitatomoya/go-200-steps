// 第24章：よくあるエラー：並行処理
registerChapter({
  number: 24,
  title: "よくあるエラー：並行処理",
  description: "デッドロック検出メッセージの読み方、チャネル操作のpanic、レースコンディションの観察方法など、並行処理特有のエラーと不定な挙動を実際に起こして修正します。",
  steps: [
    {
      id: 231,
      title: "デッドロック：受信相手のいない送信",
      explanation: `<p>この章では並行処理特有のエラーを扱います。まずは最も有名な<strong>デッドロック</strong>（全員が互いを待ち合って誰も進めなくなる状態）です。バッファなしチャネルに、受信相手がいないまま送信すると発生します。</p>
<h4>エラーメッセージの読み方</h4>
<pre><code>fatal error: all goroutines are asleep - deadlock!

goroutine 1 [chan send]:
main.main()
	/path/to/main.go:7 +0x38
exit status 2</code></pre>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td><code>fatal error:</code></td><td>panicではなくfatal error。recoverでも捕捉できない致命的エラー</td></tr>
<tr><td><code>all goroutines are asleep</code></td><td>すべてのgoroutineが待ち状態＝誰も動けない。Goランタイムはこれを検出してプログラムを強制終了する</td></tr>
<tr><td><code>goroutine 1 [chan send]:</code></td><td>goroutine 1（main）が「チャネル送信」で待っていた。角括弧内が待ちの種類</td></tr>
<tr><td><code>main.go:7</code></td><td>ブロックしていた行番号。ここが調査の起点</td></tr>
</table>
<p>角括弧内の状態表示は<code>[chan send]</code>（送信待ち）のほかに<code>[chan receive]</code>（受信待ち）、<code>[semacquire]</code>（ロックやWaitGroupの待ち）などがあり、<strong>何を待っていたか</strong>が一目で分かります。</p>
<h4>なぜ起きるか</h4>
<p>第15章で学んだとおり、バッファなしチャネルの送信<code>ch &lt;- v</code>は<strong>受信側が受け取るまでその場で停止</strong>します。mainが1人で送信すると、受信してくれる相手がどこにもいないため永遠に止まり、ランタイムがデッドロックと判定します。</p>
<h4>典型的な修正パターン</h4>
<ul>
<li>送信を別のgoroutineで行い、mainが受信する（模範解答）</li>
<li>逆に受信側をgoroutineにして、mainが送信する</li>
<li>用途によってはバッファ付きチャネルにする（ステップ238で詳しく）</li>
</ul>`,
      task: `送信<code>ch &lt;- "こんにちは"</code>を<code>go func() { ... }()</code>の中に移動して、mainが受信できるように修正してください。`,
      code: `package main

import "fmt"

func main() {
	ch := make(chan string)
	ch <- "こんにちは" // 受信する相手がいないので永遠にブロック→デッドロック
	fmt.Println(<-ch)
}`,
      solution: `package main

import "fmt"

func main() {
	ch := make(chan string)
	go func() {
		ch <- "こんにちは" // 別のgoroutineから送信する
	}()
	fmt.Println(<-ch) // mainが受信する
}`,
      hints: [
        `バッファなしチャネルの送信は、受信相手が現れるまでその場で止まります。mainが送信で止まると、受信する人が誰もいません。`,
        `go func() { ch <- "こんにちは" }() と送信を別goroutineにすれば、mainは次の行で受信できます。`
      ],
      expectedOutput: "こんにちは"
    },
    {
      id: 232,
      title: "panic: send on closed channel",
      explanation: `<p>チャネルは<code>close</code>すると「もう値は来ない」ことを受信側に伝えられますが、<strong>クローズ後に送信するとpanic</strong>します。</p>
<h4>エラーメッセージの読み方</h4>
<pre><code>panic: send on closed channel

goroutine 1 [running]:
main.main()
	/path/to/main.go:11 +0x50
exit status 2</code></pre>
<p>前のステップの<code>fatal error</code>と違い、こちらは<code>panic</code>です。<code>[running]</code>は「実行中にpanicした」ことを示し、スタックトレース（関数の呼び出し履歴）の行番号がそのまま問題の送信箇所を指します。</p>
<h4>closeにまつわるルールの整理</h4>
<table>
<tr><th>操作</th><th>結果</th></tr>
<tr><td>クローズ済みチャネルへ送信</td><td><strong>panic: send on closed channel</strong></td></tr>
<tr><td>クローズ済みチャネルから受信</td><td>バッファに残った値を返し、その後はゼロ値と<code>ok=false</code>を返す（安全）</td></tr>
<tr><td>2回close</td><td><strong>panic: close of closed channel</strong></td></tr>
</table>
<p>受信は安全で送信はpanicという非対称性から、Goには<strong>「closeするのは送信側の責務」</strong>という大原則があります。受信側や第三者がcloseすると、まだ送信中の誰かをpanicさせる危険があるからです。</p>
<h4>典型的な修正パターン</h4>
<ul>
<li>すべての送信が終わってからcloseする（模範解答）</li>
<li>送信goroutineが複数いる場合は、全員の完了をWaitGroupで待ってからcloseする（ステップ240で登場）</li>
</ul>
<p>なお、closeは「送り終わった」ことを伝える合図であり、チャネルを使い終わるたびに必ずcloseしなければならないわけではありません。受信側が<code>range</code>で回る場合など、終わりを伝える必要があるときにcloseします。</p>`,
      task: `<code>close(ch)</code>の位置を移動して、3つの値をすべて送信し終えてからクローズするように修正してください。`,
      code: `package main

import "fmt"

func main() {
	ch := make(chan int, 3)
	ch <- 10
	ch <- 20
	close(ch) // まだ送信が残っているのにクローズしてしまった
	ch <- 30  // panic: send on closed channel
	for v := range ch {
		fmt.Println("受信:", v)
	}
}`,
      solution: `package main

import "fmt"

func main() {
	ch := make(chan int, 3)
	ch <- 10
	ch <- 20
	ch <- 30
	close(ch) // すべて送信し終えてからクローズする
	for v := range ch {
		fmt.Println("受信:", v)
	}
}`,
      hints: [
        `closeは「もう送りません」という宣言です。宣言したあとに送信するとpanicします。`,
        `close(ch)をch <- 30の後ろに移動すれば、すべての送信が終わってからクローズされます。`
      ],
      expectedOutput: "受信: 30"
    },
    {
      id: 233,
      title: "panic: close of nil channel",
      explanation: `<p>チャネル型の変数を<code>var ch chan int</code>と宣言しただけでは、チャネルの実体はまだ作られていません。ゼロ値は<code>nil</code>で、nilチャネルへの操作は独特の挙動をします。</p>
<h4>エラーメッセージの読み方</h4>
<pre><code>panic: close of nil channel

goroutine 1 [running]:
main.main()
	/path/to/main.go:9 +0x20
exit status 2</code></pre>
<p>メッセージは単純明快で、「nilのチャネルをcloseした」ことを伝えています。第22章で学んだnilマップ（読み取りは安全だが書き込みはpanic）と同じく、<strong>「宣言しただけで使える」と思い込むと踏む罠</strong>です。</p>
<h4>nilチャネルの挙動一覧</h4>
<table>
<tr><th>操作</th><th>結果</th></tr>
<tr><td><code>ch &lt;- v</code>（送信）</td><td>永遠にブロック（デッドロックの原因になる）</td></tr>
<tr><td><code>&lt;-ch</code>（受信）</td><td>永遠にブロック</td></tr>
<tr><td><code>close(ch)</code></td><td><strong>panic: close of nil channel</strong></td></tr>
</table>
<p>特に注意したいのは送受信が「panicではなくブロック」になる点です。closeのようにその場でpanicしてくれれば原因はすぐ分かりますが、ブロックは症状が「プログラムが固まる・デッドロック」として離れた場所に現れるため、原因の特定が難しくなります。構造体のフィールドにチャネルを持たせて初期化を忘れるのが実務でよくあるパターンです。</p>
<h4>典型的な修正パターン</h4>
<pre><code>ch := make(chan int, 2) // 必ずmakeで実体を作ってから使う</code></pre>
<p>マップと同様、チャネルも<strong>使う前に必ずmakeする</strong>のが原則です。varで宣言したチャネルを見たら、makeがどこで呼ばれるかを確認する習慣をつけましょう。</p>`,
      task: `チャネルを<code>make(chan int, 2)</code>で初期化し、<code>1</code>と<code>2</code>を送信してから<code>close</code>するように修正してください。受信のrangeループはそのまま使えます。`,
      code: `package main

import "fmt"

func main() {
	var ch chan int // 宣言しただけ。ゼロ値はnil
	fmt.Println("チャネルはnil?", ch == nil)
	close(ch) // panic: close of nil channel
	for v := range ch {
		fmt.Println("受信:", v)
	}
	fmt.Println("完了")
}`,
      solution: `package main

import "fmt"

func main() {
	ch := make(chan int, 2) // makeで実体を作る（バッファ2）
	fmt.Println("チャネルはnil?", ch == nil)
	ch <- 1
	ch <- 2
	close(ch)
	for v := range ch {
		fmt.Println("受信:", v)
	}
	fmt.Println("完了")
}`,
      hints: [
        `var ch chan intは「nilのチャネル変数」を作るだけで、チャネルの実体は作られていません。`,
        `ch := make(chan int, 2)のようにmakeで実体を作れば、送信もcloseも安全に行えます。`
      ],
      expectedOutput: "完了"
    },
    {
      id: 234,
      title: "WaitGroupのAddの位置ミス",
      explanation: `<p>第16章で学んだ<code>sync.WaitGroup</code>は、Add（カウンタを増やす）・Done（減らす）・Wait（0になるまで待つ）の3点セットで使います。この<strong>Addを呼ぶ場所</strong>を間違えると、エラーも出ずにWaitが素通りします。</p>
<h4>何が起きるか</h4>
<pre><code>for i := 1; i &lt;= 3; i++ {
	go func() {
		wg.Add(1) // ← goroutineの中でAddしている
		defer wg.Done()
		results &lt;- i * 10
	}()
}
wg.Wait() // goroutineがまだ動き出す前ならカウンタは0→即座に通過</code></pre>
<p><code>go</code>文は「あとで実行してね」と予約するだけで、goroutineが実際に動き出すタイミングは分かりません。mainが<code>wg.Wait()</code>に到達した時点でまだどのgoroutineも動いていなければ、カウンタは0のままなのでWaitは<strong>待たずに通過</strong>します。実行してみると「完了した処理の数: 0」になることがほとんどです。</p>
<h4>不定な結果の観察方法</h4>
<p>このバグの結果は実行のたびに変わりえます。何度か実行して、次のようなパターンを観察してみてください。</p>
<ul>
<li>多くの場合：0（goroutineが動く前にmainが集計してしまう）</li>
<li>まれに：1〜3（一部のgoroutineが間に合う）</li>
<li>まれに：<code>panic: send on closed channel</code>（closeの後にgoroutineが送信してしまう）</li>
</ul>
<p>このように<strong>「実行するたびに結果が違う」こと自体が並行処理バグの重要なサイン</strong>です。1回動いたからOKではなく、繰り返し実行して確かめる習慣が大切です。</p>
<h4>修正パターン</h4>
<p><strong>Addは必ずgo文より前に、goroutineを起動する側で呼ぶ</strong>のが鉄則です。起動する側なら、Waitに到達する時点でカウンタが確実に3になっています。ループ前に<code>wg.Add(3)</code>とまとめて呼ぶ書き方もあります。</p>`,
      task: `<code>wg.Add(1)</code>をgoroutineの中から<code>go</code>文の直前（起動する側）に移動して、3つの処理がすべて完了してから集計されるように修正してください。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	results := make(chan int, 3)
	for i := 1; i <= 3; i++ {
		go func() {
			wg.Add(1) // goroutineの中でAddしている（動き出す前にWaitが通過してしまう）
			defer wg.Done()
			results <- i * 10
		}()
	}
	wg.Wait() // カウンタが0のまま素通りすることが多い
	close(results)
	count := 0
	for range results {
		count++
	}
	fmt.Println("完了した処理の数:", count) // 3のはずが0になりがち
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	results := make(chan int, 3)
	for i := 1; i <= 3; i++ {
		wg.Add(1) // 起動する側でAddする。Waitの時点でカウンタが確実に3になる
		go func() {
			defer wg.Done()
			results <- i * 10
		}()
	}
	wg.Wait()
	close(results)
	count := 0
	for range results {
		count++
	}
	fmt.Println("完了した処理の数:", count)
}`,
      hints: [
        `go文は予約だけしてすぐ次の行に進みます。goroutineの中のAddが実行される前に、mainのWaitが先に評価されるとカウンタは0です。`,
        `wg.Add(1)をfor文の中・go文の直前に移動します。「Addは起動する側、Doneは実行される側」が鉄則です。`
      ],
      expectedOutput: "完了した処理の数: 3"
    },
    {
      id: 235,
      title: "レースコンディション：カウントが足りない",
      explanation: `<p>複数のgoroutineが同じ変数を同時に読み書きすると、<strong>レースコンディション</strong>（競合状態）が発生します。エラーメッセージは出ず、<strong>結果の数値が実行のたびに変わる</strong>という形で現れます。</p>
<h4>不定な結果の観察方法</h4>
<p>5つのgoroutineがそれぞれ1万回<code>counter++</code>するコードを何度か実行すると、こうなります。</p>
<pre><code>$ go run main.go
カウント: 21637
$ go run main.go
カウント: 50000
$ go run main.go
カウント: 10000</code></pre>
<p>期待値は50000ですが、実行のたびに違う値になります。<code>counter++</code>は実際には「読む→1足す→書き戻す」の3手順であり、2つのgoroutineが同時に同じ値を読むと、片方の加算がもう片方の書き戻しで上書きされて<strong>消える</strong>のです。たまに50000になることがあるのがまた厄介で、「手元では動いた」まま本番に出てしまう典型例です。</p>
<h4>レース検出器を使う</h4>
<p>Goには公式のレース検出器があり、<code>go run -race main.go</code>のように<code>-race</code>フラグを付けて実行すると、レースを検出して報告してくれます。</p>
<pre><code>==================
WARNING: DATA RACE
Read at 0x00c000096028 by goroutine 6:
  main.main.func1()
      /path/to/main.go:16 +0x94

Previous write at 0x00c000096028 by goroutine 8:
  main.main.func1()
      /path/to/main.go:16 +0xa4</code></pre>
<p>「goroutine 6が読んだ場所に、goroutine 8が直前に書いていた」という報告で、両方の行番号が表示されます。並行処理のコードを書いたら<code>-race</code>付きでテストするのが実務の定石です。</p>
<h4>修正パターン</h4>
<p>第16章で学んだ<code>sync.Mutex</code>（相互排他ロック）で<code>counter++</code>を囲み、同時に1つのgoroutineしか触れないようにします。ほかに、加算結果をチャネルで集める方法や<code>sync/atomic</code>パッケージを使う方法もあります。</p>`,
      task: `<code>sync.Mutex</code>を追加し、<code>counter++</code>を<code>mu.Lock()</code>と<code>mu.Unlock()</code>で囲んで、必ず「カウント: 50000」になるように修正してください。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	counter := 0
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 10000; j++ {
				counter++ // 5つのgoroutineが同時に読み書き→加算が消える
			}
		}()
	}
	wg.Wait()
	fmt.Println("カウント:", counter) // 実行するたびに違う値になる
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	counter := 0
	var mu sync.Mutex // counterを守るロック
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 10000; j++ {
				mu.Lock()
				counter++ // ロック中は1つのgoroutineだけが触れる
				mu.Unlock()
			}
		}()
	}
	wg.Wait()
	fmt.Println("カウント:", counter)
}`,
      hints: [
        `counter++は「読む→足す→書く」の3手順なので、同時に実行されると加算が消えます。同時に1人しか触れない仕組みが必要です。`,
        `var mu sync.Mutexを宣言し、counter++の前後をmu.Lock()とmu.Unlock()で囲みます。`,
        `修正前後でgo run -race main.goを実行して、WARNINGが消えることも確認してみましょう。`
      ],
      expectedOutput: "カウント: 50000"
    },
    {
      id: 236,
      title: "goroutineリーク：受信されないチャネル",
      explanation: `<p>デッドロックは「全員が」止まると検出されますが、<strong>一部のgoroutineだけ</strong>が永遠にブロックしても、ランタイムは何も報告しません。これが<strong>goroutineリーク</strong>です。エラーが出ないぶん、デッドロックより発見が困難です。</p>
<h4>何が起きるか</h4>
<pre><code>func search(keyword string) string {
	ch := make(chan string) // バッファなし
	for i := 1; i &lt;= 3; i++ {
		go func() { ch &lt;- 結果 }() // 3つが送信しようとする
	}
	return &lt;-ch // 最初の1件だけ受信して帰ってしまう
}</code></pre>
<p>最速の1件を受信した時点で<code>search</code>は戻りますが、残り2つのgoroutineは<strong>送信したまま永遠に待ち続けます</strong>。誰ももう受信しないからです。1回の呼び出しで2個ずつリークし、呼ぶたびに溜まっていきます。</p>
<h4>観察方法：runtime.NumGoroutine</h4>
<p><code>runtime.NumGoroutine()</code>は現在生きているgoroutineの数を返します。searchを3回呼んだあとに数えると：</p>
<pre><code>残っているgoroutine数: 7</code></pre>
<p>main1個＋リーク6個（2個×3回）で7になり、リークが数字で確認できます。実務ではこの数がリクエストのたびに増え続け、メモリ使用量の増加やパフォーマンス低下として現れます。監視項目としてgoroutine数をグラフ化するのは定番の運用手法です。</p>
<h4>修正パターン</h4>
<table>
<tr><th>方法</th><th>内容</th></tr>
<tr><td>バッファ付きチャネル</td><td><code>make(chan string, 3)</code>にすれば、受信されなくても3件まで送信が完了し、goroutineは正常終了できる（模範解答）</td></tr>
<tr><td>全件受信する</td><td>結果を使わなくても3件すべて受信して吸い切る</td></tr>
<tr><td>キャンセル通知</td><td>doneチャネルやcontextで「もう不要」を伝えて早期終了させる（発展）</td></tr>
</table>
<p>「起動したgoroutineは必ず終わる道筋があるか？」を自問するのが、リークを防ぐ基本の考え方です。</p>`,
      task: `<code>search</code>内のチャネルを送信数と同じ容量のバッファ付きチャネル<code>make(chan string, 3)</code>に変更して、残りのgoroutineが正常終了できるようにしてください。修正後は残goroutine数が1になります。`,
      code: `package main

import (
	"fmt"
	"runtime"
	"time"
)

// search は3つの検索を並行実行し、最速の1件だけ返す
func search(keyword string) string {
	ch := make(chan string) // バッファなし
	for i := 1; i <= 3; i++ {
		go func() {
			ch <- fmt.Sprintf("%sの結果%d", keyword, i)
		}()
	}
	return <-ch // 1件だけ受信。残り2つのgoroutineは送信で永遠に待つ＝リーク
}

func main() {
	for i := 0; i < 3; i++ {
		search("golang")
	}
	time.Sleep(50 * time.Millisecond) // goroutineが落ち着くのを待つ
	fmt.Println("残っているgoroutine数:", runtime.NumGoroutine()) // 1のはずが7
}`,
      solution: `package main

import (
	"fmt"
	"runtime"
	"time"
)

// search は3つの検索を並行実行し、最速の1件だけ返す
func search(keyword string) string {
	ch := make(chan string, 3) // 送信数ぶんのバッファを確保
	for i := 1; i <= 3; i++ {
		go func() {
			ch <- fmt.Sprintf("%sの結果%d", keyword, i) // 受信されなくても完了できる
		}()
	}
	return <-ch // 残りの2件はバッファに入り、goroutineは正常終了する
}

func main() {
	for i := 0; i < 3; i++ {
		search("golang")
	}
	time.Sleep(50 * time.Millisecond) // goroutineが落ち着くのを待つ
	fmt.Println("残っているgoroutine数:", runtime.NumGoroutine())
}`,
      hints: [
        `バッファなしチャネルへの送信は受信されるまで完了しません。1件しか受信されないので、残り2つのgoroutineは永遠に待ち続けます。`,
        `make(chan string, 3)とバッファを持たせれば、送信は受信を待たずに完了し、goroutineは終了できます。`
      ],
      expectedOutput: "残っているgoroutine数: 1"
    },
    {
      id: 237,
      title: "mainが先に終わってgoroutineが動かない",
      explanation: `<p>「goroutineを起動したのに何も表示されない」。並行処理を学び始めた人が最初に踏む罠です。エラーは一切出ず、<strong>期待した出力がただ消えます</strong>。</p>
<h4>何が起きるか</h4>
<pre><code>func main() {
	go fmt.Println("goroutineからこんにちは")
	fmt.Println("mainを終了します")
}
// 出力: mainを終了します （goroutineの行は表示されない）</code></pre>
<p>Goのプログラムは<strong>main関数が終わった瞬間に、実行中・実行待ちのgoroutineを道連れにして終了します</strong>。<code>go</code>文は起動を予約するだけなので、mainが次の行を実行して終了するまでの間に、goroutineが動き出せないことがほとんどです。</p>
<h4>不定な結果の観察方法</h4>
<p>これも「まれに表示されることがある」不定な挙動です。何度も実行すると、環境によってはたまにgoroutineの出力が間に合うことがあります。ステップ234・235と同じく、<strong>実行のたびに結果が変わったら並行処理の同期不足を疑う</strong>のがセオリーです。</p>
<h4>修正パターン</h4>
<table>
<tr><th>方法</th><th>評価</th></tr>
<tr><td><code>time.Sleep</code>で待つ</td><td>×。何ミリ秒待てば十分かは保証できず、待ちすぎれば無駄。デバッグの一時しのぎ限定</td></tr>
<tr><td><code>sync.WaitGroup</code>で待つ</td><td>◯。「全員の完了」を確実に待てる（模範解答）</td></tr>
<tr><td>チャネルで完了通知</td><td>◯。完了と同時に結果も受け取りたいときに自然</td></tr>
</table>
<p>模範解答ではWaitGroupを使います。前のステップで学んだとおり<strong>Addはgo文の前</strong>です。<code>wg.Wait()</code>がgoroutineの完了までmainを足止めしてくれるので、出力が確実に表示されてからmainが終了します。</p>`,
      task: `<code>sync.WaitGroup</code>を使って、goroutineの出力が終わってからmainが終了するように修正してください。goroutineは<code>func() { defer wg.Done(); ... }</code>の形にします。`,
      code: `package main

import "fmt"

func main() {
	go fmt.Println("goroutineからこんにちは") // 起動を予約しただけ
	fmt.Println("mainを終了します")
	// mainがここで終了→goroutineは実行されないまま道連れになる
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	wg.Add(1) // 起動する側でAdd
	go func() {
		defer wg.Done()
		fmt.Println("goroutineからこんにちは")
	}()
	wg.Wait() // goroutineの完了を待ってから先へ進む
	fmt.Println("mainを終了します")
}`,
      hints: [
        `mainが終わるとgoroutineは実行の機会を失います。mainに「待ってもらう」仕組みが必要です。`,
        `wg.Add(1)→go func() { defer wg.Done(); 出力 }()→wg.Wait()の順に組み立てます。time.Sleepで待つのは時間の保証がないため避けましょう。`
      ],
      expectedOutput: "goroutineからこんにちは"
    },
    {
      id: 238,
      title: "バッファなしチャネルの送信ブロック",
      explanation: `<p>ステップ231と同じデッドロックですが、今回は「あとで自分で受信するつもり」のコードで起きます。<strong>送信と受信を同じgoroutineで順番に行うことはできない</strong>という、バッファなしチャネルの本質を確認しましょう。</p>
<h4>エラーメッセージ</h4>
<pre><code>fatal error: all goroutines are asleep - deadlock!

goroutine 1 [chan send]:
main.main()
	/path/to/main.go:7 +0x40</code></pre>
<p>コードの後ろには<code>fmt.Println(&lt;-ch, &lt;-ch)</code>という受信が書いてあるのに、なぜデッドロックになるのでしょうか。バッファなしチャネルの送信は<strong>受信と同時でなければ完了しない</strong>（同期的な手渡し）ため、mainは1行目の<code>ch &lt;- 1</code>で止まり、その先にある受信の行には永遠に到達できないのです。「コードのあとの方に受信があるからOK」は通用しません。</p>
<h4>バッファなしとバッファ付きの違い</h4>
<table>
<tr><th></th><th>バッファなし<code>make(chan int)</code></th><th>バッファ付き<code>make(chan int, 2)</code></th></tr>
<tr><td>送信の挙動</td><td>受信者が受け取るまでブロック</td><td>バッファに空きがあれば即座に完了</td></tr>
<tr><td>ブロックする条件</td><td>常に相手待ち</td><td>バッファ満杯のときだけ</td></tr>
<tr><td>向いている用途</td><td>同期（手渡しの確実性）</td><td>一時的な溜め置き、非同期化</td></tr>
</table>
<h4>修正パターン</h4>
<ul>
<li>送信する個数が決まっているなら、その個数ぶんのバッファを持たせる：<code>make(chan int, 2)</code>（模範解答）</li>
<li>本来の設計が「別goroutineとの同期」なら、ステップ231のように送信側をgoroutineに分ける</li>
</ul>
<p>バッファサイズは「とりあえず大きく」ではなく、<strong>溜まる可能性のある最大数を根拠を持って</strong>決めるのが良い設計です。無闇に大きいバッファは、詰まりの検知を遅らせるだけのことがあります。</p>`,
      task: `チャネルを容量2のバッファ付きチャネル<code>make(chan int, 2)</code>に変更して、同じgoroutine内での送信2回→受信2回が成功するように修正してください。`,
      code: `package main

import "fmt"

func main() {
	ch := make(chan int) // バッファなし
	ch <- 1              // 受信と同時でないと完了しない→ここで永遠に停止
	ch <- 2
	fmt.Println(<-ch, <-ch) // 受信の行には到達できない
}`,
      solution: `package main

import "fmt"

func main() {
	ch := make(chan int, 2) // 容量2のバッファ付き
	ch <- 1                 // バッファに入るので即座に完了
	ch <- 2
	fmt.Println(<-ch, <-ch) // バッファから順に取り出す
}`,
      hints: [
        `バッファなしチャネルの送信は「同時に受信してくれる相手」がいないと完了しません。あとの行に受信があっても、そこに到達する前に止まります。`,
        `make(chan int, 2)にすれば2個までバッファに溜められるので、送信2回が先に完了し、そのあと受信できます。`
      ],
      expectedOutput: "1 2"
    },
    {
      id: 239,
      title: "range over channelでclose忘れ",
      explanation: `<p>チャネルを<code>for v := range ch</code>で受信するループは、<strong>チャネルがcloseされるまで終わりません</strong>。送信側がcloseを忘れると、値をすべて受け取ったあとにデッドロックします。</p>
<h4>エラーメッセージの読み方</h4>
<pre><code>受信: 10
受信: 20
受信: 30
fatal error: all goroutines are asleep - deadlock!

goroutine 1 [chan receive]:
main.main()
	/path/to/main.go:12 +0xdc</code></pre>
<p>ここで注目すべきは2点です。まず、<strong>途中までは正常に動いている</strong>こと。3件の受信は成功しており、エラーは「その後」に起きています。次に、角括弧が<code>[chan receive]</code>（受信待ち）であること。ステップ231の<code>[chan send]</code>と見比べると、同じデッドロックでも<strong>待ちの向きが逆</strong>だと分かります。「受信側が待ち続けている→送信側が終わりを伝えていない→close忘れ」と推理できるわけです。</p>
<h4>なぜ起きるか</h4>
<p><code>range ch</code>は「closeされたら終了する」ループです。送信goroutineが3件送って何も言わずに帰ってしまうと、mainは4件目が来るのかもう来ないのか判断できず、永遠に待ちます。全goroutineが眠った時点でランタイムがデッドロックを検出します。</p>
<h4>修正パターン</h4>
<pre><code>go func() {
	for i := 1; i &lt;= 3; i++ {
		ch &lt;- i * 10
	}
	close(ch) // 送信側が「もう送りません」を伝える
}()</code></pre>
<p>ステップ232で学んだ「closeは送信側の責務」の実践形です。<strong>rangeで受信するチャネルは、送信側が送り終わりにcloseする</strong>。このペアを崩さないことが、チャネルを使うパイプライン処理の基本作法です。</p>`,
      task: `送信goroutineの中で、3件の送信が終わったあとに<code>close(ch)</code>を呼び、rangeループが正常に終了するように修正してください。`,
      code: `package main

import "fmt"

func main() {
	ch := make(chan int, 3)
	go func() {
		for i := 1; i <= 3; i++ {
			ch <- i * 10
		}
		// close(ch)を忘れている
	}()
	for v := range ch { // closeされないので4件目を永遠に待つ
		fmt.Println("受信:", v)
	}
	fmt.Println("すべて受信しました")
}`,
      solution: `package main

import "fmt"

func main() {
	ch := make(chan int, 3)
	go func() {
		for i := 1; i <= 3; i++ {
			ch <- i * 10
		}
		close(ch) // 送信側が送り終わりを伝える
	}()
	for v := range ch { // closeされるとループが正常に終了する
		fmt.Println("受信:", v)
	}
	fmt.Println("すべて受信しました")
}`,
      hints: [
        `range chのループは、チャネルがcloseされたときに終了します。closeがなければ次の値を永遠に待ち続けます。`,
        `送信goroutineの中、forループの直後にclose(ch)を追加します。closeするのは送信側、が原則です。`
      ],
      expectedOutput: "すべて受信しました"
    },
    {
      id: 240,
      title: "総合演習：安全な並列集計に直す",
      explanation: `<p>この章の総合演習です。4つの価格を並行に合計するプログラムに、この章で学んだバグが2つ仕込まれています。実行結果が不定になる様子を観察しながら、安全な形に直しましょう。</p>
<h4>仕込まれているバグ</h4>
<ol>
<li><strong>wg.Addを呼んでいない</strong>（ステップ234の変種）。カウンタが0のままなのでWaitは素通りします。さらに、Addせずに<code>Done</code>を呼ぶとカウンタが負になり、次のpanicが起きることがあります。
<pre><code>panic: sync: negative WaitGroup counter

goroutine 34 [running]:
sync.(*WaitGroup).Add(...)
sync.(*WaitGroup).Done(...)
main.main.func1()
	/path/to/main.go:16 +0x6c</code></pre>
スタックトレースにsyncパッケージ内部の関数が並びますが、読むべきは自分のコードが現れる行（<code>main.main.func1</code>＝mainの中の1つ目の無名関数）です。</li>
<li><strong>totalへの加算がレース</strong>（ステップ235）。複数goroutineが同時に<code>total += p</code>するため、Waitを直しても合計が1000にならないことがあります。</li>
</ol>
<h4>不定な結果の観察方法</h4>
<p>修正前に何度か実行してみてください。「合計金額: 0」「panic」など、<strong>実行のたびに違う結果</strong>が観察できるはずです。並行処理バグの典型的な症状です。</p>
<h4>安全な並列集計のチェックリスト</h4>
<table>
<tr><th>確認項目</th><th>対応</th></tr>
<tr><td>起動した数だけ待っているか</td><td>go文の前にwg.Add(1)、goroutineの先頭でdefer wg.Done()</td></tr>
<tr><td>共有変数を同時に触っていないか</td><td>sync.Mutexで囲む（またはチャネルで1か所に集める）</td></tr>
<tr><td>結果を読むのは全員の完了後か</td><td>wg.Wait()のあとでtotalを読む</td></tr>
</table>
<p>このチェックリストは実務の並行処理コードレビューでもそのまま使えます。修正後は<code>go run -race</code>でWARNINGが出ないことも確認しましょう。</p>`,
      task: `2つのバグを修正してください。（1）<code>go</code>文の直前に<code>wg.Add(1)</code>を追加し、<code>wg.Done()</code>は<code>defer</code>で呼ぶ。（2）<code>sync.Mutex</code>を追加して<code>total += p</code>をロックで囲む。修正後は必ず「合計金額: 1000」になります。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	prices := []int{100, 200, 300, 400}
	total := 0
	var wg sync.WaitGroup
	for _, p := range prices {
		go func() { // バグ1：wg.Addを呼んでいない
			defer wg.Done() // Addなしでカウンタを減らす→負になるとpanic
			total += p      // バグ2：レースコンディション
		}()
	}
	wg.Wait() // カウンタ0のまま素通りする
	fmt.Println("合計金額:", total) // 0やpanicなど実行のたびに結果が変わる
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	prices := []int{100, 200, 300, 400}
	total := 0
	var mu sync.Mutex // totalを守るロック
	var wg sync.WaitGroup
	for _, p := range prices {
		wg.Add(1) // 修正1：起動する側でAddする
		go func() {
			defer wg.Done()
			mu.Lock() // 修正2：加算をロックで囲む
			total += p
			mu.Unlock()
		}()
	}
	wg.Wait() // 4つ全員の完了を待つ
	fmt.Println("合計金額:", total)
}`,
      hints: [
        `まずWaitGroupを直します。Addは起動する側＝go文の直前です。Addなしでdefer wg.Done()が動くと負のカウンタでpanicすることもあります。`,
        `次にレースを直します。var mu sync.Mutexを宣言し、total += pをmu.Lock()とmu.Unlock()で囲みます。`,
        `修正後は何度実行しても1000になるはずです。go run -race main.goでWARNINGが出ないことも確認しましょう。`
      ],
      expectedOutput: "合計金額: 1000"
    }
  ]
});
