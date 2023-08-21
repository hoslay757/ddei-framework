<template>
  <button :class="[classString]" :disabled="disabled">
    <slot></slot>
  </button>
  <h1>112233</h1>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import './index.scss'

const Props = {
  type: {
    type: String as PropType<string>, // 转为ts类型string
    default: 'default'
  },
  disabled: {
    type: Boolean as PropType<boolean>,
    default: false
  },
}

export default defineComponent({
  name: 'WeButton',
  props: Props,
  setup(props) {
    const classString = [
      'we-button',
      `we-button-type-${props.type}`,
      props.disabled ? 'we-button-disabled' : ''
    ]
    return {
      classString
    }
  }
})
</script>
