import * as esbuild from 'esbuild'
import setting from './build.setting.js'

let result = await esbuild.build(setting)
console.log(result)