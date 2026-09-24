import assert from 'node:assert/strict'
import test from 'node:test'
import { getAuthReturnPath, isSafeInternalPath } from '../lib/auth/redirects.ts'
import { canBrowseProfileRepertoire, parseProfileQuery, profileHref, profileSearchPattern } from '../lib/profile-navigation.ts'
import { settingsPatch } from '../lib/account-settings.ts'

test('profile URLs retain tabs, groups and search across pagination', () => {
  const query = parseProfileQuery({tab:'repertoire',group:'practice',q:' reel ',page:'2',preview:'public'})
  assert.equal(profileHref('piper',query,{page:3}),'/users/piper?tab=repertoire&q=reel&page=3&group=practice&preview=public')
  assert.deepEqual(parseProfileQuery({tab:'admin',group:'private',page:'Infinity'}),{tab:'overview',group:'known',q:'',page:1,preview:false})
  assert.equal(profileSearchPattern('100%_\\'),'%'+'100\\%\\_\\\\'+'%')
})
test('profile publishing requires an owner or an accepted friend with consent; preview fails closed', () => {
  assert.equal(canBrowseProfileRepertoire(true,false,false,false),true)
  assert.equal(canBrowseProfileRepertoire(false,true,true,false),true)
  for (const [owner,friend,shared,preview] of [[false,false,true,false],[false,true,false,false],[false,false,false,false],[true,true,true,true]]) assert.equal(canBrowseProfileRepertoire(owner,friend,shared,preview),false)
})
test('auth return paths reject external URLs, encoded controls, nesting and redirect loops', () => {
  for (const value of ['https://evil.test','//evil.test','/\\evil.test','/%2fexample.com','/%5cevil','/foo%0abar','/%252f%252fevil','/bad%','/a\nb']) assert.equal(isSafeInternalPath(value),false,value)
  for (const value of ['/login?next=/login','/auth/confirm','/x/../login','/%6cogin']) assert.equal(getAuthReturnPath(value,'/dashboard'),'/dashboard',value)
  assert.equal(getAuthReturnPath('/learning-lists/4?mode=manage'),'/learning-lists/4?mode=manage')
  assert.equal(getAuthReturnPath('/repertoire'),'/repertoire')
})
test('settings update only their own group and validate before writing', () => {
  const form = new FormData();form.set('username',' Fiddler ');form.set('bio','A musical bio');form.set('show_identity','on');form.set('role','admin')
  assert.deepEqual(settingsPatch('profile',form).patch,{username:'fiddler',display_name:null,bio:'A musical bio'})
  assert.deepEqual(settingsPatch('practice',form).patch,{practice_diary_enabled:false})
  const privacy = settingsPatch('privacy',form).patch
  assert.equal(privacy.show_identity,true);assert.equal('username' in privacy,false);assert.equal('role' in privacy,false)
  form.set('bio','x'.repeat(501));assert.ok(settingsPatch('profile',form).error)
  assert.ok(settingsPatch('security',form).error)
  assert.ok(settingsPatch('notifications',form).error)
  form.set('digest_frequency','never');assert.equal(settingsPatch('notifications',form).patch.digest_frequency,'never')
})
