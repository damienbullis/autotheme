# Autotheme Makefile

# Main binary
BINARY := autotheme

# Build the project
build:
	go build -o $(BINARY) -v

# Run the project
run:
	go run main.go

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

# Not really sure what the difference is between vet and fmt

# Vet the project
vet:
	go vet ./...

# Format the project
fmt:
	gofmt -w .

# Run the project
all: clean build ./$(BINARY)
