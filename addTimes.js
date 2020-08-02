#!/usr/bin/env node

console.log('addTimes')


if (process.argv.length < 3) {
    console.log('Usage:\n\tnode addTimes.js 13:23 + 21:32 - 1:32:2')
    return
}
const argv = process.argv

/**
 * @type {Array<{op: string, time: {h: number, m: number, s: number}}>}
 */
const times = []

let argvIdx = 2

/**
 * @param {string} str raw string of format "hh:mm:ss", leave hh / mm away if empty, leave leading 0es
 * @returns {{h: number, m: number, s: number}} parse time
 * @throws {string} error while parsing
 */
function strToTime(str) {
    const splitted = str.split(':')
    if (splitted.length > 3) {
        throw "Time can't consist of more than 3 parts!"
    }

    const res = {h: 0, m: 0, s: 0}

    // convert secs
    const sStr = splitted[splitted.length - 1]
    if (sStr.length > 0 ) {
        const parsedS = parseInt(sStr)
        if (!Number.isFinite(parsedS) || parsedS > 59) {
            throw "Second could not be parsed: must be 0 <= second < 60"
        }
        res.s = parsedS
    }

    // secs only
    if (splitted.length == 1) return res

    // convert min
    const mStr = splitted[splitted.length - 2]
    if (mStr.length > 0 ) {
        const parsedM = parseInt(mStr)
        if (!Number.isFinite(parsedM) || parsedM > 59) {
            throw "Minutes could not be parsed: must be 0 <= minute < 60"
        }
        res.m = parsedM
    }

    // secs + mins only
    if (splitted.length == 2) return res

    // convert min
    const hStr = splitted[splitted.length - 3]
    if (hStr.length > 0 ) {
        const parsedH = parseInt(hStr)
        if (!Number.isFinite(parsedH) || parsedH > 24) {
            throw "Hours could not be parsed: must be 0 <= hour < 24"
        }
        res.h = parsedH
    }

    return res
}


while (argvIdx < process.argv.length) {
    
    // get operation (+ / -)

    let op = '+'
    if (argv[argvIdx].match(/^[+-]$/)) {
        op = argv[argvIdx]
        argvIdx++
        if (argvIdx >= argv.length) {
            console.error('last symbol must be time!')
            return
        }
    }

    // convert timestamp
    let t
    try {
        t = strToTime(argv[argvIdx])
    } catch (error) {
        console.error(error)
        return
    }
    times.push({op, time: t})
    argvIdx++
}

/**
 * @param {{h: number, m: number, s: number}} time
 * @returns {string}
 */
function timeToStr(time) {
    return `${time.h.toString().padStart(2, '0')}:${time.m.toString().padStart(2, '0')}:${time.s.toString().padStart(2, '0')}`
}

let resTime = {h: 0, m: 0, s: 0}

for (const t of times) {
    console.log(`${t.op} ${timeToStr(t.time)}`)
    switch (t.op) {
        case '+':
            resTime.h += t.time.h    
            resTime.m += t.time.m
            resTime.s += t.time.s
            break;
            case '-':  
            resTime.h -= t.time.h    
            resTime.m -= t.time.m
            resTime.s -= t.time.s
            break;
        default:
            console.error('unknown op: ' + t.op)
            break;
    }
}

// normalize time
// TODO not working with subraction (try 12:32 1:30 - 1:50:2)
resTime.m += Math.floor(resTime.s / 60)
resTime.s -= Math.floor(resTime.s / 60) * 60
resTime.h += Math.floor(resTime.m / 60)
resTime.m -= Math.floor(resTime.m / 60) * 60

console.log('------------------')

console.log('  ' + timeToStr(resTime))

console.log('==================')