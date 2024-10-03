import * as esbuild from 'esbuild'
import setting from './build.setting.js'

let ctx = await esbuild.context(setting)
ctx.watch()