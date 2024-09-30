# Autotheme Makefile

.PHONY: build run clean install test vet fmt

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

# Test the project
test:
	go test -v ./...

# Vet the project
vet:
	go vet ./...

# Format the project
fmt:
	go fmt ./...
