// 第18章：Goらしい設計
registerChapter({
  number: 18,
  title: "Goらしい設計",
  description: "ゼロ値の活用、インターフェースの受け渡し、関数オプション、コンポジションなど、Goコミュニティで定着している設計の考え方と慣習を学びます。",
  steps: [
    {
      id: 171,
      title: "ゼロ値を活かす設計",
      explanation: `<p>Goには「<strong>ゼロ値を有用にせよ（Make the zero value useful）</strong>」という設計思想があります。ゼロ値（変数宣言時に自動で入る初期値。intなら0、stringなら空文字列、構造体なら全フィールドがゼロ値）のまま、初期化関数を呼ばずにすぐ使える型が良い型だ、という考え方です。</p>
<h4>標準ライブラリの代表例</h4>
<p><code>bytes.Buffer</code>（文字列やバイト列を追記して溜めるバッファ）は、宣言しただけで使えます。</p>
<pre><code>var buf bytes.Buffer // 初期化不要。ゼロ値がそのまま「空のバッファ」
buf.WriteString("Hello, ")
buf.WriteString("Gopher!")
fmt.Println(buf.String())</code></pre>
<p><code>sync.Mutex</code>（複数のgoroutineから同時に触られないようにする排他制御のロック）も同じで、<code>var mu sync.Mutex</code>と宣言すれば即ロックとして機能します。</p>
<h4>自分の型でもゼロ値を活かす</h4>
<pre><code>type Counter struct {
    mu    sync.Mutex
    count int
}
// var c Counter だけで使い始められる
// countは0、muは未ロック状態から始まる</code></pre>
<p>ゼロ値で使える型は、利用者が「Newを呼び忘れた」というバグを起こしようがなく、APIがシンプルになります。逆にmapを含む構造体はゼロ値のnilマップに書き込むとpanicするため、そういう型はコンストラクタ関数（New関数）を用意する、という判断基準になります。</p>
<table>
<tr><th>型</th><th>ゼロ値のまま使えるか</th></tr>
<tr><td>bytes.Buffer</td><td>使える（空のバッファ）</td></tr>
<tr><td>sync.Mutex / sync.WaitGroup</td><td>使える</td></tr>
<tr><td>スライス（append）</td><td>使える（nilスライスにappend可）</td></tr>
<tr><td>map（書き込み）</td><td>使えない（makeが必要）</td></tr>
</table>`,
      task: `<code>bytes.Buffer</code>をゼロ値のまま宣言して文字列を2回追記し、内容を表示してください。さらに<code>Counter</code>をゼロ値のまま宣言して<code>Inc</code>を2回呼び、カウントを表示してください。`,
      code: `package main

import (
	"bytes"
	"fmt"
	"sync"
)

type Counter struct {
	mu    sync.Mutex
	count int
}

func (c *Counter) Inc() {
	c.mu.Lock()
	c.count++
	c.mu.Unlock()
}

func (c *Counter) Count() int {
	return c.count
}

func main() {
	// TODO: bytes.Bufferをvarで宣言し（初期化不要）、
	// WriteStringで"Hello, "と"Gopher!"を追記してStringで表示する

	// TODO: Counterをvarで宣言し（初期化不要）、Incを2回呼んでCountを表示する
	fmt.Println("ここを書き換える")
	_ = bytes.MinRead // bytesを使うための仮の行。完成したら消してよい
}
`,
      solution: `package main

import (
	"bytes"
	"fmt"
	"sync"
)

type Counter struct {
	mu    sync.Mutex
	count int
}

func (c *Counter) Inc() {
	c.mu.Lock()
	c.count++
	c.mu.Unlock()
}

func (c *Counter) Count() int {
	return c.count
}

func main() {
	// ゼロ値がそのまま「空のバッファ」として機能する
	var buf bytes.Buffer
	buf.WriteString("Hello, ")
	buf.WriteString("Gopher!")
	fmt.Println(buf.String())

	// ゼロ値のCounterはcount=0、ロック未使用の状態からすぐ使える
	var c Counter
	c.Inc()
	c.Inc()
	fmt.Println("カウント:", c.Count())
}
`,
      hints: [
        `<code>var buf bytes.Buffer</code>と宣言するだけで、makeやNewは不要です。`,
        `Counterも同様に<code>var c Counter</code>だけで使えます。メソッドはポインタレシーバなので<code>c.Inc()</code>と呼ぶだけでGoが自動で<code>(&amp;c).Inc()</code>にしてくれます。`
      ],
      expectedOutput: "Hello, Gopher!"
    },
    {
      id: 172,
      title: "エクスポートの規則（大文字と小文字）",
      explanation: `<p>Goには<code>public</code>や<code>private</code>のようなキーワードがありません。代わりに、<strong>識別子の1文字目が大文字ならパッケージ外に公開（エクスポート）、小文字なら非公開</strong>という規則で可視性を決めます。これは関数・型・フィールド・メソッド・定数すべてに適用されます。</p>
<table>
<tr><th>識別子</th><th>可視性</th><th>例</th></tr>
<tr><td>大文字始まり</td><td>パッケージ外から使える</td><td><code>fmt.Println</code>、<code>time.Now</code></td></tr>
<tr><td>小文字始まり</td><td>同じパッケージ内のみ</td><td>内部ヘルパー関数、内部フィールド</td></tr>
</table>
<p>この教材は単一ファイル（すべて同じmainパッケージ）なので小文字のものにもアクセスできますが、複数パッケージ構成では次のような設計が定番です。</p>
<pre><code>type Config struct {
    Host string // 公開：外から読み書きしてよい
    port int    // 非公開：外から直接触らせない
}

// コンストラクタ関数で検証してから作らせる
func NewConfig(host string, port int) Config {
    return Config{Host: host, port: port}
}

// 非公開フィールドはメソッド経由で見せる
func (c Config) Addr() string {
    return fmt.Sprintf("%s:%d", c.Host, c.port)
}</code></pre>
<h4>設計指針：最小公開の原則</h4>
<ul>
<li>まず小文字（非公開）で作り、外部に必要になったときだけ大文字にする</li>
<li>非公開フィールドへのアクセスは<code>Addr()</code>のようなメソッドを通す。不正な値の混入を防げる</li>
<li>コンストラクタは<code>New型名</code>という名前が慣習（パッケージ名が型を表すなら単に<code>New</code>）</li>
</ul>
<p>前章で見たとおり、<code>json.Marshal</code>が小文字フィールドを無視するのもこの規則によるものです。「大文字＝APIの約束、小文字＝内部実装の自由」という区別はGoの設計の根幹です。</p>`,
      task: `<code>Config</code>のフィールド<code>port</code>を非公開のままにしつつ、コンストラクタ<code>NewConfig</code>と、<code>"host:port"</code>形式を返す公開メソッド<code>Addr</code>を完成させてください。`,
      code: `package main

import "fmt"

type Config struct {
	Host string // 公開フィールド
	port int    // 非公開フィールド
}

// TODO: NewConfigを完成させる（hostとportを受け取ってConfigを返す）
func NewConfig(host string, port int) Config {
	return Config{}
}

// TODO: Addrメソッドを完成させる（"host:port"形式の文字列を返す）
func (c Config) Addr() string {
	return ""
}

func main() {
	c := NewConfig("localhost", 8080)
	fmt.Println("接続先:", c.Addr())
}
`,
      solution: `package main

import "fmt"

type Config struct {
	Host string // 公開フィールド
	port int    // 非公開フィールド
}

// コンストラクタ関数はNew型名という名前が慣習
func NewConfig(host string, port int) Config {
	return Config{Host: host, port: port}
}

// 非公開フィールドは公開メソッド経由で見せる
func (c Config) Addr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.port)
}

func main() {
	c := NewConfig("localhost", 8080)
	fmt.Println("接続先:", c.Addr())
}
`,
      hints: [
        `NewConfigでは<code>Config{Host: host, port: port}</code>のように両フィールドを設定して返します。同じパッケージ内なので小文字フィールドにも代入できます。`,
        `Addrは<code>fmt.Sprintf("%s:%d", c.Host, c.port)</code>で組み立てられます。`
      ],
      expectedOutput: "接続先: localhost:8080"
    },
    {
      id: 173,
      title: "インターフェースを受け取り、構造体を返す",
      explanation: `<p>Goコミュニティには「<strong>Accept interfaces, return structs（インターフェースを受け取り、構造体を返せ）</strong>」という有名な設計格言があります。</p>
<h4>なぜ「受け取る側」はインターフェースか</h4>
<p>関数の引数をインターフェース型にすると、その関数は「必要な振る舞いを持つあらゆる型」を受け入れられます。呼び出す側の自由度が上がり、テストでは偽物（モック）を渡せます。</p>
<pre><code>// fmt.Stringerを受け取る：String()を持つ型なら何でも渡せる
func describe(s fmt.Stringer) {
    fmt.Println("説明:", s.String())
}</code></pre>
<p><code>fmt.Stringer</code>は標準ライブラリの<code>String() string</code>メソッドを1つだけ持つインターフェースで、「自分を文字列で説明できる」ことを表します。</p>
<h4>なぜ「返す側」は構造体か</h4>
<p>戻り値を具体的な構造体（や構造体へのポインタ）にすると、呼び出し側はそのフィールドやすべてのメソッドを使えます。インターフェースで返すと、実体が持っている機能まで隠れてしまい、かえって使いにくくなります。抽象化するかどうかは<strong>受け取る側が決めればよい</strong>のです。</p>
<pre><code>// 構造体（のポインタ）を返す
func NewUser(name string) *User {
    return &amp;User{Name: name}
}</code></pre>
<h4>この原則の効果</h4>
<ul>
<li>引数のインターフェースは小さく保てる（必要なメソッドだけ要求する）</li>
<li>戻り値が具体型なので、あとからメソッドを追加しても利用者を壊さない</li>
<li>依存が「振る舞い」に向くので、差し替え・テストが容易になる</li>
</ul>
<p>もちろん例外もあります（errorインターフェースを返すのはその代表）が、迷ったらこの原則に従うのがGoらしい設計です。</p>`,
      task: `<code>User</code>に<code>String() string</code>メソッドを実装して<code>fmt.Stringer</code>を満たし、<code>describe(u)</code>が動くようにしてください。<code>String</code>は<code>"User(名前)"</code>形式を返します。`,
      code: `package main

import "fmt"

type User struct {
	Name string
}

// TODO: UserにString() stringメソッドを実装する（"User(名前)"形式）

// 構造体（のポインタ）を返す：呼び出し側は全機能を使える
func NewUser(name string) *User {
	return &User{Name: name}
}

// インターフェースを受け取る：String()を持つ型なら何でも渡せる
func describe(s fmt.Stringer) {
	fmt.Println("説明:", s.String())
}

func main() {
	u := NewUser("Gopher")
	describe(u)
}
`,
      solution: `package main

import "fmt"

type User struct {
	Name string
}

// String()を実装するとfmt.Stringerインターフェースを満たす
func (u *User) String() string {
	return "User(" + u.Name + ")"
}

// 構造体（のポインタ）を返す：呼び出し側は全機能を使える
func NewUser(name string) *User {
	return &User{Name: name}
}

// インターフェースを受け取る：String()を持つ型なら何でも渡せる
func describe(s fmt.Stringer) {
	fmt.Println("説明:", s.String())
}

func main() {
	u := NewUser("Gopher")
	describe(u)
}
`,
      hints: [
        `<code>func (u *User) String() string</code>というメソッドを定義します。NewUserが<code>*User</code>を返すので、レシーバもポインタにしておくと確実です。`,
        `戻り値は<code>"User(" + u.Name + ")"</code>のように文字列連結で作れます。`
      ],
      expectedOutput: "説明: User(Gopher)"
    },
    {
      id: 174,
      title: "関数オプションパターン（Functional Options）",
      explanation: `<p>設定項目が多い構造体を作るとき、Goには名前付き引数もデフォルト引数もないため、素朴に書くと<code>NewServer("localhost", 8080, 30, true, ...)</code>のような読めない呼び出しになりがちです。これを解決するのが<strong>関数オプションパターン（Functional Options）</strong>です。</p>
<h4>パターンの構成要素</h4>
<ol>
<li>設定を変更する関数の型を定義する：<code>type Option func(*Server)</code></li>
<li>各設定用に「Optionを返す関数」を用意する（WithXxxという名前が慣習）</li>
<li>コンストラクタは可変長引数<code>opts ...Option</code>で受け取り、デフォルト値に上書き適用する</li>
</ol>
<pre><code>type Option func(*Server)

func WithPort(port int) Option {
    return func(s *Server) { s.port = port }
}

func NewServer(opts ...Option) *Server {
    s := &amp;Server{host: "localhost", port: 8080} // デフォルト値
    for _, opt := range opts {
        opt(s) // 各オプションを適用
    }
    return s
}</code></pre>
<h4>呼び出し側の見え方</h4>
<pre><code>s1 := NewServer()                               // 全部デフォルト
s2 := NewServer(WithPort(9000), WithTimeout(60)) // 必要な分だけ指定</code></pre>
<p>このパターンの利点は次のとおりです。</p>
<ul>
<li>指定しない項目は自然にデフォルト値になる</li>
<li>呼び出しが<code>WithPort(9000)</code>と自己説明的で読みやすい</li>
<li>後からオプションを追加しても既存の呼び出しを壊さない（後方互換）</li>
</ul>
<p>gRPCをはじめ多くの著名ライブラリが採用している、Goでもっとも有名な設計パターンのひとつです。クロージャ（外側の変数を捕まえた関数）の実践的な応用例でもあります。</p>`,
      task: `<code>WithTimeout</code>を実装し、<code>NewServer(WithPort(9000), WithTimeout(60))</code>でポートとタイムアウトを変更できるようにしてください。`,
      code: `package main

import "fmt"

type Server struct {
	host    string
	port    int
	timeout int
}

type Option func(*Server)

func WithPort(port int) Option {
	return func(s *Server) { s.port = port }
}

// TODO: WithTimeoutを実装する（timeoutフィールドを変更するOptionを返す）

func NewServer(opts ...Option) *Server {
	// デフォルト値
	s := &Server{host: "localhost", port: 8080, timeout: 30}
	// TODO: 受け取った各オプションをsに適用する
	return s
}

func main() {
	s1 := NewServer()
	fmt.Printf("%s:%d timeout=%d秒\\n", s1.host, s1.port, s1.timeout)

	s2 := NewServer(WithPort(9000), WithTimeout(60))
	fmt.Printf("%s:%d timeout=%d秒\\n", s2.host, s2.port, s2.timeout)
}
`,
      solution: `package main

import "fmt"

type Server struct {
	host    string
	port    int
	timeout int
}

type Option func(*Server)

func WithPort(port int) Option {
	return func(s *Server) { s.port = port }
}

// クロージャが引数timeoutを捕まえて、あとで適用される
func WithTimeout(timeout int) Option {
	return func(s *Server) { s.timeout = timeout }
}

func NewServer(opts ...Option) *Server {
	// デフォルト値
	s := &Server{host: "localhost", port: 8080, timeout: 30}
	// 各オプションを順に適用してデフォルト値を上書きする
	for _, opt := range opts {
		opt(s)
	}
	return s
}

func main() {
	s1 := NewServer()
	fmt.Printf("%s:%d timeout=%d秒\\n", s1.host, s1.port, s1.timeout)

	s2 := NewServer(WithPort(9000), WithTimeout(60))
	fmt.Printf("%s:%d timeout=%d秒\\n", s2.host, s2.port, s2.timeout)
}
`,
      hints: [
        `WithTimeoutはWithPortとまったく同じ形です。<code>return func(s *Server) { s.timeout = timeout }</code>のようにOptionを返します。`,
        `NewServerの中では<code>for _, opt := range opts { opt(s) }</code>と、受け取った関数を順に呼び出します。`
      ],
      expectedOutput: "localhost:9000 timeout=60秒"
    },
    {
      id: 175,
      title: "テーブル駆動の考え方",
      explanation: `<p>Goのテストコードで圧倒的によく使われるのが<strong>テーブル駆動テスト（table-driven tests）</strong>というスタイルです。「入力と期待値の表（テーブル）」をデータとして定義し、1つのループで全ケースを検証します。ここではその考え方をmain関数の中で体験します。</p>
<h4>構成は3つだけ</h4>
<ol>
<li><strong>テストケースの構造体</strong>：ケース名・入力・期待値を持つ</li>
<li><strong>テーブル</strong>：無名構造体のスライスにケースを列挙する</li>
<li><strong>ループ</strong>：各ケースを実行して期待値と比較する</li>
</ol>
<pre><code>tests := []struct {
    name string
    in   int
    want int
}{
    {"正の数", 5, 5},
    {"負の数", -3, 3},
    {"ゼロ", 0, 0},
}

for _, tt := range tests {
    got := abs(tt.in)
    if got == tt.want {
        fmt.Println(tt.name, ": OK")
    } else {
        fmt.Println(tt.name, ": NG got =", got)
    }
}</code></pre>
<p>変数名<code>tt</code>（table testの略）や<code>want</code>・<code>got</code>という語彙はGoのテスト文化の定番なので、そのまま覚えてしまいましょう。</p>
<h4>なぜこのスタイルが好まれるのか</h4>
<ul>
<li>ケースの追加が「表に1行足すだけ」で済む</li>
<li>検証ロジックが1か所に集まるので、コピペのif文が増えない</li>
<li>ケース名があるので、どれが失敗したか一目で分かる</li>
<li>境界値（0、空文字列、最大値など）を網羅する習慣がつく</li>
</ul>
<p>実際のテストでは<code>func TestAbs(t *testing.T)</code>の中で同じ形を書き、失敗時は<code>t.Errorf</code>で報告します。この教材ではmainで体験しますが、形はまったく同じです。</p>`,
      task: `テーブルにケース「負の数（入力-3、期待値3）」と「ゼロ（入力0、期待値0）」を追加し、ループで全ケースを検証して「ケース名 : OK」または「ケース名 : NG」を表示してください。`,
      code: `package main

import "fmt"

// 絶対値を返す関数（テスト対象）
func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func main() {
	tests := []struct {
		name string
		in   int
		want int
	}{
		{"正の数", 5, 5},
		// TODO: 「負の数」（入力-3、期待値3）のケースを追加する
		// TODO: 「ゼロ」（入力0、期待値0）のケースを追加する
	}

	for _, tt := range tests {
		got := abs(tt.in)
		// TODO: gotとtt.wantを比較して「名前 : OK」か「名前 : NG got = 値」を表示する
		_ = got
		fmt.Println(tt.name)
	}
}
`,
      solution: `package main

import "fmt"

// 絶対値を返す関数（テスト対象）
func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func main() {
	// ケース名・入力・期待値をデータとして列挙する
	tests := []struct {
		name string
		in   int
		want int
	}{
		{"正の数", 5, 5},
		{"負の数", -3, 3},
		{"ゼロ", 0, 0},
	}

	// 検証ロジックはループ1か所に集める
	for _, tt := range tests {
		got := abs(tt.in)
		if got == tt.want {
			fmt.Println(tt.name, ": OK")
		} else {
			fmt.Println(tt.name, ": NG got =", got)
		}
	}
}
`,
      hints: [
        `ケースの追加は<code>{"負の数", -3, 3},</code>のように1行足すだけです。`,
        `ループ内は<code>if got == tt.want</code>で比較し、OKとNGで表示を分けます。`
      ],
      expectedOutput: "負の数 : OK"
    },
    {
      id: 176,
      title: "エラー設計のベストプラクティス",
      explanation: `<p>「どんなエラーを、どう返すか」はGo設計の腕の見せどころです。ここでは実務で使われる2つの道具、<strong>センチネルエラー</strong>と<strong>エラーのラップ</strong>の使い分けを学びます。</p>
<h4>センチネルエラー：区別したいエラーを公開する</h4>
<p>センチネルエラー（sentinel error）とは、パッケージレベルの変数として宣言した「目印」のエラーです。標準ライブラリの<code>io.EOF</code>や<code>sql.ErrNoRows</code>が代表例で、<code>Err</code>で始まる名前が慣習です。</p>
<pre><code>var ErrNotFound = errors.New("not found")</code></pre>
<p>呼び出し側が「このエラーのときだけ特別扱いしたい」場合に備えて公開します。逆に、区別する必要のないエラーまでセンチネルにするとAPIの約束が増えるだけなので、必要なものだけ定義します。</p>
<h4>ラップ：文脈を足しつつ元のエラーを保つ</h4>
<p>エラーを上位に返すとき、<code>fmt.Errorf</code>の<strong>%w</strong>動詞でラップすると「どこで何をしていて失敗したか」という文脈を足せます。</p>
<pre><code>func findUser(id int) error {
    // ...見つからなかったら
    return fmt.Errorf("findUser id=%d: %w", id, ErrNotFound)
}</code></pre>
<p>ラップされていても、<code>errors.Is</code>なら中身まで辿って判定できます。</p>
<pre><code>err := findUser(99)
if errors.Is(err, ErrNotFound) {
    fmt.Println("見つかりません:", err)
}</code></pre>
<h4>実務の指針</h4>
<table>
<tr><th>指針</th><th>理由</th></tr>
<tr><td>比較は==ではなくerrors.Isを使う</td><td>ラップされていても判定できる</td></tr>
<tr><td>ラップ時は「操作: %w」の形で文脈を足す</td><td>ログを見ただけで発生箇所が分かる</td></tr>
<tr><td>エラーメッセージは小文字で始め、句点を付けない</td><td>ラップで連結されたとき読みやすい（Goの慣習）</td></tr>
<tr><td>呼び出し側が区別不要なら%wでなく%vでもよい</td><td>内部エラーの型をAPIの約束にしない</td></tr>
</table>`,
      task: `センチネルエラー<code>ErrNotFound</code>を定義し、<code>findUser</code>でid=1以外なら<code>%w</code>でラップして返してください。mainでは<code>errors.Is</code>で判定して結果を表示します。`,
      code: `package main

import (
	"errors"
	"fmt"
)

// TODO: センチネルエラーErrNotFoundを定義する（errors.Newを使う）

func findUser(id int) error {
	if id == 1 {
		return nil
	}
	// TODO: "findUser id=番号: 元エラー"の形で%wを使ってラップして返す
	return errors.New("エラー")
}

func main() {
	if err := findUser(1); err == nil {
		fmt.Println("id=1: 見つかりました")
	}

	err := findUser(99)
	// TODO: errors.IsでErrNotFoundかどうか判定して表示する
	fmt.Println(err)
}
`,
      solution: `package main

import (
	"errors"
	"fmt"
)

// センチネルエラー：呼び出し側が区別したいエラーを目印として公開する
var ErrNotFound = errors.New("not found")

func findUser(id int) error {
	if id == 1 {
		return nil
	}
	// %wでラップすると、文脈を足しつつ元のエラーを保持できる
	return fmt.Errorf("findUser id=%d: %w", id, ErrNotFound)
}

func main() {
	if err := findUser(1); err == nil {
		fmt.Println("id=1: 見つかりました")
	}

	err := findUser(99)
	// ==ではなくerrors.Isで比較する（ラップの中まで辿ってくれる）
	if errors.Is(err, ErrNotFound) {
		fmt.Println("見つかりません:", err)
	}
}
`,
      hints: [
        `センチネルエラーは<code>var ErrNotFound = errors.New("not found")</code>のようにパッケージレベルで宣言します。`,
        `ラップは<code>fmt.Errorf("findUser id=%d: %w", id, ErrNotFound)</code>の形です。%wは最後に置くのが読みやすい慣習です。`,
        `判定は<code>if errors.Is(err, ErrNotFound)</code>です。==による比較はラップされていると失敗します。`
      ],
      expectedOutput: "見つかりません: findUser id=99: not found"
    },
    {
      id: 177,
      title: "コンポジション優先（継承がないGoの設計)",
      explanation: `<p>Goには他の言語にあるクラス継承がありません。代わりに<strong>コンポジション（合成）</strong>、つまり「型の中に型を埋め込んで組み合わせる」ことで機能を再利用します。これは「継承よりコンポジションを優先せよ」という設計原則を言語仕様として採用した形です。</p>
<h4>構造体の埋め込み</h4>
<p>フィールド名を書かずに型名だけを書くと、その型が<strong>埋め込まれ</strong>、埋め込んだ型のフィールドとメソッドが外側の型から直接呼べるようになります（昇格と呼びます）。</p>
<pre><code>type Animal struct {
    Name string
}

func (a Animal) Eat() {
    fmt.Println(a.Name, "が食べる")
}

type Dog struct {
    Animal // フィールド名なし＝埋め込み
    Breed  string
}

d := Dog{Animal: Animal{Name: "ポチ"}, Breed: "柴犬"}
d.Eat()         // Animalのメソッドが昇格して直接呼べる
fmt.Println(d.Name) // フィールドも昇格する</code></pre>
<h4>継承との決定的な違い</h4>
<table>
<tr><th>観点</th><th>継承（他言語）</th><th>埋め込み（Go）</th></tr>
<tr><td>関係</td><td>DogはAnimalである（is-a）</td><td>DogはAnimalを持つ（has-a）</td></tr>
<tr><td>型の互換性</td><td>DogをAnimal型として渡せる</td><td>渡せない（別の型のまま）</td></tr>
<tr><td>メソッドの上書き</td><td>オーバーライドで動的に差し替わる</td><td>外側の同名メソッドが優先されるだけ</td></tr>
</table>
<p>埋め込みはあくまで「委譲の省略記法」です。DogをAnimalとして扱いたい場合は、継承ではなく<strong>インターフェース</strong>（たとえばEat()を持つEaterインターフェース）で抽象化します。「実装の再利用は埋め込み、抽象化はインターフェース」と役割が分かれているのがGoらしい設計です。深い継承階層の代わりに、小さい部品を組み合わせて大きな型を作りましょう。</p>`,
      task: `<code>Dog</code>構造体に<code>Animal</code>を埋め込み、<code>d.Eat()</code>（昇格したメソッド）と<code>d.Bark()</code>の両方が動くようにしてください。`,
      code: `package main

import "fmt"

type Animal struct {
	Name string
}

func (a Animal) Eat() {
	fmt.Println(a.Name, "が食べる")
}

type Dog struct {
	// TODO: Animalを埋め込む（フィールド名を書かずに型名だけ書く）
	Breed string
}

func (d Dog) Bark() {
	// TODO: 昇格したNameフィールドを使って「名前 がほえる:ワン!」と表示する
}

func main() {
	d := Dog{Breed: "柴犬"} // TODO: Animal{Name: "ポチ"}も設定する
	d.Eat()
	d.Bark()
	fmt.Println("犬種:", d.Breed)
}
`,
      solution: `package main

import "fmt"

type Animal struct {
	Name string
}

func (a Animal) Eat() {
	fmt.Println(a.Name, "が食べる")
}

type Dog struct {
	Animal // 埋め込み：AnimalのフィールドとメソッドがDogに昇格する
	Breed  string
}

func (d Dog) Bark() {
	// d.Animal.Nameと書かなくても、昇格したd.Nameでアクセスできる
	fmt.Println(d.Name, "がほえる:ワン!")
}

func main() {
	d := Dog{Animal: Animal{Name: "ポチ"}, Breed: "柴犬"}
	d.Eat()
	d.Bark()
	fmt.Println("犬種:", d.Breed)
}
`,
      hints: [
        `埋め込みは<code>type Dog struct { Animal; Breed string }</code>のように型名だけを書きます。`,
        `初期化は<code>Dog{Animal: Animal{Name: "ポチ"}, Breed: "柴犬"}</code>のように、埋め込んだ型名をフィールド名として使います。`,
        `Barkの中では昇格した<code>d.Name</code>がそのまま使えます。`
      ],
      expectedOutput: "ポチ がほえる:ワン!"
    },
    {
      id: 178,
      title: "io.Writerで出力先を抽象化",
      explanation: `<p><code>io.Writer</code>はGoでもっとも重要なインターフェースといっても過言ではありません。定義はたった1メソッドです。</p>
<pre><code>type Writer interface {
    Write(p []byte) (n int, err error)
}</code></pre>
<p>「バイト列を書き込める場所」をすべて同じ型として扱えるため、<code>os.Stdout</code>（画面）、<code>bytes.Buffer</code>（メモリ上のバッファ）、ファイル、ネットワーク接続、HTTPレスポンスまでもが同じ<code>io.Writer</code>です。</p>
<h4>fmt.Fprintlnで出力先を選ぶ</h4>
<p><code>fmt.Println</code>は実は「<code>os.Stdout</code>に書くFprintln」です。<code>fmt.Fprintln(w, ...)</code>の第1引数に任意の<code>io.Writer</code>を渡せば、同じ整形ロジックで出力先だけを切り替えられます。</p>
<pre><code>func writeReport(w io.Writer, name string) {
    fmt.Fprintln(w, "レポート:", name)
}

writeReport(os.Stdout, "画面へ")   // 画面に出る

var buf bytes.Buffer
writeReport(&amp;buf, "メモリへ")     // バッファに溜まる
fmt.Print(buf.String())           // あとで取り出せる</code></pre>
<p><code>bytes.Buffer</code>を渡すときは<code>&amp;buf</code>とポインタにする点に注意してください（WriteメソッドはポインタレシーバなのでバッファのポインタだけがWriterを満たします）。</p>
<h4>なぜこの設計が強力なのか</h4>
<ul>
<li><strong>テストしやすい</strong>：出力関数にバッファを渡せば、画面を見なくても出力内容を文字列として検証できる</li>
<li><strong>再利用できる</strong>：同じ関数が画面出力にもログ収集にも使える</li>
<li><strong>前ステップの原則の実例</strong>：「インターフェースを受け取る」設計そのもの</li>
</ul>
<p>「出力する関数を書くときは、fmt.Printlnを直接呼ばずio.Writerを受け取る」。この習慣だけでコードのテスト容易性が大きく変わります。</p>`,
      task: `<code>writeReport</code>を<code>io.Writer</code>を受け取る形に完成させ、<code>os.Stdout</code>と<code>bytes.Buffer</code>の両方に書き込んでください。最後にバッファの内容と文字数（<code>buf.Len()</code>）を表示します。`,
      code: `package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
)

// TODO: io.Writerを受け取り、fmt.Fprintlnで"レポート: 名前"を書き込む
func writeReport(w io.Writer, name string) {
	// ここを実装する
}

func main() {
	// TODO: os.Stdoutに"画面出力"を書き込む

	// TODO: bytes.Bufferを宣言し、"バッファ出力"を書き込む（ポインタを渡す）

	// TODO: バッファの内容をfmt.Printで表示し、buf.Len()も表示する
	fmt.Println("ここを書き換える")
	_ = os.Args // osを使うための仮の行。完成したら消してよい
	var _ bytes.Buffer
}
`,
      solution: `package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
)

// io.Writerを受け取ることで、出力先を呼び出し側が選べる
func writeReport(w io.Writer, name string) {
	fmt.Fprintln(w, "レポート:", name)
}

func main() {
	// 出力先1：画面（標準出力）
	writeReport(os.Stdout, "画面出力")

	// 出力先2：メモリ上のバッファ（ポインタがio.Writerを満たす）
	var buf bytes.Buffer
	writeReport(&buf, "バッファ出力")

	// バッファに溜めた内容はあとから取り出して検証できる
	fmt.Print(buf.String())
	fmt.Println("バッファの文字数:", buf.Len())
}
`,
      hints: [
        `writeReportの中身は<code>fmt.Fprintln(w, "レポート:", name)</code>の1行です。`,
        `バッファに書くときは<code>writeReport(&amp;buf, "バッファ出力")</code>とポインタを渡します。ポインタでないとio.Writerを満たしません。`
      ],
      expectedOutput: "レポート: バッファ出力"
    },
    {
      id: 179,
      title: "命名規約とgofmtの思想",
      explanation: `<p>Goは「コードは書く時間より読まれる時間の方が長い」という前提で、命名とフォーマットの慣習が強く統一されています。</p>
<h4>命名の主な慣習</h4>
<table>
<tr><th>ルール</th><th>良い例</th><th>避ける例</th></tr>
<tr><td>複合語はキャメルケース（アンダースコア不使用）</td><td><code>userCount</code></td><td><code>user_count</code></td></tr>
<tr><td>getterにGetを付けない</td><td><code>Name()</code></td><td><code>GetName()</code></td></tr>
<tr><td>頭字語は大文字を保つ</td><td><code>userID</code>、<code>apiURL</code></td><td><code>userId</code>、<code>apiUrl</code></td></tr>
<tr><td>エラー変数はErrで始める</td><td><code>ErrTimeout</code></td><td><code>TimeoutError</code>（変数の場合）</td></tr>
<tr><td>インターフェース名は-erが多い</td><td><code>Reader</code>、<code>Writer</code></td><td><code>IReadable</code></td></tr>
<tr><td>スコープが狭い変数は短く</td><td>ループの<code>i</code>、レシーバの<code>u</code></td><td><code>loopCounterIndex</code></td></tr>
</table>
<p>「スコープが狭いほど短い名前、広いほど説明的な名前」が基本原則です。3行のループの変数に長い名前は不要ですが、パッケージ公開APIの名前は自己説明的にします。また、パッケージ名の重複を避けるのも重要です（strings.StringReaderではなくstrings.Readerが正しい形）。</p>
<h4>gofmtの思想：議論を終わらせる</h4>
<p><code>gofmt</code>はGo公式のフォーマッターで、インデント（タブ）、スペース、括弧の位置などをすべて自動で統一します。重要なのはその思想です。</p>
<ul>
<li><strong>設定項目がほぼない</strong>：スタイルを選べないことが機能。チームでの「どっちのスタイルにする？」という不毛な議論自体をなくす</li>
<li><strong>全Goコードが同じ見た目</strong>：初めて読むOSSでも自分のコードと同じ形なので、読む速度が落ちない</li>
<li><strong>ツールの土台になる</strong>：機械的に整形されている前提で、コード生成や自動リファクタリングのツールが作りやすい</li>
</ul>
<p>「Goのコードには2つの書き方がある。gofmtされたものと、間違ったものだ」と冗談めかして言われるほどで、保存時に自動実行する設定が事実上の標準です。</p>`,
      task: `Goの命名規約に反している識別子3つ（<code>user_count</code>、<code>GetTotal</code>、<code>apiUrl</code>）を、慣習に沿った名前（<code>userCount</code>、<code>Total</code>、<code>apiURL</code>）にリネームしてください。`,
      code: `package main

import "fmt"

type Cart struct {
	items []int
}

// TODO: getterにGetは付けない。Totalにリネームする
func (c Cart) GetTotal() int {
	total := 0
	for _, v := range c.items {
		total += v
	}
	return total
}

func main() {
	// TODO: スネークケースはGoでは使わない。userCountにリネームする
	user_count := 3

	// TODO: 頭字語は大文字を保つ。apiURLにリネームする
	apiUrl := "https://api.example.com"

	c := Cart{items: []int{100, 250, 80}}
	fmt.Println("ユーザー数:", user_count)
	fmt.Println("API:", apiUrl)
	fmt.Println("合計:", c.GetTotal())
}
`,
      solution: `package main

import "fmt"

type Cart struct {
	items []int
}

// getterにGetは付けないのがGoの慣習
func (c Cart) Total() int {
	total := 0
	for _, v := range c.items {
		total += v
	}
	return total
}

func main() {
	// 複合語はキャメルケースで書く
	userCount := 3

	// URLのような頭字語は大文字を保つ
	apiURL := "https://api.example.com"

	c := Cart{items: []int{100, 250, 80}}
	fmt.Println("ユーザー数:", userCount)
	fmt.Println("API:", apiURL)
	fmt.Println("合計:", c.Total())
}
`,
      hints: [
        `リネームは宣言箇所と使用箇所の両方を直す必要があります。直し忘れるとコンパイルエラーが教えてくれます。`,
        `<code>GetTotal</code>は<code>Total</code>に、<code>user_count</code>は<code>userCount</code>に、<code>apiUrl</code>は<code>apiURL</code>にします。`
      ],
      expectedOutput: "合計: 430"
    },
    {
      id: 180,
      title: "総合演習：オプションパターンで設定可能なロガーを作る",
      explanation: `<p>この章の総まとめとして、学んだ設計をすべて組み合わせた<strong>設定可能なロガー</strong>を作ります。使う道具は次のとおりです。</p>
<ul>
<li><strong>関数オプションパターン</strong>（ステップ174）：出力先・プレフィックス・レベルを設定可能にする</li>
<li><strong>io.Writer</strong>（ステップ178）：出力先を画面にもバッファにも切り替えられる</li>
<li><strong>ゼロ値と最小公開</strong>（171・172）：フィールドは非公開にし、Newとメソッドだけ公開する</li>
</ul>
<h4>設計図</h4>
<pre><code>const (
    LevelDebug = iota // 0
    LevelInfo         // 1
    LevelError        // 2
)

type Logger struct {
    w      io.Writer // 出力先
    prefix string    // 各行の先頭に付ける文字列
    level  int       // これ未満のレベルのログは捨てる
}

func New(opts ...Option) *Logger {
    l := &amp;Logger{w: os.Stdout, prefix: "[LOG]", level: LevelInfo}
    for _, opt := range opts {
        opt(l)
    }
    return l
}</code></pre>
<p>ログ出力の本体は1つの内部メソッドにまとめ、公開メソッドはそれを呼ぶだけにします。</p>
<pre><code>func (l *Logger) log(level int, tag, msg string) {
    if level &lt; l.level {
        return // レベルが足りないログは出力しない
    }
    fmt.Fprintln(l.w, l.prefix, tag, msg)
}

func (l *Logger) Info(msg string)  { l.log(LevelInfo, "INFO", msg) }
func (l *Logger) Error(msg string) { l.log(LevelError, "ERROR", msg) }</code></pre>
<p>これは実際のロギングライブラリ（標準ライブラリのlog/slogなど）の縮小版そのものです。「デフォルトで使いやすく、必要なら細かく設定できる」というGoらしいAPIの完成形を体験してください。</p>`,
      task: `<code>WithPrefix</code>と<code>WithLevel</code>を実装し、(1)デフォルトのロガーでInfoを出力、(2)バッファ出力・プレフィックス<code>[APP]</code>・レベルErrorのロガーでDebugとErrorを出力し、バッファの中身を表示してください（Debugは捨てられます）。`,
      code: `package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
)

const (
	LevelDebug = iota
	LevelInfo
	LevelError
)

type Logger struct {
	w      io.Writer
	prefix string
	level  int
}

type Option func(*Logger)

func WithWriter(w io.Writer) Option {
	return func(l *Logger) { l.w = w }
}

// TODO: WithPrefixを実装する（prefixフィールドを変更するOption）

// TODO: WithLevelを実装する（levelフィールドを変更するOption）

func New(opts ...Option) *Logger {
	l := &Logger{w: os.Stdout, prefix: "[LOG]", level: LevelInfo}
	for _, opt := range opts {
		opt(l)
	}
	return l
}

func (l *Logger) log(level int, tag, msg string) {
	if level < l.level {
		return
	}
	fmt.Fprintln(l.w, l.prefix, tag, msg)
}

func (l *Logger) Debug(msg string) { l.log(LevelDebug, "DEBUG", msg) }
func (l *Logger) Info(msg string)  { l.log(LevelInfo, "INFO", msg) }
func (l *Logger) Error(msg string) { l.log(LevelError, "ERROR", msg) }

func main() {
	// (1) デフォルト設定のロガー（画面に[LOG] INFO ...と出るはず）
	logger := New()
	logger.Info("サーバーを起動しました")

	// (2) TODO: バッファ出力・プレフィックス"[APP]"・レベルLevelErrorのロガーを作り、
	//     Debug("詳細情報")とError("接続に失敗しました")を出力する
	var buf bytes.Buffer
	_ = buf

	// TODO: バッファの中身を表示する（Debugは出力されていないはず）
	fmt.Println("--- バッファの中身 ---")
}
`,
      solution: `package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
)

const (
	LevelDebug = iota
	LevelInfo
	LevelError
)

type Logger struct {
	w      io.Writer
	prefix string
	level  int
}

type Option func(*Logger)

func WithWriter(w io.Writer) Option {
	return func(l *Logger) { l.w = w }
}

func WithPrefix(prefix string) Option {
	return func(l *Logger) { l.prefix = prefix }
}

func WithLevel(level int) Option {
	return func(l *Logger) { l.level = level }
}

func New(opts ...Option) *Logger {
	// デフォルト：画面出力・[LOG]・Infoレベル以上を出力
	l := &Logger{w: os.Stdout, prefix: "[LOG]", level: LevelInfo}
	for _, opt := range opts {
		opt(l)
	}
	return l
}

func (l *Logger) log(level int, tag, msg string) {
	// 設定レベル未満のログは捨てる
	if level < l.level {
		return
	}
	fmt.Fprintln(l.w, l.prefix, tag, msg)
}

func (l *Logger) Debug(msg string) { l.log(LevelDebug, "DEBUG", msg) }
func (l *Logger) Info(msg string)  { l.log(LevelInfo, "INFO", msg) }
func (l *Logger) Error(msg string) { l.log(LevelError, "ERROR", msg) }

func main() {
	// (1) デフォルト設定のロガー
	logger := New()
	logger.Info("サーバーを起動しました")

	// (2) バッファ出力・[APP]・Errorレベルのロガー
	var buf bytes.Buffer
	appLogger := New(
		WithWriter(&buf),
		WithPrefix("[APP]"),
		WithLevel(LevelError),
	)
	appLogger.Debug("詳細情報")           // レベル不足で捨てられる
	appLogger.Error("接続に失敗しました") // これは出力される

	fmt.Println("--- バッファの中身 ---")
	fmt.Print(buf.String())
}
`,
      hints: [
        `WithPrefixとWithLevelはWithWriterと同じ形です。<code>return func(l *Logger) { l.prefix = prefix }</code>のように書きます。`,
        `2つ目のロガーは<code>New(WithWriter(&amp;buf), WithPrefix("[APP]"), WithLevel(LevelError))</code>と、オプションを並べて作ります。`,
        `バッファの中身は<code>fmt.Print(buf.String())</code>で表示します。Debugの行が含まれていなければレベルフィルタが機能しています。`
      ],
      expectedOutput: "[APP] ERROR 接続に失敗しました"
    }
  ]
});
