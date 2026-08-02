// 第7章：構造体とポインタ
registerChapter({
  number: 7,
  title: "構造体とポインタ",
  description: "複数のデータをまとめる構造体（struct）と、値の場所を指し示すポインタを学びます。値渡しとポインタ渡しの違いを体験し、Goらしいデータ設計の基礎を身につけます。",
  steps: [
    {
      id: 61,
      title: "structの定義",
      explanation: `<p>これまでスライスやマップで「同じ型の値の集まり」を扱ってきました。しかし現実のデータは「名前は文字列、年齢は数値」のように<strong>異なる型の値がひとまとまり</strong>になっています。これを表現するのが<strong>構造体（struct）</strong>です。</p>
<pre><code>type User struct {
    Name string
    Age  int
}</code></pre>
<p><code>type User struct { ... }</code>は「NameとAgeという<strong>フィールド</strong>（構造体の中の変数）を持つUserという新しい型を定義する」という意味です。関数の外（パッケージのトップレベル）に書くのが一般的です。</p>
<p>構造体の変数を<code>var u User</code>と宣言すると、各フィールドには<strong>ゼロ値</strong>（変数宣言時に自動で入る初期値）が入ります。</p>
<table>
<tr><th>フィールドの型</th><th>ゼロ値</th></tr>
<tr><td>string</td><td>""（空文字列）</td></tr>
<tr><td>int</td><td>0</td></tr>
<tr><td>bool</td><td>false</td></tr>
</table>
<p>フィールドへのアクセスは<code>u.Name</code>のように<strong>ドット</strong>を使います。読み取りも代入も同じ書き方です。</p>
<pre><code>var u User
u.Name = "Gopher" // 代入
fmt.Println(u.Name) // 読み取り</code></pre>
<p>フィールド名が大文字始まり（Nameなど）だと他のパッケージからも見える「公開フィールド」になります。今は1ファイルなのでどちらでも動きますが、慣習として覚えておきましょう。</p>`,
      task: `コードを実行してゼロ値を観察したあと、TODOの位置で<code>u.Name</code>に<code>"Gopher"</code>、<code>u.Age</code>に<code>13</code>を代入して、設定後の値が表示されるようにしてください。`,
      code: `package main

import "fmt"

// UserはNameとAgeを持つ構造体
type User struct {
	Name string
	Age  int
}

func main() {
	var u User
	fmt.Println("名前:", u.Name)
	fmt.Println("年齢:", u.Age)
	// TODO: ここでu.Nameに"Gopher"、u.Ageに13を代入する

	fmt.Println("設定後:", u.Name, u.Age)
}
`,
      solution: `package main

import "fmt"

// UserはNameとAgeを持つ構造体
type User struct {
	Name string
	Age  int
}

func main() {
	var u User
	fmt.Println("名前:", u.Name)
	fmt.Println("年齢:", u.Age)
	// フィールドにはドットでアクセスする
	u.Name = "Gopher"
	u.Age = 13

	fmt.Println("設定後:", u.Name, u.Age)
}
`,
      hints: [
        `フィールドへの代入は「変数名.フィールド名 = 値」の形です。`,
        `u.Name = "Gopher" のように2行書けばOKです。`
      ],
      expectedOutput: "設定後: Gopher 13"
    },
    {
      id: 62,
      title: "構造体リテラルとフィールドアクセス",
      explanation: `<p>前のステップでは<code>var</code>で宣言してから1つずつ代入しました。実際のコードでは<strong>構造体リテラル</strong>（複合リテラルとも呼びます）で、宣言と同時に値を入れるのが普通です。書き方は2種類あります。</p>
<h4>1. フィールド名を指定する形（推奨）</h4>
<pre><code>u := User{Name: "Alice", Age: 25}</code></pre>
<p>「どのフィールドに何を入れるか」が一目で分かり、フィールドの定義順を変えても壊れません。一部のフィールドだけ指定することもでき、省略したフィールドはゼロ値になります。</p>
<h4>2. 位置で指定する形</h4>
<pre><code>b := User{"Bob", 30} // 定義順にName, Ageへ</code></pre>
<p>短く書けますが、<strong>全フィールドを定義順どおり</strong>に並べる必要があり、フィールドが増えるとコンパイルエラーになります。フィールドが2〜3個の小さな構造体以外では避けるのが慣習です。</p>
<table>
<tr><th>書き方</th><th>長所</th><th>短所</th></tr>
<tr><td>フィールド名指定</td><td>読みやすい・順序に依存しない・一部省略可</td><td>やや長い</td></tr>
<tr><td>位置指定</td><td>短い</td><td>全フィールド必須・順序変更に弱い</td></tr>
</table>
<p>複数行で書くときは、最後のフィールドの後ろにもカンマが必要です（Goの文法上の決まりです）。</p>
<pre><code>u := User{
    Name: "Alice",
    Age:  25, // 最後にもカンマ
}</code></pre>`,
      task: `TODOの行を、フィールド名を指定した構造体リテラルに書き換えて、Nameが<code>"Alice"</code>、Ageが<code>25</code>のUserを作ってください。`,
      code: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

func main() {
	// TODO: フィールド名を指定したリテラルでNameが"Alice"、Ageが25のUserを作る
	u := User{}
	fmt.Printf("%sは%d歳です\\n", u.Name, u.Age)

	// 位置指定のリテラル（フィールド定義順に並べる）
	b := User{"Bob", 30}
	fmt.Printf("%sは%d歳です\\n", b.Name, b.Age)
}
`,
      solution: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

func main() {
	// フィールド名を指定したリテラル（推奨の書き方）
	u := User{Name: "Alice", Age: 25}
	fmt.Printf("%sは%d歳です\\n", u.Name, u.Age)

	// 位置指定のリテラル（フィールド定義順に並べる）
	b := User{"Bob", 30}
	fmt.Printf("%sは%d歳です\\n", b.Name, b.Age)
}
`,
      hints: [
        `波かっこの中に「フィールド名: 値」をカンマ区切りで並べます。`,
        `User{Name: "Alice", Age: 25} の形です。`
      ],
      expectedOutput: "Aliceは25歳です"
    },
    {
      id: 63,
      title: "ポインタの基本（&と*）",
      explanation: `<p><strong>ポインタ</strong>とは「値そのもの」ではなく「値が保存されているメモリ上の場所（アドレス）」を持つ変数です。ポインタを使うと、離れた場所から元の変数を直接読み書きできます。記号は2つだけです。</p>
<table>
<tr><th>記号</th><th>読み方</th><th>意味</th></tr>
<tr><td><code>&amp;x</code></td><td>アドレス演算子</td><td>変数xのアドレスを取り出す</td></tr>
<tr><td><code>*p</code></td><td>デリファレンス（間接参照）</td><td>ポインタpが指す先の値を読み書きする</td></tr>
</table>
<pre><code>x := 10
p := &amp;x         // pの型は*int（intへのポインタ）
fmt.Println(*p) // 10（pの指す先を読む）
*p = 20         // pの指す先に書き込む
fmt.Println(x)  // 20（xが書き換わっている！）</code></pre>
<p><code>*int</code>のように、型名の前に<code>*</code>を付けると「その型へのポインタ型」を表します。宣言の<code>*int</code>と、値を取り出す<code>*p</code>は同じ記号ですが役割が違う点に注意してください。</p>
<p>ポインタのゼロ値は<code>nil</code>（どこも指していない状態）です。nilのポインタに<code>*p</code>でアクセスすると実行時エラー（panic）になるので、関数から受け取ったポインタを使うときは注意が必要です。</p>
<p>「住所のメモ」に例えると、<code>&amp;x</code>は家（変数x）の住所をメモすること、<code>*p</code>はメモの住所へ実際に行って中身を見たり置いたりすることです。</p>`,
      task: `コードを実行してポインタの動きを観察し、TODOの位置で<code>*p</code>を使ってxの値を<code>20</code>に書き換えてください。`,
      code: `package main

import "fmt"

func main() {
	x := 10
	p := &x // xのアドレスを取り出す（pの型は*int）

	fmt.Println("xの値:", x)
	fmt.Println("xのアドレス:", p)
	fmt.Println("pが指す値:", *p)

	// TODO: *pを使ってxの値を20に書き換える

	fmt.Println("x =", x)
}
`,
      solution: `package main

import "fmt"

func main() {
	x := 10
	p := &x // xのアドレスを取り出す（pの型は*int）

	fmt.Println("xの値:", x)
	fmt.Println("xのアドレス:", p)
	fmt.Println("pが指す値:", *p)

	// pの指す先（つまりx）に20を書き込む
	*p = 20

	fmt.Println("x =", x)
}
`,
      hints: [
        `ポインタの指す先へ書き込むには、ポインタ名の前に*を付けて代入します。`,
        `*p = 20 と書くと、pが指しているx自体が書き換わります。`
      ],
      expectedOutput: "x = 20"
    },
    {
      id: 64,
      title: "関数に値渡しすると変更が反映されない（体験）",
      explanation: `<p>Goの関数の引数は<strong>すべて値渡し</strong>です。値渡しとは「引数の<strong>コピー</strong>が関数に渡される」ということです。構造体も例外ではなく、関数に渡すと構造体まるごとコピーされます。</p>
<pre><code>func birthday(u User) {
    u.Age = u.Age + 1 // コピーのAgeを変えているだけ
}

u := User{Name: "Gopher", Age: 13}
birthday(u)
fmt.Println(u.Age) // 13のまま！</code></pre>
<p>関数の中の<code>u</code>は、呼び出し元の<code>u</code>とは<strong>別物（コピー）</strong>です。だから関数の中でフィールドを書き換えても、呼び出し元には何も起きません。これはバグではなくGoの仕様で、「関数に渡した値が勝手に書き換えられない」という安全性でもあります。</p>
<table>
<tr><th>場所</th><th>変数の実体</th><th>Ageを変えた結果</th></tr>
<tr><td>関数の中のu</td><td>コピー</td><td>14になる（関数が終わると消える）</td></tr>
<tr><td>呼び出し元のu</td><td>本体</td><td>13のまま</td></tr>
</table>
<p>実は第6章までに使ってきたint、string、配列も同じく値渡しです（スライスやマップは内部にポインタを含むため、要素の変更が呼び出し元に見えるという違いがありました）。</p>
<p>「じゃあ関数の中から呼び出し元の構造体を変更したいときは？」——それを解決するのが前ステップで学んだポインタです。次のステップで実際に直します。</p>`,
      task: `コードをそのまま実行し、関数の中では14になるのに、関数の外では13のままであることを観察してください。観察できたら、初期のAgeを別の数値に変えて再実行してみましょう。`,
      code: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// birthdayは引数のコピーを受け取る（値渡し）
func birthday(u User) {
	u.Age = u.Age + 1
	fmt.Println("関数の中:", u.Age)
}

func main() {
	u := User{Name: "Gopher", Age: 13}
	birthday(u)
	fmt.Println("関数の外:", u.Age) // 変わっていない！
}
`,
      solution: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// birthdayは引数のコピーを受け取る（値渡し）
func birthday(u User) {
	u.Age = u.Age + 1
	fmt.Println("関数の中:", u.Age)
}

func main() {
	u := User{Name: "Gopher", Age: 13}
	birthday(u)
	fmt.Println("関数の外:", u.Age) // 変わっていない！
}
`,
      hints: [
        `このステップは修正不要です。まず実行して2つの出力の違いを確認しましょう。`,
        `関数の中の変更が外に反映されないのは、構造体がコピーされて渡されるからです。`
      ],
      expectedOutput: "関数の外: 13"
    },
    {
      id: 65,
      title: "ポインタ渡しで変更を反映する",
      explanation: `<p>前のステップの問題を解決します。関数の中から呼び出し元の構造体を変更するには、構造体そのものではなく<strong>構造体のアドレス（ポインタ）を渡します</strong>。</p>
<pre><code>func birthday(u *User) { // *User型＝Userへのポインタを受け取る
    u.Age = u.Age + 1
}

u := User{Name: "Gopher", Age: 13}
birthday(&amp;u) // &amp;でアドレスを渡す
fmt.Println(u.Age) // 14に変わった！</code></pre>
<p>変更点は2つだけです。</p>
<ol>
<li>関数の引数の型を<code>User</code>から<code>*User</code>に変える</li>
<li>呼び出し側で<code>birthday(&amp;u)</code>と<code>&amp;</code>を付けて渡す</li>
</ol>
<p>厳密に言うとこれも「ポインタという値のコピー」を渡す値渡しです。しかしコピーされたポインタも<strong>同じ場所を指している</strong>ので、その先を書き換えれば呼び出し元に反映されます。「住所のメモをコピーして渡しても、行き先の家は同じ」というイメージです。</p>
<table>
<tr><th>渡し方</th><th>引数の型</th><th>呼び出し</th><th>変更の反映</th></tr>
<tr><td>値渡し</td><td>User</td><td>birthday(u)</td><td>されない</td></tr>
<tr><td>ポインタ渡し</td><td>*User</td><td>birthday(&amp;u)</td><td>される</td></tr>
</table>
<p>もう1つの利点は<strong>コピーのコストを避けられる</strong>ことです。フィールドが多い大きな構造体でも、ポインタなら8バイト程度を渡すだけで済みます。</p>`,
      task: `前ステップのコードを修正します。<code>birthday</code>の引数を<code>*User</code>に変え、呼び出しを<code>birthday(&amp;u)</code>にして、関数の外でも14になるようにしてください。`,
      code: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// TODO: 引数の型をUserから*Userに変える
func birthday(u User) {
	u.Age = u.Age + 1
	fmt.Println("関数の中:", u.Age)
}

func main() {
	u := User{Name: "Gopher", Age: 13}
	// TODO: &を付けてアドレスを渡す
	birthday(u)
	fmt.Println("関数の外:", u.Age)
}
`,
      solution: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// *User型（Userへのポインタ）を受け取る
func birthday(u *User) {
	u.Age = u.Age + 1
	fmt.Println("関数の中:", u.Age)
}

func main() {
	u := User{Name: "Gopher", Age: 13}
	// &uでアドレスを渡すと、関数の中の変更が反映される
	birthday(&u)
	fmt.Println("関数の外:", u.Age)
}
`,
      hints: [
        `修正箇所は「引数の型」と「呼び出し時の渡し方」の2か所です。`,
        `func birthday(u *User) にして、birthday(&u) と呼び出します。`
      ],
      expectedOutput: "関数の外: 14"
    },
    {
      id: 66,
      title: "構造体のポインタ（自動デリファレンス）",
      explanation: `<p>前のステップの関数の中で、<code>u.Age = u.Age + 1</code>と書けたことに気づいたでしょうか。<code>u</code>は<code>*User</code>（ポインタ）なのに、<code>*</code>を付けずにフィールドへアクセスできています。</p>
<p>本来、ポインタ経由でフィールドにアクセスするには「まず指す先を取り出してからドット」という手順が必要で、正確には次のように書きます。</p>
<pre><code>p := &amp;u
(*p).Age = 14 // 正式な書き方</code></pre>
<p>しかし毎回<code>(*p)</code>と書くのは面倒なので、Goでは<strong>構造体のポインタに対してはドットだけでフィールドにアクセスできる</strong>ようになっています。コンパイラが自動で<code>(*p)</code>に読み替えてくれるのです（自動デリファレンス）。</p>
<pre><code>p.Age = 14 // (*p).Age = 14と同じ意味。こちらが普通の書き方</code></pre>
<table>
<tr><th>書き方</th><th>意味</th><th>使うか</th></tr>
<tr><td>(*p).Age</td><td>正式な書き方</td><td>ほぼ書かない</td></tr>
<tr><td>p.Age</td><td>自動デリファレンスによる省略形</td><td>常にこちら</td></tr>
</table>
<p>つまり構造体を扱うコードでは、変数が<code>User</code>でも<code>*User</code>でも<strong>見た目は同じ<code>u.Age</code></strong>になります。これはコードを簡潔にする一方、「この変数はポインタか？変更は呼び出し元に影響するか？」を意識して読む必要があるということでもあります。関数の引数の型を見る習慣をつけましょう。</p>`,
      task: `コードを実行して<code>(*p).Age</code>が動くことを確認したあと、TODOの行を省略形<code>p.Age = 14</code>に書き換えて、同じ結果になることを確かめてください。`,
      code: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

func main() {
	u := User{Name: "Gopher", Age: 13}
	p := &u // 構造体のポインタ

	// TODO: この行を省略形 p.Age = 14 に書き換える
	(*p).Age = 14

	fmt.Println("更新後:", u.Name, u.Age)
}
`,
      solution: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

func main() {
	u := User{Name: "Gopher", Age: 13}
	p := &u // 構造体のポインタ

	// 構造体のポインタはドットだけでフィールドにアクセスできる
	p.Age = 14

	fmt.Println("更新後:", u.Name, u.Age)
}
`,
      hints: [
        `構造体のポインタでは(*p)を書かずに、直接ドットでアクセスできます。`,
        `(*p).Age を p.Age に置き換えるだけです。動きは同じです。`
      ],
      expectedOutput: "更新後: Gopher 14"
    },
    {
      id: 67,
      title: "ネストした構造体",
      explanation: `<p>構造体のフィールドには、int やstringだけでなく<strong>別の構造体</strong>も入れられます。これを<strong>ネスト（入れ子）</strong>と呼び、現実のデータ構造を素直に表現できます。</p>
<pre><code>type Address struct {
    City string
    Zip  string
}

type User struct {
    Name string
    Addr Address // 構造体のフィールドに構造体
}</code></pre>
<p>リテラルで初期化するときは、内側の構造体もリテラルで書きます。</p>
<pre><code>u := User{
    Name: "Gopher",
    Addr: Address{City: "Tokyo", Zip: "100-0001"},
}</code></pre>
<p>アクセスはドットをつなげるだけです。</p>
<pre><code>fmt.Println(u.Addr.City) // Tokyo
u.Addr.Zip = "150-0002"  // 書き換えもドットをつなげる</code></pre>
<p>ネストは何段でも可能ですが、深くなりすぎると読みにくくなります。実務では2〜3段までに収まる設計が多いです。</p>
<p>なお、フィールドを構造体の<strong>ポインタ</strong>（<code>Addr *Address</code>）にすることもできます。その場合ゼロ値はnilになるため、アクセス前にnilチェックが必要になります。まずは今回のようにポインタでないネストから使いこなしましょう。JSONのような階層データをGoで扱うとき、このネスト構造がそのまま対応します。</p>`,
      task: `TODOの位置で、Nameが<code>"Gopher"</code>、Addrが<code>City: "Tokyo"、Zip: "100-0001"</code>のUserをリテラルで作り、都市名を出力してください。`,
      code: `package main

import "fmt"

type Address struct {
	City string
	Zip  string
}

type User struct {
	Name string
	Addr Address
}

func main() {
	// TODO: Nameが"Gopher"、AddrがCity"Tokyo"とZip"100-0001"のUserを作る
	u := User{}

	fmt.Println("都市:", u.Addr.City)
	fmt.Println("郵便番号:", u.Addr.Zip)
}
`,
      solution: `package main

import "fmt"

type Address struct {
	City string
	Zip  string
}

type User struct {
	Name string
	Addr Address
}

func main() {
	// 内側の構造体もリテラルで初期化する
	u := User{
		Name: "Gopher",
		Addr: Address{City: "Tokyo", Zip: "100-0001"},
	}

	fmt.Println("都市:", u.Addr.City)
	fmt.Println("郵便番号:", u.Addr.Zip)
}
`,
      hints: [
        `Addrフィールドの値としてAddress{...}のリテラルを書きます。`,
        `Addr: Address{City: "Tokyo", Zip: "100-0001"}, の形です。複数行で書く場合は各行末のカンマを忘れずに。`
      ],
      expectedOutput: "都市: Tokyo"
    },
    {
      id: 68,
      title: "構造体の埋め込み（コンポジション）",
      explanation: `<p>前のステップの<code>Addr Address</code>は「フィールド名を付けたネスト」でした。Goにはもう1つ、<strong>フィールド名を書かずに型名だけを書く</strong>方法があります。これを<strong>埋め込み（embedding）</strong>と呼びます。</p>
<pre><code>type User struct {
    Name string
    Age  int
}

type Employee struct {
    User    // フィールド名なし＝埋め込み
    Company string
}</code></pre>
<p>埋め込むと、内側の型のフィールドを<strong>外側の型のフィールドのように直接アクセス</strong>できます。これを<strong>フィールドの昇格</strong>と呼びます。</p>
<pre><code>e := Employee{
    User:    User{Name: "Gopher", Age: 13},
    Company: "Acme",
}
fmt.Println(e.Name)      // e.User.Nameの省略形（昇格）
fmt.Println(e.User.Name) // 正式な書き方も使える</code></pre>
<p>リテラルで初期化するときは、埋め込んだ型の<strong>型名がそのままフィールド名</strong>になる点に注意してください（<code>User: User{...}</code>）。</p>
<table>
<tr><th>方式</th><th>書き方</th><th>アクセス</th></tr>
<tr><td>ネスト</td><td>Addr Address</td><td>u.Addr.City</td></tr>
<tr><td>埋め込み</td><td>User</td><td>e.Name（昇格）またはe.User.Name</td></tr>
</table>
<p>他言語の「継承」に似て見えますが、Goのこれは<strong>コンポジション（合成）</strong>です。「EmployeeはUserである」ではなく「EmployeeはUserを部品として持つ」と考えます。Goには継承がなく、この合成で型を組み立てるのがGo流の設計です。</p>`,
      task: `Employee構造体にUserを<strong>埋め込み</strong>（フィールド名なしで<code>User</code>とだけ書く）、昇格したフィールド<code>e.Name</code>で名前を出力できるようにしてください。`,
      code: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// TODO: Userをフィールド名なしで埋め込む
type Employee struct {
	Company string
}

func main() {
	e := Employee{
		// TODO: User: User{Name: "Gopher", Age: 13}, を追加する
		Company: "Acme",
	}

	fmt.Println("昇格したフィールド:", e.Name)
	fmt.Println("正式な書き方:", e.User.Name)
	fmt.Printf("%sは%sに勤務\\n", e.Name, e.Company)
}
`,
      solution: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// フィールド名を書かずに型名だけを書くと「埋め込み」になる
type Employee struct {
	User
	Company string
}

func main() {
	e := Employee{
		User:    User{Name: "Gopher", Age: 13},
		Company: "Acme",
	}

	fmt.Println("昇格したフィールド:", e.Name)
	fmt.Println("正式な書き方:", e.User.Name)
	fmt.Printf("%sは%sに勤務\\n", e.Name, e.Company)
}
`,
      hints: [
        `埋め込みは、構造体の中に型名だけを1行書きます（フィールド名を付けない）。`,
        `リテラルでは型名をフィールド名として使います：User: User{Name: "Gopher", Age: 13},`
      ],
      expectedOutput: "GopherはAcmeに勤務"
    },
    {
      id: 69,
      title: "コンストラクタ関数の慣習（NewUser）",
      explanation: `<p>Goには他言語のような「コンストラクタ」構文はありません。その代わり、<strong>構造体を作って返す普通の関数</strong>を用意するのが慣習です。名前は<code>New + 型名</code>（例：<code>NewUser</code>）とします。</p>
<pre><code>func NewUser(name string, age int) *User {
    if age &lt; 0 {
        age = 0 // 不正な値を補正する
    }
    return &amp;User{Name: name, Age: age}
}</code></pre>
<p>ポイントは3つあります。</p>
<ol>
<li><strong>検証や初期化のロジックを1か所に集められる</strong>。リテラルを直接書くと検証を忘れがちですが、NewUser経由なら必ず通ります。</li>
<li><strong>戻り値はポインタ（*User）にするのが一般的</strong>。呼び出し側でそのまま変更を共有でき、大きな構造体のコピーも避けられます。</li>
<li><code>return &amp;User{...}</code>のように<strong>関数内で作った構造体のアドレスを返しても安全</strong>です。C言語などと違い、Goはまだ使われている値を関数終了後も自動で生かしておいてくれます（エスケープ解析という仕組み）。</li>
</ol>
<table>
<tr><th>作り方</th><th>向いている場面</th></tr>
<tr><td>リテラル User{...}</td><td>検証不要でフィールドをそのまま入れるだけのとき</td></tr>
<tr><td>New関数</td><td>初期値の計算・検証・共通の初期化が必要なとき</td></tr>
</table>
<p>パッケージを分けるようになると「小文字始まりの非公開フィールドを外部から安全に初期化させる入口」としても重要になります。</p>`,
      task: `TODOの位置に<code>NewUser</code>関数の中身を実装してください。ageが負の数なら0に補正してから、<code>&amp;User{...}</code>を返します。`,
      code: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// NewUserはUserを作って返すコンストラクタ関数
func NewUser(name string, age int) *User {
	// TODO: ageが負の数なら0に補正し、&User{...}を返す
	return nil
}

func main() {
	u := NewUser("Alice", 30)
	fmt.Println("作成:", u.Name, u.Age)

	v := NewUser("Bob", -5)
	fmt.Println("補正:", v.Name, v.Age)
}
`,
      solution: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// NewUserはUserを作って返すコンストラクタ関数
func NewUser(name string, age int) *User {
	if age < 0 {
		age = 0 // 不正な値はここで補正する
	}
	return &User{Name: name, Age: age}
}

func main() {
	u := NewUser("Alice", 30)
	fmt.Println("作成:", u.Name, u.Age)

	v := NewUser("Bob", -5)
	fmt.Println("補正:", v.Name, v.Age)
}
`,
      hints: [
        `まずif文でageが0未満かどうか調べ、0未満なら0を代入します。`,
        `最後にreturn &User{Name: name, Age: age}と書きます。関数内で作った構造体のアドレスを返しても安全です。`
      ],
      expectedOutput: "作成: Alice 30"
    },
    {
      id: 70,
      title: "総合演習（Rectangleの面積・比較）",
      explanation: `<p>この章の総仕上げとして、長方形を表す<code>Rectangle</code>構造体を使った小さなプログラムを完成させます。使う知識はすべてこの章で学んだものです。</p>
<ul>
<li><strong>structの定義とリテラル</strong>（ステップ61〜62）</li>
<li><strong>値渡しの関数</strong>：面積の計算は元の構造体を変更しないので、値渡しで十分です（ステップ64）</li>
<li><strong>ポインタ渡しの関数</strong>：拡大は元の構造体を書き換えたいので、ポインタで受け取ります（ステップ65〜66）</li>
</ul>
<p>もう1つ、この演習で新しく使うのが<strong>構造体の比較</strong>です。フィールドがすべて比較可能な型（int、stringなど）なら、構造体同士を<code>==</code>で比較できます。<strong>全フィールドが等しいときだけtrue</strong>になります。</p>
<pre><code>a := Rectangle{Width: 8, Height: 10}
b := Rectangle{Width: 8, Height: 10}
fmt.Println(a == b) // true（全フィールドが一致）</code></pre>
<p>ただしフィールドにスライスやマップを含む構造体は<code>==</code>で比較できず、コンパイルエラーになります（スライス・マップ自体が比較不可のため）。</p>
<table>
<tr><th>関数</th><th>受け取り方</th><th>理由</th></tr>
<tr><td>area</td><td>Rectangle（値）</td><td>読むだけで変更しない</td></tr>
<tr><td>scale</td><td>*Rectangle（ポインタ）</td><td>元の構造体を書き換える</td></tr>
</table>
<p>「変更しない関数は値渡し、変更する関数はポインタ渡し」という使い分けは、次章のメソッドのレシーバ選びにもそのままつながる重要な感覚です。</p>`,
      task: `2つのTODOを実装してください。<code>area</code>は幅×高さを返し、<code>scale</code>はポインタ経由で幅と高さをfactor倍に書き換えます。実装後、拡大後の面積が80になることを確認しましょう。`,
      code: `package main

import "fmt"

type Rectangle struct {
	Width  int
	Height int
}

// areaは面積を返す（変更しないので値渡し）
func area(r Rectangle) int {
	// TODO: 幅×高さを返す
	return 0
}

// scaleは幅と高さをfactor倍にする（変更するのでポインタ渡し）
func scale(r *Rectangle, factor int) {
	// TODO: r.Widthとr.Heightをfactor倍に書き換える
}

func main() {
	r1 := Rectangle{Width: 4, Height: 5}
	fmt.Println("面積:", area(r1))

	scale(&r1, 2)
	fmt.Println("拡大後の面積:", area(r1))

	r2 := Rectangle{Width: 8, Height: 10}
	fmt.Println("r1とr2は同じ:", r1 == r2)
}
`,
      solution: `package main

import "fmt"

type Rectangle struct {
	Width  int
	Height int
}

// areaは面積を返す（変更しないので値渡し）
func area(r Rectangle) int {
	return r.Width * r.Height
}

// scaleは幅と高さをfactor倍にする（変更するのでポインタ渡し）
func scale(r *Rectangle, factor int) {
	r.Width = r.Width * factor
	r.Height = r.Height * factor
}

func main() {
	r1 := Rectangle{Width: 4, Height: 5}
	fmt.Println("面積:", area(r1))

	scale(&r1, 2)
	fmt.Println("拡大後の面積:", area(r1))

	r2 := Rectangle{Width: 8, Height: 10}
	fmt.Println("r1とr2は同じ:", r1 == r2)
}
`,
      hints: [
        `areaはreturn r.Width * r.Heightの1行です。`,
        `scaleはポインタ経由でもドットでフィールドにアクセスできます：r.Width = r.Width * factor`,
        `4×5の長方形を2倍にすると8×10になり、面積は80、r2と一致してtrueになります。`
      ],
      expectedOutput: "拡大後の面積: 80"
    }
  ]
});
