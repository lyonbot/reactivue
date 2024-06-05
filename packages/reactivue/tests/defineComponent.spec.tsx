import React, { act, useReducer } from 'react'
import { render } from '@testing-library/react'
import { screen, waitFor } from '@testing-library/dom'
import { computed, defineComponent, ref } from '../src'

const DefineTest = defineComponent(() => {
  const msg = ref('Hello, world!')

  return {
    msg,
  }
}, ({ msg }) => {
  return <p>{msg}</p>
})

it('should render basic defineComponent component', async() => {
  render(<DefineTest />)

  await waitFor(() => {
    const el = screen.getByText('Hello, world!')
    expect(el).toBeInTheDocument()
  })
})

it('defineComponent should accept single function', async() => {
  let defineTest2RenderTimes = 0

  const DefineTestV2 = defineComponent((props: { goodbye: boolean }) => {
    const msg = computed(() => props.goodbye ? 'Goodbye, world!' : 'Hello, world!')
    // eslint-disable-next-line react/display-name
    return () => {
      defineTest2RenderTimes++
      return <p>{msg.value}</p>
    }
  })

  function MockApp() {
    const [counter, update] = useReducer(x => x + 1, 0)
    return <div>
      <p>Counter: {counter}</p>
      <p><button onClick={update}>update counter</button></p>
      <DefineTestV2 goodbye={counter >= 2} />
    </div>
  }

  act(() => {
    render(<MockApp />)
  })

  // first render

  expect(screen.getByText('Hello, world!')).toBeInTheDocument()
  expect(defineTest2RenderTimes).toBe(1)
  expect(screen.getByText('Counter: 0')).toBeInTheDocument()

  // 2nd render, DefineTestV2 not re-rendered

  act(() => screen.getByText('update counter').click())
  expect(screen.getByText('Hello, world!')).toBeInTheDocument()
  expect(defineTest2RenderTimes).toBe(1) // not re-rendered
  expect(screen.getByText('Counter: 1')).toBeInTheDocument()

  // 3rd render, DefineTestV2 re-rendered

  act(() => screen.getByText('update counter').click())
  expect(screen.getByText('Goodbye, world!')).toBeInTheDocument() // <-- !
  expect(defineTest2RenderTimes).toBe(2) // <-- !
  expect(screen.getByText('Counter: 2')).toBeInTheDocument()
})
