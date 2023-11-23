import { is, each, validate, makeValidator } from "https://x-titan.github.io/utils/index.js"


const validString = makeValidator(is.str)

export const sep = (
  (is.defined(globalThis.document))
    ? "/"
    : "\\"
)

const sep2 = sep + sep
const regExpSep = /[\/\\]+/gm
const regExpProtocol = /:[\\\/]{2}/gm

export function init(href) {
  validString(href)
  href = href.trim()

  const protocolExec = regExpProtocol.exec(href)

  let host = ""
  let hash = ""
  let search = ""
  let protocol = ""
  let path = ""
  let pathname = ""

  if (protocolExec) {
    const index = protocolExec.index
    protocol = href.slice(0, index + 1).trim()
    href = href.slice(index + 3).trim()
  }

  const searchIndex = href.indexOf("?")
  const hashIndex = href.indexOf("#")

  if (searchIndex !== -1 && hashIndex !== -1) {
    if (searchIndex > hashIndex) {
      hash = href.slice(hashIndex, searchIndex)
      search = href.slice(searchIndex)
    } else {
      search = href.slice(searchIndex, hashIndex)
      hash = href.slice(hashIndex)
    }
    href = href.slice(0, Math.min(searchIndex, hashIndex))
  } else {
    if (searchIndex !== -1) {
      search = href.slice(searchIndex)
      href = href.slice(0, searchIndex)
    }
    if (hashIndex !== -1) {
      hash = href.slice(hashIndex)
      href = href.slice(0, hashIndex)
    }
  }

  const splittedHref = href.split(regExpSep)
  // const list = []

  const list = parsePath(splittedHref)

  // for (let i = 0; i < splittedHref.length; i++) {
  //   let str = splittedHref[i].trim()

  //   if (str === "" && i !== splittedHref.length - 1 && i !== 0) {
  //     continue
  //   }

  //   if (str === "." && i !== 0) {
  //     continue
  //   }

  //   if (str === ".." && list.length !== 0 && i !== 0) {
  //     list.pop()
  //     continue
  //   }

  //   list.push(str.trim())
  // }

  path = list.join(sep)
  pathname = path
  hash = hash.trim()
  search = search.trim()

  if (protocolExec) {
    host = list[0]
    // if()
    pathname = pathname.replace(host, "")
  }

  href = path + search + hash
  if (protocolExec) {
    href = protocol + sep2 + href
  }

  return { href, protocol, search, host, path, pathname, hash, list }
}

function parsePath(hreflist = [""]) {
  const list = []
  validate(is.array, hreflist)

  for (let i = 0; i < hreflist.length; i++) {
    let str = hreflist[i]
    let cache = null
    let push = true

    if (is.array(str)) {
      cache = parsePath(str)
      str = cache.shift()
    }

    validString(str)

    if (str === "") {
      if ((list.length === 0) || (i === (hreflist.length - 1) && !cache)) {
        list.push(str)
      }
      push = false
    }
    if (str === ".") {
      if (list.length === 0) {
        list.push(str)
      }
      push = false
    }
    if (str === "..") {
      if (list[list.length - 1] === ".." || list.length === 0) {
        list.push(str)
      } else {
        list.pop()
      }
      push = false
    }
    push && list.push(str.trim())
    if (cache) {
      list.push(...cache)
      if (list[list.length - 1] === "" && i !== (hreflist.length - 1)) {
        list.pop()
      }
    }
  }
  return list
}

export function normalize(href) {
  return init(href).href
}

export function basename(href, ext) {
  let { pathname } = init(href)

  let out = pathname.slice(pathname.lastIndexOf(sep) + 1)

  if (is.defined(ext)) {
    validString(ext)

    if (out.endsWith(ext)) {
      out = out.slice(0, out.lastIndexOf(ext))
    } else {
      const i = out.lastIndexOf(".")
      if (i !== -1) {
        out = out.slice(0, i)
      }
      out = out + ext
    }
  }

  return out
}

export function dirname(href) {
  let { list, protocol } = init(href)
  let out = ""

  if (protocol !== "") {
    out = protocol + sep2
  }

  list.pop()
  return out + list.join(sep)
}

export function extname(href = "") {
  const base = basename(href)
  const lastIndex = base.lastIndexOf(".")

  if (lastIndex > 0) {
    return base.slice(lastIndex)
  }

  return ""
}

export function parse(href) {
  const _ = init(href)
  _.base = basename(_.pathname)
  _.dir = dirname(href)
  _.root = _.host
  _.ext = extname(_.pathname)
  _.name = basename(_.basename, _.ext)
  _.list = undefined
  delete _.list
  return _
}

export function join_(...hreflist) {
  let out = ""
  const arr = []

  for (let i = 0; i < hreflist.length; i++) {
    const { list, protocol } = init(hreflist[i])
    if (i === 0 && protocol !== "") {
      out = protocol + sep2
    }
    arr.push(...list)
  }

  return out + parsePath(arr).join(sep)
}

export function join(...hreflist) {
  let out = ""
  const arr = []

  for (let i = 0; i < hreflist.length; i++) {
    let { protocol, list } = init(hreflist[i])

    if (i === 0 && protocol !== "") {
      out = protocol + sep2
    }

    if (list[0] === "..") {
      arr.pop()
      if (i !== 0) {
        list.shift()
      }
    }

    arr.push(...list)
  }

  return out + arr.join(sep)
}

export function isAbsolute(href) {

}

export function relative(core, href) {

}

export function resolve(...hreflist) {

}
