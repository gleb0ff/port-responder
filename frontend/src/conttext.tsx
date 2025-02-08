import React, { createContext, ReactNode, useContext, useReducer } from 'react'

export interface ISelectOptions {
  value: string
  label: string
}
export interface IResult {
  type: 'req' | 'res'
  value: string
}

export interface IConsoleState {
  port: string
  baudRate: number
  dataBits: number
  stopBits: number
  parity: number
  RTS: boolean
  DTR: boolean
  result: IResult[]
  isPortOpened: boolean
  ports: ISelectOptions[]
  command: string
  lastCommands: string[]
}

const initialState: IConsoleState = {
  port: '',
  baudRate: 115200,
  dataBits: 8,
  stopBits: 0,
  parity: 0,
  RTS: true,
  DTR: true,
  result: [],
  isPortOpened: false,
  ports: [],
  command: '',
  lastCommands: [],
}

type Action =
  | { type: 'SET_PORT'; payload: string }
  | { type: 'SET_BAUD_RATE'; payload: number }
  | { type: 'SET_DATA_BITS'; payload: number }
  | { type: 'SET_STOP_BITS'; payload: number }
  | { type: 'SET_PARITY'; payload: number }
  | { type: 'SET_RTS'; payload: boolean }
  | { type: 'SET_DTR'; payload: boolean }
  | { type: 'SET_IS_PORT_OPENED'; payload: boolean }
  | { type: 'SET_RESULT'; payload: IResult }
  | { type: 'RESET_RESULT' }
  | { type: 'SET_COMMAND'; payload: string }
  | { type: 'SET_PORTS'; payload: ISelectOptions[] }
  | { type: 'SET_LAST_COMMAND'; payload: string }

const consoleReducer = (state: IConsoleState, action: Action): IConsoleState => {
  switch (action.type) {
    case 'SET_PORT':
      return { ...state, port: action.payload }
    case 'SET_BAUD_RATE':
      return { ...state, baudRate: action.payload }
    case 'SET_DATA_BITS':
      return { ...state, dataBits: action.payload }
    case 'SET_STOP_BITS':
      return { ...state, stopBits: action.payload }
    case 'SET_PARITY':
      return { ...state, parity: action.payload }
    case 'SET_RTS':
      return { ...state, RTS: action.payload }
    case 'SET_DTR':
      return { ...state, DTR: action.payload }
    case 'SET_IS_PORT_OPENED':
      return { ...state, isPortOpened: action.payload }
    case 'SET_RESULT':
      return { ...state, result: [...state.result, action.payload] }
    case 'RESET_RESULT':
      return { ...state, result: [] }
    case 'SET_COMMAND':
      return { ...state, command: action.payload }
    case 'SET_PORTS':
      return { ...state, ports: action.payload }
    case 'SET_LAST_COMMAND': {
      const updatedCommands = [...state.lastCommands, action.payload]
      if (updatedCommands.length > 10) {
        updatedCommands.shift()
      }
      return { ...state, lastCommands: updatedCommands }
    }
    default:
      return state
  }
}

const ConsoleContext = createContext<{
  state: IConsoleState
  dispatch: React.Dispatch<Action>
}>({
  state: initialState,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispatch: () => {},
})

export const ConsoleProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(consoleReducer, initialState)

  return <ConsoleContext.Provider value={{ state, dispatch }}>{children}</ConsoleContext.Provider>
}

export const useConsole = () => {
  const context = useContext(ConsoleContext)
  if (!context) {
    throw new Error('useConsole must be used within a ConsoleProvider')
  }
  return context
}
