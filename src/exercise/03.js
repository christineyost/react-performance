// React.memo for reducing unnecessary re-renders
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react'
import {useCombobox} from '../use-combobox'
import {getItems} from '../workerized-filter-cities'
import {useAsync, useForceRerender} from '../utils'

function Menu({
  items,
  getMenuProps,
  getItemProps,
  highlightedIndex,
  selectedItem,
}) {
  return (
    <ul {...getMenuProps()}>
      {items.map((item, index) => {
        const isSelected = selectedItem?.id === item.id
        const isHighlighted = highlightedIndex === index

        return (
          <ListItem
            key={item.id}
            getItemProps={getItemProps}
            item={item}
            index={index}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
          >
            {item.name}
          </ListItem>
        )
      })}
    </ul>
  )
}

Menu = React.memo(Menu)

function ListItem({
  getItemProps,
  item,
  index,
  isSelected,
  isHighlighted,
  ...props
}) {
  return (
    <li
      {...getItemProps({
        index,
        item,
        style: {
          fontWeight: isSelected ? 'bold' : 'normal',
          backgroundColor: isHighlighted ? 'lightgray' : 'inherit',
        },
        ...props,
      })}
    />
  )
}

// ListItem = React.memo(ListItem, (prevProps, newProps) => {
//   if (prevProps.getItemProps !== newProps.getItemProps) return false
//   if (prevProps.item !== newProps.item) return false
//   if (prevProps.index !== newProps.index) return false
//   if (prevProps.selectedItem !== newProps.selectedItem) return false

//   if (prevProps.highlightedIndex !== newProps.highlightedIndex) {
//     const wasPreviouslyHighlighted =
//       prevProps.highlightedIndex === prevProps.index
//     const isCurrentlyHighlighted = newProps.highlightedIndex === newProps.index
//     return wasPreviouslyHighlighted === isCurrentlyHighlighted
//   }

//   return true
// })

ListItem = React.memo(ListItem)

function App() {
  const forceRerender = useForceRerender()
  const [inputValue, setInputValue] = React.useState('')

  const {data: allItems, run} = useAsync({data: [], status: 'pending'})
  React.useEffect(() => {
    run(getItems(inputValue))
  }, [inputValue, run])
  const items = allItems.slice(0, 100)

  const {
    selectedItem,
    highlightedIndex,
    getComboboxProps,
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    selectItem,
  } = useCombobox({
    items,
    inputValue,
    onInputValueChange: ({inputValue: newValue}) => setInputValue(newValue),
    onSelectedItemChange: ({selectedItem}) =>
      alert(
        selectedItem
          ? `You selected ${selectedItem.name}`
          : 'Selection Cleared',
      ),
    itemToString: item => (item ? item.name : ''),
  })

  return (
    <div className="city-app">
      <button onClick={forceRerender}>force rerender</button>
      <div>
        <label {...getLabelProps()}>Find a city</label>
        <div {...getComboboxProps()}>
          <input {...getInputProps({type: 'text'})} />
          <button onClick={() => selectItem(null)} aria-label="toggle menu">
            &#10005;
          </button>
        </div>
        <Menu
          items={items}
          getMenuProps={getMenuProps}
          getItemProps={getItemProps}
          highlightedIndex={highlightedIndex}
          selectedItem={selectedItem}
        />
      </div>
    </div>
  )
}

export default App

/*
eslint
  no-func-assign: 0,
*/
