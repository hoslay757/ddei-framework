<template>
  <router-view />
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
  created() {},
  mounted() {},
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
</style>
