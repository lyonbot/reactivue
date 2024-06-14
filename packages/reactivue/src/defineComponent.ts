import { useReducer } from 'react'
import { UnwrapRef, computed, markRaw, ref, toValue } from '@vue/reactivity'
import { USE_SETUP_NO_UPDATE, useSetup } from './useSetup'
import { watch } from './watch'

export function defineComponent<PropsType>(
  setupAndRenderFunction: (props: PropsType) => ((() => JSX.Element) | JSX.Element),
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
      const setupReturns = ref(setupFunction(props))

      const jsxElement
        = typeof renderFunction === 'function'
          ? computed(() => markRaw(renderFunction(setupReturns.value)))
          : computed(() => markRaw(toValue(setupReturns.value)))

      watch(jsxElement, () => {
        if (jsxElement.effect.dirty) forceUpdate() // force update only when new jsxElement is not taken by React
      }, { flush: 'post' })
      return { jsxElement }
    }, props, USE_SETUP_NO_UPDATE)

    return state.jsxElement
  }
}
