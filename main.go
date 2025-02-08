package main

import (
	"embed"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {

	app := NewApp()
	defer app.shutdown()

	// Create application with options
	err := wails.Run(&options.App{
		Title:         "Port responder",
		Width:         800,
		Height:        600,
		DisableResize: true,

		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
			app.ModemModule,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
