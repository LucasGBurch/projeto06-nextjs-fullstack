import axios from 'axios'

export const api = axios.create({
  baseURL: '/api', // Reaproveita o host do Front
})
