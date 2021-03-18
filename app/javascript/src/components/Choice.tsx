import * as React from 'react'
import { FC, useRef } from 'react'
import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { XYCoord } from 'dnd-core'
import { DefaultPortModel } from 'storm-react-diagrams';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import MenuIcon from '@material-ui/icons/Menu';

interface ChoiceProps {
  id: any
  index: number
  port: DefaultPortModel
  removeChoice: () => void
  updateChoice: () => void
  optionsButtonClick: () => void
  moveChoice: (dragIndex: number, hoverIndex: number) => void
  optionsOpen: boolean
}

const ItemTypes = {
  CHOICE: 'choice'
}

interface DragItem {
  index: number
  id: string
  type: string
}

export const Choice: FC<ChoiceProps> = ({ id, index, port, removeChoice, updateChoice, optionsButtonClick, moveChoice, optionsOpen }) => {
  const ref = useRef<HTMLButtonElement>(null)

  const [{ handlerId }, drop] = useDrop({
		accept: ItemTypes.CHOICE,
		collect(monitor) {
			return {
				handlerId: monitor.getHandlerId(),
			}
		},
    hover(item: DragItem, monitor: DropTargetMonitor) {
			if (!ref.current) {
				return
			}

			const dragIndex = item.index
			const hoverIndex = index

			if (dragIndex === hoverIndex) {
				return
			}

      const hoverBoundingRect = ref.current.getBoundingClientRect()

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      const clientOffset = monitor.getClientOffset()

      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      moveChoice(dragIndex, hoverIndex)

      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: ItemTypes.CHOICE, id, index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  return (
    <div ref={preview}>
      <li data-handler-id={handlerId} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <button ref={ref} style={{cursor: 'move'}}>
          <UnfoldMoreIcon />
        </button>
        <input defaultValue={port.label} onChange={updateChoice} />{' '}
        <button onClick={optionsButtonClick}>
          {optionsOpen ? <MenuOpenIcon /> : <MenuIcon />}
        </button>
        <button onClick={removeChoice}>
          <DeleteOutlineIcon />
        </button>
      </li>
    </div>
  )
};