<template>
  <div id="ddei_editor_canvasview"
        class="ddei_editor_canvasview">
  </div>
</template>

<script lang="ts">
import DDei from '@/components/framework/js/ddei';


export default {
  name: "DDei-Editor-CanvasView",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      layers: [],
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    let ddInstance: DDei = DDei.newInstance("ddei_editor_view", "ddei_editor_canvasview");
    this.layers = ddInstance.stage.layers;
  }
};
</script>

<style scoped>
.ddei_editor_canvasview {
  background: blue;
  height:100%;
}
</style>
