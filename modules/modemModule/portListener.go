package modemModule

import (
	"bufio"
	"context"
	"fmt"
	"go.bug.st/serial"
)

func (m *ModemModule) starListener(portName string, port serial.Port, listenerFunc ListenerFunc) error {

	if _, exists := m.cancelFuncs[portName]; !exists {
		modemCtx, cancel := context.WithCancel(m.ctx)

		m.mu.Lock()
		m.cancelFuncs[portName] = cancel
		m.mu.Unlock()

		m.wg.Add(1)
		go listenerFunc(modemCtx, port, portName)
	} else {
		return fmt.Errorf("listener already started for modem %s\n", portName)
	}
	return nil
}

func (m *ModemModule) stopListener(portName string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if cancel, exists := m.cancelFuncs[portName]; exists {
		cancel()
		delete(m.cancelFuncs, portName)
		fmt.Printf("Listener for modem %s stopped\n", portName)
	} else {
		fmt.Printf("No listener found for modem %s\n", portName)
	}
}

func (m *ModemModule) stopAllListeners() {
	m.mu.Lock()
	defer m.mu.Unlock()

	for port, cancel := range m.cancelFuncs {
		cancel()
		fmt.Printf("Listener for modem %s stopped\n", port)
	}

	m.cancelFuncs = make(map[string]context.CancelFunc)

	m.wg.Wait()
	fmt.Println("All listeners stopped")
}

func (m *ModemModule) baseListener(ctx context.Context, port serial.Port, portName string, readHandler func(line string), cancelHandler func()) {
	m.wg.Done()
	lines := make(chan string)

	go func() {
		defer close(lines)
		scanner := bufio.NewScanner(port)
		for scanner.Scan() {
			lines <- scanner.Text()
		}
		if err := scanner.Err(); err != nil {
			fmt.Printf("Error reading from port %s: %v", portName, err)
			cancelHandler() // TODO probably this is  defer ?
		}
	}()

	for {
		select {
		case <-ctx.Done():
			return
		case line, ok := <-lines:
			if !ok {
				fmt.Printf("Listener on port %s finished reading\n", portName)
				return
			}
			fmt.Println("line:", line)
			readHandler(line)
		}
	}
}
