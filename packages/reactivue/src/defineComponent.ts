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
  if (!renderFunction) {
    return (props) => {
      const forceUpdate = useReducer(v => (v + 1) % 0xFFFFFFFF, 0)[1] as () => void
      const state = useSetup((props) => {
        const renderFunction = setupFunction(props)
        const jsxElement = computed(() => renderFunction())

        watch(jsxElement, () => {
          if (jsxElement.effect.dirty) forceUpdate() // force update only when new jsxElement is not taken by React
        }, { flush: 'post' })
        return { jsxElement }
      }, props, USE_SETUP_NO_UPDATE)

      return state.jsxElement
    }
  }

  return (props) => {
    const state = useSetup(setupFunction, props)
    return renderFunction(state)
  }
}
