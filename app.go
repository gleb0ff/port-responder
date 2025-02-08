package main

import (
	"context"
	"fmt"
	"portResponder/modules/modemModule"
	"sync"
)

// App struct
type App struct {
	ctx         context.Context
	mu          sync.RWMutex
	ModemModule *modemModule.ModemModule
}

// NewApp creates a new App application struct
func NewApp() *App {
	ctx := context.Background()
	// Создаём приложение
	app := &App{
		ctx: ctx,
	}
	app.ModemModule = modemModule.NewModemModule(ctx)

	return app
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.ModemModule.SetCtx(ctx)

}

func (a *App) shutdown() {
	fmt.Println("Shutting down application...")
	if a.ModemModule != nil {
		a.ModemModule.StopAllListeners()
		a.ModemModule.CloseAllPorts()
		fmt.Println("All things stopped.")
	}
}
