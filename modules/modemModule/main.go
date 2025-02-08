package modemModule

import (
	"context"
	"go.bug.st/serial"
	"sync"
)

type ModemModule struct {
	ctx         context.Context
	openPorts   map[string]serial.Port
	cancelFuncs map[string]context.CancelFunc
	mu          sync.Mutex
	wg          sync.WaitGroup
}

type ListenerFunc func(ctx context.Context, port serial.Port, portName string)

var defaultPortMode = &serial.Mode{
	BaudRate: 115200,
	Parity:   serial.NoParity,
	DataBits: 8,
	StopBits: serial.OneStopBit,
}

func NewModemModule(ctx context.Context) *ModemModule {
	return &ModemModule{
		ctx:         ctx,
		openPorts:   make(map[string]serial.Port),
		cancelFuncs: make(map[string]context.CancelFunc),
	}
}

func (m *ModemModule) SetCtx(ctx context.Context) {
	m.ctx = ctx
}
