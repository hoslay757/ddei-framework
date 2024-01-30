<template>
  <router-view v-slot="{ Component, route }">
    <transition :duration="300" leave-active-class="animate__animated animate__fadeInRight"
      enter-active-class="animate__animated animate__fadeInLeft">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script lang="ts">
export default {
  name: "APP-DDEI",
  extends: null,
  mixins: [],
  props: {},
  //注册组件
  components: {},
  data() {
    return {
      layers: [],
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() { },
  methods: {},
};
</script>
<style>
body {
  display: block;
}

#app {
  padding: 0;
  margin: 0;
  display: block;
  max-width: 100%;
}

.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  font-size: 18px;
}
</style>
