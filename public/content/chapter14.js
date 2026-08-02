// 第14章：ゴルーチン
registerChapter({
  number: 14,
  title: "ゴルーチン",
  description: "goキーワード1つで始まるGoの並行処理を学びます。WaitGroupでの待ち合わせ、レースコンディションの体験、Mutexによる保護までを扱います。",
  steps: [
    {
      id: 131,
      title: "go文でゴルーチンを起動する",
      explanation: `<p><strong>ゴルーチン（goroutine）</strong>は、Goランタイムが管理する軽量な実行の流れです。関数呼び出しの前に<code>go</code>を付けるだけで、その関数は<strong>別のゴルーチンとして並行に</strong>実行されます。</p>
<pre><code>go fmt.Println("ゴルーチンからこんにちは") // 別の流れで実行される
fmt.Println("mainの処理")                  // こちらはmainゴルーチンで実行</code></pre>
<p>プログラム起動時に動いているmain関数自身も「mainゴルーチン」という1つのゴルーチンです。ゴルーチンはOSのスレッドよりはるかに軽く（初期スタック約2KB）、数万個を同時に動かすことも珍しくありません。</p>
<p>ただし最初に必ずぶつかる問題があります。<strong>mainゴルーチンが終了すると、他のゴルーチンが実行中でもプログラム全体が即座に終了する</strong>のです。</p>
<pre><code>func main() {
    go fmt.Println("ゴルーチンからこんにちは")
    fmt.Println("mainの終了")
    // ここでmainが終わる → ゴルーチンの出力は間に合わないことが多い
}</code></pre>
<p><code>go文</code>は「起動の予約」をするだけですぐ次の行へ進みます。起動されたゴルーチンが実際に動き出す前にmainが終われば、出力は現れません。とりあえずの回避策として<code>time.Sleep</code>で待つ方法がありますが、これは<strong>「たまたま間に合うのを祈る」だけの不確実な方法</strong>です。次のステップで正しい待ち方（sync.WaitGroup）を学びます。</p>
<table>
<tr><th>用語</th><th>意味</th></tr>
<tr><td>ゴルーチン</td><td>Goランタイムが管理する軽量な実行単位</td></tr>
<tr><td>go文</td><td>関数呼び出しを新しいゴルーチンで開始する文</td></tr>
<tr><td>mainゴルーチン</td><td>main関数を実行しているゴルーチン。終わると全体が終わる</td></tr>
</table>`,
      task: `まずそのまま実行して、ゴルーチンの出力が表示されない（ことが多い）のを確認してください。次に<code>time</code>パッケージをimportし、「mainの終了」の前に<code>time.Sleep(50 * time.Millisecond)</code>を入れて、出力されるようになることを確認しましょう。`,
      code: `package main

import "fmt"

func main() {
	// goを付けると別のゴルーチンで実行される
	go fmt.Println("ゴルーチンからこんにちは")

	// mainはゴルーチンを待たずに次へ進み、そのまま終了する
	fmt.Println("mainの終了")
}`,
      solution: `package main

import (
	"fmt"
	"time"
)

func main() {
	// goを付けると別のゴルーチンで実行される
	go fmt.Println("ゴルーチンからこんにちは")

	// 少し待つとゴルーチンの実行が間に合う（あくまで応急処置）
	time.Sleep(50 * time.Millisecond)

	fmt.Println("mainの終了")
}`,
      hints: [
        `mainゴルーチンが終了すると、他のゴルーチンは実行途中でも打ち切られます。`,
        `import文を ( ) でまとめてtimeを追加し、fmt.Println("mainの終了")の前にtime.Sleep(50 * time.Millisecond)を入れます。`
      ],
      expectedOutput: "mainの終了"
    },
    {
      id: 132,
      title: "sync.WaitGroupで待つ",
      explanation: `<p>前ステップの<code>time.Sleep</code>は「どれくらい待てば終わるか」を推測しているだけで、待ちすぎれば無駄、足りなければ取りこぼします。正しい待ち合わせには<strong><code>sync.WaitGroup</code></strong>を使います。</p>
<p>WaitGroupは「終わっていない仕事の数」を数えるカウンタです。3つのメソッドで操作します。</p>
<table>
<tr><th>メソッド</th><th>役割</th></tr>
<tr><td><code>Add(n)</code></td><td>カウンタをn増やす（仕事をn個登録する）</td></tr>
<tr><td><code>Done()</code></td><td>カウンタを1減らす（仕事が1個終わった）</td></tr>
<tr><td><code>Wait()</code></td><td>カウンタが0になるまでブロック（待機）する</td></tr>
</table>
<pre><code>var wg sync.WaitGroup

wg.Add(1) // 仕事を1個登録
go func() {
    defer wg.Done() // 終わったら必ず報告
    fmt.Println("ゴルーチンの仕事")
}()

wg.Wait() // カウンタが0になるまで待つ
fmt.Println("すべて完了")</code></pre>
<p>ポイントは2つあります。</p>
<ul>
<li><strong><code>defer wg.Done()</code>をゴルーチンの先頭に書く</strong>：途中でreturnしてもパニックが起きても、確実にカウンタが減ります（deferの「必ず実行される」性質の実践的な使い方です）</li>
<li><strong>WaitGroupはコピーしてはいけない</strong>：関数に渡すときはポインタ（<code>&amp;wg</code>）を渡します。コピーするとカウンタが別物になり待ち合わせが壊れます</li>
</ul>
<p>Sleepと違い、WaitGroupは「終わった瞬間」に待機が解除されるので、無駄がなく確実です。</p>`,
      task: `<code>time.Sleep</code>による待機を<code>sync.WaitGroup</code>に置き換えてください。<code>Add(1)</code>で登録し、ゴルーチン内で<code>defer wg.Done()</code>、mainで<code>wg.Wait()</code>を呼びます。importの修正も忘れずに。`,
      code: `package main

import (
	"fmt"
	"time"
)

func main() {
	// TODO: sync.WaitGroupを宣言し、Sleepを使わない待ち合わせに書き換える
	go func() {
		fmt.Println("ゴルーチンの仕事")
	}()

	// この「祈るような待ち方」をやめたい
	time.Sleep(50 * time.Millisecond)

	fmt.Println("すべて完了")
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup

	// 仕事を1個登録してからゴルーチンを起動する
	wg.Add(1)
	go func() {
		// 先頭にdeferで書けば、確実にカウンタが減る
		defer wg.Done()
		fmt.Println("ゴルーチンの仕事")
	}()

	// カウンタが0になる（=仕事が全部終わる）まで待つ
	wg.Wait()
	fmt.Println("すべて完了")
}`,
      hints: [
        `var wg sync.WaitGroupで宣言し、importをtimeからsyncに入れ替えます。`,
        `go文の前にwg.Add(1)、ゴルーチンの先頭にdefer wg.Done()、Sleepの代わりにwg.Wait()を書きます。`
      ],
      expectedOutput: "すべて完了"
    },
    {
      id: 133,
      title: "Add/Done/Waitの正しい位置（間違いを直す）",
      explanation: `<p>WaitGroupは強力ですが、<strong>各メソッドを呼ぶ「位置」を間違えると正しく動きません</strong>。特に多いのが、<code>Add</code>をゴルーチンの中で呼んでしまう間違いです。</p>
<pre><code>// 間違い例
for i := 0; i &lt; 3; i++ {
    go func(n int) {
        wg.Add(1) // ×ゴルーチンの中でAddしている
        defer wg.Done()
        fmt.Println("worker", n)
    }(i)
}
wg.Wait() // カウンタがまだ0のまま通過してしまうかも！</code></pre>
<p>なぜ駄目なのでしょうか。go文は起動を予約するだけで、<strong>ゴルーチンがいつ動き出すかは分かりません</strong>。3つのゴルーチンがどれも<code>Add</code>を実行する前に、mainが<code>Wait()</code>に到達すると、カウンタは0なので「全部終わった」と誤判定して素通りしてしまいます。</p>
<p>正しい位置のルールをまとめます。</p>
<table>
<tr><th>メソッド</th><th>正しい位置</th><th>理由</th></tr>
<tr><td><code>Add</code></td><td><strong>go文より前</strong>（起動する側）</td><td>Waitより先に必ずカウントされることを保証する</td></tr>
<tr><td><code>Done</code></td><td>ゴルーチンの先頭で<code>defer</code></td><td>どんな終わり方でも必ず減らす</td></tr>
<tr><td><code>Wait</code></td><td>全ゴルーチンを起動し終えたあと</td><td>起動漏れを防ぐ</td></tr>
</table>
<p>ループでN個起動する場合は、ループ内で毎回<code>wg.Add(1)</code>する書き方と、ループ前に<code>wg.Add(3)</code>とまとめる書き方のどちらでも構いません。大事なのは<strong>「Addは必ずgo文より前」</strong>という一点です。</p>`,
      task: `このコードは<code>wg.Add(1)</code>の位置が間違っているため、workerの出力がそろわないことがあります。<code>Add</code>を正しい位置（go文の前）に移動して修正してください。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup

	for i := 0; i < 3; i++ {
		go func(n int) {
			// 間違い：Addがゴルーチンの中にあると、
			// Waitがカウント前に素通りすることがある
			wg.Add(1)
			defer wg.Done()
			fmt.Println("worker", n, "完了")
		}(i)
	}

	wg.Wait()
	fmt.Println("全員終了")
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup

	for i := 0; i < 3; i++ {
		// 正解：Addはgo文より前（起動する側）で呼ぶ。
		// これでWaitより先にカウントされることが保証される
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			fmt.Println("worker", n, "完了")
		}(i)
	}

	wg.Wait()
	fmt.Println("全員終了")
}`,
      hints: [
        `go文は「予約」だけしてすぐ次へ進みます。ゴルーチン内のAddが実行される前にWaitへ到達したら何が起きるか考えてみましょう。`,
        `wg.Add(1)の行をgo func(n int) {の直前（ループ内・go文の外）へ移動します。`
      ],
      expectedOutput: "全員終了"
    },
    {
      id: 134,
      title: "複数ゴルーチンの並行実行と順序の非決定性",
      explanation: `<p>複数のゴルーチンを起動すると、それらは<strong>並行（concurrent）</strong>に実行されます。ここで体感しておくべき重要な性質が<strong>「実行順序は保証されない」</strong>ことです。</p>
<pre><code>for i := 1; i &lt;= 5; i++ {
    wg.Add(1)
    go func(n int) {
        defer wg.Done()
        fmt.Println("ゴルーチン", n)
    }(i)
}
wg.Wait()</code></pre>
<p>このコードを何度か実行すると、「ゴルーチン 3」が先に出たり「ゴルーチン 1」が最後だったり、<strong>実行のたびに順序が変わる</strong>ことがあります。起動した順に実行される保証はどこにもありません。</p>
<p>順序が変わる理由は、Goランタイムの<strong>スケジューラ</strong>が、複数のCPUコア上でゴルーチンをいつどこで動かすかを自動的に決めているためです。どのゴルーチンが先にCPUを得るかは、その時々のOSやCPUの状況に左右されます。</p>
<table>
<tr><th>保証されること</th><th>保証されないこと</th></tr>
<tr><td>Wait()の後には全ゴルーチンの処理が完了している</td><td>ゴルーチン同士の実行順序・出力順序</td></tr>
<tr><td>1つのゴルーチン内でのコードの実行順序</td><td>起動した順に動き出すこと</td></tr>
</table>
<p>この非決定性は並行処理の本質であり、<strong>「順序に依存しないコードを書く」か「順序が必要なら明示的に同期する」</strong>のが並行プログラミングの基本姿勢です。テストで出力順を検証できないのもこのためで、本教材でもこのステップの判定はWait後の決定的な行だけを使っています。</p>`,
      task: `そのまま実行し、5つのゴルーチンの出力順序を観察してください。<strong>何度か実行して</strong>、順序が実行のたびに変わりうることを確認しましょう。余裕があれば起動数を10に増やしてみてください。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			// この出力の順序は実行のたびに変わりうる
			fmt.Println("ゴルーチン", n)
		}(i)
	}

	wg.Wait()
	fmt.Println("5個のゴルーチンがすべて完了")
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			// この出力の順序は実行のたびに変わりうる
			fmt.Println("ゴルーチン", n)
		}(i)
	}

	// Waitの後は「全員終わった」ことだけが保証される
	wg.Wait()
	fmt.Println("5個のゴルーチンがすべて完了")
}`,
      hints: [
        `このステップは観察が目的です。実行ボタンを何度か押して、出力順序の変化を見てみましょう。`,
        `1〜5が順番どおりに出ることもありますが、それは偶然です。保証されているのはWait()の後に全員が完了していることだけです。`
      ],
      expectedOutput: "5個のゴルーチンがすべて完了"
    },
    {
      id: 135,
      title: "ゴルーチンとクロージャ（引数渡しの重要性）",
      explanation: `<p>第13章で学んだとおり、クロージャは外側の変数を<strong>参照としてキャプチャ</strong>します。この性質がゴルーチンと組み合わさると、思わぬ落とし穴になります。</p>
<pre><code>current := "初期値"
go func() {
    fmt.Println(current) // いつ実行される？そのときcurrentは何？
}()
current = "変更後"</code></pre>
<p>ゴルーチンが「いつ動くか分からない」ため、キャプチャした<code>current</code>を読む時点で値が書き換わっている可能性があります。しかも、mainが書き込むのと同時にゴルーチンが読むと、次のステップで学ぶ<strong>データレース</strong>（同じ変数への同時アクセスによる未定義動作）にもなります。</p>
<p>解決策はシンプルで、<strong>ゴルーチンに渡したい値は引数として渡す</strong>ことです。</p>
<pre><code>go func(v string) {
    fmt.Println(v) // vはgo文の時点の値のコピー。もう安全
}(current) // ←この瞬間にcurrentの値がコピーされる</code></pre>
<p>引数<code>v</code>には<strong>go文を実行した瞬間の値がコピー</strong>されるため、あとでcurrentが変わっても影響を受けません。</p>
<table>
<tr><th>渡し方</th><th>ゴルーチンが見る値</th><th>安全性</th></tr>
<tr><td>クロージャでキャプチャ</td><td>実行時点の最新の値（不定）</td><td>共有変数への同時アクセスの危険</td></tr>
<tr><td><strong>引数で渡す</strong></td><td>go文の時点の値（確定）</td><td>コピーなので安全</td></tr>
</table>
<p>Go 1.22でループ変数の問題（ステップ126）は解消されましたが、<strong>「ループ変数以外の共有変数」のキャプチャは今も同じ危険がある</strong>ため、この引数渡しのイディオムは引き続き重要です。</p>`,
      task: `ゴルーチンがクロージャで<code>current</code>をキャプチャしているのを、<strong>引数として値を渡す</strong>形に直してください。修正後は「ゴルーチンが見た値: 初期値」と必ず出力されるようになります。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	current := "初期値"

	wg.Add(1)
	// TODO: currentをクロージャで参照するのではなく、引数で渡すように直す
	go func() {
		defer wg.Done()
		fmt.Println("ゴルーチンが見た値:", current)
	}()

	// ゴルーチンが動き出す前に書き換わってしまうかもしれない
	current = "変更後"

	wg.Wait()
	fmt.Println("mainの値:", current)
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	current := "初期値"

	wg.Add(1)
	// 引数vにはgo文を実行した瞬間のcurrentの値がコピーされる
	go func(v string) {
		defer wg.Done()
		fmt.Println("ゴルーチンが見た値:", v)
	}(current)

	// コピー済みなので、この書き換えはゴルーチンに影響しない
	current = "変更後"

	wg.Wait()
	fmt.Println("mainの値:", current)
}`,
      hints: [
        `無名関数に引数を追加します：go func(v string) { ... }(current) の形です。`,
        `関数本体ではcurrentの代わりに引数vを使います。go文の( )に渡した瞬間の値がコピーされるのがポイントです。`
      ],
      expectedOutput: "ゴルーチンが見た値: 初期値"
    },
    {
      id: 136,
      title: "レースコンディションを体験する",
      explanation: `<p>複数のゴルーチンが<strong>同じ変数に同時に読み書き</strong>すると何が起きるでしょうか。1000個のゴルーチンがそれぞれ<code>counter++</code>を1回ずつ実行する実験をしてみます。</p>
<pre><code>counter := 0
for i := 0; i &lt; 1000; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        counter++ // 1000個のゴルーチンが同じ変数を書き換える
    }()
}
wg.Wait()
fmt.Println(counter) // 1000にならないことがある！</code></pre>
<p>結果は1000になるはずが、987や995のような<strong>中途半端な数になることがあります</strong>。これが<strong>レースコンディション（race condition：競合状態）</strong>です。</p>
<p>原因は、<code>counter++</code>が見た目は1行でも、機械レベルでは3段階の操作だからです。</p>
<ol>
<li>counterの現在値を読む（例：42）</li>
<li>1を足す（43）</li>
<li>counterに書き戻す（43）</li>
</ol>
<p>2つのゴルーチンAとBがほぼ同時に動くと、両方が「42を読み」、両方が「43を書き戻す」ことがあります。2回インクリメントしたのに1しか増えていません。これを<strong>更新の消失（lost update）</strong>と呼びます。</p>
<p>さらに重要な注意があります。データレースはGoの仕様上<strong>未定義動作</strong>であり、「たまに数が狂う」だけでは済まない壊れ方をする可能性もあります。Goには検出ツールが用意されており、手元の環境では<code>go run -race main.go</code>と実行すると「WARNING: DATA RACE」と報告してくれます。修正方法（Mutex）は次のステップで学びます。</p>`,
      task: `そのまま実行して、結果が1000にならないことがあるのを確認してください。<strong>必ず複数回実行しましょう</strong>（環境によっては1000になることもありますが、それは偶然です）。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	counter := 0
	var wg sync.WaitGroup

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			// 1000個のゴルーチンが同じ変数を同時に書き換える（危険！）
			counter++
		}()
	}

	wg.Wait()
	fmt.Println("期待値: 1000 実際:", counter)
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	counter := 0
	var wg sync.WaitGroup

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			// counter++は「読む→足す→書き戻す」の3段階なので、
			// 同時に実行されると更新が消失することがある
			counter++
		}()
	}

	wg.Wait()
	fmt.Println("期待値: 1000 実際:", counter)
}`,
      hints: [
        `このステップは「壊れ方」を体験するのが目的です。何度も実行して結果のばらつきを観察しましょう。`,
        `counter++は原子的（それ以上分割できない一撃の操作）ではありません。読み取りと書き戻しの間に他のゴルーチンが割り込めます。`
      ],
      expectedOutput: "期待値: 1000 実際:"
    },
    {
      id: 137,
      title: "sync.Mutexで守る",
      explanation: `<p>前ステップのレースコンディションを防ぐ最も基本的な道具が<strong><code>sync.Mutex</code>（ミューテックス：相互排他ロック）</strong>です。「この区間は一度に1つのゴルーチンしか入れない」を実現します。</p>
<table>
<tr><th>メソッド</th><th>役割</th></tr>
<tr><td><code>Lock()</code></td><td>ロックを取得する。他の誰かが取得中なら、解放されるまで待つ</td></tr>
<tr><td><code>Unlock()</code></td><td>ロックを解放する。待っていた誰か1人が次に進める</td></tr>
</table>
<pre><code>var mu sync.Mutex
counter := 0

go func() {
    mu.Lock()   // ここから……
    counter++   // 一度に1つのゴルーチンしか実行できない
    mu.Unlock() // ……ここまでが保護区間（クリティカルセクション）
}()</code></pre>
<p>LockからUnlockまでの区間を<strong>クリティカルセクション</strong>と呼びます。counter++の3段階（読む→足す→書き戻す）が丸ごと保護されるため、割り込みによる更新の消失が起きなくなり、結果は必ず1000になります。</p>
<p>使ううえでの重要なルールをまとめます。</p>
<ul>
<li><strong>Unlockを忘れない</strong>：忘れると他の全ゴルーチンが永遠に待ち続けます（デッドロック）。処理が複雑な場合は<code>defer mu.Unlock()</code>が安全です</li>
<li><strong>保護区間は最小限に</strong>：ロック中は他のゴルーチンが待たされるため、必要な操作だけを囲みます</li>
<li><strong>同じ変数は常に同じMutexで守る</strong>：守ったり守らなかったりでは意味がありません</li>
<li><strong>MutexもWaitGroup同様コピー禁止</strong>：構造体に入れて使う場合はポインタレシーバーで扱います（ステップ140で実践します）</li>
</ul>
<p>「共有データへのアクセスは必ずロックで囲む」——これが並行処理の安全の第一原則です。</p>`,
      task: `<code>sync.Mutex</code>を宣言し、<code>counter++</code>を<code>Lock()</code>と<code>Unlock()</code>で挟んでください。修正後は何度実行しても結果が1000になることを確認しましょう。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	counter := 0
	var wg sync.WaitGroup
	// TODO: sync.Mutexを宣言する

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			// TODO: counter++をLock()とUnlock()で挟んで保護する
			counter++
		}()
	}

	wg.Wait()
	fmt.Println("1000回の加算結果:", counter)
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	counter := 0
	var wg sync.WaitGroup
	var mu sync.Mutex

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			// Lock〜Unlockの間は一度に1つのゴルーチンしか入れない
			mu.Lock()
			counter++
			mu.Unlock()
		}()
	}

	wg.Wait()
	fmt.Println("1000回の加算結果:", counter)
}`,
      hints: [
        `var mu sync.Mutexで宣言します。WaitGroupと同じく宣言だけで使えます（ゼロ値が有効）。`,
        `counter++の前にmu.Lock()、後にmu.Unlock()を書きます。これで読む→足す→書き戻すの3段階が丸ごと保護されます。`
      ],
      expectedOutput: "1000回の加算結果: 1000"
    },
    {
      id: 138,
      title: "sync.RWMutex（読み書きロックの概要）",
      explanation: `<p><code>sync.Mutex</code>は読み取りと書き込みを区別せず、常に1つのゴルーチンしか通しません。しかし<strong>「読むだけ」なら何人同時に読んでも壊れない</strong>はずです。読み取りが圧倒的に多い場面でMutexを使うと、安全なはずの読み取り同士まで待たされて非効率です。</p>
<p>そこで使うのが<strong><code>sync.RWMutex</code>（読み書きロック）</strong>です。ロックが2種類に分かれています。</p>
<table>
<tr><th>種類</th><th>メソッド</th><th>同時に入れる数</th><th>用途</th></tr>
<tr><td>読み取りロック</td><td><code>RLock()</code> / <code>RUnlock()</code></td><td><strong>複数OK</strong></td><td>データを読むだけの処理</td></tr>
<tr><td>書き込みロック</td><td><code>Lock()</code> / <code>Unlock()</code></td><td>1つだけ（読み取りも排除）</td><td>データを変更する処理</td></tr>
</table>
<pre><code>var mu sync.RWMutex
config := map[string]string{"mode": "dev"}

// 読むだけ → RLock（他の読み取りと同時に実行できる）
mu.RLock()
v := config["mode"]
mu.RUnlock()

// 書き換える → Lock（自分ひとりになるまで待つ）
mu.Lock()
config["mode"] = "prod"
mu.Unlock()</code></pre>
<p>ルールは「<strong>読み取り同士は同時OK、書き込みは常に独占</strong>」です。書き込みロック中は読み取りも全員待たされるため、データが中途半端な状態で読まれる心配はありません。</p>
<p>典型的な用途は、設定情報やキャッシュのような<strong>「めったに更新されないが頻繁に読まれる」共有データ</strong>です。逆に書き込みが多い場面ではRWMutexの管理コストがかさみ、普通のMutexの方が速いこともあります。まずはMutexで正しく動かし、読み取りが多くて性能が問題になったらRWMutexを検討する、という順番がおすすめです。</p>`,
      task: `読み取りゴルーチンの<code>Lock()</code>/<code>Unlock()</code>を<code>RLock()</code>/<code>RUnlock()</code>に書き換えて、読み取り同士が同時に実行できるようにしてください。書き込みゴルーチンは<code>Lock()</code>のままにします。`,
      code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var mu sync.RWMutex
	config := map[string]string{"mode": "dev"}
	var wg sync.WaitGroup

	// 読み取りゴルーチン3個：読むだけなのに独占ロックを使っている
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			// TODO: 読むだけなのでRLock/RUnlockに変える
			mu.Lock()
			_ = config["mode"]
			mu.Unlock()
		}()
	}

	// 書き込みゴルーチン1個：こちらはLockのままでよい
	wg.Add(1)
	go func() {
		defer wg.Done()
		mu.Lock()
		config["mode"] = "prod"
		mu.Unlock()
	}()

	wg.Wait()
	fmt.Println("最終的なmode:", config["mode"])
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var mu sync.RWMutex
	config := map[string]string{"mode": "dev"}
	var wg sync.WaitGroup

	// 読み取りゴルーチン3個：RLockなら3個同時に読める
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			mu.RLock()
			_ = config["mode"]
			mu.RUnlock()
		}()
	}

	// 書き込みゴルーチン1個：書き込みは独占ロック
	wg.Add(1)
	go func() {
		defer wg.Done()
		mu.Lock()
		config["mode"] = "prod"
		mu.Unlock()
	}()

	wg.Wait()
	fmt.Println("最終的なmode:", config["mode"])
}`,
      hints: [
        `読み取り専用の区間はRLock()とRUnlock()、書き込みを含む区間はLock()とUnlock()を使い分けます。`,
        `変更するのは読み取りゴルーチンの中の2か所だけです。書き込み側をRLockにしてしまうと、読み取り中に書き込めてしまい保護になりません。`
      ],
      expectedOutput: "最終的なmode: prod"
    },
    {
      id: 139,
      title: "sync.Onceとatomic（概要）",
      explanation: `<p>syncパッケージには、特定の場面でMutexより適した道具があと2つあります。概要を押さえておきましょう。</p>
