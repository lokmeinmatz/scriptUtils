#!/usr/bin/env node

const { exec } = require("child_process")
const fs = require('fs')
const { join } = require('path')

const cwd = process.cwd()


async function execAsync(cmd) {
    return new Promise((res, rej) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                rej({exception: err, stderr})
            }
            else {
                res(stdout)
            }
        })
    })
}

async function renameAsync(oldPath, newPath) {
    return new Promise((res, rej) => {
        fs.rename(oldPath, newPath, res)
    })
}

console.log('processing files in ' + cwd)

const dir = fs.readdirSync(cwd)
const main = async () => {
    for (let f of dir) {
        if (f.endsWith('.MOV')) {
            console.log('Checking ' + f)
            try {
                let out = await execAsync('ffmpeg -i ' + f)
            } catch (error) {
                
                let fpsStr = /\d+.\d+ fps/g.exec(error.stderr)[0]
                let fps = parseFloat(fpsStr.split(" ")[0])
                console.log(fps)
                if (Number.isFinite(fps) && fps > 100) {
                    const oldPath = join(cwd, f)
                    const newPath = join(cwd, `120fps_${f}`)
                    await renameAsync(oldPath, newPath)
                    console.log(`${oldPath} -> ${newPath}`)
                }
            }
    
        }
    }
}

main()