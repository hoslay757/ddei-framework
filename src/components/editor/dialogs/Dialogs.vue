<template>
  <div id="dialog_background_div" class="dialog_background_div"></div>
  <CloseFileConfirmDialog></CloseFileConfirmDialog>
</template>

<script lang="ts">
import CloseFileConfirmDialog from "./CloseFileConfirmDialog.vue";
export default {
  name: "DDei-Editor-Dialogs",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      //当前编辑器
      editor: null,
    };
  },
  computed: {},
  components: {
    CloseFileConfirmDialog,
  },
  watch: {},
  created() { },
  mounted() {
  },
  methods: {
  }
};
</script>

<style lang="less" scoped>
.dialog_background_div {
  width: 100%;
  height: 100vh;
  opacity: 50%;
  z-index: 500;
  left: 0;
  top: 0;
  display: none;
  position: absolute;
}
</style>


