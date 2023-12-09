import { is, each, validate, makeValidator } from "https://x-titan.github.io/utils/index.js"
import { List } from "https://x-titan.github.io/list/index.js"

//
//      ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
//      │                                            href                                             │
//      ├──────────┬──┬─────────────────────┬─────────────────────┬───────────────────────────┬───────┤
//      │ protocol │  │        auth         │        host         │           path            │ hash  │
//      │          │  │                     ├──────────────┬──────┼──────────┬────────────────┤       │
//      │          │  │                     │   hostname   │ port │ pathname │     search     │       │
//      │          │  │                     │              │      │          ├─┬──────────────┤       │
//      │          │  │                     │              │      │          │ │    query     │       │
//      "  https:   //    user   :   pass   @ sub.host.com : 8080   /p/a/t/h  ?  query=string   #hash "
//      │          │  │          │          │   hostname   │ port │          │                │       │
//      │          │  │          │          ├──────────────┴──────┤          │                │       │
//      │ protocol │  │ username │ password │        host         │          │                │       │
//      ├──────────┴──┼──────────┴──────────┼─────────────────────┤          │                │       │
//      │   origin    │                     │       origin        │ pathname │     search     │ hash  │
//      ├─────────────┴─────────────────────┴─────────────────────┴──────────┴────────────────┴───────┤
//      │                                            href                                             │
//      └─────────────────────────────────────────────────────────────────────────────────────────────┘
//

//
//      ┌─────────────────────┬────────────┐
//      │         dir         │    base    │
//      ├──────┐              ├──────┬─────┤
//      │ root │              │ name │ ext │
//      " C:\      path\dir   \ file  .txt "
//      └──────┴──────────────┴──────┴─────┘
//

const sep = (
  (is.defined(globalThis.document))
    ? "/"
    : "\\"
)

const { log } = console
const x = "https://x-titan.github.io:5050//contact/\\\\links\\noopener/index.html?wait=true#isopened=false"
const y = "./../../folder/../lab/.file.md.txt"
const z = "data:image/png;base64,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"

const sep2 = sep + sep
const regExpSep = /[\\\/]+/
const regExpSep1 = /[\\\/]/g
const regExpSep2 = /[\\\/]{2,}/g
const regExpProtocol = /^[a-zA-Z0-9]+:/
const regExpProtocolWithSep = /^[a-zA-Z0-9]+:[\\\/]*/
const regExpHost = /[a-zA-Z0-9\.\-\_][\\\/]?/

//#region utils
/**
 * @type {(value: any) => (string)}
 */
const validateString = makeValidator(is.str)

function _splitUrl(url) {
  return validateString(url).split(regExpSep)
}

function _normSeparates(url = "") {
  return validateString(url).replace(regExpSep, sep)
}

function _isRoot(str) {
  return is.str(str) && str.indexOf(":") !== -1
}

function _getRoot(url) {
  const p = regExpProtocol.exec(validateString(url))

  if (p !== null) { return p[0] }
  else { return "" }
}

function _getRootWithSep(url) {
  const p = regExpProtocolWithSep.exec(validateString(url))

  if (p !== null) {
    return (p[0]
      .replace(regExpSep1, sep)
      .replace(regExpSep2, sep2)
    )
  } else { return "" }
}


function _getHash(url = "") {
  const i = validateString(url).indexOf("#")

  if (i === -1) { return "" }

  const j = url.slice(i)
  return ((j + " ").slice(0, j.indexOf("?")) || "")
}

function _getSearch(url = "") {
  const i = validateString(url).indexOf("?")

  if (i === -1) { return "" }

  const j = url.slice(i)
  return ((j + " ").slice(0, j.indexOf("#")) || "")
}
log(location)

/**
 * https://www.host:port.com
 */
function _getOrigin(url = "") {
  validateString(url)
  url = _splitUrl(url)

  if (_isRoot(url[0])) { return (url[0] + url[1]) }
  return url[0]
}
/**
 * www.host.com
 */
function _getHostName(url) {
  url = _getOrigin(url)
  if(_isRoot(url)){

  }
  return url
}
/**
 * www.host:port.com
 */
function _getHost() {

}
/**
 * port
 */
function _getPort() {

}
/**
 * fullhref
 */
function _getHref(url) {
  return validateString(url)
}

function _getSign(str) {
  let sign = 1
  if (str === "" || str === ".") sign = 0
  if (str === "..") sign = -1
  return sign
}

function _norm(url = "") {
  if (is.str(url)) (url = _splitUrl(url))

  const segmentList = List.fromArray(validate(is.arr, url))
  const root = []
  const normSegments = []

  let seg = null

  while (segmentList.length > 0) {
    seg = segmentList.shift().value

    if (is.arr(seg)) {
      const nlist = List.fromArray(seg)
      const last = nlist.last
      last.node = segmentList.node
      segmentList.node = nlist.node
      continue
    }

    seg = validateString(seg).trim()
    const sign = _getSign(seg)

    if (normSegments.length === 0 && !_isRoot(root[0])) {
      const r = root[0]

      switch (sign) {
        case (-1): {
          if (r === "") { break }
          if (r === ".") { root.length = 0 }
          root.push(seg)
          break
        }
        case (0): {
          if (r === ".." || r === "." || r === "") { break }
          root.push(seg)
          break
        }
        case (1): {
          if (_isRoot(seg) && root.length === 0) { root.push(seg) }
          else { normSegments.push(seg) }
        }
      }
    } else {
      switch (sign) {
        case (-1): {
          normSegments.pop()
          if (normSegments.length === 0) { segmentList.unshift(".") }
          break
        }
        case (1): {
          normSegments.push(seg)
        }
      }
    }
  }
  if (seg === "") { normSegments.push("") }
  return root.concat(normSegments)
}
//#endregion

//#region Export
export function normalize(url, shiftSegments = true) {
  if (!!shiftSegments === true) {
    return _norm(url).join(sep)
  } else {
    return _normSeparates(url)
  }
}
export function isAbsolute(url = "") {
  return _normSeparates(url).startsWith(sep) || _isRoot(url)
}
function join(...urls) {
  const splittedUrl = []
  urls.forEach((url) => {
    splittedUrl.push(_splitUrl(url))
  })

  return _norm(splittedUrl).join(sep)
}

export function extname(url = "") {
  url = _splitUrl(url)
  url = url[url.length - 1]

  const lastIndex = url.substring(1).lastIndexOf(".")

  if (lastIndex === -1) { return "" }
  return url.slice(lastIndex)
}

export function basename(url = "", ext = "") {
  url = _splitUrl(url)
  url = url[url.length - 1]


  if (is.str(ext)) {
    if (url.endsWith(ext)) {
      url = url.slice(0, url.lastIndexOf(ext))
    }
  }
  return url
}

export function dirname(url) {
  url = _splitUrl(url)
  if (url.length === 0) return "."
  const last = url.pop()
  if (_isRoot(last))
    return url.join(sep)
}

export function parse(url) {
  url = _norm(url)
  return {
    root: _getRoot(url),
    dir: dirname(url),
    name: basename(url),
    ext: extname(url),
    origin: _getOrigin(url),
    pathname: _getPathname(url),
    host: _getHost(url),
    hostname: _getHostName(url),
    hash: _getHash(url),
    search: _getSearch(url),
  }
}
//#endregion
