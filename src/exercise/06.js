// Fix "perf death by a thousand cuts"
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import {
  useForceRerender,
  useDebouncedState,
  AppGrid,
  updateGridState,
  updateGridCellState,
} from '../utils'

const GridStateContext = React.createContext()
const DogContext = React.createContext()
const GridDispatchContext = React.createContext()

const initialGrid = Array.from({length: 100}, () =>
  Array.from({length: 100}, () => Math.random() * 100),
)

function gridReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_GRID_CELL': {
      return {...state, grid: updateGridCellState(state.grid, action)}
    }
    case 'UPDATE_GRID': {
      return {...state, grid: updateGridState(state.grid)}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function dogReducer(state, action) {
  switch (action.type) {
    case 'TYPED_IN_DOG_INPUT': {
      return {...state, dogName: action.dogName}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function GridProvider({children}) {
  const [state, dispatch] = React.useReducer(gridReducer, {
    grid: initialGrid,
  })
  return (
    <GridStateContext.Provider value={state}>
      <GridDispatchContext.Provider value={dispatch}>
        {children}
      </GridDispatchContext.Provider>
    </GridStateContext.Provider>
  )
}

function DogProvider({children}) {
  const [state, dispatch] = React.useReducer(dogReducer, {
    dogName: '',
  })

  return (
    <DogContext.Provider value={[state, dispatch]}>
      {children}
    </DogContext.Provider>
  )
}

function useGridState() {
  const context = React.useContext(GridStateContext)
  if (!context) {
    throw new Error('useGridState must be used within the GridProvider')
  }
  return context
}

function useGridDispatch() {
  const context = React.useContext(GridDispatchContext)
  if (!context) {
    throw new Error('useGridDispatch must be used within the GridProvider')
  }
  return context
}

function useDog() {
  const context = React.useContext(DogContext)
  if (!context) {
    throw new Error('useDog must be used within the DogProvider')
  }
  return context
}

function Grid() {
  const dispatch = useGridDispatch()
  const [rows, setRows] = useDebouncedState(50)
  const [columns, setColumns] = useDebouncedState(50)
  const updateGridData = () => dispatch({type: 'UPDATE_GRID'})
  return (
    <AppGrid
      onUpdateGrid={updateGridData}
      rows={rows}
      handleRowsChange={setRows}
      columns={columns}
      handleColumnsChange={setColumns}
      Cell={Cell}
    />
  )
}
Grid = React.memo(Grid)

function withStateSlice(Comp, slice) {
  const MemoComp = React.memo(Comp)
  function Wrapper(props, ref) {
    const state = useGridState()

    return <MemoComp state={slice(state, props)} ref={ref} {...props} />
  }
  Wrapper.displayName = `withStateSlice(${Comp.displayName || Comp.name})`
  return React.memo(React.forwardRef(Wrapper))
}

function Cell({state: cell, row, column}) {
  const dispatch = useGridDispatch()
  const handleClick = () => dispatch({type: 'UPDATE_GRID_CELL', row, column})

  return (
    <button
      className="cell"
      onClick={handleClick}
      style={{
        color: cell > 50 ? 'white' : 'black',
        backgroundColor: `rgba(0, 0, 0, ${cell / 100})`,
      }}
    >
      {Math.floor(cell)}
    </button>
  )
}
Cell = withStateSlice(Cell, (state, {row, column}) => state.grid[row][column])

function DogNameInput() {
  const [{dogName}, dispatch] = useDog()

  function handleChange(event) {
    const newDogName = event.target.value
    dispatch({type: 'TYPED_IN_DOG_INPUT', dogName: newDogName})
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      <label htmlFor="dogName">Dog Name</label>
      <input
        value={dogName}
        onChange={handleChange}
        id="dogName"
        placeholder="Toto"
      />
      {dogName ? (
        <div>
          <strong>{dogName}</strong>, I've a feeling we're not in Kansas anymore
        </div>
      ) : null}
    </form>
  )
}
function App() {
  const forceRerender = useForceRerender()
  return (
    <div className="grid-app">
      <button onClick={forceRerender}>force rerender</button>
      <div>
        <DogProvider>
          <DogNameInput />
        </DogProvider>
        <GridProvider>
          <Grid />
        </GridProvider>
      </div>
    </div>
  )
}

export default App

/*
eslint
  no-func-assign: 0,
*/
