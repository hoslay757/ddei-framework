<template>
  <div>
    <div id="ddei_editor_canvasyview"
         class="ddei_editor_canvasyview">
    </div>
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
    return {};
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    DDei.newInstance("ddei_editor_yview", "ddei_editor_canvasyview");
  },
};
</script>

<style scoped>
.ddei_editor_canvasyview {
  background: blue;
}
</style>
