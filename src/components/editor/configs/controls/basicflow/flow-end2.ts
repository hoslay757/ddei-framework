export default {
  'id': '102092',
  'name': '结束',
  'code': 'end',
  'desc': '流程的开始节点',
  'from': '100003',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 40,
    height: 40,
    fill: {
      color: 'red'
    },
    border: {
      disabled: true
    },
    ext: {
      groups: [
        {
          name: "样式",
          icon: 'icon-config',
          subGroups: [
            {
              name: "填充",
              attrs: ["fill.type", "fill.color", "fill.image", "fill.opacity"]
            },
            {
              name: "线条",
              attrs: ["borderType", "borderColor", "borderOpacity", "borderWidth", "borderDash", "borderRound"]
            },
          ]
        },

      ]
    }
  }
}
