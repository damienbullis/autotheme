package utils

import "autotheme/pkg/constants"

// ExampleCss_Var is an example of how to use Css.Var
func ExampleCssT() {
	// Output: var(--example)
}

type CssT struct {
	// # Create a css variable
	//
	//  Var("input", &"at") // Output: var(--at-input)
	//
	//  Var("input") // Output: var(--input)
	Var func(s string, p *string) string
	// # Create a css rgb value
	//
	// 	Rgb("255 255 255", &"0.5") // Output: rgb(255 255 255 / 0.5)
	//
	// 	Rgb("255 255 255") // Output: rgb(255 255 255)
	Rgb func(s string, o *string) string
	// linear-gradient()
	Linear func(s string) string
	// radial-gradient()
	Radial func(s string) string
	// .class {}
	Class func(class string, pre *string, indent *int) ClassT
	// prop: value;
	Prop func(key string, value string) string
	// --key: value;
	MakeVar func(key string, value string, pre *string) string
}

var Css = &CssT{
	Var:     v,
	Rgb:     rgb,
	Linear:  lg,
	Radial:  rg,
	Class:   class,
	Prop:    prop,
	MakeVar: makeVar,
}

func v(s string, p *string) string {
	if p != nil {
		s = *p + "-" + s
	}
	return "var(--" + s + ")"
}

func rgb(s string, o *string) string {
	if o != nil {
		s = s + " / " + *o
	}
	return "rgb(" + s + ")"
}
func lg(s string) string {
	return "linear-gradient(" + s + ")"
}
func rg(s string) string {
	return "radial-gradient(" + s + ")"
}

type ClassT struct {
	Line func(l string)
	Make func() string
}

// Helper for creating a css class
func class(class string, pre *string, indent *int) ClassT {
	i := 0
	if pre != nil {
		class = *pre + "-" + class
	}
	if indent != nil && *indent > 0 {
		i = *indent
	}

	start := constants.Tab(i) + "." + class + " {\n"
	buf := ""
	end := "};\n\n"
	return ClassT{
		Line: func(line string) {
			buf += constants.Tab(i+1) + line + "\n"
		},
		Make: func() string {
			return start + buf + end
		},
	}
}

// Helper for creating a css property
func prop(key string, value string) string {
	return key + ": " + value + ";"
}

// Helper for creating a css variable
func makeVar(key string, value string, pre *string) string {
	if pre != nil {
		key = *pre + "-" + key
	}
	return "--" + key + ": " + value + ";"
}
