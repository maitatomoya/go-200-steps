// 第9章：インターフェース
registerChapter({
  number: 9,
  title: "インターフェース",
  description: "Goのインターフェースは「メソッドの集合」を定義する型です。暗黙の実装という独自の仕組みから、型アサーション・型スイッチ、設計思想までを学びます。",
  steps: [
    {
      id: 81,
      title: "インターフェースとは（暗黙の実装）",
      explanation: `<p><strong>インターフェース</strong>とは「この型はこういうメソッドを持っている」という約束事（メソッドの集合）を定義する型です。Goのインターフェースの最大の特徴は<strong>暗黙の実装</strong>です。JavaやPHPのように「implements」と宣言する必要はなく、<strong>必要なメソッドをすべて持っていれば自動的にそのインターフェースを満たした</strong>とみなされます。</p>
<pre><code>// Speakerインターフェース：Speak() stringを持つ型なら何でもOK
type Speaker interface {
    Speak() string
}

type Dog struct {
    Name string
}

// DogにSpeakメソッドを定義した瞬間、DogはSpeakerを満たす
func (d Dog) Speak() string {
    return d.Name + "「ワン！」"
}</code></pre>
<p>インターフェース型の変数には、それを満たす任意の型の値を代入できます。</p>
<pre><code>var s Speaker      // インターフェース型の変数
s = Dog{Name: "ポチ"} // DogはSpeakerを満たすので代入できる
fmt.Println(s.Speak())</code></pre>
<table>
<tr><th>観点</th><th>Java/PHPなど</th><th>Go</th></tr>
<tr><td>実装の宣言</td><td>implementsと明示する</td><td>不要（メソッドを持てば自動で満たす）</td></tr>
<tr><td>後付けの実装</td><td>元の型の定義を変更する必要がある</td><td>メソッドを追加するだけでよい</td></tr>
</table>
<p>暗黙の実装のおかげで、他人が作った型に対しても「自分が定義したインターフェースを満たしている」とみなして使えます。これはGoの設計の核心の1つです。なお、インターフェース名は「Speak+er」のように<strong>メソッド名+erの形</strong>にする慣習があります。</p>`,
      task: `まずそのまま実行して動作を確認してください。その後、犬の名前を<code>"コロ"</code>から<code>"ポチ"</code>に変更して再実行し、出力が変わることを確認してください。`,
      code: `package main

import "fmt"

// Speakerは「話せるもの」を表すインターフェース
type Speaker interface {
	Speak() string
}

type Dog struct {
	Name string
}

// このメソッドを持つだけでDogはSpeakerを満たす（implements宣言は不要）
func (d Dog) Speak() string {
	return d.Name + "「ワン！」"
}

func main() {
	var s Speaker
	// TODO: まず実行して観察し、次に名前を"ポチ"に変えて再実行する
	s = Dog{Name: "コロ"}
	fmt.Println(s.Speak())
}`,
      solution: `package main

import "fmt"

// Speakerは「話せるもの」を表すインターフェース
type Speaker interface {
	Speak() string
}

type Dog struct {
	Name string
}

// このメソッドを持つだけでDogはSpeakerを満たす（implements宣言は不要）
func (d Dog) Speak() string {
	return d.Name + "「ワン！」"
}

func main() {
	var s Speaker
	s = Dog{Name: "ポチ"}
	fmt.Println(s.Speak())
}`,
      hints: [
        `インターフェース型の変数sには、Speak() stringメソッドを持つ型の値なら何でも代入できます。`,
        `Dog{Name: "コロ"}のフィールド値を"ポチ"に書き換えるだけです。`
      ],
      expectedOutput: "ポチ「ワン！」"
    },
    {
      id: 82,
      title: "インターフェースを満たす複数の型",
      explanation: `<p>インターフェースの真価は、<strong>複数の異なる型が同じインターフェースを満たせる</strong>ことにあります。DogとCatはまったく別の型ですが、どちらも<code>Speak() string</code>メソッドを持てば、どちらもSpeakerとして扱えます。</p>
<pre><code>type Cat struct {
    Name string
}

func (c Cat) Speak() string {
    return c.Name + "「ニャー」"
}</code></pre>
<p>すると、<strong>インターフェース型のスライス</strong>に異なる型の値を混在させられます。これまで学んだスライスは「同じ型の値の並び」でしたが、要素の型をインターフェースにすることで「同じ約束事を満たす、異なる型の値の並び」を作れます。</p>
<pre><code>// DogもCatもSpeakerを満たすので、1つのスライスにまとめられる
speakers := []Speaker{Dog{Name: "ポチ"}, Cat{Name: "タマ"}}
for _, s := range speakers {
    // sの実際の型がDogかCatかを気にせず、Speak()を呼べる
    fmt.Println(s.Speak())
}</code></pre>
<p>ループの中では「sが実際にはどの型か」を意識する必要がありません。<strong>「Speakできる」という共通点だけに注目してコードを書ける</strong>のがポイントです。ここで重要な注意が1つあります。インターフェースを満たすには、要求されるメソッドの<strong>名前・引数・戻り値の型が完全に一致</strong>している必要があります。たとえば<code>Speak() int</code>のように戻り値の型が違うと満たしたことになりません。コンパイルエラーのメッセージに「missing method」や「wrong type for method」と出たら、メソッドの形（シグネチャ）を見直してください。</p>`,
      task: `Cat型に<code>Speak() string</code>メソッドを実装して、Cat（名前は変更しない）がSpeakerインターフェースを満たすようにしてください。戻り値は「名前+「ニャー」」の形式です。`,
      code: `package main

import "fmt"

type Speaker interface {
	Speak() string
}

type Dog struct {
	Name string
}

func (d Dog) Speak() string {
	return d.Name + "「ワン！」"
}

type Cat struct {
	Name string
}

// TODO: CatにSpeakメソッドを実装する
// 戻り値は c.Name + "「ニャー」" とする

func main() {
	speakers := []Speaker{Dog{Name: "ポチ"}, Cat{Name: "タマ"}}
	for _, s := range speakers {
		fmt.Println(s.Speak())
	}
}`,
      solution: `package main

import "fmt"

type Speaker interface {
	Speak() string
}

type Dog struct {
	Name string
}

func (d Dog) Speak() string {
	return d.Name + "「ワン！」"
}

type Cat struct {
	Name string
}

// CatもSpeakメソッドを持てばSpeakerを満たす
func (c Cat) Speak() string {
	return c.Name + "「ニャー」"
}

func main() {
	speakers := []Speaker{Dog{Name: "ポチ"}, Cat{Name: "タマ"}}
	for _, s := range speakers {
		fmt.Println(s.Speak())
	}
}`,
      hints: [
        `DogのSpeakメソッドの書き方を参考に、レシーバをCatに変えたメソッドを書きます。`,
        `func (c Cat) Speak() string { ... } の形で、名前と「ニャー」を+で連結して返します。`
      ],
      expectedOutput: "タマ「ニャー」"
    },
    {
      id: 83,
      title: "インターフェース型の引数で多態",
      explanation: `<p>関数の引数の型をインターフェースにすると、<strong>そのインターフェースを満たすどんな型でも受け取れる関数</strong>になります。これを<strong>多態（ポリモーフィズム：同じ操作が型によって異なる振る舞いをすること）</strong>と呼びます。</p>
<pre><code>// 引数の型が具体的な型（Dog）だと、Dogしか渡せない
func introduce(d Dog) {
    fmt.Println("自己紹介:", d.Speak())
}

// 引数の型をインターフェース（Speaker）にすると、
// Speakerを満たす型なら何でも渡せる
func introduce(s Speaker) {
    fmt.Println("自己紹介:", s.Speak())
}</code></pre>
<p>この書き方の利点を整理します。</p>
<table>
<tr><th>観点</th><th>具体的な型で受け取る</th><th>インターフェースで受け取る</th></tr>
<tr><td>受け取れる値</td><td>その型だけ</td><td>満たす型すべて</td></tr>
<tr><td>新しい型への対応</td><td>関数を増やすか書き換える</td><td>関数は一切変更不要</td></tr>
<tr><td>関数が知っている情報</td><td>フィールドやメソッドすべて</td><td>インターフェースのメソッドのみ</td></tr>
</table>
<p>特に「新しい型への対応」が重要です。将来Bird型を追加しても、BirdにSpeakメソッドを実装するだけで、introduce関数は<strong>1文字も変更せずに</strong>Birdを受け取れるようになります。関数を書いた人と型を追加する人が別々に作業できるため、大規模な開発でも変更の影響範囲を小さく保てます。なお、インターフェース型の引数で呼び出せるのは<strong>そのインターフェースに定義されたメソッドだけ</strong>です。introduce関数の中でDog固有のフィールド（s.Nameなど）には直接アクセスできない点に注意してください。</p>`,
      task: `introduce関数の引数の型を<code>Dog</code>から<code>Speaker</code>に変更して、DogもCatも渡せるようにしてください。現在のコードは<code>introduce(Cat{...})</code>の行でコンパイルエラーになります。`,
      code: `package main

import "fmt"

type Speaker interface {
	Speak() string
}

type Dog struct {
	Name string
}

func (d Dog) Speak() string {
	return d.Name + "「ワン！」"
}

type Cat struct {
	Name string
}

func (c Cat) Speak() string {
	return c.Name + "「ニャー」"
}

// TODO: 引数の型をSpeakerに変更して、どのSpeakerでも受け取れるようにする
func introduce(d Dog) {
	fmt.Println("自己紹介:", d.Speak())
}

func main() {
	introduce(Dog{Name: "ポチ"})
	introduce(Cat{Name: "タマ"}) // 今はここでコンパイルエラーになる
}`,
      solution: `package main

import "fmt"

type Speaker interface {
	Speak() string
}

type Dog struct {
	Name string
}

func (d Dog) Speak() string {
	return d.Name + "「ワン！」"
}

type Cat struct {
	Name string
}

func (c Cat) Speak() string {
	return c.Name + "「ニャー」"
}

// 引数をインターフェース型にすると、満たす型なら何でも渡せる
func introduce(s Speaker) {
	fmt.Println("自己紹介:", s.Speak())
}

func main() {
	introduce(Dog{Name: "ポチ"})
	introduce(Cat{Name: "タマ"})
}`,
      hints: [
        `まず実行してコンパイルエラーのメッセージを読んでみましょう。Cat型をDog型の引数に渡せない、という内容のはずです。`,
        `func introduce(s Speaker) のように、引数名と型を書き換えます。関数の中身はSpeak()しか使っていないので変更不要です。`
      ],
      expectedOutput: "自己紹介: タマ「ニャー」"
    },
    {
      id: 84,
      title: "fmt.Stringerを実装する",
      explanation: `<p>標準ライブラリには多くのインターフェースが定義されています。その代表が<strong>fmt.Stringer</strong>です。定義は次のとおり、たった1つのメソッドだけです。</p>
<pre><code>// fmtパッケージ内の定義
type Stringer interface {
    String() string
}</code></pre>
<p>ある型が<code>String() string</code>メソッドを持っていると、<code>fmt.Println</code>や<code>fmt.Printf</code>の<code>%v</code>はその型の値を表示するとき、<strong>自動的にString()を呼んでその結果を表示</strong>します。つまり「この型を人間向けにどう表示するか」を自分で決められるのです。</p>
<pre><code>type Point struct {
    X, Y int
}

// Stringメソッドを実装するとfmt.Stringerを満たす
func (p Point) String() string {
    return fmt.Sprintf("(%d, %d)", p.X, p.Y)
}

p := Point{X: 3, Y: 5}
fmt.Println(p) // {3 5} ではなく (3, 5) と表示される</code></pre>
<p>Stringメソッドがない場合、構造体は<code>{3 5}</code>のようなGoの既定の形式で表示されます。Stringメソッドを定義すれば、ログやデバッグ出力が一気に読みやすくなります。</p>
<p>1つ重要な注意があります。Stringメソッドの中で<code>fmt.Sprintf("%v", p)</code>のように<strong>自分自身をそのまま%vで整形してはいけません</strong>。%vがまたString()を呼び、String()がまた%vを呼び…と<strong>無限ループ（再帰）</strong>になってしまいます。フィールドを個別に（%dなどで）整形するのが安全です。これは実務でも時々見かけるバグです。</p>`,
      task: `Point型に<code>String() string</code>メソッドを実装して、<code>(3, 5)</code>の形式で表示されるようにしてください。<code>fmt.Sprintf</code>で「(X, Y)」の文字列を組み立てます。`,
      code: `package main

import "fmt"

type Point struct {
	X, Y int
}

// TODO: PointにString() stringメソッドを実装する
// fmt.Sprintf("(%d, %d)", p.X, p.Y) の形式で返す

func main() {
	p := Point{X: 3, Y: 5}
	fmt.Println(p)          // 実装前は {3 5} と表示される
	fmt.Println("現在地:", p) // 実装後は 現在地: (3, 5) となる
}`,
      solution: `package main

import "fmt"

type Point struct {
	X, Y int
}

// Stringメソッドを実装するとfmt.Stringerを満たし、
// fmt.Printlnが自動でこのメソッドを呼ぶようになる
func (p Point) String() string {
	return fmt.Sprintf("(%d, %d)", p.X, p.Y)
}

func main() {
	p := Point{X: 3, Y: 5}
	fmt.Println(p)
	fmt.Println("現在地:", p)
}`,
      hints: [
        `メソッドの形は func (p Point) String() string です。名前と戻り値の型が1文字でも違うとStringerを満たしません。`,
        `fmt.Sprintfは整形した文字列を「返す」関数です。%dのところにp.Xとp.Yを埋め込みます。`,
        `%vで自分自身（p）を整形すると無限再帰になるので、フィールドを個別に整形してください。`
      ],
      expectedOutput: "現在地: (3, 5)"
    },
    {
      id: 85,
      title: "空インターフェースanyと用途",
      explanation: `<p>メソッドを1つも要求しないインターフェース<code>interface{}</code>を<strong>空インターフェース</strong>と呼びます。「要求がゼロ」なので、<strong>すべての型が自動的にこれを満たします</strong>。つまり、どんな型の値でも入れられる「何でも入る箱」です。Go 1.18からは<code>any</code>という別名が使えるようになり、現在はこちらが主流です。</p>
<pre><code>var x any
x = 42        // int を入れられる
x = "hello"   // string も入れられる
x = 3.14      // float64 も入れられる</code></pre>
<p>異なる型を混在させたスライスも作れます。値の中身は<code>%v</code>、実際の型は<code>%T</code>で確認できます。</p>
<pre><code>values := []any{42, "hello", 3.14, true}
for _, v := range values {
    fmt.Printf("値: %v 型: %T\\n", v, v)
}</code></pre>
<p>ただし、便利そうに見えて<strong>大きな代償</strong>があります。any型の変数に対しては、元の型のメソッドや演算が一切使えません。<code>x = 42</code>としても<code>x + 1</code>はコンパイルエラーです。コンパイラは「xはany」としか知らないからです。元の型として使うには、次のステップで学ぶ型アサーションが必要になります。</p>
<table>
<tr><th>anyの正当な用途</th><th>例</th></tr>
<tr><td>本当に何でも受け取る関数</td><td>fmt.Printlnの引数（...any）</td></tr>
<tr><td>型が実行時まで不明なデータ</td><td>JSONの解析結果など</td></tr>
</table>
<p>「型を考えるのが面倒だからany」は<strong>アンチパターン</strong>です。Goの型チェックという安全装置を自分で外すことになるため、anyは本当に必要な場面に限定しましょう。</p>`,
      task: `まずそのまま実行して、各要素の値と型がどう表示されるか観察してください。その後、スライスの末尾に<code>true</code>を追加して再実行し、bool型と表示されることを確認してください。`,
      code: `package main

import "fmt"

func main() {
	// anyのスライスには異なる型の値を混在できる
	// TODO: まず実行して観察し、次に末尾にtrueを追加して再実行する
	values := []any{42, "hello", 3.14}
	for _, v := range values {
		fmt.Printf("値: %v 型: %T\\n", v, v)
	}
}`,
      solution: `package main

import "fmt"

func main() {
	// anyのスライスには異なる型の値を混在できる
	values := []any{42, "hello", 3.14, true}
	for _, v := range values {
		fmt.Printf("値: %v 型: %T\\n", v, v)
	}
}`,
      hints: [
        `%Tは値の実際の型名を表示する書式指定子です。42はint、"hello"はstringと表示されます。`,
        `スライスリテラルの末尾にカンマ区切りでtrueを追加するだけです。`
      ],
      expectedOutput: "値: hello 型: string"
    },
    {
      id: 86,
      title: "型アサーション（v, ok := i.(string)）",
      explanation: `<p>インターフェース型の変数から<strong>元の具体的な型の値を取り出す</strong>操作を<strong>型アサーション</strong>と呼びます。書き方は<code>i.(型名)</code>です。</p>
<pre><code>var i any = "こんにちは"
s := i.(string) // iの中身をstringとして取り出す</code></pre>
<p>ただしこの1戻り値の形には危険があります。中身が指定した型と違うと、プログラムが<strong>panic（実行時の強制終了）</strong>してしまうのです。</p>
<pre><code>var i any = "こんにちは"
n := i.(int) // 中身はstringなのでpanicする！</code></pre>
<p>そこで実務では、ほぼ必ず<strong>カンマokイディオム</strong>と呼ばれる2戻り値の形を使います。マップの<code>v, ok := m[key]</code>と同じ発想です。</p>
<pre><code>s, ok := i.(string)
if ok {
    fmt.Println("stringでした:", s)
}

n, ok := i.(int)
if !ok {
    // 失敗してもpanicせず、nにはintのゼロ値（0）が入る
    fmt.Println("intではありません")
}</code></pre>
<table>
<tr><th>書き方</th><th>成功時</th><th>失敗時</th></tr>
<tr><td>v := i.(T)</td><td>vに値が入る</td><td>panicで強制終了</td></tr>
<tr><td>v, ok := i.(T)</td><td>vに値、okにtrue</td><td>vにゼロ値、okにfalse。panicしない</td></tr>
</table>
<p>「失敗する可能性が少しでもあるならカンマok形式」と覚えてください。1戻り値形式を使ってよいのは、直前のチェックなどで型が100%確実な場合だけです。</p>`,
      task: `現在のコードは実行するとpanicします。まず実行してpanicのメッセージを確認し、その後<code>v, ok :=</code>形式に書き換えて、string判定とint判定の両方を安全に行ってください。`,
      code: `package main

import "fmt"

func main() {
	var i any = "こんにちは"

	// TODO: まず実行してpanicを観察する。
	// その後、s, ok := i.(string) と n, ok := i.(int) の
	// カンマok形式に書き換えて、panicしないようにする
	n := i.(int)
	fmt.Println(n)
}`,
      solution: `package main

import "fmt"

func main() {
	var i any = "こんにちは"

	// カンマok形式なら、型が違ってもpanicせずokがfalseになる
	s, ok := i.(string)
	if ok {
		fmt.Println("stringでした:", s)
	}

	n, ok := i.(int)
	if ok {
		fmt.Println("intでした:", n)
	} else {
		fmt.Println("intではありません（ゼロ値:", n, "）")
	}
}`,
      hints: [
        `panicメッセージには「interface conversion: interface {} is string, not int」のように、実際の型と指定した型が表示されます。読む練習をしましょう。`,
        `v, ok := i.(string) の形にすると、失敗してもokがfalseになるだけでpanicしません。`,
        `if ok { 成功時の処理 } else { 失敗時の処理 } と分岐させます。`
      ],
      expectedOutput: "stringでした: こんにちは"
    },
    {
      id: 87,
      title: "型スイッチ",
      explanation: `<p>「中身がintならこう、stringならこう、boolならこう」と<strong>複数の型で分岐したい</strong>とき、型アサーションをif文で並べるのは冗長です。そこでGoには<strong>型スイッチ</strong>という専用の構文があります。</p>
<pre><code>switch v := i.(type) {
case int:
    // このブロック内では v は int型 として使える
    fmt.Println("整数:", v*2)
case string:
    // このブロック内では v は string型 として使える
    fmt.Println("文字列の長さ:", len(v))
case bool:
    fmt.Println("真偽値:", v)
default:
    // どのcaseにも一致しない場合。vの型はiと同じ（any）
    fmt.Printf("不明な型: %T\\n", v)
}</code></pre>
<p>ポイントは3つあります。</p>
<ul>
<li><code>i.(type)</code>という書き方は<strong>switch文の中でだけ</strong>使える特別な構文です。通常の式として書くとコンパイルエラーになります。</li>
<li>各caseブロックの中では、変数vが<strong>そのcaseの型として</strong>扱われます。case intの中ではv*2のような整数演算ができ、case stringの中ではlen(v)が使えます。同じ変数名なのにブロックごとに型が変わる、と考えてください。</li>
<li><code>default</code>は「どの型にも一致しなかった場合」の受け皿です。想定外の型を見逃さないため、基本的に書いておくのが安全です。</li>
</ul>
<p>型スイッチは、前ステップのカンマok形式を複数の型に拡張したものと言えます。分岐が2つ以上あるなら型スイッチのほうが読みやすくなります。fmtパッケージの内部でも、この仕組みで引数の型ごとに表示方法を切り替えています。</p>`,
      task: `describe関数の型スイッチに<code>case string</code>と<code>case bool</code>を追加してください。stringの場合は「文字列（長さN）」、boolの場合は「真偽値（true/false）」を返します。`,
      code: `package main

import "fmt"

// TODO: case string と case bool を追加する
// string: fmt.Sprintf("文字列（長さ%d）", len(v)) を返す
// bool:   fmt.Sprintf("真偽値（%t）", v) を返す
func describe(i any) string {
	switch v := i.(type) {
	case int:
		return fmt.Sprintf("整数（2倍すると%d）", v*2)
	default:
		return fmt.Sprintf("不明な型（%T）", v)
	}
}

func main() {
	values := []any{10, "Go", true, 3.14}
	for _, v := range values {
		fmt.Println(describe(v))
	}
}`,
      solution: `package main

import "fmt"

// 型スイッチで型ごとに異なる処理を行う
func describe(i any) string {
	switch v := i.(type) {
	case int:
		return fmt.Sprintf("整数（2倍すると%d）", v*2)
	case string:
		// このブロック内ではvはstring型なのでlen(v)が使える
		return fmt.Sprintf("文字列（長さ%d）", len(v))
	case bool:
		return fmt.Sprintf("真偽値（%t）", v)
	default:
		return fmt.Sprintf("不明な型（%T）", v)
	}
}

func main() {
	values := []any{10, "Go", true, 3.14}
	for _, v := range values {
		fmt.Println(describe(v))
	}
}`,
      hints: [
        `case int: のブロックを参考に、case string: と case bool: を追加します。caseの順番は結果に影響しません。`,
        `case string: の中ではvはstring型なので、len(v)で長さが取れます。`,
        `%tはbool値をtrue/falseで表示する書式指定子です。`
      ],
      expectedOutput: "文字列（長さ2）"
    },
    {
      id: 88,
      title: "インターフェースのnilの罠（概要）",
      explanation: `<p>インターフェースには、Go経験者でも一度はハマる有名な罠があります。それが<strong>「nilポインタを入れたインターフェースはnilではない」</strong>という現象です。</p>
<p>仕組みを理解するには、インターフェース型の変数が内部的に<strong>（型情報, 値）のペア</strong>を持っていることを知る必要があります。</p>
<table>
<tr><th>状態</th><th>型情報</th><th>値</th><th>== nil の結果</th></tr>
<tr><td>var i any（何も代入していない）</td><td>なし</td><td>なし</td><td>true</td></tr>
<tr><td>nilポインタを代入したi</td><td>*MyError</td><td>nil</td><td><strong>false</strong></td></tr>
</table>
<p>インターフェースがnilと判定されるのは<strong>型情報と値の両方が空</strong>のときだけです。nilポインタを代入すると、値はnilでも「*MyError型である」という型情報が入るため、インターフェース全体としてはnilではなくなります。</p>
<pre><code>var p *MyError = nil // nilポインタ
fmt.Println(p == nil) // true

var i any = p         // インターフェースに入れると…
fmt.Println(i == nil)  // false！ 型情報(*MyError)が入っているため</code></pre>
<p>「中身はnilなのに、箱としてはnilではない」という状態です。%Tと%vで観察すると、型は*main.MyError、値は&lt;nil&gt;と表示され、ペア構造が実感できます。</p>
<p>この罠が実害を生む典型例が、次章で学ぶ<strong>エラー処理</strong>です。error型（実はインターフェース）を返す関数でnilの具象ポインタを返してしまうと、呼び出し側の<code>if err != nil</code>が「エラーあり」と誤判定します。今は「インターフェースは（型, 値）のペアであり、nilポインタを入れるとnilでなくなる」ことを覚えておけば十分です。</p>`,
      task: `実行する前に、2つのPrintlnがそれぞれtrue/falseのどちらを表示するか予想してください。その後実行して、予想と結果を見比べてください。最後の行の%T・%vの出力にも注目してください。`,
      code: `package main

import "fmt"

type MyError struct {
	Msg string
}

func main() {
	// TODO: 実行前に2つの結果を予想してから実行する
	var p *MyError = nil
	fmt.Println("pはnil?", p == nil)

	var i any = p
	fmt.Println("iはnil?", i == nil)

	fmt.Printf("iの中身: 型=%T 値=%v\\n", i, i)
}`,
      solution: `package main

import "fmt"

type MyError struct {
	Msg string
}

func main() {
	// pはただのnilポインタなので、p == nil は当然true
	var p *MyError = nil
	fmt.Println("pはnil?", p == nil)

	// インターフェースに入れると型情報(*MyError)が付くため、
	// 値がnilでもインターフェース全体としてはnilではない
	var i any = p
	fmt.Println("iはnil?", i == nil)

	fmt.Printf("iの中身: 型=%T 値=%v\\n", i, i)
}`,
      hints: [
        `インターフェース変数は内部で（型情報, 値）のペアを持ちます。両方が空のときだけnilと判定されます。`,
        `pを代入した時点でiには「*MyError型」という型情報が入ります。値がnilでも型情報があるので…？`
      ],
      expectedOutput: "iはnil? false"
    },
    {
      id: 89,
      title: "小さなインターフェースの設計思想（io.Writer等の紹介）",
      explanation: `<p>Goの標準ライブラリのインターフェースは驚くほど小さく、<strong>メソッド1〜2個</strong>のものがほとんどです。代表格がioパッケージの<strong>io.Writer</strong>と<strong>io.Reader</strong>です。</p>
<pre><code>// 「バイト列を書き込める」ことだけを要求する
type Writer interface {
    Write(p []byte) (n int, err error)
}</code></pre>
<p>戻り値のerrorは「失敗したかどうか」を表す型で、次章で詳しく学びます。ここで注目してほしいのは、この小ささがもたらす効果です。要求が小さいほど満たすのが簡単なので、<strong>実に多くの型がio.Writerを満たしています</strong>。</p>
<table>
<tr><th>io.Writerを満たす型</th><th>書き込み先</th></tr>
<tr><td>os.Stdout</td><td>画面（標準出力）</td></tr>
<tr><td>strings.Builder</td><td>メモリ上の文字列</td></tr>
<tr><td>os.File</td><td>ファイル</td></tr>
<tr><td>ネットワーク接続など</td><td>通信相手</td></tr>
</table>
<p>そして<code>fmt.Fprintln(w, ...)</code>のように<strong>io.Writerを引数に取る関数</strong>は、書き込み先が画面でもメモリでもファイルでも、同じコードで動きます。実はいつも使っているfmt.Printlnは、Fprintlnにos.Stdoutを渡したものと同じです。</p>
<pre><code>fmt.Fprintln(os.Stdout, "画面へ")   // fmt.Printlnと同じ

var b strings.Builder
fmt.Fprintln(&amp;b, "メモリ上の文字列へ") // 出力先を差し替えただけ</code></pre>
<p>Goには<strong>「インターフェースは小さいほど良い」</strong>という格言があります。大きなインターフェース（メソッド10個など）は満たせる型が少なく再利用しにくいのに対し、小さなインターフェースは組み合わせも自由です。自分で設計するときも「本当に必要なメソッドだけ」を要求するのが、Goらしい設計です。</p>`,
      task: `strings.Builderへの書き込みを追加してください。<code>var b strings.Builder</code>を宣言し、<code>fmt.Fprintln(&amp;b, "Builderに書き込み")</code>で書き込んでから、<code>b.String()</code>の内容を「Builderの中身: 」に続けて出力します。`,
      code: `package main

import (
	"fmt"
	"os"
)

func main() {
	// os.Stdout（画面）はio.Writerを満たす。これはfmt.Printlnと同じ動き
	fmt.Fprintln(os.Stdout, "os.Stdoutに書き込み")

	// TODO: strings.Builder（メモリ上の文字列）にも書き込んでみる
	// 1. importに"strings"を追加する
	// 2. var b strings.Builder を宣言する
	// 3. fmt.Fprintln(&b, "Builderに書き込み") で書き込む
	// 4. fmt.Print("Builderの中身: ", b.String()) で中身を出力する
}`,
      solution: `package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	// os.Stdout（画面）はio.Writerを満たす。これはfmt.Printlnと同じ動き
	fmt.Fprintln(os.Stdout, "os.Stdoutに書き込み")

	// strings.Builderもio.Writerを満たすので、
	// 同じFprintlnで書き込み先だけを差し替えられる
	var b strings.Builder
	fmt.Fprintln(&b, "Builderに書き込み")
	fmt.Print("Builderの中身: ", b.String())
}`,
      hints: [
        `Fprintlnの第1引数が「書き込み先」です。os.Stdoutなら画面、&bならメモリ上のBuilderに書き込まれます。`,
        `Builderは&bのようにポインタで渡します（Writeメソッドが中身を変更するため、ポインタレシーバで定義されています）。`,
        `b.String()でBuilderに溜まった文字列を取り出せます。Fprintlnが改行も書き込んでいるので、fmt.Printで十分です。`
      ],
      expectedOutput: "Builderの中身: Builderに書き込み"
    },
    {
      id: 90,
      title: "総合演習（Shapeインターフェースで面積計算）",
      explanation: `<p>この章の総仕上げとして、インターフェースの定番課題「図形の面積計算」に取り組みます。使う知識はすべてこれまでのステップで学んだものです。</p>
<ul>
<li><strong>インターフェース定義</strong>（ステップ81）：Shapeは「面積と名前を返せるもの」</li>
<li><strong>複数の型で実装</strong>（ステップ82）：RectangleとCircleがそれぞれ実装</li>
<li><strong>インターフェースのスライス</strong>（ステップ82〜83）：[]Shapeでまとめて処理</li>
</ul>
<pre><code>type Shape interface {
    Area() float64
    Name() string
}</code></pre>
<p>設計のポイントは、Shapeを使う側のループが<strong>図形の種類を一切知らない</strong>ことです。</p>
<pre><code>shapes := []Shape{
    Rectangle{Width: 3, Height: 4},
    Circle{Radius: 5},
}
total := 0.0
for _, s := range shapes {
    fmt.Printf("%sの面積: %.2f\\n", s.Name(), s.Area())
    total += s.Area()
}</code></pre>
<p>このループは長方形の面積公式も円の面積公式も知りません。「Area()を呼べば面積が返ってくる」という約束だけを頼りに動いています。将来Triangle（三角形）を追加しても、<strong>このループは1行も変わりません</strong>。これがインターフェースによる設計の力です。</p>
<p>実装で使う知識のおさらいです。</p>
<table>
<tr><th>項目</th><th>内容</th></tr>
<tr><td>円の面積</td><td>半径 × 半径 × 円周率（math.Piを使う）</td></tr>
<tr><td>%.2f</td><td>float64を小数点以下2桁で表示する書式指定子</td></tr>
<tr><td>1行メソッド</td><td>func (r Rectangle) Area() float64 { return r.Width * r.Height } のように1行で書ける</td></tr>
</table>`,
      task: `Circle型に<code>Area() float64</code>（半径×半径×math.Pi）と<code>Name() string</code>（"円"を返す）の2つのメソッドを実装して、プログラムを完成させてください。`,
      code: `package main

import (
	"fmt"
	"math"
)

// Shapeは「面積と名前を返せる図形」を表すインターフェース
type Shape interface {
	Area() float64
	Name() string
}

type Rectangle struct {
	Width, Height float64
}

func (r Rectangle) Area() float64 { return r.Width * r.Height }
func (r Rectangle) Name() string  { return "長方形" }

type Circle struct {
	Radius float64
}

// TODO: CircleにArea()とName()を実装してShapeを満たす
// Area: 半径×半径×math.Pi を返す
// Name: "円" を返す

func main() {
	shapes := []Shape{
		Rectangle{Width: 3, Height: 4},
		Circle{Radius: 5},
	}

	total := 0.0
	for _, s := range shapes {
		fmt.Printf("%sの面積: %.2f\\n", s.Name(), s.Area())
		total += s.Area()
	}
	fmt.Printf("合計面積: %.2f\\n", total)
}`,
      solution: `package main

import (
	"fmt"
	"math"
)

// Shapeは「面積と名前を返せる図形」を表すインターフェース
type Shape interface {
	Area() float64
	Name() string
}

type Rectangle struct {
	Width, Height float64
}

func (r Rectangle) Area() float64 { return r.Width * r.Height }
func (r Rectangle) Name() string  { return "長方形" }

type Circle struct {
	Radius float64
}

// CircleもArea()とName()を持てばShapeを満たす
func (c Circle) Area() float64 { return c.Radius * c.Radius * math.Pi }
func (c Circle) Name() string  { return "円" }

func main() {
	shapes := []Shape{
		Rectangle{Width: 3, Height: 4},
		Circle{Radius: 5},
	}

	total := 0.0
	for _, s := range shapes {
		fmt.Printf("%sの面積: %.2f\\n", s.Name(), s.Area())
		total += s.Area()
	}
	fmt.Printf("合計面積: %.2f\\n", total)
}`,
      hints: [
        `RectangleのArea()とName()の書き方をそのまま参考にできます。レシーバをCircleに変えるだけです。`,
        `func (c Circle) Area() float64 { return c.Radius * c.Radius * math.Pi } のように1行で書けます。`,
        `2つのメソッドを両方実装しないとShapeを満たさず、[]Shapeへの代入でコンパイルエラーになります。`
      ],
      expectedOutput: "合計面積: 90.54"
    }
  ]
});
