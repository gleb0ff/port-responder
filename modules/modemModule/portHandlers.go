package modemModule

import (
	"fmt"
	"go.bug.st/serial"
	"go.bug.st/serial/enumerator"
)

func (m *ModemModule) openPort(portName string, portMode *serial.Mode) (serial.Port, error) {

	if portMode == nil {
		portMode = defaultPortMode
	}
	fmt.Printf("opening  port %s", portName)

	port, exists := m.openPorts[portName]
	if exists {
		return port, nil
	}

	port, err := serial.Open(portName, portMode)
	if err != nil {
		return nil, err
	}
	m.mu.Lock()
	m.openPorts[portName] = port
	m.mu.Unlock()
	return port, err
}

func (m *ModemModule) closePortByPortName(portName string) {
	fmt.Printf("closing  port %s", portName)
	port, exists := m.openPorts[portName]

	if exists {
		err := port.Close()
		if err != nil {
			fmt.Printf("port closing error %s: %v", portName, err)
		}
		m.mu.Lock()
		delete(m.openPorts, portName)
		m.mu.Unlock()
	} else {
		fmt.Printf("port not opened %s", portName)
	}
}
func (m *ModemModule) closeAllPorts() {
	m.mu.Lock()
	defer m.mu.Unlock()
	for name, port := range m.openPorts {
		_ = port.Close()

		delete(m.openPorts, name)
	}
}

func (m *ModemModule) scanPorts() []string {
	var processedPorts []string
	ports, err := enumerator.GetDetailedPortsList()
	if err != nil {
		return processedPorts
	}
	if len(ports) == 0 {
		return processedPorts
	}

	for _, portItem := range ports {
		processedPorts = append(processedPorts, portItem.Name)
	}

	return processedPorts
}
