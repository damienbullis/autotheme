package main_test

import (
	"fmt"
	"os"
	"os/exec"
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

type CLITestSuite struct {
	path string
}

func newCLITestSuite(path string) *CLITestSuite {
	return &CLITestSuite{
		path,
	}
}

func (s *CLITestSuite) setup() {
	fmt.Println("Building CLI...")
	exec.Command("go", "build", "-o", s.path+"/autotheme").Run()
	fmt.Println("CLI built successfully")
}

// Method to run a command and return output and errors
func (s *CLITestSuite) RunCommand(args ...string) (string, error) {
	cmd := exec.Command("./"+s.path+"/autotheme", args...)
	output, err := cmd.CombinedOutput()
	return string(output), err
}

func (s *CLITestSuite) cleanup() {
	// Remove the test directory
	fmt.Println("Cleaning up...")
	exec.Command("rm", "-rf", "./"+s.path).Run()
	fmt.Println("Cleaned up successfully")
}

var suite *CLITestSuite

var _ = BeforeSuite(func() {
	suite = newCLITestSuite("test")
	suite.setup()
})

var _ = AfterSuite(func() {
	suite.cleanup()
})

var _ = Describe("AutoTheme CLI", Ordered, func() {
	var suite *CLITestSuite

	Describe("Root command", func() {
		var output string
		var err error
		BeforeAll(func() {
			output, err = suite.RunCommand("-o", "test/index.css")
		})
		It("should run successfully", func() {
			Expect(err).ShouldNot(HaveOccurred(), "CLI execution failed")
		})
		It("should output to the terminal", func() {
			Expect(output).Should(ContainSubstring("AutoTheme"), "AutoTheme is missing from output")
		})
		It("generate a index.css file", func() {
			_, fileErr := os.Stat("./test/index.css")
			Expect(os.IsNotExist(fileErr)).Should(BeFalse(), "index.css should exist")
		})
	})

	// It("should run successfully", func() {
	// 	// Run the CLI command
	// 	_, err := suite.RunCommand()

	// 	Expect(err).ShouldNot(HaveOccurred(), "CLI execution failed")
	// })

	// Describe("help flag", func() {
	// 	cmd := exec.Command("go", "run", ".", "-h")
	// 	output, err := cmd.CombinedOutput()

	// 	It("should run successfully", func() {
	// 		// Run the CLI command
	// 		Expect(err).ShouldNot(HaveOccurred(), "CLI execution failed")
	// 	})

	// 	It("should contain name of cli", func() {
	// 		// Run the CLI command
	// 		Expect(string(output)).Should(ContainSubstring("AutoTheme"), "AutoTheme is missing from help output")
	// 	})

	// })
	// It("should run successfully with version flag", func() {})
})

func TestMain(m *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(m, "CLI Suite")
}
