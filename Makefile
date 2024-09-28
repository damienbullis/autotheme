# Autotheme Makefile

.PHONY: help build build-all run clean install test vet fmt

# Build the project
build:
	go build -o autotheme
build-all:
	./build.sh

# Run the project
run:
	go run . $(ARGS)

# Clean the project
clean:
	go clean
	rm -rf bin

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
