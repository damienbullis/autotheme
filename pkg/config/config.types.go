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
	Colors    ColorsI
	Opacity   bool
	Spacing   bool
	Noise     bool
	Gradients GradientI
}

func (t UseClassesT) IsUseClasses() {}
