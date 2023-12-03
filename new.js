import { is, each, validate, makeValidator } from "https://x-titan.github.io/utils/index.js"
import { List } from "https://x-titan.github.io/list/index.js"

const validateString = makeValidator(is.str)

const sep = (
  (is.defined(globalThis.document))
    ? "/"
    : "\\"
)

const { log } = console
const x = "https://x-titan.github.io:5050/contact/noopener/index.html#isopened=false?wait=true"
const y = "../../folder/lab/file.txt"
const z = "data:image/png;base64,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"

const sep2 = sep + sep
const regExpSep = /[\\\/]+/
const regExpProtocol = /^[a-zA-Z0-9]+:/
const regExpProtocolWithSep = /[a-zA-Z0-9]+:[\\\/]*/
const regExpHost = /[a-zA-Z0-9\.\-\_][\\\/]?/

log(location)

function get_protocol(url) {
  const p = regExpProtocol.exec(url)

  if (p !== null) return p[0]
  else return ""
}
function get_protocolWithSep(url) {
  const p = regExpProtocolWithSep.exec(url)

  if (p !== null) return p[0]
  else return ""
}

function split_url(url = "") {
  return validateString(url).split(regExpSep) || []
}

function get_host(url) {
  const u = validateString(url)
    .replace(get_protocolWithSep(url), "")
    .split(regExpSep)[0]

  if (u === ".." || u === ".") return ""
  return u
}

function get_hostname(url) {
  return get_host(validateString(url)).split(":")[0] || ""
}
function get_port(url) {
  return get_host(validateString(url)).split(":")[1] || ""
}
function get_origin(url) {
  validateString(url)
  const protocol = get_protocolWithSep(url)
  const host = get_host(url)
  return protocol + host
}

function get_additional(url = "") {
  const hashIndex = url.indexOf("#")
  const searchIndex = url.indexOf("?")
  if (searchIndex !== -1 && hashIndex !== -1) {

  }
  return url.slice(Math.min(hashIndex, searchIndex))
}

function get_hash(url = "") {
  validateString(url)
  const i = url.indexOf("#")
  if (i === -1) return ""
  const j = url.slice(i)
  return (j + " ").slice(0, j.indexOf("?")) || ""
}

function get_search(url) {
  validateString(url)
  const i = url.indexOf("?")
  if (i === -1) return ""
  const j = url.slice(i)
  return (j + " ").slice(0, j.indexOf("#")) || ""
}

function get_pathname(url) {
  return (validateString(url)
    .replace(get_origin(url), "")
    .replace(get_hash(url), "")
    .replace(get_search(url), ""))
}


function get_dirname(url) {

}

function get_extname(url) {

}

function get_basename(url) {

}



function parse(url) { }
function normalize(url) { }
function join(...urlList) { }
