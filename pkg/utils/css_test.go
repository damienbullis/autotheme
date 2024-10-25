package utils_test

import (
	. "autotheme/pkg/utils"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("CssT", func() {
	Describe("Var function", func() {
		Context("When the prefix is provided", func() {
			It("should return the correct CSS variable string with prefix", func() {
				prefix := "theme"
				result := Css.Var("color", &prefix)
				Expect(result).To(Equal("var(--theme-color)"))
			})
		})

		Context("When the prefix is nil", func() {
			It("should return the correct CSS variable string without prefix", func() {
				result := Css.Var("background", nil)
				Expect(result).To(Equal("var(--background)"))
			})
		})

		Context("When the variable name is empty", func() {
			It("should return 'var(--)' when prefix is nil", func() {
				result := Css.Var("", nil)
				Expect(result).To(Equal("var(--)"))
			})

			It("should return 'var(--prefix-)' when prefix is provided", func() {
				prefix := "prefix"
				result := Css.Var("", &prefix)
				Expect(result).To(Equal("var(--prefix-)"))
			})
		})
	})

	Describe("Rgb function", func() {
		Context("When the opacity is provided", func() {
			It("should return the correct RGB string with opacity", func() {
				opacity := "0.5"
				result := Css.Rgb("255,0,0", &opacity)
				Expect(result).To(Equal("rgb(255,0,0 / 0.5)"))
			})
		})

		Context("When the opacity is nil", func() {
			It("should return the correct RGB string without opacity", func() {
				result := Css.Rgb("0,255,0", nil)
				Expect(result).To(Equal("rgb(0,255,0)"))
			})
		})

		Context("When the RGB values are empty", func() {
			It("should return 'rgb( / opacity)' when RGB is empty and opacity is provided", func() {
				opacity := "0.8"
				result := Css.Rgb("", &opacity)
				Expect(result).To(Equal("rgb( / 0.8)"))
			})

			It("should return 'rgb()' when RGB is empty and opacity is nil", func() {
				result := Css.Rgb("", nil)
				Expect(result).To(Equal("rgb()"))
			})
		})
	})

	Describe("Linear function", func() {
		Context("With valid gradient input", func() {
			It("should return the correct linear-gradient string", func() {
				gradient := "to right, red, blue"
				result := Css.Linear(gradient)
				Expect(result).To(Equal("linear-gradient(to right, red, blue)"))
			})
		})

		Context("With empty gradient input", func() {
			It("should return 'linear-gradient()' when input is empty", func() {
				result := Css.Linear("")
				Expect(result).To(Equal("linear-gradient()"))
			})
		})
	})

	Describe("Radial function", func() {
		Context("With valid gradient input", func() {
			It("should return the correct radial-gradient string", func() {
				gradient := "circle, yellow, green"
				result := Css.Radial(gradient)
				Expect(result).To(Equal("radial-gradient(circle, yellow, green)"))
			})
		})

		Context("With empty gradient input", func() {
			It("should return 'radial-gradient()' when input is empty", func() {
				result := Css.Radial("")
				Expect(result).To(Equal("radial-gradient()"))
			})
		})
	})

	Describe("Class function", func() {
		Context("When prefix and indent are provided", func() {
			It("should return the correctly prefixed class with indentation", func() {
				prefix := "btn"
				indent := 2
				class := Css.Class("primary", &prefix, &indent)
				Expect(class.Make()).To(Equal("    .btn-primary {\n};\n\n"))
			})
		})

		Context("When prefix is nil and indent is provided", func() {
			It("should return the class without prefix and with indentation", func() {
				indent := 1

				class := Css.Class("secondary", nil, &indent)
				Expect(class.Make()).To(Equal("  .secondary {\n};\n\n"))
			})
		})

		Context("When prefix is provided and indent is nil", func() {
			It("should return the prefixed class without indentation", func() {
				prefix := "card"

				class := Css.Class("header", &prefix, nil)
				class.Line(Css.Prop("font-size", "16px"))
				Expect(class.Make()).To(Equal(".card-header {\n  font-size: 16px;\n};\n\n"))
			})
		})

		Context("When both prefix and indent are nil", func() {
			It("should return the class without prefix and without indentation", func() {
				class := Css.Class("footer", nil, nil)

				Expect(class.Make()).To(Equal(".footer {\n};\n\n"))
			})
		})

		Context("When indent is zero", func() {
			It("should return the class without indentation", func() {
				indent := 0
				class := Css.Class("content", nil, &indent)

				Expect(class.Make()).To(Equal(".content {\n};\n\n"))
			})
		})
	})

	Describe("Prop function", func() {
		Context("With valid key and value", func() {
			It("should return the correct CSS property string", func() {
				key := "margin"
				value := "10px"
				result := Css.Prop(key, value)
				Expect(result).To(Equal("margin: 10px;"))
			})
		})

		Context("When value is empty", func() {
			It("should return the property with an empty value", func() {
				key := "padding"
				value := ""
				result := Css.Prop(key, value)
				Expect(result).To(Equal("padding: ;"))
			})
		})

		Context("When key is empty", func() {
			It("should return ': value;\\n' when key is empty", func() {
				key := ""
				value := "auto"
				result := Css.Prop(key, value)
				Expect(result).To(Equal(": auto;"))
			})
		})

		Context("When both key and value are empty", func() {
			It("should return ': ;'", func() {
				result := Css.Prop("", "")
				Expect(result).To(Equal(": ;"))
			})
		})

		Context("When key and value contain special characters", func() {
			It("should return the property correctly with special characters", func() {
				key := "font-family"
				value := "Arial, sans-serif"
				result := Css.Prop(key, value)
				Expect(result).To(Equal("font-family: Arial, sans-serif;"))
			})
		})
	})

	Describe("MakeVar function", func() {
		Context("When prefix is provided", func() {
			It("should return the correct CSS variable with prefix", func() {
				prefix := "theme"
				key := "color"
				value := "#fff"
				result := Css.MakeVar(key, value, &prefix)
				Expect(result).To(Equal("--theme-color: #fff;"))
			})
		})

		Context("When prefix is nil", func() {
			It("should return the CSS variable without prefix", func() {
				key := "background"
				value := "#000"
				result := Css.MakeVar(key, value, nil)
				Expect(result).To(Equal("--background: #000;"))
			})
		})

		Context("When key is empty", func() {
			It("should return '--: value;' when prefix is provided", func() {
				prefix := "base"
				value := "solid"
				result := Css.MakeVar("", value, &prefix)
				Expect(result).To(Equal("--base-: solid;"))
			})

			It("should return '--: value;' when prefix is nil", func() {
				value := "none"
				result := Css.MakeVar("", value, nil)
				Expect(result).To(Equal("--: none;"))
			})
		})

		Context("When value is empty", func() {
			It("should return '--key: ;' when prefix is provided", func() {
				prefix := "layout"
				key := "width"
				result := Css.MakeVar(key, "", &prefix)
				Expect(result).To(Equal("--layout-width: ;"))
			})

			It("should return '--key: ;' when prefix is nil", func() {
				key := "height"
				result := Css.MakeVar(key, "", nil)
				Expect(result).To(Equal("--height: ;"))
			})
		})

		Context("When both key and value are empty", func() {
			It("should return '--: ;'", func() {
				result := Css.MakeVar("", "", nil)
				Expect(result).To(Equal("--: ;"))
			})

			It("should return '--prefix-: ;' when prefix is provided", func() {
				prefix := "custom"
				result := Css.MakeVar("", "", &prefix)
				Expect(result).To(Equal("--custom-: ;"))
			})
		})

		It("should return '--: value;' when both key and prefix are empty", func() {
			prefix := ""
			value := "transparent"
			result := Css.MakeVar("", value, &prefix)
			Expect(result).To(Equal("---: transparent;"))
		})
	})

	Describe("Combined scenarios", func() {
		It("should handle multiple Css functions correctly", func() {
			// Test Var
			prefix := "app"
			varResult := Css.Var("primary", &prefix)
			Expect(varResult).To(Equal("var(--app-primary)"))

			// Test Rgb
			opacity := "0.75"
			rgbResult := Css.Rgb("100,150,200", &opacity)
			Expect(rgbResult).To(Equal("rgb(100,150,200 / 0.75)"))

			// Test Linear
			linResult := Css.Linear("to bottom, #fff, #000")
			Expect(linResult).To(Equal("linear-gradient(to bottom, #fff, #000)"))

			// Test Radial
			radResult := Css.Radial("ellipse, pink, purple")
			Expect(radResult).To(Equal("radial-gradient(ellipse, pink, purple)"))

			// Test Class
			classPrefix := "container"
			indent := 3
			class := Css.Class("main", &classPrefix, &indent)
			Expect(class.Make()).To(Equal("      .container-main {\n};\n\n"))

			// Test Prop
			propResult := Css.Prop("display", "flex")
			Expect(propResult).To(Equal("display: flex;"))

			// Test MakeVar
			makeVarPrefix := "theme"
			makeVarResult := Css.MakeVar("spacing", "8px", &makeVarPrefix)
			Expect(makeVarResult).To(Equal("--theme-spacing: 8px;"))
		})
	})
})
