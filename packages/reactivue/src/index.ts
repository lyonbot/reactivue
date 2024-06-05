export { useSetup } from './useSetup'
export { defineComponent } from './defineComponent'
export { watch, watchEffect } from './watch'
export { computed } from './computed'
export { createSetup } from './createSetup'
export { getCurrentInstance } from './component'
export { nextTick } from './nextTick'
export { warn } from './errorHandling'
export * from './mock'
export {
  onMounted,
  onBeforeMount,
  onUnmounted,
  onUpdated,
  onBeforeUnmount,
  onBeforeUpdate,
} from './lifecycle'

// redirect all APIs from @vue/reactivity
export {
  // computed,
  ComputedGetter,
  ComputedRef,
  ComputedSetter,
  customRef,
  DebuggerEvent,
  DeepReadonly,
  effect,
  effectScope,
  enableTracking,
  getCurrentScope,
  isProxy,
  isReactive,
  isReadonly,
  isRef,
  ITERATE_KEY,
  markRaw,
  onScopeDispose,
  pauseTracking,
  reactive,
  ReactiveEffect,
  ReactiveEffectOptions,
  ReactiveFlags,
  readonly,
  ref,
  Ref,
  RefUnwrapBailTypes,
  resetTracking,
  shallowReactive,
  shallowReadonly,
  shallowRef,
  stop,
  toRaw,
  toRef,
  toRefs,
  ToRefs,
  toValue,
  track,
  TrackOpTypes,
  trigger,
  TriggerOpTypes,
  triggerRef,
  unref,
  UnwrapRef,
  WritableComputedOptions,
  WritableComputedRef,
} from '@vue/reactivity'
