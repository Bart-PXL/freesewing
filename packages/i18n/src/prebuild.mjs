import yaml from 'js-yaml'
import path from 'node:path'
import rdir from 'recursive-readdir'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

// No __dirname in Node 14
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/*
 * Helper method to get a list of yaml/yml files.
 * Will traverse recursively to get all files from the current folder
 */
const getTranslationFileList = async () => {
  let allFiles
  try {
    allFiles = await rdir(path.resolve(__dirname, 'locales'))
  }
  catch (err) {
    console.log(err)
    return false
  }

  // Filter out all that's a .yaml or .yml file
  const files = []
  for (const file of allFiles) {
    if (file.slice(-5) === `.yaml` || file.slice(-4) === `.yml`) {
      files.push(file)
    }
  }

  return files.sort()
}

/** extracts the locale from the file name */
const localeFromFileName = (fileName) => {
  const split1 = fileName.split(`${path.sep}locales${path.sep}`).pop()
  return split1.split(`${path.sep}`).shift()
}

/*
 * Figures out the list of locales from the list of files
 * (by checking how many version of aaron.yaml exist)
 */
const getLocalesFromFileList = files => files
  .filter(file => (file.slice(-10) === 'aaron.yaml'))
  .map(localeFromFileName)

// Helper method to see if a dir occurs in a full path
const pathContains = (fullPath, dir) => fullPath
  .indexOf(`${path.sep}${dir}${path.sep}`) !== -1

/*
 * Determines the namespace name based on the file path
 */
const namespaceFromFile = file => {
  const ext = path.extname(file)
  const name = path.basename(file, ext)

  //if (pathContains(file, 'components')) return 'c_' + name
  if (pathContains(file, 'options')) return 'o_' + name
  if (pathContains(file, 'plugin')) return 'plugin'

  return name
}

/*
 * This method flattens a .yml files with a structure like:
 * key:
 *   title:
 *   description:
 *   options; (this one is not always present)
 */
const flattenYml = content => {
  const flat = {}
  for (const l1 in content) {
    flat[`${l1}.t`] = content[l1].title
    flat[`${l1}.d`] = content[l1].description
  }

  return flat
}

/*
 * Loads and parses a translation file, making sure to
 * handle nested keys in .yml files
 */
const loadTranslationFile = async (file) => {
  const data = yaml.load(
    (await readFile(file, { encoding: 'utf-8'}))
  )

  return (path.extname(file) === '.yml')
    ? flattenYml(data)
    : data
}


/*
 * Creates an object with namespaces and the YAML/YML files
 * that go with them
 */
const getNamespacesFromFileList = async (files, locales, only=false) => {
  const namespaces = {}
  for (var i = 0; i < files.length; i++) {
    let file = files[i]

    let loc = localeFromFileName(file);
    if (locales.indexOf(loc) === -1) continue

    let namespace = namespaceFromFile(file);
    if (only === true && only.indexOf(namespace) === -1) continue

    if (typeof namespaces[loc] === 'undefined') {
      namespaces[loc] = {}
    }

    if (typeof namespaces[loc][namespace] === 'undefined') {
      namespaces[loc][namespace] = {}
    }

    namespaces[loc][namespace] = {
      ...namespaces[loc][namespace],
      ...(await loadTranslationFile(file))
    }
  }

  return namespaces
}

const header = `/*
 * This file is auto-generated by the build script
 * All edits will be overwritten on the next build
 */`
const namespaceFile = (name, data) => `${header}
const ${name} = ${JSON.stringify(data, null ,2)}

export default ${name}
`
const localeFile = (namespaces) => `${header}
${namespaces
  .map(ns => 'import '+ns+' from "./'+ns+'.mjs"')
  .join("\n")
}

const allNamespaces = {
  ${namespaces.join(",\n  ")}
}

export default allNamespaces
`
const indexFile = (locales, data) => `${header}
${locales
  .map(l => 'import '+l+'Namespaces from "./next/'+l+'/index.mjs"')
  .join("\n")
}

${locales
  .map(l => 'export const '+l+' = '+l+'Namespaces')
  .join("\n")
}

export const languages = {
${locales
  .map(l => '  '+l+': "'+ data[l].i18n[l]+'"')
  .join(",\n")
}
}
`

/*
 * Writes out files
 */
const writeFiles = async allNamespaces => {
  const filePromises = []
  const dist = path.resolve(__dirname, '..', 'dist')

  for (const [locale, namespaces] of Object.entries(allNamespaces)) {
    // make sure there's a folder for the locale
    await mkdir(path.resolve(dist, locale), {recursive: true})

    for (const [namespace, data] of Object.entries(namespaces)) {
      filePromises.push(
        writeFile(
          path.resolve(dist, locale, namespace+'.mjs', ),
          namespaceFile(namespace, data)
        )
      )
    }
    // Locale index files
    filePromises.push(
      writeFile(
        path.resolve(dist, locale, 'index.mjs', ),
        localeFile(Object.keys(namespaces))
      )
    )
  }
  // Locale index files
  filePromises.push(
    writeFile(
      path.resolve(dist, 'index.mjs', ),
      indexFile(Object.keys(allNamespaces), allNamespaces)
    )
  )

  // write the files
  await Promise.all(filePromises)

  return
}

/*
 * Turns YAML translation files into JS
 */
export const build = async (localeFilter = () => true, only=false) => {
  const files = await getTranslationFileList()
  const locales = getLocalesFromFileList(files).filter(localeFilter)
  console.log('building i18n for', locales)
  const namespaces = await getNamespacesFromFileList(files, locales, only)

  await writeFiles(namespaces)
  return namespaces
}

//export default strings

