import { ToastContainer } from 'react-toastify'

import { createTheme, ThemeProvider } from '@mui/material'
import { grey } from '@mui/material/colors'

import { CommandConsole } from './containers/CommandConsole/CommandConsole'
import { ConsoleProvider } from './conttext'

export const App = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: grey[900],
      },
      secondary: {
        main: grey[700],
      },
      background: {
        default: grey[0],
        paper: grey[50],
      },
      text: {
        primary: grey[900],
        secondary: grey[1000],
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <ConsoleProvider>
        <CommandConsole />
        <ToastContainer hideProgressBar={true} />
      </ConsoleProvider>
    </ThemeProvider>
  )
}
