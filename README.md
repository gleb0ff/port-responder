# README

## About

PortResponder is a program for sending and receiving messages to a port.

## Live Development

To run in live development mode, run `wails dev` in the project directory.

## Building

To build a redistributable, production mode package, use `wails build`.
The result will be located in the build folder 

## Cross Building example mac -> windows
wails generate bindings  
GOOS=windows GOARCH=amd64 wails build -ldflags="-H=windowsgui" -tags="desktop,production" -skipbindings

