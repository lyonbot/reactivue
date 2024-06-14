import { useReducer } from 'react'
import { UnwrapRef, computed } from '@vue/reactivity'
import { USE_SETUP_NO_UPDATE, useSetup } from './useSetup'
import { watch } from './watch'

export function defineComponent<PropsType>(
  setupAndRenderFunction: (props: PropsType) => () => JSX.Element,
): (props: PropsType) => JSX.Element
export function defineComponent<PropsType, State>(
  setupFunction: (props: PropsType) => State,
  renderFunction: (state: UnwrapRef<State>) => JSX.Element,
): (props: PropsType) => JSX.Element
export function defineComponent(
  setupFunction: (props: any) => any,
  renderFunction?: (state: any) => JSX.Element,
): (props: any) => JSX.Element {
  return (props) => {
    const forceUpdate = useReducer(v => (v + 1) % 0xFFFFFFFF, 0)[1] as () => void
    const state = useSetup((props) => {
      const setupReturns = setupFunction(props)
      const realRenderFunction = renderFunction ? () => realRenderFunction(setupReturns) : setupReturns
      if (!renderFunction && typeof realRenderFunction !== 'function')
        throw new Error('setup must return a render function, or provide a render function separately')

      const jsxElement = computed(() => realRenderFunction())

      watch(jsxElement, () => {
        if (jsxElement.effect.dirty) forceUpdate() // force update only when new jsxElement is not taken by React
      }, { flush: 'post' })
      return { jsxElement }
    }, props, USE_SETUP_NO_UPDATE)

    return state.jsxElement
  }
}
