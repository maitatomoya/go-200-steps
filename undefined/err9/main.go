package main

import "fmt"

func main() {
	// このままではコンパイルエラー: declared and not used: message
	message := "Goは未使用変数を許さない"
	fmt.Println("こんにちは")
}
