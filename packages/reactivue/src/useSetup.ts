import { UnwrapRef, ref, readonly, unref, shallowReactive } from '@vue/reactivity'
import { useState, useEffect, useReducer } from 'react'
import { getNewInstanceId, createNewInstanceWithId, useInstanceScope, unmountInstance } from './component'
import { watch } from './watch'
import { invokeLifeCycle } from './lifecycle'
import { LifecycleHooks } from './types'

export const USE_SETUP_NO_UPDATE = 1

export function useSetup<State, Props = {}>(
  setupFunction: (props: Props) => State,
  ReactProps?: Props,
  flags = 0,
): UnwrapRef<State> {
  const id = useState(getNewInstanceId)[0]

  const forceUpdate = useReducer(v => (v + 1) & 0xFFFFFFFF, 0)[1] as () => void

  const createState = () => {
    const props = shallowReactive({ ...(ReactProps || {}) }) as any
    const instance = createNewInstanceWithId(id, props)

    useInstanceScope(id, () => {
      const setupState: Record<any, any> = setupFunction(readonly(props)) ?? {}
      const data = ref(setupState)

      invokeLifeCycle(LifecycleHooks.BEFORE_MOUNT)

      instance.data = data

      if (__DEV__) {
        for (const key of Object.keys(setupState))
          instance.initialState[key] = unref(setupState[key])
      }
    })

    return instance.data.value
  }

  // run setup function
  const [state, setState] = useState(createState)

  // sync props changes, in each rendering
  if (ReactProps) {
    useInstanceScope(id, (instance) => {
      if (!instance)
        return
      const { props } = instance
      const oldKeys = Object.keys(props)
      for (const key of Object.keys(ReactProps)) {
        props[key] = (ReactProps as any)[key]

        const oldIndex = oldKeys.indexOf(key)
        if (oldIndex !== -1)
          oldKeys.splice(oldIndex, 1)
      }
      for (const key of oldKeys)
        delete props[key]
    })
  }

  // trigger React re-render on data changes
  useEffect(() => {
    /**
     * Invalidate setup after hmr updates
     */
    if (__DEV__) {
      let isChanged = false

      useInstanceScope(id, (instance) => {
        if (!instance)
          return

        if (!instance.isUnmounting)
          return

        const props = Object.assign({}, (ReactProps || {})) as any
        const setup = setupFunction(readonly(props)) as Record<any, any>

        for (const key of Object.keys(setup)) {
          if (isChanged)
            break

          if (typeof instance.initialState[key] === 'function')
            isChanged = instance.initialState[key].toString() !== setup[key].toString()
          else
            isChanged = instance.initialState[key] !== unref(setup[key])
        }

        instance.isUnmounting = false
      })

      if (isChanged)
        setState(createState())
    }

    useInstanceScope(id, (instance) => {
      if (!instance)
        return

      // Avoid repeated execution of onMounted and watch after hmr updates in development mode
      if (instance.isMounted)
        return

      instance.isMounted = true

      invokeLifeCycle(LifecycleHooks.MOUNTED)

      const { data } = instance
      if (!(USE_SETUP_NO_UPDATE & flags)) {
        watch(
          data,
          () => {
            /**
             * Prevent triggering rerender when component
             * is about to unmount or really unmounted
             */
            if (instance.isUnmounting)
              return

            useInstanceScope(id, () => {
              invokeLifeCycle(LifecycleHooks.BEFORE_UPDATE, instance)
              // trigger React update
              forceUpdate()
              invokeLifeCycle(LifecycleHooks.UPDATED, instance)
            })
          },
          { deep: true, flush: 'post' },
        )
      }
    })

    return () => {
      unmountInstance(id)
    }
  }, [])

  return state
}
