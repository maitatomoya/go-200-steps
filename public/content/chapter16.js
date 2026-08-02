// 第16章：並行処理パターン
registerChapter({
  number: 16,
  title: "並行処理パターン",
  description: "チャネルとゴルーチンを組み合わせた実務で頻出の並行処理パターンを学びます。ワーカープール、パイプライン、タイムアウト、キャンセルなど、Goらしい設計の型を身につけます。",
  steps: [
    {
      id: 151,
      title: "ワーカープール（jobs/resultsチャネル）",
      explanation: `<p>前章の総合演習で組んだ構成には<strong>ワーカープール</strong>という名前が付いています。あらかじめ決まった数のワーカー（処理担当のゴルーチン）を起動しておき、仕事をチャネル経由で配る設計パターンです。</p>
<p>「仕事が1000件あるから1000個のゴルーチンを起動する」のではなく、「ワーカーは3つだけ起動し、1000件の仕事をjobsチャネルに流す」のがポイントです。</p>
<table>
<tr><th>方式</th><th>ゴルーチン数</th><th>特徴</th></tr>
<tr><td>仕事ごとに起動</td><td>仕事の数だけ</td><td>実装は簡単だが、同時実行数を制御できない</td></tr>
<tr><td>ワーカープール</td><td>固定（例: 3）</td><td>同時実行数を一定に保てる。負荷の予測がしやすい</td></tr>
</table>
<p>構成要素はいつも同じ3点セットです。</p>
<ul>
<li><code>jobs &lt;-chan int</code>：仕事の配布路。ワーカーはrangeで受信し、closeされたら終了</li>
<li><code>results chan&lt;- int</code>：結果の回収路</li>
<li><code>sync.WaitGroup</code>：全ワーカーの終了検知（resultsを安全にcloseするため）</li>
</ul>
<pre><code>func worker(jobs &lt;-chan int, results chan&lt;- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for j := range jobs {
        results &lt;- j * 2 // 実務ではここがAPI呼び出しや画像処理などになる
    }
}</code></pre>
<p>複数のワーカーがjobsを同時にrangeしても、<strong>1つの仕事は必ず1つのワーカーだけ</strong>が受け取ります。チャネルが排他制御を内蔵しているからこそ成り立つパターンです。実務ではDBへの同時接続数を抑えたいバッチ処理や、外部APIの呼び出し制限を守りたい場面で頻出します。</p>`,
      task: `TODOの2箇所を埋めて、ワーカー3つのワーカープールを完成させてください。ワーカー起動のループと、jobsへの送信＋closeを書きます。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func worker(jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		results <- j * 2 // 仕事: 値を2倍にする
	}
}

func main() {
	jobs := make(chan int, 5)
	results := make(chan int, 5)
	var wg sync.WaitGroup

	// TODO: (1) ワーカーを3つ起動する（wg.Add(1)を忘れずに）

	// TODO: (2) jobsに1から5までを送信し、closeする

	wg.Wait()
	close(results)

	total := 0
	for r := range results {
		total += r
	}
	fmt.Println("結果の合計:", total)
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func worker(jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		results <- j * 2 // 仕事: 値を2倍にする
	}
}

func main() {
	jobs := make(chan int, 5)
	results := make(chan int, 5)
	var wg sync.WaitGroup

	// (1) ワーカーを3つ起動する
	for w := 1; w <= 3; w++ {
		wg.Add(1)
		go worker(jobs, results, &wg)
	}

	// (2) 仕事を配ってからclose（ワーカーのrangeを終わらせる）
	for j := 1; j <= 5; j++ {
		jobs <- j
	}
	close(jobs)

	wg.Wait()
	close(results)

	total := 0
	for r := range results {
		total += r
	}
	fmt.Println("結果の合計:", total)
}`,
      hints: [
        `ワーカー起動はforループで3回、「wg.Add(1)」してから「go worker(jobs, results, &wg)」です。`,
        `仕事の配布は「for j := 1; j <= 5; j++ { jobs <- j }」の後にclose(jobs)。closeを忘れるとワーカーが終了せずデッドロックになります。`
      ],
      expectedOutput: "結果の合計: 30"
    },
    {
      id: 152,
      title: "ファンアウト・ファンイン",
      explanation: `<p>並行処理の教科書に必ず登場する2つの用語を押さえましょう。</p>
<ul>
<li><strong>ファンアウト（fan-out）</strong>：1つのチャネルから<strong>複数のゴルーチン</strong>が受信して、処理を分散させること（扇が開くイメージ）</li>
<li><strong>ファンイン（fan-in）</strong>：複数のゴルーチンの出力を<strong>1つのチャネル</strong>に集約すること（扇が閉じるイメージ）</li>
</ul>
<p>ワーカープールは実はこの2つの組み合わせです。jobsからのファンアウトで処理を分散し、resultsへのファンインで結果を集めています。</p>
<p>このパターンで最も間違えやすいのが<strong>出力チャネルを閉じるタイミング</strong>です。送信者が複数いるので、誰か1人が閉じるわけにはいきません。定番の解決策は「closeだけを担当するゴルーチン」を用意することです。</p>
<pre><code>// ファンアウト: 3つのゴルーチンがinから受信する
var wg sync.WaitGroup
for i := 0; i &lt; 3; i++ {
    wg.Add(1)
    go square(in, out, &amp;wg)
}

// closeの番人: 全員の完了を待ってからoutを閉じる
go func() {
    wg.Wait()
    close(out)
}()</code></pre>
<p>この「<code>wg.Wait()</code>してからcloseするだけのゴルーチン」を挟むことで、mainは<code>for v := range out</code>と書くだけで済みます。mainで<code>wg.Wait()</code>すると、outを受信する人がいなくなってデッドロックする（ワーカーがout送信でブロックしたままDoneできない）ため、待機とcloseを別ゴルーチンに逃がすのがコツです。処理を分けて、集めて、閉じる。この3拍子はGoの並行処理の基本リズムです。</p>`,
      task: `TODOを埋めてください。<code>wg.Wait()</code>の後に<code>out</code>をcloseする「closeの番人」ゴルーチンを追加し、ファンインした結果をmainで合計できるようにします。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func square(in <-chan int, out chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for n := range in {
		out <- n * n
	}
}

func main() {
	in := make(chan int)
	out := make(chan int)

	// ファンアウト: 3つのゴルーチンがinを分担して処理する
	var wg sync.WaitGroup
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go square(in, out, &wg)
	}

	// 入力を流し込むゴルーチン
	go func() {
		for n := 1; n <= 9; n++ {
			in <- n
		}
		close(in)
	}()

	// TODO: 全ワーカーの終了を待ってからoutをcloseするゴルーチンを起動する

	// ファンイン: 1つのoutにまとまった結果を受信する
	sum := 0
	for v := range out {
		sum += v
	}
	fmt.Println("ファンインした合計:", sum)
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func square(in <-chan int, out chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for n := range in {
		out <- n * n
	}
}

func main() {
	in := make(chan int)
	out := make(chan int)

	// ファンアウト: 3つのゴルーチンがinを分担して処理する
	var wg sync.WaitGroup
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go square(in, out, &wg)
	}

	// 入力を流し込むゴルーチン
	go func() {
		for n := 1; n <= 9; n++ {
			in <- n
		}
		close(in)
	}()

	// closeの番人: 全ワーカーの完了を待ってからoutを閉じる
	go func() {
		wg.Wait()
		close(out)
	}()

	// ファンイン: 1つのoutにまとまった結果を受信する
	sum := 0
	for v := range out {
		sum += v
	}
	fmt.Println("ファンインした合計:", sum)
}`,
      hints: [
        `mainでwg.Wait()すると、outの受信者がいなくなりデッドロックします。待機とcloseは別ゴルーチンに任せましょう。`,
        `go func() { wg.Wait(); close(out) }() の形で「closeの番人」を起動します。mainはそのままrangeで受信を続けられます。`
      ],
      expectedOutput: "ファンインした合計: 285"
    },
    {
      id: 153,
      title: "パイプラインパターン",
      explanation: `<p><strong>パイプライン</strong>は、処理をいくつかの<strong>ステージ</strong>（段階）に分け、チャネルでつなぐパターンです。工場のベルトコンベアのように、各ステージが自分の加工だけを担当し、結果を次のステージへ流します。</p>
<pre><code>生成ステージ → [チャネル1] → 2倍ステージ → [チャネル2] → +10ステージ → [チャネル3] → main</code></pre>
<p>各ステージは「入力チャネルをrangeで受信し、加工して出力チャネルへ送信し、終わったら出力をcloseする」という同じ形をしています。</p>
<pre><code>func double(in &lt;-chan int, out chan&lt;- int) {
    for n := range in {
        out &lt;- n * 2
    }
    close(out) // 自分の出力は自分で閉じる
}</code></pre>
<p>closeが<strong>ドミノ倒しのように伝わる</strong>のがこのパターンの美しいところです。生成ステージがチャネル1を閉じると、2倍ステージのrangeが終わってチャネル2が閉じられ、+10ステージのrangeが終わってチャネル3が閉じられ、最後にmainのrangeが終わります。</p>
<p>パイプラインの利点を整理します。</p>
<ul>
<li><strong>各ステージが並行に動く</strong>：1件目が+10ステージにいる間に、2件目は2倍ステージを処理できる</li>
<li><strong>責務が分かれる</strong>：各ステージは小さな関数になり、テストしやすい</li>
<li><strong>順序が保たれる</strong>：各ステージが1ゴルーチンなら、投入順と出力順が一致する</li>
</ul>
<p>実務では「ファイルを読む→パースする→変換する→保存する」のようなデータ処理の流れをそのまま表現できます。前ステップのファンアウトと組み合わせて、重いステージだけワーカーを増やすこともできます。</p>`,
      task: `TODOの<code>addTen</code>ステージを実装してください。<code>double</code>と同じ形で、受信した値に10を足して送信し、最後に出力チャネルをcloseします。`,
      code: `package main

import "fmt"

// ステージ2: 値を2倍にする
func double(in <-chan int, out chan<- int) {
	for n := range in {
		out <- n * 2
	}
	close(out)
}

// ステージ3: 値に10を足す
func addTen(in <-chan int, out chan<- int) {
	// TODO: inから受信した値に10を足してoutへ送信し、終わったらoutをcloseする
}

func main() {
	stage1 := make(chan int)
	stage2 := make(chan int)
	stage3 := make(chan int)

	// ステージ1: 1〜3を生成する
	go func() {
		for n := 1; n <= 3; n++ {
			stage1 <- n
		}
		close(stage1)
	}()

	go double(stage1, stage2)
	go addTen(stage2, stage3)

	for v := range stage3 {
		fmt.Println(v)
	}
}`,
      solution: `package main

import "fmt"

// ステージ2: 値を2倍にする
func double(in <-chan int, out chan<- int) {
	for n := range in {
		out <- n * 2
	}
	close(out)
}

// ステージ3: 値に10を足す
func addTen(in <-chan int, out chan<- int) {
	for n := range in {
		out <- n + 10
	}
	close(out) // closeがドミノ倒しに伝わり、mainのrangeも終わる
}

func main() {
	stage1 := make(chan int)
	stage2 := make(chan int)
	stage3 := make(chan int)

	// ステージ1: 1〜3を生成する
	go func() {
		for n := 1; n <= 3; n++ {
			stage1 <- n
		}
		close(stage1)
	}()

	go double(stage1, stage2)
	go addTen(stage2, stage3)

	for v := range stage3 {
		fmt.Println(v)
	}
}`,
      hints: [
        `doubleと同じ構造です。rangeで受信し、加工して送信、ループを抜けたらclose(out)します。`,
        `for n := range in { out <- n + 10 } の後にclose(out)です。closeを忘れるとmainのrangeが終わらずデッドロックします。`
      ],
      expectedOutput: "16"
    },
    {
      id: 154,
      title: "doneチャネルでキャンセル",
      explanation: `<p>起動したゴルーチンを途中で止めたいことがあります。Goにはゴルーチンを外から強制終了する機能は<strong>ありません</strong>。代わりに「もう終わっていいよ」という合図を送り、ゴルーチン自身に終了してもらいます。その合図に使うのが<strong>doneチャネル</strong>です。</p>
<pre><code>done := make(chan struct{})</code></pre>
<p><code>struct{}</code>は<strong>空構造体</strong>（フィールドを1つも持たない構造体で、サイズ0）です。値を運ぶ必要がなく「合図」だけが目的なので、最も軽い型を使うのがGoの慣習です。</p>
<p>合図の送り方は<code>close(done)</code>です。closeされたチャネルからの受信は<strong>即座にゼロ値が返る</strong>という前章の性質を利用します。closeなら、doneを待っている<strong>全ゴルーチンに一斉に</strong>合図が届きます（値の送信だと1回につき1ゴルーチンしか受け取れません）。</p>
<p>受け取る側は、selectのdefaultやcaseで定期的にdoneを覗きます。</p>
<pre><code>for {
    select {
    case &lt;-done:
        return // 合図を受けたので後片付けして終了
    default:
        // 通常の仕事を続ける
    }
}</code></pre>
<p>このパターンの要点は「<strong>キャンセルは協調的</strong>」ということです。ゴルーチン側がdoneを確認するコードを書いていなければ、いくらcloseしても止まりません。逆に言えば、ループの区切りなど安全なタイミングでだけ終了するので、中途半端な状態で強制終了される事故が起きません。この考え方は後のステップで学ぶcontextパッケージにそのまま受け継がれています。</p>`,
      task: `TODOの2箇所を埋めてください。ワーカーのselectに<code>done</code>の受信ケースを追加し、mainで<code>close(done)</code>して停止の合図を送ります。`,
      code: `package main

import (
	"fmt"
	"time"
)

func main() {
	done := make(chan struct{})
	stopped := make(chan struct{})

	go func() {
		for {
			select {
			// TODO: (1) doneから受信したら "キャンセルを受信して停止します" と表示し、
			//       close(stopped)してからreturnする
			default:
				time.Sleep(2 * time.Millisecond) // 通常の仕事のつもり
			}
		}
	}()

	time.Sleep(20 * time.Millisecond)
	// TODO: (2) doneをcloseして停止の合図を送る

	<-stopped // ワーカーが止まるのを待つ
	fmt.Println("main: ワーカーの停止を確認しました")
}`,
      solution: `package main

import (
	"fmt"
	"time"
)

func main() {
	done := make(chan struct{})
	stopped := make(chan struct{})

	go func() {
		for {
			select {
			case <-done:
				// closeされたチャネルの受信は即座に返るので、合図として使える
				fmt.Println("キャンセルを受信して停止します")
				close(stopped)
				return
			default:
				time.Sleep(2 * time.Millisecond) // 通常の仕事のつもり
			}
		}
	}()

	time.Sleep(20 * time.Millisecond)
	close(done) // 停止の合図。doneを待つ全ゴルーチンに一斉に届く

	<-stopped // ワーカーが止まるのを待つ
	fmt.Println("main: ワーカーの停止を確認しました")
}`,
      hints: [
        `closeされたチャネルからの受信は即座に返ります。「case <-done:」と書けば、close(done)された瞬間にこのcaseが選ばれるようになります。`,
        `(1)は「case <-done:」の中でPrintln、close(stopped)、returnの3つを実行します。(2)はclose(done)の1行です。`
      ],
      expectedOutput: "main: ワーカーの停止を確認しました"
    },
    {
      id: 155,
      title: "time.Afterとタイムアウトのあるselect",
      explanation: `<p>外部サービスの応答待ちなど、「一定時間待っても結果が来なければ諦める」処理を<strong>タイムアウト</strong>と呼びます。Goではselectと<code>time.After</code>の組み合わせで簡潔に書けます。</p>
<p><code>time.After(d)</code>は「d時間後に現在時刻が1回だけ送られてくる<strong>受信専用チャネル</strong>（<code>&lt;-chan time.Time</code>）」を返す関数です。チャネルを返すというのが面白いところで、selectのcaseにそのまま並べられます。</p>
<pre><code>select {
case r := &lt;-result:
    fmt.Println("結果:", r) // 時間内に届いた
case &lt;-time.After(20 * time.Millisecond):
    fmt.Println("タイムアウト") // 20ms待っても届かなかった
}</code></pre>
<p>selectは「先に実行可能になったcase」を選ぶので、resultへの送信とtime.Afterの発火の<strong>早いほうが勝つ</strong>という競争になります。</p>
<table>
<tr><th>状況</th><th>選ばれるcase</th></tr>
<tr><td>処理がタイムアウトより速い</td><td>resultの受信（成功）</td></tr>
<tr><td>処理がタイムアウトより遅い</td><td>time.Afterの受信（タイムアウト）</td></tr>
</table>
<p>注意点を2つ挙げます。第一に、タイムアウトしても<strong>元の処理のゴルーチンは動き続けます</strong>。結果を受け取る人がいなくなるので、送信側はバッファ付きチャネル（容量1）にしておくと送信でブロックし続ける事故を防げます。第二に、forループ内で<code>time.After</code>を毎回呼ぶとタイマーが作り直され続けるため、繰り返し使う場面では<code>time.NewTimer</code>の利用が推奨されます。まずは単発のタイムアウトから確実に使えるようになりましょう。</p>`,
      task: `2つ目のselectにTODOがあります。<code>time.After</code>を使って20ミリ秒のタイムアウトケースを追加し、低速な処理が打ち切られることを確認してください。`,
      code: `package main

import (
	"fmt"
	"time"
)

func main() {
	fast := make(chan string, 1)
	slow := make(chan string, 1)

	go func() {
		time.Sleep(5 * time.Millisecond)
		fast <- "高速APIの応答"
	}()
	go func() {
		time.Sleep(50 * time.Millisecond)
		slow <- "低速APIの応答"
	}()

	// 高速な処理: 30msのタイムアウトに間に合う
	select {
	case r := <-fast:
		fmt.Println("成功:", r)
	case <-time.After(30 * time.Millisecond):
		fmt.Println("タイムアウト")
	}

	// 低速な処理: 20msのタイムアウトに間に合わない
	select {
	case r := <-slow:
		fmt.Println("成功:", r)
		// TODO: time.Afterを使って20msのタイムアウトケースを追加し、
		//       "タイムアウト: 20ms以内に応答なし" と表示する
	}
}`,
      solution: `package main

import (
	"fmt"
	"time"
)

func main() {
	fast := make(chan string, 1)
	slow := make(chan string, 1)

	go func() {
		time.Sleep(5 * time.Millisecond)
		fast <- "高速APIの応答"
	}()
	go func() {
		time.Sleep(50 * time.Millisecond)
		slow <- "低速APIの応答"
	}()

	// 高速な処理: 30msのタイムアウトに間に合う
	select {
	case r := <-fast:
		fmt.Println("成功:", r)
	case <-time.After(30 * time.Millisecond):
		fmt.Println("タイムアウト")
	}

	// 低速な処理: 20msのタイムアウトに間に合わない
	select {
	case r := <-slow:
		fmt.Println("成功:", r)
	case <-time.After(20 * time.Millisecond):
		fmt.Println("タイムアウト: 20ms以内に応答なし")
	}
}`,
      hints: [
        `time.After(d)はd時間後に値が届くチャネルを返すので、selectのcaseに直接書けます。`,
        `「case <-time.After(20 * time.Millisecond):」を追加します。届いた時刻の値は使わないので、変数に受け取る必要はありません。`
      ],
      expectedOutput: "タイムアウト: 20ms以内に応答なし"
    },
    {
      id: 156,
      title: "ジェネレータパターン（チャネルを返す関数）",
      explanation: `<p>これまでチャネルは呼び出し側が<code>make</code>して関数に渡していました。発想を逆にして、<strong>関数の中でチャネルを作って返す</strong>のが<strong>ジェネレータパターン</strong>です。値を次々と「生成」して流すことからこう呼ばれます。</p>
<pre><code>func countdown(from int) &lt;-chan int {
    ch := make(chan int)
    go func() {
        for i := from; i >= 1; i-- {
            ch &lt;- i
        }
        close(ch) // 送り終えたら自分で閉じる
    }()
    return ch // 起動直後にチャネルだけ先に返す
}</code></pre>
<p>この関数のポイントは3つあります。</p>
<ul>
<li><strong>戻り値が受信専用型<code>&lt;-chan int</code></strong>：利用者は受信しかできず、誤って送信やcloseをする事故を型レベルで防げる</li>
<li><strong>内部でゴルーチンを起動</strong>：関数はすぐにreturnし、値の生成は裏で進む</li>
<li><strong>closeまで面倒を見る</strong>：チャネルの生成・送信・closeが1つの関数に閉じ、利用者は受信に専念できる</li>
</ul>
<p>利用者側のコードは驚くほど簡潔になります。</p>
<pre><code>for v := range countdown(5) {
    fmt.Println(v) // 5 4 3 2 1
}</code></pre>
<p>チャネルの管理（作成・close）という間違えやすい仕事を生成側に隠蔽できるのが、このパターンの価値です。パイプラインの各ステージをジェネレータ形式で書けば、<code>addTen(double(generate(1, 2, 3)))</code>のように関数を入れ子にしてステージを直感的に連結することもできます。実務でもID採番器や、大量データを少しずつ供給する読み込み処理などで活躍します。</p>`,
      task: `関数<code>countdown</code>を完成させてください。チャネルを作り、ゴルーチン内で<code>from</code>から1までを送信してclose、チャネル自体は即座にreturnします。`,
      code: `package main

import "fmt"

// countdownはfromから1までの値を順に流すチャネルを返す
func countdown(from int) <-chan int {
	ch := make(chan int)
	// TODO: ゴルーチンを起動し、fromから1までを順にchへ送信して、最後にcloseする
	return ch
}

func main() {
	for v := range countdown(5) {
		fmt.Println(v)
	}
	fmt.Println("発射!")
}`,
      solution: `package main

import "fmt"

// countdownはfromから1までの値を順に流すチャネルを返す
func countdown(from int) <-chan int {
	ch := make(chan int)
	go func() {
		for i := from; i >= 1; i-- {
			ch <- i
		}
		close(ch) // 生成側がcloseまで責任を持つ
	}()
	return ch
}

func main() {
	for v := range countdown(5) {
		fmt.Println(v)
	}
	fmt.Println("発射!")
}`,
      hints: [
        `go func() { ... }() でゴルーチンを起動し、その中で送信ループとcloseを行います。returnはゴルーチンの外です。`,
        `ループはfor i := from; i >= 1; i-- { ch <- i }、ループの後にclose(ch)です。closeしないとmainのrangeが終わりません。`
      ],
      expectedOutput: "発射!"
    },
    {
      id: 157,
      title: "セマフォパターン（同時実行数の制限）",
      explanation: `<p>ワーカープールとは別の方法で同時実行数を制限するのが<strong>セマフォ</strong>（同時に使える席の数を管理する仕組み）です。Goでは<strong>バッファ付きチャネルそのもの</strong>をセマフォとして使えます。</p>
<pre><code>sem := make(chan struct{}, 2) // 席は2つ＝同時実行は最大2

// 各ゴルーチンの中で:
sem &lt;- struct{}{} // 席を取る（満席ならここでブロックして待つ）
// ... 制限したい処理 ...
&lt;-sem             // 席を返す（待っていた誰かが入れるようになる）</code></pre>
<p>仕組みは単純で、バッファ容量が「席数」に相当します。バッファに空きがあれば送信は即成功（入場できる）、満杯なら送信がブロック（満席なので待つ）します。<code>struct{}{}</code>は空構造体の値で、doneチャネルと同様「意味のある値は運ばない」ことを表します。</p>
<p>ワーカープールとの使い分けを整理します。</p>
<table>
<tr><th></th><th>ワーカープール</th><th>セマフォ</th></tr>
<tr><td>ゴルーチン数</td><td>固定数だけ起動</td><td>仕事の数だけ起動してよい</td></tr>
<tr><td>制限の仕方</td><td>ワーカー数で制限</td><td>同時に「席」を持てる数で制限</td></tr>
<tr><td>向いている場面</td><td>大量・定常的な仕事</td><td>既存の並行コードに制限を後付けしたいとき</td></tr>
</table>
<p>「ゴルーチンは気軽に起動しつつ、重い区間だけ同時2つまで」のような柔軟な制御ができるのがセマフォの持ち味です。確認用のコードでは、Mutexで守ったカウンタで「同時に席に着いた最大人数」を記録し、制限がきちんと効いていること（最大2）を検証します。</p>`,
      task: `TODOの2箇所を埋めてください。処理の前に<code>sem &lt;- struct{}{}</code>で席を取り、処理の後に<code>&lt;-sem</code>で席を返します。6個のゴルーチンが動いても同時実行数の最大が2になるはずです。`,
      code: `package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	sem := make(chan struct{}, 2) // 同時実行は最大2

	var mu sync.Mutex
	current := 0 // いま実行中の数
	max := 0     // 同時実行数の最大記録
	var wg sync.WaitGroup

	for i := 1; i <= 6; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			// TODO: (1) semに空構造体を送信して席を取る

			mu.Lock()
			current++
			if current > max {
				max = current
			}
			mu.Unlock()

			time.Sleep(10 * time.Millisecond) // 制限したい重い処理のつもり

			mu.Lock()
			current--
			mu.Unlock()

			// TODO: (2) semから受信して席を返す
		}()
	}

	wg.Wait()
	fmt.Println("同時実行数の最大:", max)
}`,
      solution: `package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	sem := make(chan struct{}, 2) // 同時実行は最大2

	var mu sync.Mutex
	current := 0 // いま実行中の数
	max := 0     // 同時実行数の最大記録
	var wg sync.WaitGroup

	for i := 1; i <= 6; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			sem <- struct{}{} // 席を取る（満席なら空くまでブロック）

			mu.Lock()
			current++
			if current > max {
				max = current
			}
			mu.Unlock()

			time.Sleep(10 * time.Millisecond) // 制限したい重い処理のつもり

			mu.Lock()
			current--
			mu.Unlock()

			<-sem // 席を返す（待っていたゴルーチンが進めるようになる）
		}()
	}

	wg.Wait()
	fmt.Println("同時実行数の最大:", max)
}`,
      hints: [
        `バッファ付きチャネルへの送信は、バッファに空きがあれば即成功、満杯ならブロックします。この性質が「席取り」になります。`,
        `(1)は「sem <- struct{}{}」、(2)は「<-sem」です。取ったら必ず返すこと。返し忘れると席が埋まったままになり、後続が永遠に待たされます。`
      ],
      expectedOutput: "同時実行数の最大: 2"
    },
    {
      id: 158,
      title: "sync.Mutexとチャネルの使い分け指針",
      explanation: `<p>ここまででMutex（第14章）とチャネルの両方を学びました。「どちらを使えばいいのか」は実務でも必ず悩むポイントなので、指針を整理しておきましょう。</p>
<table>
<tr><th>やりたいこと</th><th>向いている道具</th><th>理由</th></tr>
<tr><td>共有カウンタや共有マップなど<strong>状態を守る</strong></td><td>Mutex</td><td>短い区間の排他だけならロックが最も簡潔で速い</td></tr>
<tr><td>ゴルーチン間で<strong>データの受け渡し</strong></td><td>チャネル</td><td>所有権ごと値を渡せるので、渡した後の競合が起きない</td></tr>
<tr><td>完了通知・キャンセル・タイムアウト</td><td>チャネル（+select）</td><td>合図と待ち合わせはチャネルの得意分野</td></tr>
<tr><td>処理の流れの組み立て（パイプラインなど）</td><td>チャネル</td><td>ステージ間の接続を型で表現できる</td></tr>
</table>
<p>Goコミュニティの経験則はこうまとめられます。「<strong>データの所有権を渡すなら通信（チャネル）、状態を守るだけなら共有メモリ＋ロック（Mutex）</strong>」。どちらか一方が常に正しいわけではなく、適材適所です。</p>
<p>同じ「100回のカウント」を両方式で書き比べてみると違いが体感できます。</p>
<pre><code>// Mutex方式: 共有変数counterを全員で書き換える（守る対象は状態）
mu.Lock()
counter++
mu.Unlock()

// チャネル方式: 各自が結果を送信し、1箇所で集計する（渡す対象はデータ）
results &lt;- 1      // 各ゴルーチン
total += &lt;-results // 集計側
</code></pre>
<p>アンチパターンも覚えておきましょう。単純なカウンタをチャネルで実装すると、Mutexの数倍のコード量になりがちです。逆に、複雑な受け渡しの流れをMutexと共有変数で組むと、ロック忘れやデッドロックの温床になります。迷ったら「これは状態か、流れか」と自問するのが第一歩です。</p>`,
      task: `チャネル方式の集計部分にTODOがあります。100個のゴルーチンがそれぞれ<code>results</code>へ1を送信するので、mainで100回受信して<code>total</code>に合計してください。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	// 方法1: Mutexで共有カウンタを守る（状態を守る）
	var mu sync.Mutex
	counter := 0
	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			mu.Lock()
			counter++
			mu.Unlock()
		}()
	}
	wg.Wait()
	fmt.Println("Mutex方式:", counter)

	// 方法2: チャネルで結果を集約する（データを渡す）
	results := make(chan int, 100)
	for i := 0; i < 100; i++ {
		go func() {
			results <- 1
		}()
	}

	total := 0
	// TODO: resultsから100回受信してtotalに足し込む

	fmt.Println("チャネル方式:", total)
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	// 方法1: Mutexで共有カウンタを守る（状態を守る）
	var mu sync.Mutex
	counter := 0
	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			mu.Lock()
			counter++
			mu.Unlock()
		}()
	}
	wg.Wait()
	fmt.Println("Mutex方式:", counter)

	// 方法2: チャネルで結果を集約する（データを渡す）
	results := make(chan int, 100)
	for i := 0; i < 100; i++ {
		go func() {
			results <- 1
		}()
	}

	total := 0
	// 送信される件数が100と分かっているので、100回受信すればよい
	for i := 0; i < 100; i++ {
		total += <-results
	}

	fmt.Println("チャネル方式:", total)
}`,
      hints: [
        `送信される件数が100件と分かっているので、closeを待たずに「決まった回数だけ受信する」書き方ができます。`,
        `for i := 0; i < 100; i++ { total += <-results } のように、受信結果をそのまま足し込みます。`
      ],
      expectedOutput: "チャネル方式: 100"
    },
    {
      id: 159,
      title: "コンテキスト入門（context.Background、WithCancel）",
      explanation: `<p>doneチャネルによるキャンセルを標準化したのが<strong>contextパッケージ</strong>です。実務のGoコード、特にWebサーバーやAPIクライアントでは、ほぼすべての関数が第1引数に<code>ctx context.Context</code>を取ると言ってよいほど浸透しています。</p>
<p>基本の登場人物は3つです。</p>
<table>
<tr><th>API</th><th>役割</th></tr>
<tr><td><code>context.Background()</code></td><td>すべての起点となる空のコンテキスト。mainや初期化処理で使う</td></tr>
<tr><td><code>context.WithCancel(親)</code></td><td>キャンセル可能な子コンテキストと、cancel関数のペアを返す</td></tr>
<tr><td><code>ctx.Done()</code></td><td>キャンセルされたらcloseされる受信専用チャネルを返す</td></tr>
</table>
<pre><code>ctx, cancel := context.WithCancel(context.Background())
defer cancel() // 使い終わったら必ず呼ぶ（呼び忘れはリソースリーク）

go worker(ctx)

// 止めたくなったら
cancel()</code></pre>
<p>ワーカー側は、doneチャネルのときとまったく同じ形で書けます。<code>ctx.Done()</code>がdoneチャネルの役割を果たします。</p>
<pre><code>select {
case &lt;-ctx.Done():
    fmt.Println(ctx.Err()) // キャンセル理由が入る（context canceled）
    return
default:
    // 通常の仕事
}</code></pre>
<p>doneチャネルよりも優れている点は、<strong>キャンセルの連鎖</strong>です。コンテキストは親子関係を持ち、親をcancelすると子や孫のDone()も一斉にcloseされます。「リクエスト全体を打ち切ったら、その中で動くDB問い合わせも外部API呼び出しも全部止まる」という実務の要求を、この親子構造が自然に実現します。<code>ctx.Err()</code>はキャンセル後に<code>context.Canceled</code>（文字列表現はcontext canceled）を返し、理由の判別に使えます。ここでは入口として、WithCancelの基本形を確実に押さえましょう。</p>`,
      task: `TODOの2箇所を埋めてください。(1)<code>context.WithCancel(context.Background())</code>でctxとcancelを作り、(2)10ミリ秒後に<code>cancel()</code>を呼んでワーカーを停止させます。`,
      code: `package main

import (
	"context"
	"fmt"
	"time"
)

func worker(ctx context.Context, stopped chan<- string) {
	for {
		select {
		case <-ctx.Done():
			stopped <- "ctx.Done()を受信: " + ctx.Err().Error()
			return
		default:
			time.Sleep(2 * time.Millisecond) // 通常の仕事のつもり
		}
	}
}

func main() {
	// TODO: (1) context.Background()を親にして、WithCancelでctxとcancelを作る

	stopped := make(chan string)
	go worker(ctx, stopped)

	time.Sleep(10 * time.Millisecond)
	// TODO: (2) cancelを呼んでワーカーに停止を伝える

	fmt.Println(<-stopped)
	fmt.Println("main: 終了")
}`,
      solution: `package main

import (
	"context"
	"fmt"
	"time"
)

func worker(ctx context.Context, stopped chan<- string) {
	for {
		select {
		case <-ctx.Done():
			stopped <- "ctx.Done()を受信: " + ctx.Err().Error()
			return
		default:
			time.Sleep(2 * time.Millisecond) // 通常の仕事のつもり
		}
	}
}

func main() {
	// Backgroundを親に、キャンセル可能なコンテキストを作る
	ctx, cancel := context.WithCancel(context.Background())

	stopped := make(chan string)
	go worker(ctx, stopped)

	time.Sleep(10 * time.Millisecond)
	cancel() // ctx.Done()がcloseされ、ワーカーに停止が伝わる

	fmt.Println(<-stopped)
	fmt.Println("main: 終了")
}`,
      hints: [
        `WithCancelは「ctx, cancel := context.WithCancel(context.Background())」のように2つの戻り値を返します。`,
        `cancelはただの関数なので「cancel()」と呼ぶだけです。呼ぶとctx.Done()のチャネルがcloseされ、doneチャネルパターンと同じ仕組みで停止が伝わります。`
      ],
      expectedOutput: "ctx.Done()を受信: context canceled"
    },
    {
      id: 160,
      title: "総合演習：並列集計パイプライン",
      explanation: `<p>この章の総仕上げとして、学んだパターンを1つのプログラムに組み合わせます。1〜20の数を生成し、4つのワーカーで並列に二乗し、結果を集計する<strong>並列集計パイプライン</strong>です。</p>
<pre><code>generate(20) → [inチャネル] → 4ワーカーで二乗（ファンアウト） → [outチャネル]（ファンイン） → mainで集計</code></pre>
<p>使うパターンを確認しましょう。</p>
<ul>
<li><strong>ジェネレータ</strong>：<code>generate(n)</code>は1〜nを流す受信専用チャネルを返す（作成・送信・closeを内包）</li>
<li><strong>ファンアウト・ファンイン</strong>：<code>squareWorkers(in, workers)</code>は複数ワーカーでinを分担処理し、1本のoutへ集約して返す</li>
<li><strong>closeの番人</strong>：全ワーカーの完了を<code>wg.Wait()</code>で見届けてからoutをcloseするゴルーチン</li>
</ul>
<pre><code>func squareWorkers(in &lt;-chan int, workers int) &lt;-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    for i := 0; i &lt; workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for n := range in {
                out &lt;- n * n
            }
        }()
    }
    go func() {
        wg.Wait()
        close(out)
    }()
    return out
}</code></pre>
<p>注目してほしいのは、ステージを増やしてもmainのコードが<code>for v := range out</code>のまま変わらないことです。チャネルを返す関数でパターンを部品化すると、並行処理の複雑さが関数の中に閉じ込められ、呼び出し側は普通の逐次処理のように読めます。これがGoの並行処理設計の到達点の1つです。ワーカー数を1や8に変えても合計が変わらないこと（正しさが並列度に依存しないこと)も、ぜひ確かめてみてください。</p>`,
      task: `TODOの2箇所を埋めて完成させてください。(1)<code>generate</code>のゴルーチン内で1〜nを送信してclose、(2)<code>squareWorkers</code>に「closeの番人」ゴルーチンを追加します。`,
      code: `package main

import (
	"fmt"
	"sync"
)

// ジェネレータ: 1からnまでの数を流すチャネルを返す
func generate(n int) <-chan int {
	out := make(chan int)
	go func() {
		// TODO: (1) 1からnまでをoutへ送信し、終わったらcloseする
	}()
	return out
}

// ファンアウト・ファンイン: 複数ワーカーで二乗を計算し、1本のチャネルに集約する
func squareWorkers(in <-chan int, workers int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for n := range in {
				out <- n * n
			}
		}()
	}
	// TODO: (2) 全ワーカーの完了を待ってからoutをcloseするゴルーチンを起動する
	return out
}

func main() {
	in := generate(20)
	out := squareWorkers(in, 4)

	sum := 0
	count := 0
	for v := range out {
		sum += v
		count++
	}
	fmt.Println("処理件数:", count)
	fmt.Println("二乗の合計:", sum)
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

// ジェネレータ: 1からnまでの数を流すチャネルを返す
func generate(n int) <-chan int {
	out := make(chan int)
	go func() {
		for i := 1; i <= n; i++ {
			out <- i
		}
		close(out) // 生成側がcloseまで責任を持つ
	}()
	return out
}

// ファンアウト・ファンイン: 複数ワーカーで二乗を計算し、1本のチャネルに集約する
func squareWorkers(in <-chan int, workers int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for n := range in {
				out <- n * n
			}
		}()
	}
	// closeの番人: 全ワーカーの完了を待ってからoutを閉じる
	go func() {
		wg.Wait()
		close(out)
	}()
	return out
}

func main() {
	in := generate(20)
	out := squareWorkers(in, 4)

	sum := 0
	count := 0
	for v := range out {
		sum += v
		count++
	}
	fmt.Println("処理件数:", count)
	fmt.Println("二乗の合計:", sum)
}`,
      hints: [
        `(1)はジェネレータパターンそのものです。for i := 1; i <= n; i++ { out <- i } の後にclose(out)します。`,
        `(2)はファンアウト・ファンインで学んだ「closeの番人」です。go func() { wg.Wait(); close(out) }() を起動します。`,
        `どちらのcloseを忘れてもデッドロックになります。「送信者が閉じる」「複数送信者ならWaitGroupで待ってから閉じる」の2原則を思い出しましょう。`
      ],
      expectedOutput: "二乗の合計: 2870"
    }
  ]
});