<h4>sync.Once：1回だけ実行する</h4>
<p><code>once.Do(f)</code>は、<strong>何個のゴルーチンから何回呼ばれても、fを最初の1回しか実行しません</strong>。さらに「実行が完了するまで他の呼び出しは待つ」ことも保証されます。</p>
<pre><code>var once sync.Once
// 5個のゴルーチンが同時に呼んでも、初期化は1回だけ
once.Do(func() { fmt.Println("初期化は1回だけ") })</code></pre>
<p>設定ファイルの読み込みや接続の初期化など、「最初に使う人が1回だけ準備する」処理の定番です。if文とフラグ変数で自作すると、まさに前ステップまでのレースコンディションが起きます。Onceはそれを安全に肩代わりしてくれます。</p>
<h4>sync/atomic：不可分な数値操作</h4>
<p><code>counter++</code>が3段階に分かれることが問題なら、<strong>「読み・足し・書き」を分割不可能な1操作（アトミック操作）として実行</strong>すればロックは不要です。それを提供するのが<code>sync/atomic</code>パッケージです。</p>
<pre><code>var count int64
atomic.AddInt64(&amp;count, 1)          // ロックなしで安全に+1
v := atomic.LoadInt64(&amp;count)       // 安全に読み取る</code></pre>
<p>操作対象をポインタ（<code>&amp;count</code>）で渡す点に注意してください。CPUの専用命令を使うためMutexより高速ですが、<strong>使えるのは単純な数値の加算・読み書き・交換などに限られます</strong>。</p>
<table>
<tr><th>道具</th><th>向いている場面</th></tr>
<tr><td>Mutex</td><td>複数の操作や複雑なデータをまとめて守る</td></tr>
<tr><td>atomic</td><td>単一の数値カウンタなど、ごく単純な操作だけ</td></tr>
<tr><td>Once</td><td>1回だけ実行したい初期化</td></tr>
</table>`,
      task: `そのまま実行して、(1)「初期化は1回だけ」が5個のゴルーチンから呼ばれても<strong>1回しか出力されない</strong>こと、(2)atomicによるカウントが必ず5になることを確認してください。`,
      code: `package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var once sync.Once
	var wg sync.WaitGroup
	var count int64

	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			// 5個のゴルーチンが呼ぶが、実行されるのは最初の1回だけ
			once.Do(func() {
				fmt.Println("初期化は1回だけ")
			})

			// アトミック操作：ロックなしで安全に+1できる
			atomic.AddInt64(&count, 1)
		}()
	}

	wg.Wait()
	fmt.Println("実行回数:", atomic.LoadInt64(&count))
}`,
      solution: `package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var once sync.Once
	var wg sync.WaitGroup
	var count int64

	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			// 5個のゴルーチンが呼ぶが、実行されるのは最初の1回だけ
			once.Do(func() {
				fmt.Println("初期化は1回だけ")
			})

			// アトミック操作：ロックなしで安全に+1できる
			atomic.AddInt64(&count, 1)
		}()
	}

	wg.Wait()
	fmt.Println("実行回数:", atomic.LoadInt64(&count))
}`,
      hints: [
        `まず実行して観察しましょう。once.Doに渡した関数は、何回呼ばれても最初の1回しか実行されません。`,
        `atomic.AddInt64は&countのようにポインタを渡します。counter++と違い、読み・足し・書きが分割不可能な1操作になるためレースが起きません。`
      ],
      expectedOutput: "実行回数: 5"
    },
    {
      id: 140,
      title: "総合演習：並列カウンタ",
      explanation: `<p>この章の総仕上げとして、<strong>複数のゴルーチンから安全に使えるカウンタ型</strong>を作ります。実務でも頻出の「Mutexを構造体に埋め込む」パターンです。</p>
