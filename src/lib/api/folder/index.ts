import request from '../request'
import Cookies from 'js-cookie'


// 加载目录
export function loadfolder(json = {}) {
  return request.post('/v1/folder/load', json, {
    headers: {
      'token': Cookies.get('token')
    }
  })
}

// 创建目录
export function createfolder(json = {}) {
  return request.post('/v1/folder/create', json, {
    headers: {
      'token': Cookies.get('token')
    }
  })
}

// 删除目录
export function removefolder(json = {}) {
  return request.post('/v1/folder/del', json, {
    headers: {
      'token': Cookies.get('token')
    }
  })
}

// 重命名目录
export function renamefolder(json = {}) {
  return request.post('/v1/folder/rename', json, {
    headers: {
      'token': Cookies.get('token')
    }
  })
}

