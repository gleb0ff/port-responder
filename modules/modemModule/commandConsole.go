package modemModule

import (
	"context"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go.bug.st/serial"
	"strings"
)

func (m *ModemModule) startCommandConsoleListener(portName string, portMode *serial.Mode) error {
	fmt.Printf("start command console listener at port %s", portName)
	port, err := m.openPort(portName, portMode)
	if err != nil {
		return fmt.Errorf("port opening error %s: %v", portName, err)
	}
	return m.starListener(portName, port, m.commandConsoleHandler)
}

func (m *ModemModule) stopCommandConsoleListener(portName string) {
	fmt.Printf("stop command console listener at port %s", portName)
	m.stopListener(portName)
	m.closePortByPortName(portName)
}

func (m *ModemModule) commandConsoleReadHandler() func(line string) {
	return func(line string) {
		runtime.EventsEmit(m.ctx, "commandTester", strings.TrimSpace(line))
	}
}
func (m *ModemModule) commandConsoleCancelHandler(portName string) func() {
	return func() {
		m.stopCommandConsoleListener(portName)
	}
}

func (m *ModemModule) commandConsoleHandler(ctx context.Context, port serial.Port, portName string) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("panic in goroutine defaultListener at port %s: %v", portName, r)
		}
	}()
	commandConsoleReadHandler := m.commandConsoleReadHandler()
	commandConsoleCancelHandler := m.commandConsoleCancelHandler(portName)
	m.baseListener(ctx, port, portName, commandConsoleReadHandler, commandConsoleCancelHandler)
}

func (m *ModemModule) commandConsoleExecute(command string, portName string) error {
	fmt.Printf("Execute command %s at port %s", command, portName)
	port, exists := m.openPorts[portName]

	if !exists {
		return fmt.Errorf("port %s is not open", portName)
	}
	_, err := port.Write([]byte(command + "\r"))
	if err != nil {
		fmt.Printf("error reading response: %v", err)
		return err
	}
	return nil
}
