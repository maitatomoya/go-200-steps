// 第10章：エラー処理
registerChapter({
  number: 10,
  title: "エラー処理",
  description: "Goのエラー処理は例外ではなく「値」として扱うのが特徴です。error型の基本からラップ・カスタムエラー・panicとrecoverまで、実務で必須の作法を学びます。",
  steps: [
    {
      id: 91,
      title: "error型とif err != nil（Goのエラー処理の基本形）",
      explanation: `<p>多くの言語（Java、Python、PHPなど）はエラーを<strong>例外（exception）</strong>という特別な仕組みで処理しますが、Goは違います。Goでは<strong>エラーはただの値</strong>であり、関数の戻り値として普通に返されます。</p>
<p>その中心にあるのが<strong>error型</strong>です。実はerrorは前章で学んだ<strong>インターフェース</strong>で、定義はたった1メソッドです。</p>
<pre><code>// 組み込みのerror型の定義
type error interface {
    Error() string // エラー内容を文字列で返す
}</code></pre>
<p>失敗する可能性のある関数は、<strong>最後の戻り値としてerrorを返す</strong>のがGoの鉄則です。成功なら<code>nil</code>（エラーなし）、失敗ならエラー値が入ります。呼び出し側は必ず次の形でチェックします。</p>
<pre><code>n, err := strconv.Atoi("123") // 文字列を整数に変換する関数
if err != nil {
    // 失敗時の処理（エラーを表示して戻る、など）
    fmt.Println("変換失敗:", err)
} else {
    fmt.Println("変換成功:", n)
}</code></pre>
<p>この<code>if err != nil</code>はGoのコードで最も頻繁に登場するパターンです。冗長に感じるかもしれませんが、次の利点があります。</p>
<table>
<tr><th>観点</th><th>例外方式</th><th>Goのエラー値方式</th></tr>
<tr><td>エラーの流れ</td><td>どこまでも飛んでいく（見えにくい）</td><td>戻り値なのでその場で見える</td></tr>
<tr><td>処理の強制</td><td>catchを忘れても動いてしまう</td><td>errを無視すると未使用変数エラーになりやすい</td></tr>
</table>
<p><strong>「エラーはその場で受け取り、その場で判断する」</strong>。これがGoのエラー処理の哲学です。</p>`,
      task: `まずそのまま実行して「変換成功: 123」を確認してください。その後、TODOに従って<code>"abc"</code>を変換するコードを追加し、失敗時に<code>err</code>にどんなメッセージが入るか観察してください。`,
      code: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	// strconv.Atoiは文字列を整数に変換する。失敗する可能性があるのでerrorも返す
	n, err := strconv.Atoi("123")
	if err != nil {
		fmt.Println("変換失敗:", err)
	} else {
		fmt.Println("変換成功:", n)
	}

	// TODO: strconv.Atoi("abc")を同じ形で呼び出し、
	// if err != nil で成功/失敗を分岐して結果を出力する
}`,
      solution: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	// strconv.Atoiは文字列を整数に変換する。失敗する可能性があるのでerrorも返す
	n, err := strconv.Atoi("123")
	if err != nil {
		fmt.Println("変換失敗:", err)
	} else {
		fmt.Println("変換成功:", n)
	}

	// "abc"は数値に変換できないので、errにエラー値が入る
	m, err := strconv.Atoi("abc")
	if err != nil {
		fmt.Println("変換失敗:", err)
	} else {
		fmt.Println("変換成功:", m)
	}
}`,
      hints: [
        `成功時はerrがnil、失敗時はerrにエラー値が入ります。「nilなら成功」と覚えましょう。`,
        `最初のブロックをコピーして、"123"を"abc"に、変数nをmに変えるだけです。`,
        `失敗時のerrをPrintlnに渡すと、エラーの内容が文字列として表示されます。`
      ],
      expectedOutput: "変換成功: 123"
    },
    {
      id: 92,
      title: "errors.Newでエラーを作る",
      explanation: `<p>前ステップでは標準ライブラリが返すエラーを受け取りました。今度は<strong>自分の関数からエラーを返す</strong>番です。最も簡単な方法が<code>errors.New</code>です。</p>
<pre><code>import "errors"

err := errors.New("0で割ることはできません")</code></pre>
<p><code>errors.New</code>は、指定したメッセージを持つエラー値を作って返します。これを使って「失敗するかもしれない関数」の典型形を書いてみましょう。</p>
<pre><code>// 戻り値は (結果, エラー) のペアにするのがGoの慣習
func divide(a, b int) (int, error) {
    if b == 0 {
        // 失敗：結果はゼロ値、エラーに理由を入れて返す
        return 0, errors.New("0で割ることはできません")
    }
    // 成功：結果を入れ、エラーはnil
    return a / b, nil
}</code></pre>
<p>この形には守るべき慣習が3つあります。</p>
<ol>
<li><strong>errorは最後の戻り値</strong>にする（(int, error)であって(error, int)ではない）</li>
<li>失敗時、結果側には<strong>ゼロ値</strong>（intなら0）を入れる。呼び出し側はエラー時に結果を使ってはいけない</li>
<li>成功時はエラーに<strong>必ずnil</strong>を返す</li>
</ol>
<p>エラーメッセージにも慣習があります。<strong>小文字で始め、句点や改行で終わらない</strong>のが標準です（英語の場合。日本語なら「。」を付けない）。これは、エラーが「ファイル読み込み失敗: 0で割ることはできません」のように他のメッセージと連結されることが多いためです。</p>
<p>もし0除算をチェックせずに<code>a / b</code>を実行すると、プログラムはpanic（強制終了）します。<strong>panicする前に検知してエラーとして返す</strong>のが、堅牢なコードの基本です。</p>`,
      task: `divide関数に0除算チェックを追加してください。<code>b == 0</code>のとき、<code>errors.New</code>で作ったエラーを返します（現在のコードはdivide(10, 0)の実行時にpanicします）。`,
      code: `package main

import (
	"errors"
	"fmt"
)

// TODO: bが0のとき 0 と errors.New("0で割ることはできません") を返す
// チェックを関数の先頭に追加する
func divide(a, b int) (int, error) {
	return a / b, nil
}

func main() {
	result, err := divide(10, 2)
	if err != nil {
		fmt.Println("エラー:", err)
	} else {
		fmt.Println("結果:", result)
	}

	result, err = divide(10, 0) // 今はここでpanicする
	if err != nil {
		fmt.Println("エラー:", err)
	} else {
		fmt.Println("結果:", result)
	}
}`,
      solution: `package main

import (
	"errors"
	"fmt"
)

// 失敗する可能性のある関数は (結果, error) を返すのがGoの慣習
func divide(a, b int) (int, error) {
	if b == 0 {
		// 失敗：結果はゼロ値、エラーに理由を入れて返す
		return 0, errors.New("0で割ることはできません")
	}
	return a / b, nil
}

func main() {
	result, err := divide(10, 2)
	if err != nil {
		fmt.Println("エラー:", err)
	} else {
		fmt.Println("結果:", result)
	}

	result, err = divide(10, 0)
	if err != nil {
		fmt.Println("エラー:", err)
	} else {
		fmt.Println("結果:", result)
	}
}`,
      hints: [
        `まず実行して、0除算panicのメッセージ（integer divide by zero）を確認してみましょう。`,
        `関数の先頭に if b == 0 { ... } のブロックを追加し、その中でreturnします。`,
        `return 0, errors.New("0で割ることはできません") のように、結果のゼロ値とエラーをセットで返します。`
      ],
      expectedOutput: "エラー: 0で割ることはできません"
    },
    {
      id: 93,
      title: "fmt.Errorfとフォーマット",
      explanation: `<p><code>errors.New</code>は固定の文字列しか入れられません。しかし実務のエラーメッセージには「どの値で失敗したのか」という<strong>具体的な情報</strong>を含めたいことがほとんどです。そこで使うのが<code>fmt.Errorf</code>です。</p>
<pre><code>// fmt.Sprintfと同じ書式指定でエラー値を作れる
err := fmt.Errorf("残高不足です（残高%d円に対して%d円を出金しようとしました）", balance, amount)</code></pre>
<p><code>fmt.Errorf</code>は「Sprintfで文字列を組み立てて、それをエラー値にして返す」関数だと考えれば理解しやすいでしょう。書式指定子はこれまで学んだものがそのまま使えます。</p>
<table>
<tr><th>書式指定子</th><th>意味</th><th>例</th></tr>
<tr><td>%d</td><td>整数</td><td>残高%d円</td></tr>
<tr><td>%s</td><td>文字列</td><td>ファイル%sが見つからない</td></tr>
<tr><td>%q</td><td>引用符付き文字列</td><td>入力%qが不正（"abc"のように表示）</td></tr>
<tr><td>%v</td><td>任意の値の既定形式</td><td>設定値%vが不正</td></tr>
</table>
<p>良いエラーメッセージと悪いエラーメッセージを比べてみましょう。</p>
<pre><code>// 悪い例：何がいくら足りないのか分からない
errors.New("残高不足")

// 良い例：状況が具体的に分かる
fmt.Errorf("残高不足です（残高%d円に対して%d円を出金しようとしました）", balance, amount)</code></pre>
<p>エラーメッセージは<strong>障害調査のときに最初に読まれる情報</strong>です。「どの操作が」「どの値で」失敗したかが書かれていれば、ログを見ただけで原因を推測できます。使い分けの目安は単純で、<strong>埋め込む値がなければerrors.New、あればfmt.Errorf</strong>です。</p>`,
      task: `withdraw関数のエラーを<code>fmt.Errorf</code>に書き換えて、「残高不足です（残高700円に対して2000円を出金しようとしました）」のように実際の金額入りのメッセージを返すようにしてください。`,
      code: `package main

import (
	"errors"
	"fmt"
)

// 出金処理：残高が足りなければエラーを返す
func withdraw(balance, amount int) (int, error) {
	if amount > balance {
		// TODO: fmt.Errorfに書き換えて、balanceとamountを
		// 「残高不足です（残高%d円に対して%d円を出金しようとしました）」の形式で埋め込む
		return balance, errors.New("残高不足")
	}
	return balance - amount, nil
}

func main() {
	balance := 1000

	balance, err := withdraw(balance, 300)
	if err != nil {
		fmt.Println("エラー:", err)
	} else {
		fmt.Println("出金成功。残高:", balance, "円")
	}

	_, err = withdraw(balance, 2000)
	if err != nil {
		fmt.Println("エラー:", err)
	}
}`,
      solution: `package main

import (
	"fmt"
)

// 出金処理：残高が足りなければ具体的な金額入りのエラーを返す
func withdraw(balance, amount int) (int, error) {
	if amount > balance {
		// fmt.Errorfなら実際の値をメッセージに埋め込める
		return balance, fmt.Errorf("残高不足です（残高%d円に対して%d円を出金しようとしました）", balance, amount)
	}
	return balance - amount, nil
}

func main() {
	balance := 1000

	balance, err := withdraw(balance, 300)
	if err != nil {
		fmt.Println("エラー:", err)
	} else {
		fmt.Println("出金成功。残高:", balance, "円")
	}

	_, err = withdraw(balance, 2000)
	if err != nil {
		fmt.Println("エラー:", err)
	}
}`,
      hints: [
        `fmt.Errorfの使い方はfmt.Printfとほぼ同じですが、表示する代わりにエラー値を返します。`,
        `%dの位置に順番にbalance、amountが埋め込まれます。引数の順番に注意してください。`,
        `errors.Newを使わなくなったら、importから"errors"を削除しないと未使用importのコンパイルエラーになります。`
      ],
      expectedOutput: "残高不足です（残高700円に対して2000円を出金しようとしました）"
    },
    {
      id: 94,
      title: "複数戻り値でエラーを返す関数を書く",
      explanation: `<p>ここまでの知識を組み合わせて、<strong>「値とエラーのペアを返す関数」を自分で設計する</strong>練習をします。題材は「ユーザーIDから名前を探す関数」です。</p>
<p>マップの検索には、失敗を検知できる<strong>カンマokイディオム</strong>がありました。これをエラーに変換して返すのが今回のポイントです。</p>
<pre><code>func findUser(users map[int]string, id int) (string, error) {
    name, ok := users[id]
    if !ok {
        // 「見つからない」をエラー値に変換して呼び出し側へ伝える
        return "", fmt.Errorf("ID %dのユーザーは存在しません", id)
    }
    return name, nil
}</code></pre>
<p>「okがfalse」という<strong>関数内部の事情</strong>を、「error」という<strong>共通の形式</strong>に変換して返しています。呼び出し側はマップの存在チェックの仕組みを知らなくても、いつもの<code>if err != nil</code>だけで扱えます。</p>
<p>呼び出し側では、ループ内でエラーが起きても処理を続けたい場合に<code>continue</code>を組み合わせるパターンが頻出です。</p>
<pre><code>for _, id := range []int{1, 3} {
    name, err := findUser(users, id)
    if err != nil {
        fmt.Println("エラー:", err)
        continue // この件は諦めて次へ
    }
    fmt.Println("見つかりました:", name)
}</code></pre>
<p>エラー処理を先に書いて<code>continue</code>や<code>return</code>で抜け、<strong>正常系の処理をインデントの浅い位置に置く</strong>のがGoらしいスタイルです（early returnと呼ばれます）。if-elseの入れ子が深くなるのを防ぎ、コードの主役である正常系が読みやすくなります。</p>`,
      task: `findUser関数の中身を実装してください。カンマokイディオムでマップを検索し、見つからなければ<code>fmt.Errorf("ID %dのユーザーは存在しません", id)</code>のエラーを、見つかれば名前と<code>nil</code>を返します。`,
      code: `package main

import (
	"fmt"
)

// TODO: usersからidを検索して (名前, nil) を返す。
// 見つからない場合は ("", fmt.Errorf("ID %dのユーザーは存在しません", id)) を返す
func findUser(users map[int]string, id int) (string, error) {
	return "", nil
}

func main() {
	users := map[int]string{1: "佐藤", 2: "鈴木"}

	for _, id := range []int{1, 3} {
		name, err := findUser(users, id)
		if err != nil {
			fmt.Println("エラー:", err)
			continue
		}
		fmt.Println("見つかりました:", name)
	}
}`,
      solution: `package main

import (
	"fmt"
)

// マップ検索の「ok」をエラーに変換して返す
func findUser(users map[int]string, id int) (string, error) {
	name, ok := users[id]
	if !ok {
		return "", fmt.Errorf("ID %dのユーザーは存在しません", id)
	}
	return name, nil
}

func main() {
	users := map[int]string{1: "佐藤", 2: "鈴木"}

	for _, id := range []int{1, 3} {
		name, err := findUser(users, id)
		if err != nil {
			fmt.Println("エラー:", err)
			continue
		}
		fmt.Println("見つかりました:", name)
	}
}`,
      hints: [
        `マップの検索は name, ok := users[id] の形で、存在しない場合okがfalseになります。`,
        `if !ok { エラーを返す } を先に書き、その後に正常系のreturnを書くとGoらしい形になります。`,
        `失敗時の1つ目の戻り値は空文字列""（stringのゼロ値）にします。`
      ],
      expectedOutput: "エラー: ID 3のユーザーは存在しません"
    },
    {
      id: 95,
      title: "エラーのラップ（%w）",
      explanation: `<p>エラーは関数から関数へと伝わっていきます。その途中で「どの処理の中で起きたのか」という<strong>文脈を付け足したい</strong>ことがよくあります。このとき使うのが<code>fmt.Errorf</code>の特別な書式指定子<strong>%w</strong>（wrapのw）です。</p>
<pre><code>baseErr := errors.New("データが見つかりません")

// %wで元のエラーを「包んで」新しいエラーを作る
wrapped := fmt.Errorf("設定の読み込みに失敗: %w", baseErr)

fmt.Println(wrapped)
// 出力: 設定の読み込みに失敗: データが見つかりません</code></pre>
<p>表示だけ見ると<code>%v</code>と同じに見えますが、決定的な違いがあります。<strong>%wは元のエラーへの参照を内部に保持する</strong>のです。包んだエラーから元のエラーを取り出すには<code>errors.Unwrap</code>を使います。</p>
<table>
<tr><th>書式指定子</th><th>表示</th><th>errors.Unwrapで元のエラーを取り出す</th></tr>
<tr><td>%v</td><td>同じ</td><td>できない（nilが返る）。文字列に変換されただけ</td></tr>
<tr><td>%w</td><td>同じ</td><td><strong>できる</strong>。元のエラーが生きている</td></tr>
</table>
<p>%vで包むと、元のエラーは「ただの文字列」になってしまい、後から「元の原因は何だったのか」をプログラムで判定できません。%wなら、たまねぎの皮のように<strong>エラーの層</strong>ができて、あとから中身を調べられます。</p>
<pre><code>fmt.Println(errors.Unwrap(wrapped)) // データが見つかりません
// %vで包んだ場合は &lt;nil&gt; になる</code></pre>
<p>実務では「DB接続失敗 → ユーザー取得失敗 → ページ表示失敗」のように、各層が文脈を足しながらエラーを上に渡していきます。<strong>エラーを別のエラーで包むなら%w</strong>。この使い分けは次ステップのerrors.Isで効いてきます。</p>`,
      task: `現在のコードは<code>%v</code>でエラーを包んでいるため、<code>errors.Unwrap</code>が元のエラーを取り出せず「元のエラー: &lt;nil&gt;」と表示されます。まず実行して確認し、その後<code>%v</code>を<code>%w</code>に変更して元のエラーを取り出せるようにしてください。`,
      code: `package main

import (
	"errors"
	"fmt"
)

func main() {
	baseErr := errors.New("データが見つかりません")

	// TODO: まず実行して「元のエラー: <nil>」を確認し、
	// その後 %v を %w に変更して再実行する
	wrapped := fmt.Errorf("設定の読み込みに失敗: %v", baseErr)

	fmt.Println("ラップ後:", wrapped)
	fmt.Println("元のエラー:", errors.Unwrap(wrapped))
}`,
      solution: `package main

import (
	"errors"
	"fmt"
)

func main() {
	baseErr := errors.New("データが見つかりません")

	// %wで包むと、元のエラーへの参照が保持される
	wrapped := fmt.Errorf("設定の読み込みに失敗: %w", baseErr)

	fmt.Println("ラップ後:", wrapped)
	// %wで包んだので、Unwrapで元のエラーを取り出せる
	fmt.Println("元のエラー:", errors.Unwrap(wrapped))
}`,
      hints: [
        `%vと%wは表示上は同じですが、%wだけが「元のエラーを保持したまま包む」動きをします。`,
        `errors.Unwrapは、%wで包まれたエラーから中のエラーを1枚だけ取り出します。包まれていなければnilを返します。`
      ],
      expectedOutput: "ラップ後: 設定の読み込みに失敗: データが見つかりません"
    },
    {
      id: 96,
      title: "errors.Isとerrors.As",
      explanation: `<p>エラーが%wで何重にも包まれるようになると、困ったことが起きます。「このエラーの<strong>根本原因</strong>は在庫切れなのか、接続失敗なのか」を判定したいのに、<code>err == ErrNotFound</code>のような単純比較では<strong>包まれたエラーは一致しない</strong>のです。</p>
<p>そこで登場するのが<code>errors.Is</code>です。エラーの包みを1枚ずつ剥がしながら、<strong>どこかの層に目的のエラーがあるか</strong>を調べてくれます。</p>
<pre><code>// パッケージレベルで宣言する「番兵エラー」（目印となるエラー値）
var ErrNotFound = errors.New("見つかりません")

func findItem(id int) error {
    if id != 1 {
        // 文脈を足しつつ%wでErrNotFoundを包む
        return fmt.Errorf("商品ID %d: %w", id, ErrNotFound)
    }
    return nil
}

err := findItem(99)
err == ErrNotFound        // false！ 包まれているので一致しない
errors.Is(err, ErrNotFound) // true！ 包みを剥がして照合してくれる</code></pre>
<p>このように、あらかじめ<code>ErrXxx</code>という名前でパッケージに公開しておく目印用のエラーを<strong>番兵エラー（sentinel error）</strong>と呼びます。標準ライブラリにも<code>io.EOF</code>（読み込みの終端）などがあります。</p>
<p>兄弟分の<code>errors.As</code>は「特定の<strong>エラー型</strong>が層の中にあるか」を調べ、あればその型の変数に取り出します。カスタムエラー型を次のステップで学んでから実際に使います。</p>
<table>
<tr><th>関数</th><th>調べること</th><th>使いどころ</th></tr>
<tr><td>errors.Is(err, target)</td><td>特定の「値」が層の中にあるか</td><td>番兵エラーとの照合</td></tr>
<tr><td>errors.As(err, &amp;target)</td><td>特定の「型」が層の中にあるか</td><td>エラーの詳細フィールドを取り出す</td></tr>
</table>
<p>ラップされたエラーの比較には==ではなくerrors.Is。これは現代のGoの必須知識です。</p>`,
      task: `TODOの位置に<code>errors.Is(err, ErrNotFound)</code>を使ったif文を追加し、真なら「原因はErrNotFoundです」と出力してください。==による比較が失敗する様子と見比べましょう。`,
      code: `package main

import (
	"errors"
	"fmt"
)

// 番兵エラー：「見つからない」ことを表す目印
var ErrNotFound = errors.New("見つかりません")

func findItem(id int) error {
	if id != 1 {
		return fmt.Errorf("商品ID %d: %w", id, ErrNotFound)
	}
	return nil
}

func main() {
	err := findItem(99)
	fmt.Println("エラー:", err)

	// TODO: errors.Is(err, ErrNotFound) がtrueなら
	// "原因はErrNotFoundです" と出力する

	// ==による比較はラップされていると一致しない
	if err == ErrNotFound {
		fmt.Println("==でも一致しました")
	} else {
		fmt.Println("==では一致しません（ラップされているため）")
	}
}`,
      solution: `package main

import (
	"errors"
	"fmt"
)

// 番兵エラー：「見つからない」ことを表す目印
var ErrNotFound = errors.New("見つかりません")

func findItem(id int) error {
	if id != 1 {
		return fmt.Errorf("商品ID %d: %w", id, ErrNotFound)
	}
	return nil
}

func main() {
	err := findItem(99)
	fmt.Println("エラー:", err)

	// errors.Isは包みを剥がしながらErrNotFoundを探してくれる
	if errors.Is(err, ErrNotFound) {
		fmt.Println("原因はErrNotFoundです")
	}

	// ==による比較はラップされていると一致しない
	if err == ErrNotFound {
		fmt.Println("==でも一致しました")
	} else {
		fmt.Println("==では一致しません（ラップされているため）")
	}
}`,
      hints: [
        `errはfmt.Errorfの%wでErrNotFoundを包んだものです。==では「包んだ後のエラー」と「元のエラー」の比較になるため一致しません。`,
        `if errors.Is(err, ErrNotFound) { ... } の形で書きます。第1引数が調べたいエラー、第2引数が探したい番兵エラーです。`
      ],
      expectedOutput: "原因はErrNotFoundです"
    },
    {
      id: 97,
      title: "カスタムエラー型（Error()メソッド）",
      explanation: `<p>エラーに<strong>メッセージ以外の情報</strong>（どのフィールドが不正か、HTTPステータスコードは何か等）を持たせたいときは、<strong>カスタムエラー型</strong>を作ります。error型はインターフェースなので、<code>Error() string</code>メソッドを持つ型を自作すればよいのです。前章で学んだ「暗黙の実装」がここで活きます。</p>
<pre><code>// 入力チェック失敗を表すカスタムエラー型
type ValidationError struct {
    Field string // どのフィールドが
    Msg   string // どう不正か
}

// このメソッドを持つだけで、*ValidationErrorはerrorとして使える
func (e *ValidationError) Error() string {
    return fmt.Sprintf("%sが不正です: %s", e.Field, e.Msg)
}

func checkAge(age int) error {
    if age &lt; 0 {
        return &amp;ValidationError{Field: "年齢", Msg: "0以上を指定してください"}
    }
    return nil
}</code></pre>
<p>レシーバをポインタ（*ValidationError）にし、<code>&amp;ValidationError{...}</code>とポインタを返すのが慣習です。そして受け取る側では、前ステップで予告した<code>errors.As</code>を使って構造体のフィールドを取り出せます。</p>
<pre><code>var vErr *ValidationError
if errors.As(err, &amp;vErr) {
    // errの層の中に*ValidationErrorがあれば、vErrに取り出される
    fmt.Println("問題のフィールド:", vErr.Field)
}</code></pre>
<p><code>errors.As</code>の第2引数には、取り出し先の変数の<strong>ポインタ</strong>（&amp;vErr）を渡します。使い分けをまとめます。</p>
<table>
<tr><th>手段</th><th>持てる情報</th><th>判定方法</th></tr>
<tr><td>errors.New / fmt.Errorf</td><td>メッセージのみ</td><td>errors.Is（番兵エラー）</td></tr>
<tr><td>カスタムエラー型</td><td>任意のフィールド</td><td>errors.As（型で照合し取り出す）</td></tr>
</table>
<p>まずはerrors.Newやfmt.Errorfで十分。<strong>構造化された情報が必要になったらカスタムエラー型</strong>、が実務の使い分けです。</p>`,
      task: `ValidationError型に<code>Error() string</code>メソッド（ポインタレシーバ）を実装して、errorインターフェースを満たすようにしてください。書式は「(Field)が不正です: (Msg)」です。実装しないとコンパイルエラーになります。`,
      code: `package main

import (
	"errors"
	"fmt"
)

// 入力チェック失敗を表すカスタムエラー型
type ValidationError struct {
	Field string
	Msg   string
}

// TODO: *ValidationErrorにError() stringメソッドを実装する
// fmt.Sprintf("%sが不正です: %s", e.Field, e.Msg) を返す

func checkAge(age int) error {
	if age < 0 {
		return &ValidationError{Field: "年齢", Msg: "0以上を指定してください"}
	}
	return nil
}

func main() {
	err := checkAge(-5)
	if err != nil {
		fmt.Println("エラー:", err)

		// errors.Asで層の中の*ValidationErrorを取り出す
		var vErr *ValidationError
		if errors.As(err, &vErr) {
			fmt.Println("問題のフィールド:", vErr.Field)
		}
	}
}`,
      solution: `package main

import (
	"errors"
	"fmt"
)

// 入力チェック失敗を表すカスタムエラー型
type ValidationError struct {
	Field string
	Msg   string
}

// Error()メソッドを実装すると、errorインターフェースを満たす
func (e *ValidationError) Error() string {
	return fmt.Sprintf("%sが不正です: %s", e.Field, e.Msg)
}

func checkAge(age int) error {
	if age < 0 {
		return &ValidationError{Field: "年齢", Msg: "0以上を指定してください"}
	}
	return nil
}

func main() {
	err := checkAge(-5)
	if err != nil {
		fmt.Println("エラー:", err)

		// errors.Asで層の中の*ValidationErrorを取り出す
		var vErr *ValidationError
		if errors.As(err, &vErr) {
			fmt.Println("問題のフィールド:", vErr.Field)
		}
	}
}`,
      hints: [
        `まず実行して「*ValidationError does not implement error (missing method Error)」というコンパイルエラーを確認しましょう。`,
        `func (e *ValidationError) Error() string { ... } の形です。レシーバはポインタにします。`,
        `メソッド名はError（大文字始まり）、戻り値はstringです。1文字でも違うとerrorを満たしません。`
      ],
      expectedOutput: "問題のフィールド: 年齢"
    },
    {
      id: 98,
      title: "panicとrecover（使いどころの限定）",
      explanation: `<p><strong>panic</strong>は「プログラムをその場で異常終了させる」仕組みです。0除算や範囲外アクセスで自動的に起きるほか、<code>panic("メッセージ")</code>で自分で起こすこともできます。panicが起きると関数の実行は中断され、呼び出し元へ次々と伝わって、最終的にプログラム全体がスタックトレース（実行経路の記録）を出して終了します。</p>
<p>この連鎖を途中で受け止めるのが<strong>recover</strong>です。recoverは<strong>defer</strong>と組み合わせて使います。deferは「この関数が終了するとき（panic時も含む）に必ず実行する処理」を予約する文です。</p>
<pre><code>func safeCall() {
    // deferで予約した無名関数は、panicが起きても実行される
    defer func() {
        if r := recover(); r != nil {
            // rにはpanicに渡した値が入る
            fmt.Println("recoverしました:", r)
        }
    }()

    fmt.Println("処理を開始します")
    panic("重大な問題が発生") // ここで中断され、deferの関数が動く
    // この行以降は実行されない
}</code></pre>
<p>recoverが成功すると、panicの連鎖はそこで止まり、<strong>呼び出し元は何事もなかったように処理を続けられます</strong>。</p>
<p>ただし、最重要なのは<strong>使いどころを限定する</strong>ことです。他言語のtry-catchの感覚でpanic/recoverを使うのは典型的な誤りです。</p>
<table>
<tr><th>状況</th><th>使うべきもの</th></tr>
<tr><td>入力が不正、データが見つからない等の予期できる失敗</td><td><strong>error</strong>（この章の主役）</td></tr>
<tr><td>プログラムのバグ、続行不可能な初期化失敗</td><td>panic</td></tr>
<tr><td>サーバーが1リクエストの障害で全体を道連れにしない備え</td><td>recover（フレームワークの内部などで）</td></tr>
</table>
<p>日常のコードで書くのは99%がerrorです。panic/recoverは「存在と仕組みを知っておき、めったに書かない」が正しい距離感です。</p>`,
      task: `現在のコードは実行するとpanicでプログラム全体が異常終了し、最後のPrintlnが実行されません。まず実行して確認し、その後safeCall関数の先頭にdefer+recoverを追加して、プログラムが最後まで実行されるようにしてください。`,
      code: `package main

import "fmt"

func safeCall() {
	// TODO: まず実行してpanicによる異常終了を観察する。
	// その後、関数の先頭に以下のdefer+recoverを追加する
	// defer func() {
	//     if r := recover(); r != nil {
	//         fmt.Println("recoverしました:", r)
	//     }
	// }()
	fmt.Println("処理を開始します")
	panic("重大な問題が発生")
}

func main() {
	safeCall()
	fmt.Println("プログラムは継続しています")
}`,
      solution: `package main

import "fmt"

func safeCall() {
	// deferで予約した関数はpanic発生時にも実行される
	defer func() {
		if r := recover(); r != nil {
			// recoverがpanicの連鎖を止め、rにpanicの値が入る
			fmt.Println("recoverしました:", r)
		}
	}()
	fmt.Println("処理を開始します")
	panic("重大な問題が発生")
}

func main() {
	safeCall()
	fmt.Println("プログラムは継続しています")
}`,
      hints: [
        `まず実行して、panic: 重大な問題が発生、とスタックトレースが表示されて終了することを確認しましょう。`,
        `deferの後ろは「関数を定義してその場で呼び出す」形です。最後の () を忘れずに。`,
        `recoverはdeferされた関数の中で呼んだときだけ効果があります。関数の先頭に置くのが定石です。`
      ],
      expectedOutput: "プログラムは継続しています"
    },
    {
      id: 99,
      title: "strconv.Atoiのエラー処理実践",
      explanation: `<p>エラー処理の実践として、最も使用頻度の高い関数の1つ<code>strconv.Atoi</code>（文字列→整数変換）を題材に、<strong>複数件のデータを処理しながらエラーに対処する</strong>パターンを身につけます。</p>
<p>ここで知っておくべき重要な性質があります。Atoiは失敗時に<strong>0とエラー</strong>を返します。エラーを無視すると、失敗した値が0として計算に混入してしまうのです。</p>
<pre><code>n, _ := strconv.Atoi("abc") // エラーを_で捨てると…
fmt.Println(n)               // 0 が返る。失敗に気づけない！</code></pre>
<p><code>_</code>でエラーを捨てるのは、Goのエラー処理で<strong>最もやってはいけないこと</strong>です。「たまたま0だったのか、失敗して0なのか」が区別できなくなります。</p>
<p>複数件を処理するときの定石は「エラーの件は記録してスキップし、残りは処理を続ける」です。</p>
<pre><code>inputs := []string{"10", "20", "abc", "30"}
sum := 0
skipped := 0

for _, s := range inputs {
    n, err := strconv.Atoi(s)
    if err != nil {
        // %qは値を"abc"のように引用符付きで表示する。エラー原因の特定に便利
        fmt.Printf("%qは数値に変換できないためスキップ: %v\\n", s, err)
        skipped++
        continue
    }
    sum += n
}</code></pre>
<p>Atoiのエラーメッセージ<code>strconv.Atoi: parsing "abc": invalid syntax</code>には「どの関数が」「どの入力で」「なぜ」失敗したかがすべて含まれています。標準ライブラリのエラーメッセージは、自分がfmt.Errorfでエラーを作るときのお手本になります。</p>
<p>この「1件の失敗で全体を止めず、失敗数を集計して報告する」パターンは、CSVの取り込みやフォーム入力の一括検証など、実務のあらゆる場面で登場します。</p>`,
      task: `現在のコードはエラーを<code>_</code>で捨てているため、"abc"が0として合計に混入しても気づけません。エラー処理を追加して、変換に失敗した入力はメッセージを表示してスキップし、スキップ件数を数えるようにしてください。`,
      code: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	inputs := []string{"10", "20", "abc", "30"}
	sum := 0
	skipped := 0

	for _, s := range inputs {
		// TODO: エラーを_で捨てずに受け取り、失敗したら
		// fmt.Printf("%qは数値に変換できないためスキップ: %v\\n", s, err) を表示して
		// skippedを増やし、continueで次へ進む
		n, _ := strconv.Atoi(s)
		sum += n
	}
	fmt.Println("合計:", sum)
	fmt.Println("スキップ件数:", skipped)
}`,
      solution: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	inputs := []string{"10", "20", "abc", "30"}
	sum := 0
	skipped := 0

	for _, s := range inputs {
		n, err := strconv.Atoi(s)
		if err != nil {
			// 失敗した入力は報告してスキップし、残りの処理は続ける
			fmt.Printf("%qは数値に変換できないためスキップ: %v\\n", s, err)
			skipped++
			continue
		}
		sum += n
	}
	fmt.Println("合計:", sum)
	fmt.Println("スキップ件数:", skipped)
}`,
      hints: [
        `n, _ := の _ を err に変えて、直後に if err != nil のブロックを追加します。`,
        `エラー時はskipped++してからcontinueします。continueを忘れると、失敗時の0がsumに足されてしまいます。`,
        `%qは文字列を引用符付きで、%vはエラーの内容を表示します。`
      ],
      expectedOutput: "合計: 60"
    },
    {
      id: 100,
      title: "総合演習（安全な除算計算機）",
      explanation: `<p>最終ステップです。この章で学んだ道具を総動員して「安全な除算計算機」を完成させます。使う知識の対応表です。</p>
<table>
<tr><th>使う知識</th><th>学んだステップ</th><th>この演習での役割</th></tr>
<tr><td>番兵エラー</td><td>96</td><td>ErrDivideByZeroを目印として定義</td></tr>
<tr><td>(値, error)を返す関数</td><td>92・94</td><td>safeDivideが結果とエラーを返す</td></tr>
<tr><td>%wによるラップ</td><td>95</td><td>どの計算で失敗したかの文脈を追加</td></tr>
<tr><td>errors.Is</td><td>96</td><td>根本原因がゼロ除算かを判定</td></tr>
<tr><td>エラー時のcontinue</td><td>94・99</td><td>1件の失敗で全体を止めない</td></tr>
</table>
<p>中心となるsafeDivide関数の設計はこうです。</p>
<pre><code>var ErrDivideByZero = errors.New("0で割ることはできません")

func safeDivide(a, b float64) (float64, error) {
    if b == 0 {
        // 番兵エラーを%wで包み、「どの計算か」という文脈を足す
        return 0, fmt.Errorf("計算 %g ÷ %g: %w", a, b, ErrDivideByZero)
    }
    return a / b, nil
}</code></pre>
<p><code>%g</code>はfloat64を過不足なく表示する書式指定子です（10.0なら10と表示）。呼び出し側は、errors.Isで「ゼロ除算が原因か」を判定して表示を変えます。</p>
<pre><code>result, err := safeDivide(p[0], p[1])
if err != nil {
    if errors.Is(err, ErrDivideByZero) {
        fmt.Println("エラー（ゼロ除算）:", err)
    } else {
        fmt.Println("エラー:", err)
    }
    continue
}</code></pre>
<p>なお、float64の除算<code>7 / 0.0</code>は実はpanicせずInf（無限大）になりますが、計算機として「0で割る指示はエラー」と<strong>自分たちで仕様を決めて</strong>チェックしています。エラー処理とは、言語に強制されるものではなく<strong>設計の一部</strong>である、という感覚を持てたらこの章は卒業です。</p>`,
      task: `2箇所のTODOを実装してください。(1) safeDivide関数に、bが0のとき<code>fmt.Errorf("計算 %g ÷ %g: %w", a, b, ErrDivideByZero)</code>を返すチェックを追加。(2) main関数のエラー処理で、<code>errors.Is</code>を使ってゼロ除算のときだけ「エラー（ゼロ除算）:」の表示に切り替える。`,
      code: `package main

import (
	"errors"
	"fmt"
)

// 番兵エラー：ゼロ除算を表す目印
var ErrDivideByZero = errors.New("0で割ることはできません")

func safeDivide(a, b float64) (float64, error) {
	// TODO: bが0のとき、ErrDivideByZeroを%wで包んだエラーを返す
	// 書式: fmt.Errorf("計算 %g ÷ %g: %w", a, b, ErrDivideByZero)
	return a / b, nil
}

func main() {
	pairs := [][2]float64{
		{10, 2},
		{7, 0},
		{9, 3},
	}

	success := 0
	for _, p := range pairs {
		result, err := safeDivide(p[0], p[1])
		if err != nil {
			// TODO: errors.Is(err, ErrDivideByZero) がtrueなら
			// "エラー（ゼロ除算）:" を、そうでなければ "エラー:" を付けて表示する
			fmt.Println("エラー:", err)
			continue
		}
		fmt.Printf("%g ÷ %g = %g\\n", p[0], p[1], result)
		success++
	}
	fmt.Println("成功した計算:", success, "件")
}`,
      solution: `package main

import (
	"errors"
	"fmt"
)

// 番兵エラー：ゼロ除算を表す目印
var ErrDivideByZero = errors.New("0で割ることはできません")

func safeDivide(a, b float64) (float64, error) {
	if b == 0 {
		// 番兵エラーを%wで包み、どの計算で失敗したかの文脈を足す
		return 0, fmt.Errorf("計算 %g ÷ %g: %w", a, b, ErrDivideByZero)
	}
	return a / b, nil
}

func main() {
	pairs := [][2]float64{
		{10, 2},
		{7, 0},
		{9, 3},
	}

	success := 0
	for _, p := range pairs {
		result, err := safeDivide(p[0], p[1])
		if err != nil {
			// errors.Isで根本原因がゼロ除算かを判定する
			if errors.Is(err, ErrDivideByZero) {
				fmt.Println("エラー（ゼロ除算）:", err)
			} else {
				fmt.Println("エラー:", err)
			}
			continue
		}
		fmt.Printf("%g ÷ %g = %g\\n", p[0], p[1], result)
		success++
	}
	fmt.Println("成功した計算:", success, "件")
}`,
      hints: [
        `safeDivideの先頭に if b == 0 { ... } を追加し、0とラップしたエラーを返します。ステップ92と95の組み合わせです。`,
        `main側は if errors.Is(err, ErrDivideByZero) { ... } else { ... } で表示を分けます。`,
        `エラーはラップされているので、==での比較ではなくerrors.Isを使う必要があります（ステップ96）。`
      ],
      expectedOutput: "成功した計算: 2 件"
    }
  ]
});
