import request from '../request'
import Cookies from 'js-cookie'


// 加载文件
export function listfile(json = {}) {
  return request.get('/v1/file/list', {
    params: json,
    headers: {
      'token': Cookies.get('token')
    }
  })
}

// 创建文件
export function createfile(json = {}) {
  return request.post('/v1/file/create', json, {
    headers: {
      'token': Cookies.get('token')
    }
  })
}

// 删除文件
export function removefile(json = {}) {
  return request.post('/v1/file/del', json, {
    headers: {
      'token': Cookies.get('token')
    }
  })
}

// 修改文件基本信息
export function savefilebasic(json = {}) {
  return request.post('/v1/file/savebasic', json, {
    headers: {
      'token': Cookies.get('token')
    }
  })
}

// 复制文件
export function copyfile(json = {}) {
  return request.post('/v1/file/copy', json, {
    headers: {
      'token': Cookies.get('token')
    }
  })
}


// 加载文件内容，包括设计信息
export function loadfile(json = {}) {
  return request.post('/v1/file/load', json, {
    headers: {
      'token': Cookies.get('token')
    }
  })
}



// 保存文件内容，包括设计信息
export function savefile(json = {}) {
  return request.post('/v1/file/save', json, {
    headers: {
      'token': Cookies.get('token')
    }
  })
}

// 保存文件内容，包括设计信息，然后发布文件
export function publishfile(json = {}) {
  return request.post('/v1/file/publish', json, {
    headers: {
      'token': Cookies.get('token')
    }
  })
}

