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

var _ = Describe("AutoTheme", Ordered, func() {
	Describe("Root ", func() {
		Describe("command", func() {
			var output string
			var err error
			var content string
			BeforeAll(func() {
				output, err = suite.RunCommand("-o", "test/index.css")

				// Read the content of the file
				file, _ := os.ReadFile("test/index.css")
				content = string(file)
			})
			It("should run successfully", func() {
				Expect(err).ShouldNot(HaveOccurred(), "CLI execution failed")
			})
			It("should output to the terminal", func() {
				Expect(output).Should(ContainSubstring("AutoTheme"), "AutoTheme is missing from output")
			})
			It("generate a index.css file", func() {
				Expect(content).ShouldNot(BeEmpty(), "index.css should exist")
			})
		})

		Describe("flags", func() {})
	})

	Describe("Init", func() {
		Describe("command", func() {})
		Describe("flags", func() {})
	})
})

func TestMain(m *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(m, "CLI Suite")
}
