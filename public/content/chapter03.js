// 第3章：制御フロー
registerChapter({
  number: 3,
  title: "制御フロー",
  description: "if・for・switchを使ってプログラムの流れを制御する方法を学びます。Goのループがforだけである理由や、switchの独特な仕様も理解します。",
  steps: [
    {
      id: 21,
      title: "ifの基本（括弧なし・波括弧必須）",
      explanation: `<p>プログラムは通常、上から下へ順番に実行されますが、<strong>if文</strong>を使うと「条件が成立したときだけ実行する」という分岐を作れます。Goのif文には、他の言語経験者ほど驚く2つの特徴があります。</p>
<ul>
<li><strong>条件式を丸括弧で囲まない</strong>（CやJavaScriptの<code>if (x > 5)</code>のような括弧は書かないのが流儀）</li>
<li><strong>波括弧<code>{ }</code>は省略できない</strong>（本体が1行でも必ず書く）</li>
</ul>
<pre><code>if score &gt;= 60 {
    fmt.Println("合格")
}</code></pre>
<p>さらに、開き波括弧<code>{</code>は<strong>必ず条件式と同じ行に書きます</strong>。次の行に書くとコンパイルエラーになります。これはGoが文末にセミコロンを自動挿入する仕組みによるもので、スタイルの好みではなく言語仕様です。</p>
<pre><code>// これはコンパイルエラーになる
if score &gt;= 60
{
    fmt.Println("合格")
}</code></pre>
<p>条件式には<code>bool</code>型（真偽値）になる式だけが書けます。比較演算子は第2章までに登場した<code>==</code>、<code>!=</code>、<code>&lt;</code>、<code>&lt;=</code>、<code>&gt;</code>、<code>&gt;=</code>が使えます。複数の条件を組み合わせるときは、「かつ」を表す<code>&amp;&amp;</code>と「または」を表す<code>||</code>を使います。</p>
<p>波括弧を必須にすることで「インデントはされているのにifの外にある」という古典的なバグを言語レベルで防いでいます。書式が全員同じになるのは、チーム開発でコードを読む時間を減らすというGoの設計思想の表れです。</p>`,
      task: `変数<code>score</code>の値が60以上のときに「合格」と表示するif文を、TODOコメントの位置に書いてください。`,
      code: `package main

import "fmt"

func main() {
	score := 75
	fmt.Println("点数:", score)
	// TODO: scoreが60以上なら「合格」と表示するif文をここに書く
}
`,
      solution: `package main

import "fmt"

func main() {
	score := 75
	fmt.Println("点数:", score)
	if score >= 60 {
		fmt.Println("合格")
	}
}
`,
      hints: [
        `if文は「if 条件式 { 処理 }」の形で書きます。条件式を丸括弧で囲む必要はありません。`,
        `「60以上」は比較演算子の >= で表せます。score >= 60 が条件式になります。`,
        `開き波括弧 { は必ずif文と同じ行に書きます。次の行に書くとコンパイルエラーです。`
      ],
      expectedOutput: "合格"
    },
    {
      id: 22,
      title: "else ifとelse",
      explanation: `<p>条件が成立しなかった場合の処理は<strong>else</strong>で、複数の条件を順番に調べたい場合は<strong>else if</strong>で書きます。上から順に評価され、<strong>最初に成立した条件のブロックだけ</strong>が実行されます。</p>
<pre><code>if score &gt;= 90 {
    fmt.Println("秀")
} else if score &gt;= 70 {
    fmt.Println("良")
} else {
    fmt.Println("可")
}</code></pre>
<p>ここで注意したいのが書き方のルールです。<code>else</code>や<code>else if</code>は、<strong>直前のブロックの閉じ波括弧<code>}</code>と同じ行に書かなければなりません</strong>。改行して<code>else</code>を書き始めるとコンパイルエラーになります。これもセミコロン自動挿入の仕様によるものです。</p>
<pre><code>// これはコンパイルエラーになる
if score &gt;= 90 {
    fmt.Println("秀")
}
else {
    fmt.Println("それ以外")
}</code></pre>
<p>条件の並べ方にはコツがあります。上の例で<code>score &gt;= 70</code>を先に書き、<code>score &gt;= 90</code>を後に書くと、95点でも先に<code>score &gt;= 70</code>が成立してしまい「秀」に到達できません。<strong>範囲が狭い（厳しい）条件から順に並べる</strong>のが基本です。</p>
<table>
<tr><th>書き方</th><th>意味</th></tr>
<tr><td><code>if</code></td><td>最初の条件</td></tr>
<tr><td><code>else if</code></td><td>前の条件が不成立のとき調べる次の条件（いくつでも書ける）</td></tr>
<tr><td><code>else</code></td><td>どの条件も不成立のときの処理（最後に1つだけ）</td></tr>
</table>`,
      task: `成績判定のif文を完成させてください。70以上なら「良」と表示する<code>else if</code>と、どれにも当てはまらないとき「可」と表示する<code>else</code>を追加します。`,
      code: `package main

import "fmt"

func main() {
	score := 85
	if score >= 90 {
		fmt.Println("秀")
	}
	// TODO: 70以上なら「良」と表示するelse ifを追加する
	// TODO: どれにも当てはまらないとき「可」と表示するelseを追加する
}
`,
      solution: `package main

import "fmt"

func main() {
	score := 85
	if score >= 90 {
		fmt.Println("秀")
	} else if score >= 70 {
		fmt.Println("良")
	} else {
		fmt.Println("可")
	}
}
`,
      hints: [
        `else ifとelseは、直前の閉じ波括弧 } と同じ行に続けて書きます。「} else if 条件 {」という形です。`,
        `scoreは85なので、score >= 70 のelse ifブロックが実行されれば「良」と表示されます。`,
        `完成形は if → else if → else の3段構えになります。`
      ],
      expectedOutput: "良"
    },
    {
      id: 23,
      title: "if文の初期化ステートメント",
      explanation: `<p>Goのif文には、<strong>条件式の前に短い文を1つ書ける</strong>という便利な機能があります。これを<strong>初期化ステートメント</strong>と呼び、セミコロン<code>;</code>で条件式と区切ります。</p>
<pre><code>if r := n % 3; r == 0 {
    fmt.Println("3の倍数")
} else {
    fmt.Println("余り:", r)
}</code></pre>
<p>この書き方の最大のポイントは<strong>変数のスコープ（変数が使える範囲）</strong>です。初期化ステートメントで宣言した変数<code>r</code>は、<strong>そのif文（elseブロックを含む）の中でしか使えません</strong>。if文の外で<code>r</code>を参照するとコンパイルエラーになります。</p>
<pre><code>// 比較：ifの外で宣言すると、rはこの後もずっと生き続ける
r := n % 3
if r == 0 {
    fmt.Println("3の倍数")
}
// ここでもrが使えてしまう</code></pre>
<p>「この変数はこの判定のためだけに使う」という意図をコードの形で表現でき、使い終わった変数がその後のコードに漏れ出さないため、変数名の衝突や誤用を防げます。リーダブルコードで言う「変数のスコープを縮める」をGoが文法として支援している機能です。</p>
<p>実務のGoコードでは、関数の戻り値とエラーを受け取って即座に判定するイディオム（<code>if err := doSomething(); err != nil { ... }</code>）として頻出します。関数とエラー処理は後の章で学びますが、この形を見たら「宣言と判定を1行にまとめているのだな」と読めるようにしておきましょう。</p>`,
      task: `変数<code>r</code>の宣言をif文の初期化ステートメントに移動して、<code>r</code>のスコープをif文の中だけに限定してください。動作（出力）は変えないこと。`,
      code: `package main

import "fmt"

func main() {
	n := 10
	// TODO: rの宣言を初期化ステートメントとしてif文の中に移動する
	r := n % 3
	if r == 0 {
		fmt.Println("3の倍数")
	} else {
		fmt.Println("余り:", r)
	}
}
`,
      solution: `package main

import "fmt"

func main() {
	n := 10
	if r := n % 3; r == 0 {
		fmt.Println("3の倍数")
	} else {
		fmt.Println("余り:", r)
	}
}
`,
      hints: [
        `初期化ステートメントは「if 文; 条件式 {」の形で、文と条件式をセミコロンで区切ります。`,
        `「if r := n % 3; r == 0 {」のように、:= による宣言をifの行に移します。`,
        `elseブロックの中でもrは使えるので、fmt.Println("余り:", r) はそのままで動きます。`
      ],
      expectedOutput: "余り: 1"
    },
    {
      id: 24,
      title: "forの基本（Goのループはforだけ）",
      explanation: `<p>多くの言語には<code>for</code>、<code>while</code>、<code>do-while</code>など複数のループ構文がありますが、<strong>Goのループはforただ1つ</strong>です。覚えることを減らし、誰が書いても同じ形になるようにするというGoらしい割り切りです。</p>
<p>最も基本的な形は、セミコロンで区切られた3つの部分を持つ形です。</p>
<pre><code>for i := 0; i &lt; 5; i++ {
    fmt.Println(i)
}</code></pre>
<table>
<tr><th>部分</th><th>名前</th><th>実行タイミング</th></tr>
<tr><td><code>i := 0</code></td><td>初期化ステートメント</td><td>ループ開始前に1回だけ</td></tr>
<tr><td><code>i &lt; 5</code></td><td>条件式</td><td>毎回の繰り返しの前（falseなら終了）</td></tr>
<tr><td><code>i++</code></td><td>後処理ステートメント</td><td>毎回の繰り返しの後</td></tr>
</table>
<p>if文と同じく、<strong>丸括弧は書かず、波括弧は必須</strong>です。<code>i++</code>は「iを1増やす」という意味で、Goでは文（ステートメント）であり式ではないため、<code>x := i++</code>のような書き方はできません。また前置の<code>++i</code>は存在しません。</p>
<p>初期化ステートメントで宣言した<code>i</code>はループの中でしか使えません。これもif文の初期化ステートメントと同じスコープのルールです。</p>
<p>なお、Go 1.22からはループ変数が<strong>繰り返しごとに新しく作られる</strong>仕様になりました。今の段階では影響を感じにくいですが、後の章でクロージャや並行処理を学ぶときに重要になる改善です。</p>
<p>ループの定番パターンが「合計を求める」処理です。ループの外で合計用の変数を0で用意し、ループの中で足し込んでいきます。</p>
<pre><code>sum := 0
for i := 1; i &lt;= 10; i++ {
    sum += i
}</code></pre>`,
      task: `例のループを参考に、1から10までの整数の合計を計算して「合計: 55」と表示するコードをTODOの位置に書いてください。`,
      code: `package main

import "fmt"

func main() {
	// 動作確認用：1から3まで表示する
	for i := 1; i <= 3; i++ {
		fmt.Println(i)
	}
	// TODO: 1から10までの合計を計算して「合計: 55」と表示する
}
`,
      solution: `package main

import "fmt"

func main() {
	// 動作確認用：1から3まで表示する
	for i := 1; i <= 3; i++ {
		fmt.Println(i)
	}
	sum := 0
	for i := 1; i <= 10; i++ {
		sum += i
	}
	fmt.Println("合計:", sum)
}
`,
      hints: [
        `合計を入れる変数をループの外で sum := 0 と宣言し、ループの中で足し込みます。`,
        `for i := 1; i <= 10; i++ の形で1から10まで繰り返し、sum += i で加算します。`,
        `表示は fmt.Println("合計:", sum) と書くと「合計: 55」の形になります。`
      ],
      expectedOutput: "合計: 55"
    },
    {
      id: 25,
      title: "while相当のfor（条件だけのfor）",
      explanation: `<p>Goには<code>while</code>がありませんが、困ることはありません。forの3つの部分のうち<strong>初期化と後処理を省略して条件式だけを書く</strong>と、他の言語のwhileと同じ動きになるからです。</p>
<pre><code>n := 1
for n &lt; 1000 {
    n *= 2
}</code></pre>
<p>このループは「<code>n</code>が1000未満の間、繰り返す」という意味です。セミコロンも書きません。<code>for n &lt; 1000 { ... }</code>という条件だけの形は、<strong>何回繰り返すか事前に分からない処理</strong>に向いています。</p>
<table>
<tr><th>形</th><th>使いどころ</th></tr>
<tr><td><code>for i := 0; i &lt; N; i++ { }</code></td><td>回数が決まっている繰り返し</td></tr>
<tr><td><code>for 条件式 { }</code></td><td>条件が満たされる間の繰り返し（while相当）</td></tr>
</table>
<p>条件だけのforを書くときの最重要ポイントは、<strong>ループの中で条件に関わる変数を必ず変化させる</strong>ことです。上の例で<code>n *= 2</code>を忘れると条件が永遠にtrueのままになり、プログラムが止まらない<strong>無限ループ</strong>になります（意図的な無限ループは次のステップで学びます）。</p>
<p>もう1つの注意は、ループ変数を<strong>ループの外で宣言しておく</strong>必要があることです。初期化ステートメントがないので、条件式で使う変数は事前に存在していなければなりません。逆に言えば、ループが終わった後もその変数を参照できるという利点があります。「最終的にnはいくつになったか」「何回繰り返したか」をループの後で確認したいときに便利です。</p>`,
      task: `3つの部分を持つfor文を、条件だけのfor（while相当）に書き換えてください。「1000を超えるまで2倍し続ける」動作はそのまま維持します。`,
      code: `package main

import "fmt"

func main() {
	count := 0
	// TODO: このforを「for n < 1000 { ... }」の条件だけの形に書き換える
	// （nの宣言はループの外に出し、n *= 2 はループの中で行う）
	for n := 1; n < 1000; n *= 2 {
		count++
		_ = n
	}
	fmt.Println("回数:", count)
	// TODO: 最終的なnの値も「最終値: 1024」と表示する
}
`,
      solution: `package main

import "fmt"

func main() {
	count := 0
	n := 1
	for n < 1000 {
		n *= 2
		count++
	}
	fmt.Println("回数:", count)
	fmt.Println("最終値:", n)
}
`,
      hints: [
        `条件だけのforでは初期化ができないため、n := 1 をループの前に移動します。`,
        `for n < 1000 { } の中で n *= 2 と count++ を実行します。セミコロンは書きません。`,
        `nをループの外で宣言したので、ループ終了後に fmt.Println("最終値:", n) で参照できます。1を2倍し続けると1024で1000を超えます。`
      ],
      expectedOutput: "最終値: 1024"
    },
    {
      id: 26,
      title: "無限ループとbreak",
      explanation: `<p>forの3つの部分をすべて省略すると、<strong>永遠に繰り返す無限ループ</strong>になります。</p>
<pre><code>for {
    // ずっと繰り返される
}</code></pre>
<p>「無限ループはバグでは？」と思うかもしれませんが、Goでは<strong>意図的な無限ループ＋脱出条件</strong>という組み合わせを頻繁に使います。サーバーがリクエストを待ち続ける処理や、「終了条件がループの途中で決まる」処理に自然にはまる形だからです。</p>
<p>ループから抜けるには<strong>break</strong>を使います。breakが実行されると、その時点でループを打ち切り、ループの次の行へ進みます。</p>
<pre><code>total := 0
i := 1
for {
    total += i
    if total &gt; 100 {
        break // 合計が100を超えたら終了
    }
    i++
}</code></pre>
<p>このように「まず処理してから、続けるかどうか判断する」流れは、条件だけのforでは書きにくいことがあります。条件式はループの<strong>先頭</strong>で評価されるため、「1回実行した後に判定したい」場合（他言語のdo-whileに相当）は、無限ループ＋breakのほうが素直に書けるのです。</p>
<table>
<tr><th>やりたいこと</th><th>Goでの書き方</th></tr>
<tr><td>先に条件を見てから実行（while型）</td><td><code>for 条件 { }</code></td></tr>
<tr><td>実行してから条件を見る（do-while型）</td><td><code>for { }</code> ＋ <code>break</code></td></tr>
</table>
<p>無限ループを書くときは、<strong>breakに必ず到達する保証があるか</strong>を常に確認しましょう。脱出条件に関わる変数が更新されているか、条件が本当に成立し得るかの2点をチェックする癖をつけると安全です。</p>`,
      task: `無限ループ<code>for { }</code>の中で1から順に整数を足していき、合計が100を超えたら<code>break</code>で抜けて「i: 14 total: 105」と表示されるようにTODOを埋めてください。`,
      code: `package main

import "fmt"

func main() {
	total := 0
	i := 1
	for {
		total += i
		// TODO: totalが100を超えたらbreakでループを抜ける
		i++
	}
	fmt.Println("i:", i, "total:", total)
}
`,
      solution: `package main

import "fmt"

func main() {
	total := 0
	i := 1
	for {
		total += i
		if total > 100 {
			break
		}
		i++
	}
	fmt.Println("i:", i, "total:", total)
}
`,
      hints: [
        `初期コードのままではbreakがないため無限ループです。まず「どの条件で抜けるべきか」を考えましょう。`,
        `total += i の直後に「if total > 100 { break }」を入れると、100を超えた瞬間にループを抜けます。`,
        `breakをi++より前に置くのがポイントです。1+2+...+13=91、そこにi=14を足すと105で100を超えます。`
      ],
      expectedOutput: "i: 14 total: 105"
    },
    {
      id: 27,
      title: "continueとラベル付きbreak",
      explanation: `<p><strong>continue</strong>は「今回の繰り返しをスキップして、次の繰り返しへ進む」命令です。breakがループ全体を打ち切るのに対し、continueは1回分だけ飛ばします。</p>
<pre><code>for i := 1; i &lt;= 5; i++ {
    if i%2 == 0 {
        continue // 偶数のときは以降を飛ばす
    }
    fmt.Println("奇数:", i)
}</code></pre>
<p>「条件に合わないものを先頭で弾いて、本処理をネストさせずに書く」というこのパターンは、リーダブルコードで推奨されるガード節と同じ発想で、実務コードでも多用されます。</p>
<p>次に、ループが二重になっている場合を考えます。内側のループで<code>break</code>を書いても、抜けられるのは<strong>内側のループだけ</strong>です。外側のループは続行するため、「見つかったら全部やめたい」場面では期待と違う動きになります。</p>
<p>そこでGoには<strong>ラベル付きbreak</strong>があります。外側のforの直前に<code>ラベル名:</code>を書き、<code>break ラベル名</code>とすると、そのラベルが付いたループごと一気に抜けられます。</p>
<pre><code>outer:
for i := 1; i &lt;= 5; i++ {
    for j := 1; j &lt;= 5; j++ {
        if i*j == 12 {
            fmt.Println("発見:", i, j)
            break outer // 外側のループごと抜ける
        }
    }
}</code></pre>
<p>ラベル名は変数と同じ規則で自由に付けられます（<code>outer</code>や<code>loop</code>が定番）。同様に<code>continue ラベル名</code>で「外側のループの次の繰り返しへ進む」こともできます。多くの言語ではフラグ変数を使って二重ループを抜けますが、Goではラベルで意図を直接表現できます。</p>`,
      task: `このコードを実行すると「発見:」が2回表示されてしまいます。内側の<code>break</code>をラベル付きbreakに変えて、最初の1組（3と4）を見つけた時点で二重ループ全体を抜けるように修正してください。`,
      code: `package main

import "fmt"

func main() {
	// 掛けて12になる組み合わせを探す
	// TODO: 外側のforにラベルを付け、break outer で二重ループ全体を抜ける
	for i := 1; i <= 5; i++ {
		for j := 1; j <= 5; j++ {
			if i*j == 12 {
				fmt.Println("発見:", i, j)
				break // これでは内側のループしか抜けられない
			}
		}
	}
	fmt.Println("探索終了")
}
`,
      solution: `package main

import "fmt"

func main() {
	// 掛けて12になる組み合わせを探す
outer:
	for i := 1; i <= 5; i++ {
		for j := 1; j <= 5; j++ {
			if i*j == 12 {
				fmt.Println("発見:", i, j)
				break outer
			}
		}
	}
	fmt.Println("探索終了")
}
`,
      hints: [
        `まず初期コードをそのまま実行して、「発見: 3 4」と「発見: 4 3」の2回表示されることを確認しましょう。breakが内側のループしか抜けていない証拠です。`,
        `外側のforの直前の行に「outer:」と書いてラベルを付けます。`,
        `breakを「break outer」に変えると、ラベルが付いた外側のループごと抜けられます。`
      ],
      expectedOutput: "発見: 3 4"
    },
    {
      id: 28,
      title: "switchの基本（fallthroughしない仕様）",
      explanation: `<p>1つの値を複数の候補と比較して分岐するなら、else ifを並べるより<strong>switch文</strong>が読みやすくなります。</p>
<pre><code>switch num {
case 1:
    fmt.Println("金")
case 2:
    fmt.Println("銀")
case 3:
    fmt.Println("銅")
default:
    fmt.Println("圏外")
}</code></pre>
<p><code>switch 値 { }</code>の中に<code>case 候補:</code>を並べ、どれにも一致しないときは<code>default</code>が実行されます。ここでC言語やJavaScriptの経験者が最も驚くのがこの仕様です。</p>
<ul>
<li><strong>caseの最後にbreakを書く必要がない</strong>。Goのswitchは一致したcaseの処理が終わると<strong>自動的にswitch全体を抜けます</strong>。</li>
<li>C系言語のように次のcaseへ処理が流れ落ちる（fallthroughする）ことは<strong>ありません</strong>。break書き忘れによる定番バグを言語仕様ごと排除しています。</li>
</ul>
<p>また、1つのcaseに<strong>候補をカンマ区切りで複数並べる</strong>ことができます。他言語で「caseを縦に並べてfallthroughさせる」書き方をしていた場面は、Goではこう書きます。</p>
<pre><code>switch day {
case "土", "日":
    fmt.Println("休日")
default:
    fmt.Println("平日")
}</code></pre>
<p>比較対象は整数に限らず、文字列などの比較可能な値なら何でも使えます。さらにif文と同じように初期化ステートメントも書けます（<code>switch d := today(); d { ... }</code>のような形。関数は次章で学びます）。「1つの値をたくさんの候補と比べるならswitch、範囲や複雑な条件で分けるならif」が使い分けの目安です。</p>`,
      task: `順位に応じてメダルの色を表示するswitch文を完成させてください。<code>case 3</code>で「銅」、<code>default</code>で「圏外」と表示するようにTODOを埋めます。breakは不要です。`,
      code: `package main

import "fmt"

func main() {
	num := 3
	switch num {
	case 1:
		fmt.Println("金")
	case 2:
		fmt.Println("銀")
	// TODO: 3のとき「銅」と表示するcaseを追加する
	// TODO: どれにも一致しないとき「圏外」と表示するdefaultを追加する
	}
}
`,
      solution: `package main

import "fmt"

func main() {
	num := 3
	switch num {
	case 1:
		fmt.Println("金")
	case 2:
		fmt.Println("銀")
	case 3:
		fmt.Println("銅")
	default:
		fmt.Println("圏外")
	}
}
`,
      hints: [
        `caseは「case 3:」のようにコロンで終わり、次の行に処理を書きます。`,
        `defaultはcaseと同じ並びに「default:」と書きます。位置はどこでも構いませんが、最後に書くのが慣例です。`,
        `Goのswitchは自動的に抜けるので、breakを書く必要はありません。numは3なので「銅」と表示されれば正解です。`
      ],
      expectedOutput: "銅"
    },
    {
      id: 29,
      title: "条件式switchとfallthrough",
      explanation: `<p>switchには比較する値を<strong>書かない</strong>形もあります。値を省略すると<code>switch true</code>と同じ意味になり、各caseに<strong>bool型の条件式</strong>を書けます。長いelse ifの連鎖を平らに整理できる、Goらしい書き方です。</p>
<pre><code>score := 75
switch {
case score &gt;= 90:
    fmt.Println("秀")
case score &gt;= 70:
    fmt.Println("良")
default:
    fmt.Println("可")
}</code></pre>
<p>caseは<strong>上から順に評価され、最初に成立したものだけ</strong>が実行されます。else ifと同じく、狭い（厳しい）条件から順に並べるのがポイントです。</p>
<p>次に<strong>fallthrough</strong>です。前のステップで「Goのswitchは自動的に抜ける」と学びましたが、あえて<strong>次のcaseへ処理を流したい</strong>ときだけ、caseの最後に<code>fallthrough</code>と書きます。</p>
<pre><code>switch n {
case 1:
    fmt.Println("case 1")
    fallthrough
case 2:
    fmt.Println("case 2")
case 3:
    fmt.Println("case 3")
}</code></pre>
<p><code>n</code>が1のとき、出力は「case 1」「case 2」の2行になります。重要なのは、fallthroughが<strong>次のcaseの条件を評価せずに無条件で</strong>その本体を実行する点です（だから<code>n</code>が2でなくてもcase 2の本体が動きます）。そしてcase 2にはfallthroughがないので、case 3へは流れません。</p>
<table>
<tr><th>言語</th><th>既定の動き</th><th>流したいとき</th></tr>
<tr><td>C / JavaScript</td><td>次のcaseへ流れる</td><td>（breakで止める）</td></tr>
<tr><td>Go</td><td>自動的に抜ける</td><td>fallthroughを明示する</td></tr>
</table>
<p>実務でfallthroughが必要な場面はまれです。「使わないのが基本、使うときは意図をコメントで残す」くらいの距離感で付き合いましょう。</p>`,
      task: `if〜else ifで書かれた成績判定を、値を書かない条件式switchに書き換えてください。出力が「良」のまま変わらないことを確認します。`,
      code: `package main

import "fmt"

func main() {
	score := 75
	// TODO: このif文を、値を省略したswitch（条件式switch）に書き換える
	if score >= 90 {
		fmt.Println("秀")
	} else if score >= 70 {
		fmt.Println("良")
	} else {
		fmt.Println("可")
	}
}
`,
      solution: `package main

import "fmt"

func main() {
	score := 75
	switch {
	case score >= 90:
		fmt.Println("秀")
	case score >= 70:
		fmt.Println("良")
	default:
		fmt.Println("可")
	}
}
`,
      hints: [
        `値を省略して「switch {」とだけ書くと、各caseに条件式を書ける形になります。`,
        `「case score >= 90:」のように、caseの後ろに条件式とコロンを書きます。`,
        `elseに相当するのはdefaultです。scoreは75なので「良」と表示されれば正解です。`
      ],
      expectedOutput: "良"
    },
    {
      id: 30,
      title: "総合演習（FizzBuzz）",
      explanation: `<p>第3章の総仕上げとして、プログラミングの定番課題<strong>FizzBuzz</strong>に挑戦します。ルールは次の通りです。</p>
<ol>
<li>1から順に数を数えていく</li>
<li>3の倍数のときは数の代わりに「Fizz」と言う</li>
<li>5の倍数のときは「Buzz」と言う</li>
<li>3と5両方の倍数（つまり15の倍数）のときは「FizzBuzz」と言う</li>
<li>それ以外は数をそのまま言う</li>
</ol>
<p>使う道具はすべて学習済みです。「回数が決まった繰り返し」はforで、「倍数かどうか」は剰余演算子<code>%</code>で判定できます。<code>i % 3 == 0</code>がtrueなら<code>i</code>は3の倍数です。</p>
<p>この課題の急所は<strong>条件を調べる順番</strong>です。もし最初に「3の倍数か？」を調べると、15はそこで「Fizz」と判定されてしまい、「FizzBuzz」に到達できません。<strong>最も特殊な条件（15の倍数）を最初に</strong>調べる必要があります。前のステップで学んだ「狭い条件から順に並べる」の実践です。</p>
<pre><code>for i := 1; i &lt;= 30; i++ {
    switch {
    case i%15 == 0:
        // FizzBuzz
    case i%3 == 0:
        // Fizz
    // ...
    }
}</code></pre>
<p>分岐はif〜else ifでも条件式switchでも書けます。どちらでも正解ですが、4つの分岐が平らに並ぶこの課題は条件式switchの得意分野です。</p>
<p>FizzBuzzは単純に見えて、「ループ」「剰余」「条件の順序」という基礎が全部詰まっています。採用面接で書かされることもある有名課題なので、何も見ずに書けるようにしておいて損はありません。</p>`,
      task: `1から30までの整数について、FizzBuzzのルール通りに1行ずつ表示するプログラムを完成させてください。15の倍数で「FizzBuzz」、3の倍数で「Fizz」、5の倍数で「Buzz」、それ以外は数をそのまま表示します。`,
      code: `package main

import "fmt"

func main() {
	for i := 1; i <= 30; i++ {
		// TODO: FizzBuzzの判定を書く
		// 15の倍数 → FizzBuzz / 3の倍数 → Fizz / 5の倍数 → Buzz / それ以外 → iをそのまま表示
		fmt.Println(i)
	}
}
`,
      solution: `package main

import "fmt"

func main() {
	for i := 1; i <= 30; i++ {
		switch {
		case i%15 == 0:
			fmt.Println("FizzBuzz")
		case i%3 == 0:
			fmt.Println("Fizz")
		case i%5 == 0:
			fmt.Println("Buzz")
		default:
			fmt.Println(i)
		}
	}
}
`,
      hints: [
        `「3と5両方の倍数」は「15の倍数」と同じです。この条件を最初に判定しないと、FizzBuzzがFizzに化けてしまいます。`,
        `倍数の判定は剰余演算子を使い、i%15 == 0 のように書きます。`,
        `条件式switch（switch { case i%15 == 0: ... }）かif〜else ifの4分岐で書き、最後のdefault（else）でiを表示します。`
      ],
      expectedOutput: "FizzBuzz"
    }
  ]
});
