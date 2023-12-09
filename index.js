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

export const sep = (
  (is.defined(globalThis.document))
    ? "/"
    : "\\"
)

const sep2 = sep + sep
const regExpSep = /[\\\/]+/
const regExpSep1 = /[\\\/]/g
const regExpSep2 = /[\\\/]{2,}/g
const regExpRoot = /^[a-zA-Z0-9]+:/
const regExpRootWithSep = /^[a-zA-Z0-9]+:[\\\/]*/
const regExpOrigin = /^(?<root>\w+\:[\\\/]*)?(?<auth>[\w\d]+:[\w\d]+@)?(?<hostname>[\w\d\_\-]+\.?[\w\d\_\-\.]*)(?<port>:[\w\d]+)?/
const regExpAuth = /[\w\d]+:[\w\d]+@/

//#region utils
/**
 * @type {(value: any) => (string)}
 */
const validateString = makeValidator(is.str)

function _splitPath(path = "") {
  return validateString(path).split(regExpSep)
}

function _normSeparates(path = "") {
  return validateString(path).split(regExpSep).join(sep)
}

function _isRoot(path = "") {
  return is.str(path) && (path.indexOf(":") !== -1)
}

function _getRoot(path = "") {
  const root = regExpRoot.exec(validateString(path))

  if (root) {
    return root[0]
  } else { return "" }
}

function _getRootWithSep(path = "") {
  const root = regExpRootWithSep.exec(validateString(path))

  if (root) {
    return (root[0]
      .replace(regExpSep1, sep)
      .replace(regExpSep2, sep2)
    )
  } else { return "" }
}

function _getHash(path = "") {
  const i = validateString(path).indexOf("#")

  if (i === -1) { return "" }

  const j = path.slice(i)
  return ((j + " ").slice(0, j.indexOf("?")) || "")
}

function _getSearch(path = "") {
  const i = validateString(path).indexOf("?")

  if (i === -1) { return "" }

  const j = path.slice(i)
  return ((j + " ").slice(0, j.indexOf("#")) || "")
}

/**
 * https://www.host:port.com
 */
function _getOrigin(path = "") {
  path = validateString(path).trim()
  const origin = RegExp(regExpOrigin.source).exec(path)

  if (origin) {
    path = origin[0].replace(origin.groups?.auth || "", "")
  } else { path = "" }

  return (path
    .replace(regExpSep1, sep)
    .replace(regExpSep2, sep2)
    .trim()
  )
}

/**
 * www.host:port.com
 */
function _getHost(path = "") {
  path = validateString(path).trim()
  const origin = RegExp(regExpOrigin.source).exec(path)

  if (origin) {
    return (origin.groups?.hostname || "") + (origin.groups?.port || "")
  } else { return "" }
}

/**
 * www.host.com
 */
function _getHostName(path = "") {
  path = validateString(path).trim()
  const origin = RegExp(regExpOrigin.source).exec(path)

  if (origin) {
    return (origin.groups?.hostname || "")
  } else { return "" }
}

/**
 * port
 */
function _getPort(path = "") {
  path = validateString(path).trim()
  const origin = RegExp(regExpOrigin.source).exec(path)
  if (origin) {
    return (origin.groups?.port || "").replace(":", "")
  } else { return "" }
}

function _getPathName(path = "") {
  path = validateString(path).trim()
  const origin = RegExp(regExpOrigin.source).exec(path)

  if (origin) {
    path = path.replace(origin[0], "")
  }

  return (_normSeparates(path)
    .replace(_getSearch(path), "")
    .replace(_getHash(path), "")
    .trim()
  )

}

function _getHref(path = "") {
  path = validateString(path).trim()
  const origin = _getOrigin(path)
  const pathname = _getPathName(path)
  const search = _getSearch(path)
  const hash = _getHash(path)

  return origin + pathname + search + hash
}

function _getSign(str = "") {
  let sign = 1
  if (str === "" || str === ".") sign = 0
  if (str === "..") sign = -1
  return sign
}

function _norm(path = "") {
  if (is.str(path)) (path = _splitPath(path))

  const segmentList = List.fromArray(validate(is.arr, path))
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
export function isAbsolute(path = "") {
  return _normSeparates(path).startsWith(sep) || _isRoot(path)
}

export function normalize(path = "", shiftSegments = true) {
  if (!!shiftSegments === true) {
    return _norm(path).join(sep)
  } else {
    return _normSeparates(path)
  }
}

export function join(...paths) {
  const splittedPath = []
  paths.forEach((path) => {
    splittedPath.push(_splitPath(path))
  })

  return _norm(splittedPath).join(sep)
}

export function dirname(path = "") {
  path = _splitPath(path)
  if (path.length === 0) return "."
  const last = path.pop()
  if (_isRoot(last)) {
    return path.join(sep)
  } else { return "" }
}

export function basename(path = "", ext = "") {
  path = _splitPath(path)
  path = path[path.length - 1]


  if (is.str(ext)) {
    if (path.endsWith(ext)) {
      path = path.slice(0, path.lastIndexOf(ext))
    }
  }
  return path
}

export function extname(path = "") {
  path = _splitPath(path)
  path = path[path.length - 1]

  const lastIndex = path.substring(1).lastIndexOf(".")

  if (lastIndex === -1) { return "" }
  return path.slice(lastIndex)
}

/**
 * For NodeJS
 */
export function parse(path = "") {
  path = _normSeparates(path)
  return {
    root: _getRoot(path),
    dir: dirname(path),
    name: basename(path),
    ext: extname(path),
  }
}

/**
 * For web JS
 */
export function init(path = "") {
  path = _normSeparates(path)
  return {
    protocol: _getRoot(path),
    href: _getHref(path),
    origin: _getOrigin(path),
    host: _getHost(path),
    port: _getPort(path),
    hostname: _getHostName(path),
    pathname: _getPathName(path),
    search: _getSearch(path),
    hash: _getHash(path),
  }
}

export function format(pathObject) { }
export function relative(from, to) { }
export function resolve(...path) { }
//#endregion
