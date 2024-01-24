export default {
  'id': '301007',
  'name': '判定',
  'code': 'switch',
  'desc': 'UML的状态分支',
  'from': '100040',
  'icon': 'toolbox-shape-circle',
  'define': {
    width: 40,
    height: 40,
    ext: {
      groups: [
        {
          name: "属性",
          icon: 'icon-tianse-02-01',
          subGroups: [
            {
              name: "填充",
              attrs: ["fill.type", "fill.color", "fill.image", "fill.opacity"]
            },
            {
              name: "线条",
              attrs: ["borderType", "borderColor", "borderOpacity", "borderWidth", "borderDash"]
            },
          ]
        },
      ]
    }
  }
}