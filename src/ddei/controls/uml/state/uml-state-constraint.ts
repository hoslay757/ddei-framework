export default {
  'id': '301010',
  'name': '约束',
  'code': 'constr',
  'desc': 'UML的约束',
  'from': '103005',
  'icon': 'toolbox-shape-circle',
  'define': {
    width: 140,
    height: 90,
    textStyle: {
      align: 3,
      feed: 1
    },
    text: ` Constraint Name :
Body`,
    composes: [
      {
        width: 90,
        height: 18,
        cIndex: 3,
        id: '100002',
        border: {
          disabled: true
        },
        fill: {
          type: 0
        },
        textStyle: {
          align: 2,
        },
        text: "<<invariant>>",
        initCPV: {
          x: -15, y: -35
        },
        attrLinks: [
          { code: "font", mapping: ["*"] },
          { code: "textStyle", mapping: ["*"] },
        ]
      },
    ],
    ext: {
      groups: [
        {
          name: "样式",
          icon: 'icon-tianse-02-01',
          subGroups: [
            {
              name: "填充",
              attrs: ["fill.type", "fill.color", "fill.image", "fill.opacity"]
            },
            {
              name: "线条",
              attrs: ["borderType", "borderColor", "borderOpacity", "borderWidth", "borderDash", "borderRound"]
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
    }
  }
}