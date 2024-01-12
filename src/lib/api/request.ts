import axios from 'axios'

const request = axios.create({

  baseURL: 'https://www.hoslay.store:28000/api',
  // baseURL: 'http://localhost:8100',

  timeout: 3000

})

export default request;