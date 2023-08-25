export default {
  'id': '103',
  'name': '容器',
  'code': 'basic-container-shapes',
  'desc': '容器，能够容纳其他控件，也能够包含容器',
  'orderNo': 3,
  //当前分组下所有控件
  'controls': [
    {
      'id': '100201',
      'name': '容器-联动',
      'orderNo': 1,
    },
    {
      'id': '100201',
      'name': '容器-不联动',
      'orderNo': 1,
      'linkChild': false,
      'linkSelf': false
    }
  ]
}
