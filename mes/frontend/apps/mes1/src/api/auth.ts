import client from './client'

import type { SysUser } from '@/types/user'

export function login(username: string, password: string, captcha: string, rememberMe: boolean) {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  if (captcha) params.append('captcha', captcha)
  params.append('rememberMe', String(rememberMe))
  return client.post('/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function getCaptchaUrl() {
  return '/verification/code'
}

export function logout() {
  return client.get('/logout')
}

export function getUserInfo() {
  return client.get('/admin/user/info') as Promise<SysUser>
}
