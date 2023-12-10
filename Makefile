# Autotheme Makefile

# Main binary
BINARY := autotheme

# Build the project
build:
	go build -o $(BINARY) -v

# Run the project
run:
	go run main.go $(ARGS)

# Clean the project
clean:
	go clean
	rm -f $(BINARY)

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

# Run the project
all: clean build ./$(BINARY)
