# Autotheme Makefile

.PHONY: build run clean install test test-watch vet fmt

# Build the project locally
build:
	go build -o dist/autotheme

# Run the project
run:
	go run . $(ARGS)

# Clean the project
clean:
	go clean
	rm -rf dist

# Install the project
install:
	go install

# Run all tests
test:
	ginkgo -v ./...

# Watch mode for tests
test-watch:
	ginkgo watch -v ./...

# Vet the project
vet:
	go vet ./...

# Format the project
fmt:
	go fmt ./...
