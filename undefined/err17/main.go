package main

import "fmt"

func main() {
	var n int = 5
	var f float64 = 1.5

	// このままではコンパイルエラー: mismatched types int and float64
	// TODO: nをfloat64に変換して計算できるようにする
	fmt.Println("結果:", n*f)
}
