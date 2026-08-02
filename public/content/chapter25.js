// 第25章：よくあるエラー：実行時と論理
registerChapter({
  number: 25,
  title: "よくあるエラー：実行時と論理",
  description: "コンパイルは通るのに動きがおかしい「実行時エラー・論理バグ」を修復する総仕上げの章です。最後は6つのバグを含むプログラムを完全修復して卒業です。",
  steps: [
    {
      id: 241,
      title: "json: cannot unmarshal（型不一致）",
      explanation: `<p>この章では「コンパイルは通るのに、実行すると失敗する・結果がおかしい」タイプのエラーを扱います。最初はJSONの読み込みでよく出るエラーです。</p>
<h4>エラーメッセージの読み方</h4>
<pre><code>json: cannot unmarshal string into Go struct field User.Age of type int</code></pre>
<p>このメッセージは部品に分けると原因がそのまま書いてあります。</p>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td>cannot unmarshal string</td><td>JSON側の値が文字列だった</td></tr>
<tr><td>into Go struct field User.Age</td><td>入れようとした先はUser構造体のAgeフィールド</td></tr>
<tr><td>of type int</td><td>そのフィールドの型はint</td></tr>
</table>
<p>つまり「JSONでは<code>"29"</code>（文字列）なのに、Goの受け皿は<code>int</code>」という型のズレです。<code>json.Unmarshal</code>はこのズレを検出するとエラーを返します。エラーはpanic（実行時の強制停止）ではなく戻り値なので、<code>if err != nil</code>で受け取って内容を読むのが第一歩です。</p>
<h4>典型的な修正パターン</h4>
<ul>
<li>データを直せるなら：JSON側を正しい型にする（<code>"Age": 29</code>）</li>
<li>データを直せないなら：構造体側の型をデータに合わせる（<code>Age string</code>にしてから変換する）</li>
</ul>
<p>なお<code>json.Unmarshal</code>は、JSONのキーと構造体のフィールド名を大文字小文字を区別せずに対応付けます。フィールドが小文字（非公開）だと対応付け自体がされず、値が入らない点も合わせて覚えておきましょう。</p>`,
      task: `実行するとエラーメッセージが表示されます。メッセージを読んで原因を特定し、今回はJSONデータ側を修正して（Ageを数値にして）正しく表示されるようにしてください。`,
      code: `package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	Name string
	Age  int
}

func main() {
	// 外部から受け取ったつもりのJSONデータ
	data := "{\\"Name\\":\\"Gopher\\",\\"Age\\":\\"29\\"}"
	var u User
	err := json.Unmarshal([]byte(data), &u)
	if err != nil {
		fmt.Println("エラー:", err)
		return
	}
	fmt.Printf("名前:%s 年齢:%d\\n", u.Name, u.Age)
}`,
      solution: `package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	Name string
	Age  int
}

func main() {
	// Ageを文字列ではなく数値にする
	data := "{\\"Name\\":\\"Gopher\\",\\"Age\\":29}"
	var u User
	err := json.Unmarshal([]byte(data), &u)
	if err != nil {
		fmt.Println("エラー:", err)
		return
	}
	fmt.Printf("名前:%s 年齢:%d\\n", u.Name, u.Age)
}`,
      hints: [
        `エラーメッセージの「cannot unmarshal string ... of type int」は「文字列をintに入れられない」という意味です。JSONのどの値が文字列になっていますか。`,
        `JSONで数値を表すときは引用符を付けません。<code>\\"Age\\":\\"29\\"</code>の値側の引用符を外しましょう。`
      ],
      expectedOutput: "名前:Gopher 年齢:29"
    },
    {
      id: 242,
      title: "time.Formatのレイアウト間違い",
      explanation: `<p>他の言語では日付の書式を<code>YYYY-MM-DD</code>のように書きますが、Goの<code>time.Format</code>は全く違う方式です。しかも間違えてもエラーにならず、書いた文字がそのまま出力されるだけなので、気付きにくいバグになります。</p>
<h4>Goの「参照時刻」方式</h4>
<p>Goでは<strong>2006年1月2日 15時4分5秒</strong>という決まった時刻（参照時刻）を「見本」として書式を指定します。アメリカ式の日付表記で1月2日3時(午後)4分5秒6年＝1,2,3,4,5,6と並ぶ覚えやすい時刻です。</p>
<table>
<tr><th>出したいもの</th><th>書くべきもの</th><th>間違い例</th></tr>
<tr><td>年（4桁）</td><td>2006</td><td>YYYY</td></tr>
<tr><td>月（2桁）</td><td>01</td><td>MM</td></tr>
<tr><td>日（2桁）</td><td>02</td><td>DD</td></tr>
<tr><td>時（24時間）</td><td>15</td><td>hh</td></tr>
<tr><td>分</td><td>04</td><td>mm</td></tr>
<tr><td>秒</td><td>05</td><td>ss</td></tr>
</table>
<pre><code>t.Format("2006-01-02 15:04")  // 例: 2024-03-09 14:30
t.Format("2006年01月02日")      // 例: 2024年03月09日</code></pre>
<h4>なぜエラーにならないのか</h4>
<p><code>Format</code>はレイアウト文字列の中から参照時刻のパターン（2006や01など）だけを探して置き換え、それ以外の文字は<strong>そのまま出力</strong>します。<code>YYYY-MM-DD</code>にはパターンが1つも含まれないため、文字通り「YYYY-MM-DD」と印字されるのです。エラーメッセージが出ないバグは、出力を目で確認して初めて発見できます。テストで実際の出力を検証する習慣が効くのはこのタイプです。</p>`,
      task: `実行すると日付が「YYYY-MM-DD hh:mm」とそのまま表示されてしまいます。レイアウト文字列をGoの参照時刻方式に直し、「2024-03-09 14:30」と表示されるようにしてください。`,
      code: `package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Date(2024, 3, 9, 14, 30, 0, 0, time.UTC)
	// 他言語の書式をそのまま書いてしまっている
	fmt.Println(t.Format("YYYY-MM-DD hh:mm"))
}`,
      solution: `package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Date(2024, 3, 9, 14, 30, 0, 0, time.UTC)
	// Goは参照時刻 2006-01-02 15:04:05 を見本として書式を指定する
	fmt.Println(t.Format("2006-01-02 15:04"))
}`,
      hints: [
        `Goのレイアウトは「2006年1月2日15時4分5秒」という決まった見本の時刻で書きます。YYYYの代わりに何を書きますか。`,
        `年=2006、月=01、日=02、時=15、分=04です。「2006-01-02 15:04」の形になります。`
      ],
      expectedOutput: "2024-03-09 14:30"
    },
    {
      id: 243,
      title: "strconv.Atoiのエラー無視で0が混入",
      explanation: `<p>Goの関数はエラーを戻り値で返しますが、<code>_</code>（ブランク識別子）で受けると簡単に握りつぶせてしまいます。今回はその典型的な事故です。</p>
<h4>エラー時の戻り値は「ゼロ値」</h4>
<p><code>strconv.Atoi("abc")</code>は変換に失敗すると、エラーと同時に<strong>値としては0</strong>を返します。エラーを無視すると、この0が正常な値と区別されないまま計算に混ざります。</p>
<pre><code>n, _ := strconv.Atoi("abc") // n = 0、エラーは捨てられた
total += n                  // 0が合計に加算される（見た目は正常）</code></pre>
<p>恐ろしいのは、プログラムが<strong>止まらずに間違った答えを出す</strong>ことです。panicなら気付けますが、この種のバグは「平均点がなんとなく低い」といった形でしか現れず、原因調査に時間がかかります。</p>
<h4>典型的な修正パターン</h4>
<table>
<tr><th>方針</th><th>書き方</th></tr>
<tr><td>不正データを飛ばす</td><td>if err != nil { continue }</td></tr>
<tr><td>その場で処理を打ち切る</td><td>if err != nil { return err }</td></tr>
<tr><td>既定値を明示して使う</td><td>エラー時に意図した値を代入（コメントで理由を書く）</td></tr>
</table>
<p>不正データを飛ばす場合は、<strong>件数の数え方</strong>にも注意が必要です。平均を「合計÷入力件数」で計算すると、飛ばした分だけ分母が大きくなり、やはり答えがずれます。有効件数を別のカウンタで数えましょう。</p>`,
      task: `テストの平均点を計算していますが、不正な入力「abc」が0点として混入し、平均が61点になってしまいます。エラーをチェックして不正データをスキップし、有効な3件の平均81点が表示されるようにしてください。`,
      code: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	inputs := []string{"80", "95", "abc", "70"}
	total := 0
	for _, s := range inputs {
		n, _ := strconv.Atoi(s) // エラーを捨てている
		total += n
	}
	// 245 / 4 = 61 になってしまう（正しくは 245 / 3 = 81）
	fmt.Printf("平均点:%d\\n", total/len(inputs))
}`,
      solution: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	inputs := []string{"80", "95", "abc", "70"}
	total := 0
	count := 0
	for _, s := range inputs {
		n, err := strconv.Atoi(s)
		if err != nil {
			fmt.Println("不正な入力をスキップ:", s)
			continue
		}
		total += n
		count++
	}
	fmt.Printf("平均点:%d\\n", total/count)
}`,
      hints: [
        `Atoiの2つ目の戻り値を_で捨てずにerrで受け取り、失敗したデータはcontinueで飛ばしましょう。`,
        `平均の分母にも注意。len(inputs)は4のままなので、変換に成功した件数をcountで数えて割ります。`
      ],
      expectedOutput: "平均点:81"
    },
    {
      id: 244,
      title: "浮動小数点の比較ミス",
      explanation: `<p>コンピュータは小数を2進数で近似して保持するため、変数どうしの<code>0.1 + 0.2</code>はぴったり<code>0.3</code>になりません。<code>==</code>で比較すると予想外にfalseになります。</p>
<h4>実際に何が起きているか</h4>
<pre><code>a := 0.1
b := 0.2
fmt.Println(a + b)        // 0.30000000000000004
fmt.Println(a+b == 0.3)   // false</code></pre>
<p>0.1は2進数では割り切れない無限小数（10進数の1/3=0.333...と同じ状況）なので、float64はそれを最も近い値で近似します。近似値どうしの足し算はわずかな誤差を持ち、<code>==</code>のような完全一致の比較は失敗します。これはGoに限らず、float型を持つほぼ全ての言語で起きる現象です。</p>
<p>ちなみにGoでは、リテラルを直接書いた<code>0.1 + 0.2 == 0.3</code>だけはtrueになります。Goの「型なし定数」はコンパイル時に高精度で正確に計算されるためです。同じ式でも変数を経由した瞬間にfloat64の近似計算になる、という違いは覚えておく価値があります。</p>
<h4>修正パターン：誤差を許容して比較する</h4>
<p>「差の絶対値が十分小さければ等しいとみなす」のが定石です。許容誤差はイプシロンと呼ばれます。</p>
<pre><code>const epsilon = 1e-9
if math.Abs(a-b) &lt; epsilon {
    // 等しいとみなす
}</code></pre>
<table>
<tr><th>場面</th><th>推奨する方法</th></tr>
<tr><td>計算結果の等値判定</td><td>math.Absと許容誤差で比較</td></tr>
<tr><td>金額の計算</td><td>そもそもfloatを使わず、整数（円単位・銭単位）で持つ</td></tr>
<tr><td>大小比較（&lt;や&gt;）</td><td>誤差の影響が小さければそのままでよい場合が多い</td></tr>
</table>
<p>特に金額は「1円未満のズレ」が実害になるため、実務では整数で扱うのが基本です。floatの<code>==</code>を見たらバグを疑う、という感覚を持っておきましょう。</p>`,
      task: `2つの変数の合計0.1+0.2と0.3の比較が失敗して「一致しません」と表示されてしまいます。mathパッケージをimportし、差の絶対値が1e-9未満なら等しいとみなす比較に直してください。`,
      code: `package main

import "fmt"

func main() {
	itemA := 0.1
	itemB := 0.2
	price := itemA + itemB
	if price == 0.3 {
		fmt.Println("合計は0.3です")
	} else {
		fmt.Println("一致しません:", price)
	}
}`,
      solution: `package main

import (
	"fmt"
	"math"
)

func main() {
	itemA := 0.1
	itemB := 0.2
	price := itemA + itemB
	// 差の絶対値が十分小さければ等しいとみなす
	if math.Abs(price-0.3) < 1e-9 {
		fmt.Println("合計は0.3です")
	} else {
		fmt.Println("一致しません:", price)
	}
}`,
      hints: [
        `floatの==は近似誤差のせいで失敗します。「差がとても小さいか」を判定する形に変えましょう。`,
        `math.Abs(price-0.3) < 1e-9 のように、差の絶対値を許容誤差と比べます。mathのimportを忘れずに。`
      ],
      expectedOutput: "合計は0.3です"
    },
    {
      id: 245,
      title: "appendの共有による意図しない上書き",
      explanation: `<p>スライスは「配列の一部を指すビュー」なので、1つの配列を複数のスライスが共有できます。この性質と<code>append</code>が組み合わさると、離れた場所のデータが書き換わる不思議なバグが起きます。</p>
<h4>何が起きているか</h4>
<pre><code>scores := []int{10, 20, 30, 40, 50}
top2 := scores[:2]        // len=2, cap=5。scoresと同じ配列を共有
top2 = append(top2, 999)  // capに空きがあるので新しい配列を作らず
                          // 共有中の配列のscores[2]の位置に999を書き込む</code></pre>
<p>スライスは「配列へのポインタ・長さ（len）・容量（cap）」の3点セットです。<code>scores[:2]</code>のlenは2ですが、capは元の配列の末尾までの5が引き継がれます。<code>append</code>は<strong>capに空きがあれば同じ配列に書き込み、足りないときだけ新しい配列を作る</strong>ため、空きがある今回は共有中の配列を直接上書きし、<code>scores[2]</code>の30が999に化けます。</p>
<h4>修正パターン</h4>
<table>
<tr><th>方法</th><th>書き方</th><th>特徴</th></tr>
<tr><td>copyで複製する</td><td>make + copy</td><td>共有を完全に断ち切る。最も分かりやすい</td></tr>
<tr><td>capを制限する</td><td>scores[:2:2]（フルスライス式）</td><td>cap=2になり、appendが必ず新配列を作る</td></tr>
</table>
<p>「元データを守りたい部分スライス」を作るときは、共有したままでよいのか、複製すべきなのかを毎回意識しましょう。appendの結果を必ず変数に受け直す（<code>s = append(s, ...)</code>）のと並ぶ、スライスの二大注意点です。</p>`,
      task: `上位2件を取り出してボーナス枠999を追加したところ、元のscoresの30が999に上書きされてしまいます。makeとcopyでtop2を独立した複製にして、scoresが元のまま表示されるようにしてください。`,
      code: `package main

import "fmt"

func main() {
	scores := []int{10, 20, 30, 40, 50}
	top2 := scores[:2]
	top2 = append(top2, 999) // ボーナス枠を追加したつもり
	fmt.Println("top2:", top2)
	// scoresの30が999に化けてしまう
	fmt.Println("scores:", scores)
}`,
      solution: `package main

import "fmt"

func main() {
	scores := []int{10, 20, 30, 40, 50}
	// 複製を作って配列の共有を断ち切る
	top2 := make([]int, 2)
	copy(top2, scores[:2])
	top2 = append(top2, 999)
	fmt.Println("top2:", top2)
	fmt.Println("scores:", scores)
}`,
      hints: [
        `scores[:2]はscoresと同じ配列を共有していて、capに空きがあるためappendがscores[2]を直接上書きしています。`,
        `top2 := make([]int, 2) で入れ物を作り、copy(top2, scores[:2]) で中身を複製してからappendしましょう。`
      ],
      expectedOutput: "scores: [10 20 30 40 50]"
    },
    {
      id: 246,
      title: "マップのイテレーション順に依存したバグ",
      explanation: `<p>マップを<code>range</code>で回すと、<strong>実行するたびに順序が変わります</strong>。これはバグではなくGoの仕様で、順序に依存したコードを書かせないように、実行時がわざと順序をシャッフルしています。</p>
<h4>なぜわざとランダムにするのか</h4>
<p>マップの内部実装（ハッシュテーブル）では、要素の並びは追加順とも辞書順とも無関係です。もし「たまたま同じ順序」で列挙されると、開発者がその順序に依存したコードを書いてしまい、言語のバージョンアップで壊れる事故が過去の他言語で多発しました。Goは最初から順序をランダム化することで、依存コードを早期に発見できるようにしています。</p>
<h4>順序依存バグの典型例</h4>
<ul>
<li>帳票やレポートの出力順が実行のたびに変わる</li>
<li>「最初に見つかった要素」を使う処理の結果が安定しない</li>
<li>マップを順に処理した結果を文字列連結すると、毎回違う文字列になりテストが不安定になる</li>
</ul>
<h4>修正パターン：キーを取り出してソートする</h4>
<pre><code>names := make([]string, 0, len(stock))
for name := range stock {
    names = append(names, name)
}
sort.Strings(names)
for _, name := range names {
    fmt.Println(name, stock[name]) // 常に同じ順序
}</code></pre>
<p>「キーのスライスを作る→ソートする→その順でマップを引く」の3段構えが定石です。順序が必要な場面では、マップ単体ではなく「マップ＋ソート済みキーのスライス」の組で考える習慣をつけましょう。</p>`,
      task: `在庫レポートの出力順が実行のたびに変わってしまいます。商品名のスライスを作ってsort.Stringsで並べ替え、名前順に「apple:3 banana:5 cherry:2」と1行で表示されるようにしてください（strings.Joinを使います）。`,
      code: `package main

import "fmt"

func main() {
	stock := map[string]int{"apple": 3, "banana": 5, "cherry": 2}
	// 実行するたびに表示順が変わってしまう
	for name, n := range stock {
		fmt.Printf("%s:%d\\n", name, n)
	}
}`,
      solution: `package main

import (
	"fmt"
	"sort"
	"strings"
)

func main() {
	stock := map[string]int{"apple": 3, "banana": 5, "cherry": 2}
	// キーを取り出してソートし、その順で組み立てる
	names := make([]string, 0, len(stock))
	for name := range stock {
		names = append(names, name)
	}
	sort.Strings(names)
	parts := make([]string, 0, len(names))
	for _, name := range names {
		parts = append(parts, fmt.Sprintf("%s:%d", name, stock[name]))
	}
	fmt.Println(strings.Join(parts, " "))
}`,
      hints: [
        `マップ自体は並べ替えられないので、キーだけをスライスに集めてソートし、その順でマップを引きます。`,
        `fmt.Sprintfで「名前:数」の文字列を作ってスライスに集め、strings.Join(parts, \" \")で1行にまとめましょう。`
      ],
      expectedOutput: "apple:3 banana:5 cherry:2"
    },
    {
      id: 247,
      title: "off-by-oneエラー（境界の1つずれ）",
      explanation: `<p>「1つずれ」によるバグはoff-by-oneエラーと呼ばれ、プログラミング全体で最も頻度の高いバグの1つです。Goではスライスの範囲外アクセスとしてpanicになるため、症状としては分かりやすい部類です。</p>
<h4>panicメッセージの読み方</h4>
<pre><code>panic: runtime error: index out of range [4] with length 4</code></pre>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td>index out of range [4]</td><td>インデックス4にアクセスしようとした</td></tr>
<tr><td>with length 4</td><td>スライスの長さは4（有効な添字は0〜3）</td></tr>
</table>
<p>長さ4のスライスの有効な添字は<strong>0, 1, 2, 3</strong>です。最後の添字は<code>len - 1</code>なので、ループ条件を<code>i &lt;= len(nums)</code>と書くと、最後の周回で存在しない<code>nums[4]</code>にアクセスしてしまいます。正しくは<code>i &lt; len(nums)</code>です。</p>
<h4>そもそもずれを起こさない書き方</h4>
<pre><code>for _, n := range nums {
    total += n
}</code></pre>
<p><code>range</code>は要素の数だけ正確に回るので、境界条件を自分で書く必要がなく、off-by-oneが原理的に起きません。添字が必要な場合も<code>for i, n := range nums</code>で両方受け取れます。カウンタ式のforを書くのは「途中から回したい」「逆順に回したい」など、rangeで表現しにくいときに限る、と考えると事故が減ります。</p>`,
      task: `実行すると「index out of range [4] with length 4」でpanicします。ループ条件の1つずれを直して、合計20が表示されるようにしてください（余裕があればrangeでの書き換えも試してみましょう）。`,
      code: `package main

import "fmt"

func main() {
	nums := []int{2, 4, 6, 8}
	total := 0
	// 最後の周回で存在しないnums[4]にアクセスしてしまう
	for i := 0; i <= len(nums); i++ {
		total += nums[i]
	}
	fmt.Println("合計:", total)
}`,
      solution: `package main

import "fmt"

func main() {
	nums := []int{2, 4, 6, 8}
	total := 0
	// 有効な添字は0〜len-1なので条件は i < len(nums)
	for i := 0; i < len(nums); i++ {
		total += nums[i]
	}
	fmt.Println("合計:", total)
}`,
      hints: [
        `長さ4のスライスの有効な添字は0〜3です。i <= len(nums) だとiが4のときもループに入ってしまいます。`,
        `条件を i < len(nums) に直します。rangeで書けばそもそも境界を書かずに済みます。`
      ],
      expectedOutput: "合計: 20"
    },
    {
      id: 248,
      title: "文字列のbyte走査で日本語が壊れる",
      explanation: `<p>Goの文字列はUTF-8のバイト列です。英数字は1文字=1バイトですが、日本語は1文字=3バイトなので、バイト単位で1文字ずつ取り出そうとすると文字が壊れます。</p>
<h4>2つの走査方法の違い</h4>
<table>
<tr><th>書き方</th><th>単位</th><th>"Go言語"での挙動</th></tr>
<tr><td>for i := 0; i &lt; len(s); i++ で s[i]</td><td>byte（1バイト）</td><td>len(s)=8。日本語部分は3バイトに分解され壊れる</td></tr>
<tr><td>for _, r := range s</td><td>rune（1文字）</td><td>G, o, 言, 語 の4文字が正しく取れる</td></tr>
</table>
<p><code>len(s)</code>が返すのは<strong>バイト数</strong>であって文字数ではありません。"Go言語"は G(1) + o(1) + 言(3) + 語(3) = 8バイトです。<code>s[i]</code>で取れるのは1バイト（byte型）で、日本語の3バイトのうち1つだけを<code>%c</code>で表示すると、無関係な記号やアクセント付き文字に化けます。</p>
<h4>修正パターン：rangeでruneとして回す</h4>
<pre><code>for i, r := range s {
    // rはrune（文字）、iはバイト位置（連番ではない！）
}</code></pre>
<p>文字列を<code>range</code>で回すと、GoはUTF-8を自動でデコードして1文字（rune）ずつ返します。ただし1つ目の変数は「何文字目か」ではなく<strong>バイト位置</strong>（0, 1, 2, 5, ...のように飛ぶ）なので、文字数を数えたいときは自分でカウンタを増やします。文字数だけ欲しい場合は<code>utf8.RuneCountInString(s)</code>も使えます。</p>`,
      task: `"Go言語"を1文字ずつ表示したいのに、3文字目以降が壊れた文字になります。rangeを使ってrune単位で走査し、「3文字目:言」「4文字目:語」と正しく表示されるようにしてください（何文字目かは自前のカウンタで数えます）。`,
      code: `package main

import "fmt"

func main() {
	s := "Go言語"
	// バイト単位で回しているため日本語が壊れる（len(s)は8）
	for i := 0; i < len(s); i++ {
		fmt.Printf("%d文字目:%c\\n", i+1, s[i])
	}
}`,
      solution: `package main

import "fmt"

func main() {
	s := "Go言語"
	// rangeは1文字（rune）ずつ返す。バイト位置ではなく自前のカウンタで数える
	count := 0
	for _, r := range s {
		count++
		fmt.Printf("%d文字目:%c\\n", count, r)
	}
}`,
      hints: [
        `s[i]は1バイトしか取れません。文字列をrangeで回すと1文字（rune）ずつ取り出せます。`,
        `rangeの1つ目の変数はバイト位置で飛び飛びになるので、count++で自前の連番を作りましょう。`
      ],
      expectedOutput: "3文字目:言"
    },
    {
      id: 249,
      title: "無限ループ（条件更新忘れ）",
      explanation: `<p>実行しても何も表示されず、プログラムが終わらない。エラーメッセージが一切出ないため、初心者が最も戸惑うバグの1つが無限ループです。</p>
<h4>なぜ止まらないのか</h4>
<pre><code>i := 1
for i &lt;= 10 {
    total += i
    // iを増やし忘れている → i は永遠に1のまま
}</code></pre>
<p>forループが終わるのは「条件式が偽になったとき」だけです。条件式に登場する変数（ここでは<code>i</code>）がループ本体の中で<strong>終了に向かって変化しない</strong>限り、条件は永遠に真のままです。CPUは全力で同じ計算を繰り返し続けるので、実行中はCPU使用率が跳ね上がるのも特徴です。止めるにはターミナルでCtrl+Cを押します。</p>
<h4>無限ループを防ぐチェックリスト</h4>
<ul>
<li>条件式の変数は、ループ本体のどこかで必ず更新されているか</li>
<li>更新の向きは終了条件に近づく方向か（増やすべき変数を減らしていないか）</li>
<li>continueで更新文を飛ばしてしまう経路はないか</li>
</ul>
<p>3点目は特に見落としがちです。<code>for i &lt;= 10 { ... if 条件 { continue } ; i++ }</code>のような形だと、continueした周回では<code>i++</code>が実行されず無限ループになります。カウンタ更新があるループでは、更新式をforの3番目の位置（<code>for i := 1; i &lt;= 10; i++</code>）に書いておくと、continueしても必ず実行されるため安全です。</p>`,
      task: `実行すると何も表示されず終わりません（実行環境が強制停止します）。ループ内でiを更新し忘れているのが原因です。修正して「1から10の合計: 55」が表示されるようにしてください。`,
      code: `package main

import "fmt"

func main() {
	i := 1
	total := 0
	for i <= 10 {
		total += i
		// iを増やし忘れている
	}
	fmt.Println("1から10の合計:", total)
}`,
      solution: `package main

import "fmt"

func main() {
	i := 1
	total := 0
	for i <= 10 {
		total += i
		i++ // 条件の変数を終了に向かって更新する
	}
	fmt.Println("1から10の合計:", total)
}`,
      hints: [
        `forが終わるのは条件 i <= 10 が偽になったときだけ。iはどこかで増えていますか。`,
        `ループ本体の最後に i++ を足します。for i := 1; i <= 10; i++ の3部形式に書き換えるのも安全です。`
      ],
      expectedOutput: "1から10の合計: 55"
    },
    {
      id: 250,
      title: "卒業課題：エラーだらけのプログラムを完全修復する",
      explanation: `<p>いよいよ最終ステップです。売上データを集計するプログラムに<strong>6つのバグ</strong>が仕込まれています。第21〜25章で学んだエラーの知識を総動員して、完全に修復してください。</p>
<h4>デバッグの手順（この順番が効率的）</h4>
<ol>
<li><strong>コンパイルエラーを全て潰す</strong>：コンパイラのメッセージは行番号つきで正確。上から順に直す</li>
<li><strong>実行してpanicを直す</strong>：panicメッセージと発生行を読み、nil・境界を疑う</li>
<li><strong>出力を検算して論理バグを直す</strong>：止まらないバグはエラーメッセージが出ない。期待値と見比べる</li>
</ol>
<h4>この章までに学んだ、疑うべきポイント</h4>
<table>
<tr><th>症状</th><th>疑うポイント</th><th>学んだ章</th></tr>
<tr><td>imported and not used</td><td>使っていないimport</td><td>第21章</td></tr>
<tr><td>declared and not used</td><td>:=による意図しない新変数（シャドーイング）</td><td>第21・22章</td></tr>
<tr><td>assignment to entry in nil map</td><td>makeせずに使っているマップ</td><td>第22章</td></tr>
<tr><td>index out of range</td><td>ループ境界の1つずれ</td><td>第25章</td></tr>
<tr><td>数値が期待とずれる</td><td>Atoiなどのエラー無視による0の混入、件数の数え方</td><td>第25章</td></tr>
<tr><td>実行のたびに出力順が変わる</td><td>マップのrange順への依存</td><td>第25章</td></tr>
</table>
<h4>期待する最終出力</h4>
<pre><code>apple:5
cherry:7
有効:3件 無効:1件
最多:cherry(7)</code></pre>
<p>appleは3+2=5、cherryは7、"banana,x"は数量が不正なので無効データとして集計から除外します。商品は名前順に表示します。1つ直すたびに実行し直して、エラーメッセージの変化を確認しながら進めるのがコツです。ここまで来たあなたは、Goのエラーメッセージを「怖いもの」ではなく「原因を教えてくれる味方」として読めるようになっているはずです。</p>`,
      task: `売上集計プログラムに6つのバグ（コンパイルエラー2種・実行時panic2種・論理バグ2種）があります。全て修正して、期待する最終出力（explanation参照）が名前順で表示されるようにしてください。`,
      code: `package main

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

func main() {
	// "商品名,数量" 形式の売上データ（"banana,x"は不正データ）
	records := []string{"apple,3", "banana,x", "apple,2", "cherry,7"}

	// 商品ごとの合計数量
	var totals map[string]int
	valid := 0
	invalid := 0

	for i := 0; i <= len(records); i++ {
		parts := strings.Split(records[i], ",")
		name := parts[0]
		qty, _ := strconv.Atoi(parts[1])
		totals[name] += qty
		valid++
	}

	// 集計結果を表示しつつ、最多販売の商品を探す
	bestName := ""
	bestQty := 0
	for name, qty := range totals {
		fmt.Printf("%s:%d\\n", name, qty)
		if qty > bestQty {
			bestName := name
			bestQty := qty
		}
	}

	fmt.Printf("有効:%d件 無効:%d件\\n", valid, invalid)
	fmt.Printf("最多:%s(%d)\\n", bestName, bestQty)
}`,
      solution: `package main

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

func main() {
	// "商品名,数量" 形式の売上データ（"banana,x"は不正データ）
	records := []string{"apple,3", "banana,x", "apple,2", "cherry,7"}

	// 修正1: makeで初期化する（nilマップへの代入はpanic）
	totals := make(map[string]int)
	valid := 0
	invalid := 0

	// 修正2: <= を < にする（off-by-one）
	for i := 0; i < len(records); i++ {
		parts := strings.Split(records[i], ",")
		name := parts[0]
		// 修正3: エラーを無視せず、不正データはスキップして無効件数を数える
		qty, err := strconv.Atoi(parts[1])
		if err != nil {
			invalid++
			continue
		}
		totals[name] += qty
		valid++
	}

	// 修正4: キーをソートして順序を安定させる（importのsortも活きる）
	names := make([]string, 0, len(totals))
	for name := range totals {
		names = append(names, name)
	}
	sort.Strings(names)

	bestName := ""
	bestQty := 0
	for _, name := range names {
		fmt.Printf("%s:%d\\n", name, totals[name])
		// 修正5: := ではなく = で外の変数を更新する（シャドーイング）
		if totals[name] > bestQty {
			bestName = name
			bestQty = totals[name]
		}
	}

	fmt.Printf("有効:%d件 無効:%d件\\n", valid, invalid)
	fmt.Printf("最多:%s(%d)\\n", bestName, bestQty)
}`,
      hints: [
        `まずコンパイルエラーから。「imported and not used: sort」はソート処理を実装すれば解消します。「declared and not used」はif内の:=が原因です。`,
        `次にpanicを2つ。「assignment to entry in nil map」はmake、「index out of range」はループ条件 <= を確認しましょう。`,
        `最後に論理バグ。Atoiのエラーを無視するとbananaが0個の有効データになります（valid/invalidの数え方も直す）。表示順はキーをsort.Stringsで並べてから出力します。`
      ],
      expectedOutput: "最多:cherry(7)"
    }
  ]
});
