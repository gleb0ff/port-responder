package modemModule

import (
	"go.bug.st/serial"
)

func (m *ModemModule) StartCommandConsoleListener(portName string, portMode *serial.Mode) error {
	return m.startCommandConsoleListener(portName, portMode)
}
func (m *ModemModule) StopCommandConsoleListener(portName string) {
	m.stopCommandConsoleListener(portName)
}
func (m *ModemModule) CommandConsoleExecute(command string, portName string) error {
	return m.commandConsoleExecute(command, portName)
}
func (m *ModemModule) ScanPorts() []string {
	return m.scanPorts()
}
func (m *ModemModule) CloseAllPorts() {
	m.closeAllPorts()
}
func (m *ModemModule) StopAllListeners() {
	m.stopAllListeners()
}
