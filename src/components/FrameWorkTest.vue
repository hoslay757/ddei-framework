<template>
  <div>
    <div id="ddei_demo_container"
         class="demo_container">
    </div>
  </div>
</template>

<script lang="ts">
import DDei from "./framework/js/ddei";

export default {
  name: "DDeiTest",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    DDei.newInstance("ddei_demo", "ddei_demo_container");
  },
};
</script>

<style scoped>
.demo_container {
  width: 100%;
  height: calc(100vh - 235px);
  overflow: auto;
  background-color: aquamarine;
}
</style>
