// Real PieceSearchFilters/FilterShell state with mocked router and modal boundary.
// RENDERER_ROOT=/private/tmp/tunes-review-lifecycle node tests/integration/catalogue-filter-lifecycle.mjs
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
const require=createRequire(import.meta.url)
const rendererRequire=createRequire(`${process.env.RENDERER_ROOT}/package.json`)
const React=rendererRequire('react')
const {create,act}=rendererRequire('react-test-renderer')
const ts=require('typescript')
globalThis.IS_REACT_ACT_ENVIRONMENT=true
const routes=[]
const router={push:href=>routes.push(href)}
const host=tag=>function Host(props){return React.createElement(tag,props,props.children)}
const mocks={react:React,'react/jsx-runtime':rendererRequire('react/jsx-runtime'),'next/navigation':{useRouter:()=>router},
  '@/components/filters/FilterPanel':{default:host('filter-panel')},
  '@/components/filters/FilterSection':{default:host('filter-section')},
  '@/components/ui/Icon':{default:host('icon')},
  '@/components/ui/LoadingSpinner':{default:host('spinner')},
}
const cache=new Map()
function load(file){
  if(cache.has(file))return cache.get(file)
  const compiled=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
  const loaded={exports:{}}
  const customRequire=id=>{
    if(mocks[id])return {...mocks[id],__esModule:true}
    if(!id.startsWith('@/')&&!id.startsWith('.'))return require(id)
    const path=id.startsWith('@/')?resolve(id.slice(2)):resolve(dirname(file),id)
    const target=[path,`${path}.ts`,`${path}.tsx`].find(existsSync)
    assert.ok(target,`Unresolved ${id}`)
    return load(target)
  }
  new Function('require','module','exports',compiled)(customRequire,loaded,loaded.exports)
  cache.set(file,loaded.exports)
  return loaded.exports
}
const Filters=load(resolve('components/library/PieceSearchFilters.tsx')).default
const props={basePath:'/library',searchLabel:'Search',searchPlaceholder:'Tunes',searchValue:'reel',selectedKeys:['D'],selectedStyles:[],selectedTimeSignatures:[],availableKeys:['D','G'],availableStyles:['Irish'],availableTimeSignatures:['4/4'],hasActiveFilters:true,selectedSort:'newest',preservedParams:{group:'style'},totalCount:2,countItems:[{key:'D',style:'Irish',time_signature:'4/4',piece_styles:[]},{key:'G',style:'Irish',time_signature:'4/4',piece_styles:[]}]}
let tree
const toggle=async()=>act(async()=>tree.root.findAllByType('button').find(n=>n.props['aria-controls']).props.onClick())
const panel=()=>tree.root.findByType('filter-panel')
const checkbox=value=>tree.root.findAllByType('input').find(n=>n.props.type==='checkbox'&&n.props.value===value)
const setCheck=async(value,checked)=>act(async()=>checkbox(value).props.onChange({target:{checked}}))
try{
  await act(async()=>{tree=create(React.createElement(Filters,props))})
  await toggle();await setCheck('G',true)
  assert.equal(routes.length,0,'draft never navigates')
  assert.equal(panel().props.applyLabel,'Show 2 tunes')
  await act(async()=>panel().props.onClose())
  assert.equal(routes.length,0,'cancel never navigates')
  await toggle()
  assert.equal(checkbox('G').props.checked,false,'cancel discards draft')
  assert.equal(checkbox('D').props.checked,true)
  await setCheck('G',true)
  await act(async()=>panel().props.onApply())
  assert.equal(routes.length,1)
  const url=new URL(routes[0],'https://tunes.invalid')
  assert.deepEqual(url.searchParams.getAll('key'),['D','G'])
  assert.equal(url.searchParams.get('q'),'reel')
  assert.equal(url.searchParams.get('sort'),'newest')
  assert.equal(url.searchParams.get('group'),'style')
  assert.equal(tree.root.findAllByType('filter-panel').length,0)
  await act(async()=>tree.update(React.createElement(Filters,{...props,selectedKeys:['G']})))
  await toggle()
  assert.equal(checkbox('G').props.checked,true,'URL navigation restores applied state')
  assert.equal(checkbox('D').props.checked,false)
  await act(async()=>panel().props.onClearAll())
  assert.equal(routes.length,1,'clear in panel is only a draft')
  assert.equal(checkbox('G').props.checked,false)
  await act(async()=>panel().props.onClose())
  await toggle()
  assert.equal(checkbox('G').props.checked,true,'cancel restores applied filters after draft clear')
  await act(async()=>panel().props.onClose())
  await act(async()=>tree.root.findAllByType('button').find(n=>n.props.children==='Clear').props.onClick())
  const cleared=new URL(routes.at(-1),'https://tunes.invalid')
  assert.equal(cleared.searchParams.has('key'),false)
  assert.equal(cleared.searchParams.has('q'),false)
  assert.equal(cleared.searchParams.get('group'),'style')
  assert.equal(cleared.searchParams.get('sort'),'newest')
  console.log('PASS: draft changes/clear do not navigate; cancel discards; apply navigates once preserving query/sort/group; incoming URL restores state; toolbar Clear removes filters')
}finally{if(tree)await act(async()=>tree.unmount())}
