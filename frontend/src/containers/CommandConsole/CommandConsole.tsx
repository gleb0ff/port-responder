import React, { ChangeEvent, ChangeEventHandler, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import {
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material'
import Checkbox from '@mui/material/Checkbox'

import { serial } from '../../../wailsjs/go/models'
import {
  CommandConsoleExecute,
  ScanPorts,
  StartCommandConsoleListener,
  StopCommandConsoleListener,
} from '../../../wailsjs/go/modemModule/ModemModule'
import { EventsOff, EventsOn } from '../../../wailsjs/runtime'
import { useConsole } from '../../conttext'
import { baudRates, dataBitsOptions, parityOptions, stopBitsOptions } from './entity'

export const CommandConsole = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingScan, setIsLoadingScan] = useState(false)

  const { state, dispatch } = useConsole()

  const {
    result,
    port,
    ports,
    command,
    isPortOpened,
    stopBits,
    parity,
    RTS,
    DTR,
    baudRate,
    dataBits,
    lastCommands,
  } = state

  const ref = useRef(null)

  useEffect(() => {
    let noEvents = false
    try {
      const handler = (message: string) => {
        dispatch({ type: 'SET_RESULT', payload: { type: 'res', value: message } })
      }

      EventsOn('commandTester', handler)
    } catch {
      noEvents = true
    }
    return () => !noEvents && EventsOff('commandTester')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    ref.current.scrollTop = ref.current.scrollHeight
  }, [result])

  const openPortHandle = () => {
    const mode = new serial.Mode({
      BaudRate: baudRate,
      DataBits: dataBits,
      Parity: parity,
      StopBits: stopBits,
      InitialStatusBits: {
        RTS: RTS,
        DTR: DTR,
      },
    })
    StartCommandConsoleListener(port, mode)
      .then(() => {
        dispatch({ type: 'SET_IS_PORT_OPENED', payload: true })
      })
      .catch((e) => {
        toast('Something went wrong ' + e, { type: 'error' })
      })
  }
  const closePortHandle = () => {
    StopCommandConsoleListener(port)
      .then(() => {
        dispatch({ type: 'SET_IS_PORT_OPENED', payload: false })
      })
      .catch((e) => {
        toast('Something went wrong ' + e, { type: 'error' })
      })
  }

  const setPortHandle: ChangeEventHandler = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_PORT', payload: e.target.value })
  }
  const setCommandHandle = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_COMMAND', payload: e.target.value })
  }
  const onChangeAutocomplete = (_, value: string) => {
    dispatch({ type: 'SET_COMMAND', payload: value })
  }
  const setBaudRateHandle = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_BAUD_RATE', payload: Number(e.target.value) })
  }
  const setDataBitsHandle = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_DATA_BITS', payload: Number(e.target.value) })
  }
  const setPartyHandle = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_PARITY', payload: Number(e.target.value) })
  }
  const setStopBitsHandle = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_STOP_BITS', payload: Number(e.target.value) })
  }
  const setRTSHandle = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_RTS', payload: e.target.checked })
  }
  const setDTRHandle = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_DTR', payload: e.target.checked })
  }

  const scanPortsHandle = () => {
    setIsLoadingScan(true)
    ScanPorts()
      .then((ports) => {
        dispatch({
          type: 'SET_PORTS',
          payload: ports.sort().map((item) => ({ value: item, label: item })),
        })
      })
      .catch((e) => {
        toast('Something went wrong ' + e, { type: 'error' })
      })
      .finally(() => {
        setIsLoadingScan(false)
      })
  }

  const sendCommand = () => {
    if (!port || !command || !baudRate) return

    setIsLoading(true)
    CommandConsoleExecute(command, port)
      .catch((e) => {
        toast('Something went wrong ' + e, { type: 'error' })
      })
      .then(() => {
        dispatch({ type: 'SET_RESULT', payload: { type: 'req', value: '--> ' + command } })
        dispatch({ type: 'SET_LAST_COMMAND', payload: command })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <Box sx={{ height: '100vh', p: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Box sx={{ display: 'flex', gap: '10px', height: '100%' }}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            border: '1px solid #ddd',
            maxWidth: '700px',
            p: '5px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            ref={ref}
            sx={{
              width: '100%',
              height: '100%',
              overflowX: 'hidden',
              overflowY: 'auto',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
            }}
          >
            {result.map((e, i) => (
              <div key={i} style={e.type === 'req' ? { color: '#aeb2ae' } : {}}>
                {e.value}
              </div>
            ))}
          </Box>
          <IconButton
            onClick={() => dispatch({ type: 'RESET_RESULT' })}
            sx={{ position: 'absolute', right: '10px', top: 0 }}
            disabled={!result}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', width: '320px', gap: '30px', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outlined"
              onClick={scanPortsHandle}
              loading={isLoadingScan}
              sx={{ height: '40px' }}
              size="small"
              fullWidth
              disabled={isPortOpened}
            >
              scan
            </Button>
            <TextField
              select
              label="Port"
              value={port}
              onChange={setPortHandle}
              fullWidth
              size="small"
              disabled={!ports.length || isPortOpened}
            >
              {ports.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outlined"
              onClick={openPortHandle}
              sx={{ height: '40px' }}
              fullWidth
              size="small"
              disabled={isPortOpened || !port}
            >
              open
            </Button>
            <Button
              variant="outlined"
              onClick={closePortHandle}
              sx={{ height: '40px' }}
              size="small"
              fullWidth
              disabled={!isPortOpened}
            >
              close
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <TextField
              select
              label="Baud Rate"
              value={baudRate}
              onChange={setBaudRateHandle}
              fullWidth
              size="small"
              disabled={isPortOpened}
            >
              {baudRates.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Data Bits"
              value={dataBits}
              onChange={setDataBitsHandle}
              disabled={isPortOpened}
              fullWidth
              size="small"
            >
              {dataBitsOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <TextField
              select
              label="Party"
              value={parity}
              onChange={setPartyHandle}
              disabled={isPortOpened}
              fullWidth
              size="small"
            >
              {parityOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Stop Bits"
              value={stopBits}
              onChange={setStopBitsHandle}
              disabled={isPortOpened}
              fullWidth
              size="small"
            >
              {stopBitsOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <FormControlLabel
              control={<Checkbox checked={RTS} />}
              label="RTS"
              onChange={setRTSHandle}
              disabled={isPortOpened}
            />
            <FormControlLabel
              control={<Checkbox checked={DTR} />}
              label="DTR"
              onChange={setDTRHandle}
              disabled={isPortOpened}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: '10px' }}>
        <Autocomplete
          size="small"
          disablePortal
          freeSolo
          options={lastCommands}
          onChange={onChangeAutocomplete}
          sx={{ width: '520px' }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Command"
              variant="outlined"
              onChange={setCommandHandle}
              value={command}
            />
          )}
        />
        <Button
          variant="outlined"
          onClick={sendCommand}
          loading={isLoading}
          sx={{ width: '220px' }}
          disabled={!ports.length || !command || !isPortOpened}
        >
          go
        </Button>
      </Box>
    </Box>
  )
}
