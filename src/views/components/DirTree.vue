<template>
  <div class="ddei_home_dir_tree">
    <div class="ddei_home_dir_tree_node">
      <div class="ddei_home_dir_tree_node_content">
        <span>全部</span>
      </div>
    </div>
    <div class="ddei_home_dir_tree_node">
      <div class="ddei_home_dir_tree_node_content selected">
        <img class="ddei_home_dir_tree_node_icon"
             src="../../components/editor/icons/toolbox-expanded.png" />
        <span>目录1</span>
        <div class="ddei_home_dir_tree_node_buttons">
          <img src="../../components/editor/icons/icon-plus-circle.png"
               title="新建子目录" />
          <img src="../../components/editor/icons/icon-style-line.png"
               title="重命名" />
          <img src="../../components/editor/icons/icon-hand.png"
               title="移动" />
          <img src="../../components/editor/icons/icon-trash.png"
               title="移入回收站" />
        </div>
      </div>
      <div class="ddei_home_dir_tree_node">
        <div class="ddei_home_dir_tree_node_content">
          <img class="ddei_home_dir_tree_node_icon"
               src="../../components/editor/icons/toolbox-expanded.png" />
          <span>目录1-1</span>
          <div class="ddei_home_dir_tree_node_buttons">
          </div>
        </div>
      </div>
    </div>
    <div class="ddei_home_dir_tree_node">
      <div class="ddei_home_dir_tree_node_content">
        <img class="ddei_home_dir_tree_node_icon"
             src="../../components/editor/icons/toolbox-expanded.png" />
        <span>目录2</span>
        <div class="ddei_home_dir_tree_node_buttons">
        </div>
      </div>
    </div>

  </div>
</template>

<script >
export default {
  name: 'DDei-Home-Dir-tree',
  props: {

  },
  data () {
    return {

    }
  },
  created () { },
  mounted () {

  },
  methods: {

  }
}
</script>

<style scoped>
.ddei_home_dir_tree {
  flex: 1;
  height: calc(100% - 20px);
  background-color: #212121;
  font-size: 14px;
  padding: 10px 20px 10px 0px;
  cursor: pointer;
}

.ddei_home_dir_tree_node {
  width: 100%;
  padding-left: 20px;
  text-align: left;
}

.ddei_home_dir_tree_node_content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.ddei_home_dir_tree_node_content.selected {
  color: white;
  background: #414141;
}

.ddei_home_dir_tree_node_buttons {
  display: none;
  height: 20px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 4px;
  flex: 0 0 80px;
}

.ddei_home_dir_tree_node_buttons img {
  width: 14px;
  height: 14px;
  margin-top: 3px;
}

.ddei_home_dir_tree_node_buttons img:hover {
  filter: brightness(200%);
}

.ddei_home_dir_tree_node_content.selected .ddei_home_dir_tree_node_buttons {
  display: grid;
}

.ddei_home_dir_tree span {
  margin: 4px auto;
  flex: 1;
}

.ddei_home_dir_tree_node_icon {
  height: 12px;
  margin-right: 5px;
  flex: 0 0 12px;
}

.ddei_home_dir_tree span:hover {
  color: white;
  background: #414141;
}
</style>