<pre><code>type SafeCounter struct {
    mu    sync.Mutex // 守る対象のすぐそばに置くのが慣習
    total int
}

func (c *SafeCounter) Add(n int) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.total += n
}</code></pre>
<p>この設計のポイントを整理します。</p>
<ul>
<li><strong>Mutexと守るデータを同じ構造体にまとめる</strong>：「totalに触るときはmuを取る」という約束が構造として表現され、ロック忘れを防ぎやすくなります</li>
<li><strong>必ずポインタレシーバー（*SafeCounter）にする</strong>：値レシーバーだと構造体ごとMutexがコピーされ、ロックが機能しなくなります（go vetが警告してくれます）</li>
<li><strong>ロック処理をメソッドの中に隠す</strong>：使う側はc.Add(1)と呼ぶだけでよく、ロックの存在を意識せずに済みます</li>
<li><strong>defer c.mu.Unlock()</strong>：メソッドが複雑になっても解放漏れを防げます</li>
</ul>
<p>今回の演習では、4つのワーカーゴルーチンがそれぞれ250回ずつAdd(1)を呼びます。合計1000回の加算がすべて保護されていれば、結果は必ず1000になります。</p>
<table>
<tr><th>この章で学んだこと</th><th>演習での使いどころ</th></tr>
<tr><td>go文とWaitGroup（131〜133）</td><td>4ワーカーの起動と待ち合わせ</td></tr>
<tr><td>レースとMutex（136〜137）</td><td>SafeCounterの内部実装</td></tr>
<tr><td>引数渡し（135）</td><td>ワーカー番号が必要なら引数で渡す</td></tr>
</table>
<p>次章では、ゴルーチン同士が<strong>データを受け渡す</strong>ためのGo独自の仕組み「チャネル」を学びます。</p>`,
      task: `<code>SafeCounter</code>の<code>Add</code>と<code>Value</code>メソッドを実装してください。どちらもMutexで<code>total</code>を保護します。完成したら実行し、結果が必ず1000になることを確認しましょう。`,
      code: `package main

