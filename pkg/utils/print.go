package utils

import (
	"fmt"
	"reflect"
)

func PrettyPrint(data interface{}) {
	v := reflect.ValueOf(data)

	if v.Kind() == reflect.Slice {
		for i := 0; i < v.Len(); i++ {
			fmt.Printf("Element %d:\n", i)
			prettyPrintStruct(v.Index(i))
			fmt.Println()
		}
	} else if v.Kind() == reflect.Struct {
		prettyPrintStruct(v)
	} else {
		fmt.Println("Unsupported type")
	}
}

func prettyPrintStruct(v reflect.Value) {
	t := v.Type()

	for i := 0; i < v.NumField(); i++ {
		field := t.Field(i)
		value := v.Field(i)

		fmt.Printf("%s: %v\n", field.Name, value.Interface())
	}
}
