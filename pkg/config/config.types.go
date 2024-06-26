package config

type ColorKeys string

const (
	Primary ColorKeys = "primary"
	Accent1 ColorKeys = "accent1"
	Accent2 ColorKeys = "accent2"
	Accent3 ColorKeys = "accent3"
	Accent4 ColorKeys = "accent4"
	Accent5 ColorKeys = "accent5"
)

// Interface for color types
type ColorsI interface {
	// Marker
	IsColor()
}
type ColorsBool bool

func (b ColorsBool) IsColor() {}

type ColorsT map[ColorKeys]bool

func (t ColorsT) IsColor() {}

// Interface for gradient types
type GradientI interface {
	// Marker
	IsGradient()
}
type GradientBool bool

func (b GradientBool) IsGradient() {}

type GradientTuple struct {
	First  ColorKeys
	Second ColorKeys
}
type GradientArray []GradientTuple

func (a GradientArray) IsGradient() {}

type UseClassesI interface {
	// Marker
	IsUseClasses()
}

// Boolean type for use-classes flag
type UseClassesBool bool

func (b UseClassesBool) IsUseClasses() {}

// Struct for use-classes flag
type UseClassesT struct {
	Colors    ColorsT
	Opacity   bool
	Spacing   bool
	Noise     bool
	Gradients GradientI
}

func (t UseClassesT) IsUseClasses() {}

type TailwindBool bool

func (b TailwindBool) isTailwind() {}

type TailwindT struct {
	Colors    ColorsI
	Noise     bool
	Gradients GradientI
	Spacing   bool
}

func (t TailwindT) isTailwind() {}

type TailwindI interface {
	// Marker
	isTailwind()
}

type OverrideT struct {
	FontSize  float64
	Scalar    float64
	DarkMode  bool
	Colors    ColorsI
	Opacity   bool
	Noise     bool
	Spacing   bool
	Gradients GradientI
}
