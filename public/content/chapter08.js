// 第8章：メソッドとレシーバ
registerChapter({
  number: 8,
  title: "メソッドとレシーバ",
  description: "型に振る舞いを持たせるメソッドと、その受け手であるレシーバを学びます。値レシーバとポインタレシーバの使い分けを体験し、Goらしい型設計の土台を固めます。",
  steps: [
    {
      id: 71,
      title: "メソッドの定義（値レシーバ）",
      explanation: `<p>第7章では<code>area(r Rectangle)</code>のように「構造体を引数に取る関数」を書きました。Goでは、この関数を型に<strong>所属させる</strong>ことができます。それが<strong>メソッド</strong>です。</p>
<pre><code>// 関数版
func area(r Rectangle) int {
    return r.Width * r.Height
}

// メソッド版
func (r Rectangle) Area() int {
    return r.Width * r.Height
}</code></pre>
<p>違いは<code>func</code>と関数名の間にある<code>(r Rectangle)</code>だけです。これを<strong>レシーバ</strong>（receiver：メソッドの受け手）と呼びます。「Rectangle型の値rに対して呼び出せるArea」という意味になります。</p>
<p>呼び出し方は、フィールドアクセスと同じドット記法です。</p>
<pre><code>r := Rectangle{Width: 10, Height: 5}
fmt.Println(r.Area()) // 50</code></pre>
<table>
<tr><th></th><th>関数</th><th>メソッド</th></tr>
<tr><td>定義</td><td>func area(r Rectangle) int</td><td>func (r Rectangle) Area() int</td></tr>
<tr><td>呼び出し</td><td>area(r)</td><td>r.Area()</td></tr>
<tr><td>所属</td><td>どの型にも属さない</td><td>Rectangle型に属する</td></tr>
</table>
<p>今回のようにレシーバを値で受け取る形を<strong>値レシーバ</strong>と呼びます。関数の値渡しと同じく、レシーバには<strong>コピー</strong>が渡されます。メソッドにすると「その型に何ができるか」が型の近くにまとまり、<code>r.Area()</code>のように読み下せるコードになります。</p>`,
      task: `関数<code>area</code>をRectangle型の<strong>メソッド</strong><code>Area</code>に書き換え、<code>r.Area()</code>で呼び出せるようにしてください。`,
      code: `package main

import "fmt"

type Rectangle struct {
	Width  int
	Height int
}

// TODO: この関数をRectangleのメソッドAreaに書き換える
// ヒント: funcの直後にレシーバ(r Rectangle)を書く
func area(r Rectangle) int {
	return r.Width * r.Height
}

func main() {
	r := Rectangle{Width: 10, Height: 5}
	// TODO: r.Area()で呼び出す形に変える
	fmt.Println("面積:", area(r))
}
`,
      solution: `package main

import "fmt"

type Rectangle struct {
	Width  int
	Height int
}

// (r Rectangle)がレシーバ。Rectangle型に属するメソッドになる
func (r Rectangle) Area() int {
	return r.Width * r.Height
}

func main() {
	r := Rectangle{Width: 10, Height: 5}
	fmt.Println("面積:", r.Area())
}
`,
      hints: [
        `メソッドはfunc (レシーバ名 型名) メソッド名() 戻り値型 { ... }の形で定義します。`,
        `func (r Rectangle) Area() int と書き、呼び出しはr.Area()です。`
      ],
      expectedOutput: "面積: 50"
    },
    {
      id: 72,
      title: "ポインタレシーバ",
      explanation: `<p>値レシーバはコピーを受け取るため、レシーバのフィールドを書き換えても呼び出し元には反映されません。第7章の値渡しとまったく同じ問題です。解決方法も同じで、レシーバを<strong>ポインタ</strong>にします。これが<strong>ポインタレシーバ</strong>です。</p>
<pre><code>// ポインタレシーバ：呼び出し元のRectangleを直接書き換えられる
func (r *Rectangle) Scale(factor int) {
    r.Width = r.Width * factor
    r.Height = r.Height * factor
}</code></pre>
<p>レシーバの型を<code>*Rectangle</code>にするだけです。メソッドの中では自動デリファレンス（ステップ66）が効くので、<code>r.Width</code>とそのまま書けます。</p>
<p>呼び出し側にはうれしい省略があります。本来は<code>(&amp;r).Scale(2)</code>と書くところを、Goが自動でアドレスを取ってくれるため、こう書けます。</p>
<pre><code>r := Rectangle{Width: 10, Height: 5}
r.Scale(2) // (&amp;r).Scale(2)と同じ意味。&amp;は書かなくてよい
fmt.Println(r.Width) // 20に変わっている</code></pre>
<table>
<tr><th>レシーバ</th><th>定義</th><th>フィールド変更</th></tr>
<tr><td>値レシーバ</td><td>func (r Rectangle) Area() int</td><td>呼び出し元に反映されない</td></tr>
<tr><td>ポインタレシーバ</td><td>func (r *Rectangle) Scale(factor int)</td><td>呼び出し元に反映される</td></tr>
</table>
<p>1つの型に値レシーバのメソッドとポインタレシーバのメソッドを混在させることは文法上可能ですが、Goの慣習では<strong>1つの型のレシーバはどちらかに統一する</strong>のが望ましいとされます（詳しくはステップ79で扱います）。</p>`,
      task: `TODOの位置に、ポインタレシーバのメソッド<code>Scale</code>を実装してください。幅と高さをfactor倍に書き換えます。`,
      code: `package main

import "fmt"

type Rectangle struct {
	Width  int
	Height int
}

func (r Rectangle) Area() int {
	return r.Width * r.Height
}

// TODO: ポインタレシーバ(r *Rectangle)のメソッドScale(factor int)を定義し、
// WidthとHeightをfactor倍に書き換える

func main() {
	r := Rectangle{Width: 10, Height: 5}
	r.Scale(2) // (&r).Scale(2)の省略形
	fmt.Println("拡大後の幅:", r.Width)
	fmt.Println("拡大後の面積:", r.Area())
}
`,
      solution: `package main

import "fmt"

type Rectangle struct {
	Width  int
	Height int
}

func (r Rectangle) Area() int {
	return r.Width * r.Height
}

// ポインタレシーバなら呼び出し元のRectangleを直接書き換えられる
func (r *Rectangle) Scale(factor int) {
	r.Width = r.Width * factor
	r.Height = r.Height * factor
}

func main() {
	r := Rectangle{Width: 10, Height: 5}
	r.Scale(2) // (&r).Scale(2)の省略形
	fmt.Println("拡大後の幅:", r.Width)
	fmt.Println("拡大後の面積:", r.Area())
}
`,
      hints: [
        `レシーバの型を*Rectangleにすると、メソッド内の変更が呼び出し元に反映されます。`,
        `func (r *Rectangle) Scale(factor int) { r.Width = r.Width * factor ... }の形です。`
      ],
      expectedOutput: "拡大後の幅: 20"
    },
    {
      id: 73,
      title: "値レシーバとポインタレシーバの使い分け（罠の体験と修正）",
      explanation: `<p>レシーバの選び間違いは、Go初心者が最もハマりやすいバグの1つです。まず罠を体験しましょう。次のコードは一見正しそうですが、動きません。</p>
<pre><code>func (u User) SetAge(age int) { // 値レシーバ
    u.Age = age // コピーを書き換えているだけ！
}

u := User{Name: "Alice", Age: 18}
u.SetAge(20)
fmt.Println(u.Age) // 18のまま。エラーも警告も出ない</code></pre>
<p>恐ろしいのは<strong>コンパイルエラーにならない</strong>ことです。コードは正常に動いているように見えて、変更だけが静かに消えます。原因は値レシーバがコピーを受け取ることです。修正はレシーバを<code>*User</code>にするだけです。</p>
<p>使い分けの基準を整理します。</p>
<table>
<tr><th>状況</th><th>選ぶレシーバ</th></tr>
<tr><td>フィールドを変更する</td><td>ポインタレシーバ</td></tr>
<tr><td>構造体が大きい（コピーが重い）</td><td>ポインタレシーバ</td></tr>
<tr><td>読み取りだけの小さな構造体</td><td>値レシーバ</td></tr>
<tr><td>迷ったら</td><td>ポインタレシーバ</td></tr>
</table>
<p>「Set〜」「Add〜」「Update〜」のような<strong>状態を変える名前のメソッドが値レシーバだったら要注意</strong>、というのがコードレビューでの定番チェックポイントです。自分で書くときも、メソッド名とレシーバの種類が食い違っていないか確認する習慣をつけましょう。</p>`,
      task: `まず実行して、<code>SetAge(20)</code>を呼んだのにAgeが18のままであることを観察してください。その後、レシーバを<code>*User</code>に修正して20になるようにしてください。`,
      code: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// TODO: まず実行して変更が消えることを確認し、
// その後レシーバを*Userに修正する
func (u User) SetAge(age int) {
	u.Age = age
}

func main() {
	u := User{Name: "Alice", Age: 18}
	u.SetAge(20)
	fmt.Println("変更後:", u.Age)
}
`,
      solution: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// フィールドを変更するメソッドはポインタレシーバにする
func (u *User) SetAge(age int) {
	u.Age = age
}

func main() {
	u := User{Name: "Alice", Age: 18}
	u.SetAge(20)
	fmt.Println("変更後:", u.Age)
}
`,
      hints: [
        `値レシーバはコピーを受け取るので、フィールドへの代入は呼び出し元に届きません。`,
        `レシーバの型をUserから*Userに変えるだけで直ります。呼び出し側のu.SetAge(20)はそのままで動きます。`
      ],
      expectedOutput: "変更後: 20"
    },
    {
      id: 74,
      title: "任意の型にメソッドを定義（type MyInt int）",
      explanation: `<p>メソッドを定義できるのは構造体だけではありません。<code>type</code>で定義した型なら、intやstringを元にした型にもメソッドを付けられます。</p>
<pre><code>type MyInt int // intを元にした新しい型

func (m MyInt) IsEven() bool {
    return m%2 == 0
}</code></pre>
<p>ただし重要な制約があります。<strong>メソッドは同じパッケージ内で定義した型にしか付けられません</strong>。組み込みのintそのものや、他のパッケージの型に直接メソッドを追加することはできないのです。だからこそ<code>type MyInt int</code>のように、いったん自分の型を定義します。</p>
<p><code>MyInt</code>と<code>int</code>は元が同じでも<strong>別の型</strong>として扱われるため、混ぜて使うには型変換が必要です。</p>
<pre><code>n := MyInt(10)      // intからMyIntへ変換
x := 5
// n + x はコンパイルエラー（型が違う）
y := n + MyInt(x)   // 変換すれば計算できる</code></pre>
<p>この仕組みの実用例は標準ライブラリにもあります。たとえば<code>time.Duration</code>はint64を元にした型で、<code>Seconds()</code>などのメソッドを持っています。</p>
<table>
<tr><th>できること</th><th>できないこと</th></tr>
<tr><td>自分で定義した型にメソッドを付ける</td><td>組み込み型intに直接メソッドを付ける</td></tr>
<tr><td>MyInt同士の演算（元がintなので%や*が使える）</td><td>MyIntとintを変換なしで混ぜる</td></tr>
</table>
<p>「値に意味と振る舞いを持たせたいとき、専用の型を作る」——これはGoらしい設計の第一歩です。</p>`,
      task: `TODOの位置に、MyIntのメソッド<code>Double</code>（自分を2倍したMyIntを返す）を実装してください。<code>IsEven</code>の実装を参考にできます。`,
      code: `package main

import "fmt"

// MyIntはintを元にした独自の型
type MyInt int

// IsEvenは偶数ならtrueを返す
func (m MyInt) IsEven() bool {
	return m%2 == 0
}

// TODO: 自分を2倍したMyIntを返すメソッドDoubleを定義する

func main() {
	n := MyInt(10)
	fmt.Println("2倍:", n.Double())
	fmt.Println("偶数?", n.IsEven())
	fmt.Println("7は偶数?", MyInt(7).IsEven())
}
`,
      solution: `package main

import "fmt"

// MyIntはintを元にした独自の型
type MyInt int

// IsEvenは偶数ならtrueを返す
func (m MyInt) IsEven() bool {
	return m%2 == 0
}

// Doubleは自分を2倍した値を返す
func (m MyInt) Double() MyInt {
	return m * 2
}

func main() {
	n := MyInt(10)
	fmt.Println("2倍:", n.Double())
	fmt.Println("偶数?", n.IsEven())
	fmt.Println("7は偶数?", MyInt(7).IsEven())
}
`,
      hints: [
        `構造体のときと同じ形で、レシーバの型をMyIntにしてメソッドを定義します。`,
        `func (m MyInt) Double() MyInt { return m * 2 }のように、戻り値の型もMyIntにします。`
      ],
      expectedOutput: "2倍: 20"
    },
    {
      id: 75,
      title: "メソッドチェーン",
      explanation: `<p>メソッドが<strong>レシーバ自身（のポインタ）を返す</strong>ように作ると、ドットで呼び出しをつなげられます。これを<strong>メソッドチェーン</strong>と呼びます。</p>
<pre><code>type Counter struct {
    Total int
}

func (c *Counter) Add(n int) *Counter {
    c.Total = c.Total + n
    return c // 自分自身を返すのがポイント
}</code></pre>
<p><code>Add</code>が<code>*Counter</code>を返すので、その戻り値に対してさらに<code>.Add()</code>を呼べます。</p>
<pre><code>c := &amp;Counter{}
c.Add(1).Add(2).Add(3)
fmt.Println(c.Total) // 6</code></pre>
<p>処理の流れを読むと「c.Add(1)がcを返す→そのcに.Add(2)→さらに.Add(3)」と、同じcに対して順番に実行されているだけです。1行で設定を積み重ねるビルダーと呼ばれる作り方などで使われ、標準ライブラリでもstringsパッケージのReplacerなどで似た形を見かけます。</p>
<p>注意点もあります。</p>
<ul>
<li>戻り値の型を書き忘れる（<code>return c</code>だけ書いて型がない）とコンパイルエラーになります。エラーメッセージを読んで直す練習にもなります。</li>
<li>チェーンが長くなりすぎると、途中でエラー処理を挟めず読みにくくなります。Goでは何でもチェーンにするより、<strong>素直に複数行で書く方が好まれる</strong>場面も多いです。「できるから使う」ではなく「読みやすくなるなら使う」と考えましょう。</li>
</ul>`,
      task: `このコードはコンパイルエラーになります。エラーメッセージを確認したあと、<code>Add</code>が<code>*Counter</code>（自分自身）を返すように修正して、チェーン呼び出しを動くようにしてください。`,
      code: `package main

import "fmt"

type Counter struct {
	Total int
}

// TODO: 戻り値の型を*Counterにして、最後にreturn cを追加する
func (c *Counter) Add(n int) {
	c.Total = c.Total + n
}

func main() {
	c := &Counter{}
	// Addが何も返さないため、この行はコンパイルエラーになる
	c.Add(1).Add(2).Add(3)
	fmt.Println("合計:", c.Total)
}
`,
      solution: `package main

import "fmt"

type Counter struct {
	Total int
}

// 自分自身を返すことでメソッドチェーンが可能になる
func (c *Counter) Add(n int) *Counter {
	c.Total = c.Total + n
	return c
}

func main() {
	c := &Counter{}
	c.Add(1).Add(2).Add(3)
	fmt.Println("合計:", c.Total)
}
`,
      hints: [
        `チェーンするには、メソッドが「次の呼び出しの対象」を返す必要があります。`,
        `シグネチャをfunc (c *Counter) Add(n int) *Counterにして、本体の最後にreturn cを書きます。`
      ],
      expectedOutput: "合計: 6"
    },
    {
      id: 76,
      title: "Stringerの前振り：String()メソッド",
      explanation: `<p>構造体を<code>fmt.Println</code>で表示すると<code>{25}</code>のような素っ気ない形式になります。実はここで、ある名前のメソッドを定義すると表示を自分で決められます。それが<code>String() string</code>メソッドです。</p>
<pre><code>type Temperature struct {
    Celsius float64
}

func (t Temperature) String() string {
    return fmt.Sprintf("%.1f度", t.Celsius)
}

t := Temperature{Celsius: 25.0}
fmt.Println(t) // 25.0度 ←String()の結果が使われる！</code></pre>
<p>不思議なのは、<strong>String()をどこからも呼んでいない</strong>のに出力が変わることです。fmtパッケージは値を表示する前に「この値はString() stringメソッドを持っているか？」を調べ、持っていれば自動でそれを呼びます。<code>fmt.Sprintf("%v", t)</code>や文字列連結ではない<code>Println</code>の引数でも同じことが起きます。</p>
<p>2つ注意点があります。</p>
<ul>
<li>メソッド名は<strong>正確に<code>String</code></strong>、戻り値は<strong>正確に<code>string</code></strong>である必要があります。<code>ToString</code>では反応しません。</li>
<li>String()の中で<code>fmt.Sprintf("%v", t)</code>のように自分自身を書式化すると、String()が無限に呼ばれ続けて実行時エラーになります。フィールド（<code>t.Celsius</code>）を直接書式化しましょう。</li>
</ul>
<p>「なぜfmtは他人が作った型のメソッドを見つけて呼べるのか？」——この仕組みの正体は<strong>インターフェース</strong>という機能で、第9章でじっくり学びます。この章では「そういう現象が起きる」という観察に留めておきましょう。</p>`,
      task: `まず実行して<code>{25}</code>と表示されることを確認してください。その後、TODOの位置に<code>String()</code>メソッドを追加して、<code>25.0度</code>と表示されるようにしてください。`,
      code: `package main

import "fmt"

type Temperature struct {
	Celsius float64
}

// TODO: まず実行して{25}と表示されるのを確認し、
// その後String() stringメソッドを追加する
// 書式は fmt.Sprintf("%.1f度", t.Celsius) を使う

func main() {
	t := Temperature{Celsius: 25.0}
	fmt.Println(t)
}
`,
      solution: `package main

import "fmt"

type Temperature struct {
	Celsius float64
}

// String()を定義すると、fmtが表示時に自動でこれを呼ぶ
// （この仕組みの正体はインターフェース。第9章で学ぶ）
func (t Temperature) String() string {
	return fmt.Sprintf("%.1f度", t.Celsius)
}

func main() {
	t := Temperature{Celsius: 25.0}
	fmt.Println(t)
}
`,
      hints: [
        `メソッド名はString、戻り値の型はstringにします。どこかで呼び出す必要はありません。`,
        `func (t Temperature) String() string { return fmt.Sprintf("%.1f度", t.Celsius) }`,
        `String()の中でfmt.Sprintf("%v", t)と書くと無限ループになるので、必ずt.Celsiusを使います。`
      ],
      expectedOutput: "25.0度"
    },
    {
      id: 77,
      title: "メソッド値とメソッド式（概要）",
      explanation: `<p>第4章で「関数は変数に代入できる」と学びました。実はメソッドも同じように<strong>値として取り出す</strong>ことができます。取り出し方は2通りあります。</p>
<h4>1. メソッド値（method value）</h4>
<pre><code>u := User{Name: "Alice"}
f := u.Hello // 呼び出さずに代入（かっこを付けない）
f()          // こんにちは、Alice</code></pre>
<p><code>u.Hello</code>とかっこなしで書くと「レシーバuを<strong>束縛した</strong>（覚え込ませた）関数」が得られます。<code>f</code>を呼ぶときはもうレシーバを渡す必要がありません。</p>
<h4>2. メソッド式（method expression）</h4>
<pre><code>g := User.Hello // 型名から取り出す
g(u)            // レシーバを第1引数として渡す</code></pre>
<p><code>User.Hello</code>と型名から取り出すと「レシーバを<strong>第1引数として受け取る</strong>普通の関数」が得られます。<code>g</code>の型は<code>func(User)</code>です。</p>
<table>
<tr><th></th><th>書き方</th><th>レシーバ</th><th>呼び出し</th></tr>
<tr><td>メソッド値</td><td>u.Hello</td><td>束縛済み</td><td>f()</td></tr>
<tr><td>メソッド式</td><td>User.Hello</td><td>第1引数で渡す</td><td>g(u)</td></tr>
</table>
<p>「メソッドは、レシーバという特別な第1引数を持つ関数にすぎない」——メソッド式を見るとこのGoの設計思想がよく分かります。日常のコードで多用するものではありませんが、コールバック（あとで呼んでもらう関数）としてメソッドを渡したいときにメソッド値が役立ちます。ここでは概要をつかめれば十分です。</p>`,
      task: `コードを実行して3行とも同じ挨拶が表示されることを観察してください。その後、TODOの位置でメソッド値<code>f := u.Hello</code>を作って<code>f()</code>で呼び出してください。`,
      code: `package main

import "fmt"

type User struct {
	Name string
}

func (u User) Hello() {
	fmt.Println("こんにちは、" + u.Name)
}

func main() {
	u := User{Name: "Alice"}

	// 普通の呼び出し
	u.Hello()

	// TODO: メソッド値 f := u.Hello を作り、f()で呼び出す

	// メソッド式：レシーバを第1引数に取る関数として取り出す
	g := User.Hello
	g(u)
}
`,
      solution: `package main

import "fmt"

type User struct {
	Name string
}

func (u User) Hello() {
	fmt.Println("こんにちは、" + u.Name)
}

func main() {
	u := User{Name: "Alice"}

	// 普通の呼び出し
	u.Hello()

	// メソッド値：レシーバuを束縛した関数になる
	f := u.Hello
	f()

	// メソッド式：レシーバを第1引数に取る関数として取り出す
	g := User.Hello
	g(u)
}
`,
      hints: [
        `かっこを付けずにu.Helloと書くと、呼び出しではなく「関数の値」になります。`,
        `f := u.Hello のあと f() と呼び出します。fにはレシーバuが覚え込まされています。`
      ],
      expectedOutput: "こんにちは、Alice"
    },
    {
      id: 78,
      title: "埋め込みとメソッドの昇格",
      explanation: `<p>ステップ68で、構造体を埋め込むと<strong>フィールドが昇格</strong>することを学びました。実は<strong>メソッドも同じように昇格します</strong>。</p>
<pre><code>type Animal struct {
    Name string
}

func (a Animal) Greet() {
    fmt.Println("こんにちは、" + a.Name + "です")
}

type Dog struct {
    Animal // 埋め込み
}</code></pre>
<p>DogにはGreetを定義していませんが、Animalを埋め込んでいるので<code>d.Greet()</code>と呼べます。内部的には<code>d.Animal.Greet()</code>の省略形です。</p>
<pre><code>d := Dog{Animal: Animal{Name: "ポチ"}}
d.Greet() // こんにちは、ポチです（昇格したメソッド）
d.Bark()  // Dog自身のメソッドももちろん使える</code></pre>
<p>これで「共通の振る舞いをAnimalに1回だけ書き、DogやCatはそれを部品として持つ」という<strong>コンポジションによる再利用</strong>ができます。</p>
<p>ただし継承との違いに注意してください。昇格したGreetのレシーバはあくまで<strong>Animal</strong>です。GreetからDog側のフィールドやメソッドは見えませんし、Dogに同名のGreetを定義すると外側が優先される（隠す）だけで、他言語のオーバーライドのような動的な切り替えは起きません。</p>
<table>
<tr><th>観点</th><th>Goの埋め込み</th><th>他言語の継承</th></tr>
<tr><td>関係</td><td>〜を部品として持つ</td><td>〜の一種である</td></tr>
<tr><td>内側から外側</td><td>見えない</td><td>見えることが多い</td></tr>
</table>
<p>シンプルに「メソッドの使い回しができる合成」と捉えるのがGo流です。</p>`,
      task: `Dog構造体にAnimalを埋め込んで、<code>d.Greet()</code>（昇格したメソッド）と<code>d.Bark()</code>の両方が動くようにしてください。`,
      code: `package main

import "fmt"

type Animal struct {
	Name string
}

func (a Animal) Greet() {
	fmt.Println("こんにちは、" + a.Name + "です")
}

// TODO: Animalをフィールド名なしで埋め込む
type Dog struct {
}

func (d Dog) Bark() {
	fmt.Println("ワン！")
}

func main() {
	// TODO: Animal: Animal{Name: "ポチ"} で初期化する
	d := Dog{}
	d.Greet() // Animalから昇格したメソッド
	d.Bark()  // Dog自身のメソッド
}
`,
      solution: `package main

import "fmt"

type Animal struct {
	Name string
}

func (a Animal) Greet() {
	fmt.Println("こんにちは、" + a.Name + "です")
}

// Animalを埋め込むと、そのメソッドも昇格して使える
type Dog struct {
	Animal
}

func (d Dog) Bark() {
	fmt.Println("ワン！")
}

func main() {
	d := Dog{Animal: Animal{Name: "ポチ"}}
	d.Greet() // Animalから昇格したメソッド
	d.Bark()  // Dog自身のメソッド
}
`,
      hints: [
        `埋め込みはステップ68と同じく、構造体の中に型名Animalだけを書きます。`,
        `初期化はd := Dog{Animal: Animal{Name: "ポチ"}}です。埋め込んだ型名がフィールド名になります。`
      ],
      expectedOutput: "こんにちは、ポチです"
    },
    {
      id: 79,
      title: "レシーバの命名慣習とGoらしいAPI設計",
      explanation: `<p>文法はもう学んだので、このステップでは「Goらしい書き方」を整えます。まずレシーバ名の慣習です。</p>
<ul>
<li>レシーバ名は<strong>型名の頭文字1〜2文字</strong>にする（Circleならc、Rectangleならr）</li>
<li><code>this</code>や<code>self</code>は<strong>使わない</strong>。Goでは他言語の習慣を持ち込まず、短い名前で統一するのが公式スタイル（Go Code Review Commentsという公式のレビュー指針にも明記されています）</li>
<li>同じ型のメソッドでは<strong>レシーバ名をそろえる</strong>（あるメソッドはc、別のメソッドはcircleのようにばらつかせない）</li>
</ul>
<pre><code>// 良い例
func (c Circle) Area() float64 { ... }
func (c Circle) Diameter() float64 { ... }

// 避ける例
func (this Circle) Area() float64 { ... }
func (self Circle) Diameter() float64 { ... }</code></pre>
<p>レシーバの種類（値かポインタか）についても慣習があります。</p>
<table>
<tr><th>指針</th><th>理由</th></tr>
<tr><td>1つの型ではレシーバの種類を統一する</td><td>混在すると「このメソッドは変更が反映されるか」を毎回考えることになる</td></tr>
<tr><td>1つでも変更系メソッドがあるなら全部ポインタに</td><td>統一の基準として分かりやすい</td></tr>
<tr><td>メソッド名は短く、動詞または名詞で</td><td>c.CalculateAreaValue()よりc.Area()が読みやすい</td></tr>
</table>
<p>ゲッターに<code>Get</code>を付けない（<code>GetName()</code>ではなく<code>Name()</code>）のもGoの有名な慣習です。呼び出す側のコードが<code>c.Area()</code>のように自然な英語として読み下せるか——これがGoらしいAPI設計の感覚です。</p>`,
      task: `このコードは動きますが、Goの慣習に反する書き方が混ざっています。レシーバ名<code>this</code>と<code>self</code>を、慣習に従って両方とも<code>c</code>に統一してください（メソッド内の参照も直すこと）。`,
      code: `package main

import "fmt"

type Circle struct {
	Radius float64
}

// TODO: レシーバ名thisをcに変更する（中の参照も直す）
func (this Circle) Area() float64 {
	return 3.14 * this.Radius * this.Radius
}

// TODO: レシーバ名selfもcに変更して統一する
func (self Circle) Diameter() float64 {
	return self.Radius * 2
}

func main() {
	c := Circle{Radius: 2}
	fmt.Printf("面積: %.2f\\n", c.Area())
	fmt.Printf("直径: %.2f\\n", c.Diameter())
}
`,
      solution: `package main

import "fmt"

type Circle struct {
	Radius float64
}

// レシーバ名は型名の頭文字1〜2文字にそろえるのが慣習
func (c Circle) Area() float64 {
	return 3.14 * c.Radius * c.Radius
}

func (c Circle) Diameter() float64 {
	return c.Radius * 2
}

func main() {
	c := Circle{Radius: 2}
	fmt.Printf("面積: %.2f\\n", c.Area())
	fmt.Printf("直径: %.2f\\n", c.Diameter())
}
`,
      hints: [
        `レシーバ名は宣言部分(this Circle)と、メソッド本体の中のthis.Radiusの両方を書き換えます。`,
        `Circleの頭文字を取って(c Circle)とし、本体はc.Radiusにします。2つのメソッドで同じ名前にそろえます。`
      ],
      expectedOutput: "面積: 12.56"
    },
    {
      id: 80,
      title: "総合演習（BankAccountの入出金）",
      explanation: `<p>第7章と第8章の総仕上げとして、銀行口座<code>BankAccount</code>を実装します。使う知識の総復習です。</p>
<ul>
<li><strong>コンストラクタ関数</strong>（ステップ69）：<code>NewBankAccount</code>で初期化の入口を1つにする</li>
<li><strong>ポインタレシーバ</strong>（ステップ72〜73）：DepositとWithdrawは残高を変更するのでポインタレシーバにする</li>
<li><strong>複数の戻り値・bool判定</strong>（第4章）：出金は成功/失敗があるのでboolを返す</li>
</ul>
<p>設計のポイントは<strong>不正な操作をメソッドの入口で防ぐ</strong>ことです。</p>
<pre><code>func (a *BankAccount) Withdraw(amount int) bool {
    if amount &lt;= 0 || amount &gt; a.Balance {
        return false // 不正な金額・残高不足は失敗
    }
    a.Balance = a.Balance - amount
    return true
}</code></pre>
<p>フィールドを直接<code>acc.Balance = -100</code>と書き換えられてしまえば台無しですが、「変更はメソッド経由で行う」と決めておけば、検証ロジックが必ず通ります。パッケージを分けてフィールドを非公開にすると、これを言語レベルで強制できるようになります（先の章で学びます）。</p>
<table>
<tr><th>メソッド</th><th>レシーバ</th><th>役割</th></tr>
<tr><td>Deposit(amount)</td><td>*BankAccount</td><td>正の金額なら残高に加算</td></tr>
<tr><td>Withdraw(amount)</td><td>*BankAccount</td><td>出金できればtrue、できなければfalse</td></tr>
</table>
<p>「データ（構造体）と振る舞い(メソッド)をひとまとめにして、正しい操作だけを外に公開する」——この形が身につけば、第7〜8章は合格です。</p>`,
      task: `<code>Deposit</code>と<code>Withdraw</code>の2つのTODOを実装してください。Depositは0以下の金額を無視して加算し、Withdrawは0以下または残高超過ならfalse、成功ならtrueを返します。`,
      code: `package main

import "fmt"

type BankAccount struct {
	Owner   string
	Balance int
}

// NewBankAccountは口座を作るコンストラクタ関数
func NewBankAccount(owner string, initial int) *BankAccount {
	return &BankAccount{Owner: owner, Balance: initial}
}

// Depositはamountが正の数なら残高に加算する
func (a *BankAccount) Deposit(amount int) {
	// TODO: amountが0以下なら何もせずreturnし、正の数なら残高に加算する
}

// Withdrawは出金に成功したらtrue、失敗したらfalseを返す
func (a *BankAccount) Withdraw(amount int) bool {
	// TODO: amountが0以下、または残高より大きければfalseを返す
	// そうでなければ残高から引いてtrueを返す
	return false
}

func main() {
	acc := NewBankAccount("Gopher", 3000)

	acc.Deposit(5000)
	fmt.Println("入金後の残高:", acc.Balance)

	if acc.Withdraw(1000) {
		fmt.Println("出金成功 残高:", acc.Balance)
	}

	if !acc.Withdraw(100000) {
		fmt.Println("出金失敗: 残高不足")
	}

	fmt.Println("最終残高:", acc.Balance)
}
`,
      solution: `package main

import "fmt"

type BankAccount struct {
	Owner   string
	Balance int
}

// NewBankAccountは口座を作るコンストラクタ関数
func NewBankAccount(owner string, initial int) *BankAccount {
	return &BankAccount{Owner: owner, Balance: initial}
}

// Depositはamountが正の数なら残高に加算する
func (a *BankAccount) Deposit(amount int) {
	if amount <= 0 {
		return // 0以下の入金は無視する
	}
	a.Balance = a.Balance + amount
}

// Withdrawは出金に成功したらtrue、失敗したらfalseを返す
func (a *BankAccount) Withdraw(amount int) bool {
	if amount <= 0 || amount > a.Balance {
		return false // 不正な金額・残高不足は失敗
	}
	a.Balance = a.Balance - amount
	return true
}

func main() {
	acc := NewBankAccount("Gopher", 3000)

	acc.Deposit(5000)
	fmt.Println("入金後の残高:", acc.Balance)

	if acc.Withdraw(1000) {
		fmt.Println("出金成功 残高:", acc.Balance)
	}

	if !acc.Withdraw(100000) {
		fmt.Println("出金失敗: 残高不足")
	}

	fmt.Println("最終残高:", acc.Balance)
}
`,
      hints: [
        `Depositはif amount <= 0 { return }で先に弾いてから加算すると読みやすくなります。`,
        `Withdrawの失敗条件は「amount <= 0」と「amount > a.Balance」の2つで、||でつなげます。`,
        `期待する流れ：3000円で開設→5000円入金で8000円→1000円出金成功で7000円→100000円出金は失敗。`
      ],
      expectedOutput: "出金成功 残高: 7000"
    }
  ]
});
