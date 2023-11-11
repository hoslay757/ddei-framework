import { create } from '../http'

const http = create()

/**
* 获取规则引擎列表数据
*/
export function getEngineListData (params) {
  return http.get('v1/engine/list', { params })
}

/**
* 删除则引擎列表数据
*/
export function deleteEngineData (id) {
  return http.post(`v1/engine/delete/${id}`)
}

/**
* 拷贝则引擎列表数据
*/
export function copyEngineData (id) {
  return http.post(`v1/engine/copy/${id}`)
}

/**
 * 校验添加规则数据
 * @return  true:数据有重复 false：数据不重复
 */
export function checkEngineData (params) {
  return http.get(`v1/engine/check?code=${params.code}`)
}

/**
 * 根据id获取列表数据
 */
export function getEngineDataById (id) {
  return http.get(`v1/engine/${id}`)
}

/**
 * 根据code和version获取列表数据
 */
export function getEngineDataByParams ({ code, version }) {
  return http.get(`v1/engine`, {
    params: {
      code,
      version
    }
  })
}

/**
 * 获取树形菜单数据
 */
export function getTreeData () {
  return http.get('/v1/rule/group/list')
}

/**
 * 保存分组信息
 * 传入id参数则更新
 * @param {*} groupInfo 分组信息
 */
export function saveGroup (groupInfo = {}) {
  if (groupInfo.id) {
    return http.post('/v1/rule/group/update', groupInfo)
  }
  return http.post('/v1/rule/group', groupInfo)
}

export function deleteGroup (id, isContent = false) {
  return http.post('/v1/rule/group/delete', {
    id,
    isContent
  })
}

export function queryRuleTree (id) {
  return http.get('/v1/rule/group/by/id', {
    params: {
      id
    }
  })
}

export function getRoleData () {
  return http.get('/v1/role/list', {
    params: {
    }
  })
}

export function getGroupRoleIds (id) {
  return http.get('/v1/role/by/group/id', {
    params: {
      id
    }
  })
}