import (
	"fmt"
	"sync"
)

// SafeCounterは複数ゴルーチンから安全に使えるカウンタ
type SafeCounter struct {
	mu    sync.Mutex
	total int
}

// TODO: Addを実装する。muで保護しながらtotalにnを加算する
func (c *SafeCounter) Add(n int) {
	c.total += n
}

// TODO: Valueを実装する。muで保護しながらtotalを返す
func (c *SafeCounter) Value() int {
	return c.total
}

func main() {
	counter := &SafeCounter{}
	var wg sync.WaitGroup

	// 4人のワーカーがそれぞれ250回ずつ加算する（計1000回）
	for w := 1; w <= 4; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := 0; i < 250; i++ {
				counter.Add(1)
			}
		}()
	}

	wg.Wait()
	fmt.Println("最終カウント:", counter.Value())
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

// SafeCounterは複数ゴルーチンから安全に使えるカウンタ
type SafeCounter struct {
	mu    sync.Mutex
	total int
}

// Addはロックで保護しながらtotalにnを加算する
func (c *SafeCounter) Add(n int) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.total += n
}

// Valueはロックで保護しながら現在の合計を返す
func (c *SafeCounter) Value() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.total
}

func main() {
	counter := &SafeCounter{}
	var wg sync.WaitGroup

	// 4人のワーカーがそれぞれ250回ずつ加算する（計1000回）
	for w := 1; w <= 4; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := 0; i < 250; i++ {
				counter.Add(1)
			}
		}()
	}

	wg.Wait()
	fmt.Println("最終カウント:", counter.Value())
}`,
      hints: [
        `AddとValueの先頭でc.mu.Lock()、直後にdefer c.mu.Unlock()を書くのが定番の形です。`,
        `レシーバーが*SafeCounter（ポインタ）であることが重要です。値レシーバーだとMutexがコピーされて保護が壊れます。`,
        `保護を入れる前に一度実行して1000にならないことを確認し、実装後に必ず1000になることを見比べると理解が深まります。`
      ],
      expectedOutput: "最終カウント: 1000"
    }
  ]
});
