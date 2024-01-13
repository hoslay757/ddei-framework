export default {
  'id': '308004',
  'name': '状态',
  'code': 'state',
  'desc': 'UML的活动的状态节点',
  'from': '100009',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 120,
    height: 80,

    border: {
      round: 5
    },

    ext: {
      sample: {
        //分割横线的纵坐标
        pvalue: -20,
      },
      groups: [
        {
          name: "属性",
          icon: 'icon-config',
          subGroups: [
            {
              name: "样式",
              attrs: ["fill.type", "fill.color", "fill.image", "fill.opacity", "borderType", "borderColor", "borderOpacity", "borderWidth", "borderDash"]
            },
            {
              name: "文本",
              attrs: ["font.family", "font.size", "font.color", "fontAlign", "textStyle.feed"
                , "textStyle.scale", "textStyle.hollow", "textStyle.bold", "textStyle.italic"
                , "textStyle.underline", "textStyle.deleteline", "textStyle.topline", "textStyle.hspace", "textStyle.vspace"]
            },
          ]
        },
      ]
    },

    //组合控件
    composes: [
      {
        width: 115,
        height: 20,
        cIndex: 2,
        id: '100002',
        border: {
          disabled: true
        },
        fill: {
          type: 0
        },
        text: "State",
        initCPV: {
          x: 0, y: -27
        },
        attrLinks: [
          { code: "textStyle", mapping: ["*"] },
          { code: "font", mapping: ["*"] },
        ]
      },
      {
        width: 115,
        height: 53,
        cIndex: 2,
        id: '100002',
        textStyle: {
          feed: 1
        },
        border: {
          disabled: true
        },
        fill: {
          type: 0,
        },
        text: "Action",
        initCPV: {
          x: 0, y: 12
        },
        attrLinks: [
          { code: "textStyle", mapping: ["*"] },
          { code: "font", mapping: ["*"] },
        ]
      },
    ]
  }

}
