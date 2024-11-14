import fs from 'fs'

interface File {
  type: 'file' | 'dir'
  name: string
}

export const fetchDir = (dirName: string, baseDir: string): Promise<File[]> => {
  return new Promise<File[]>((resolve, reject) => {
    fs.readdir(dirName, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(
          files.map((file) => ({
            type: file.isDirectory() ? 'dir' : 'file',
            name: file.name,
            path: `${baseDir}/${file.name}`,
          }))
        )
      }
    })
  })
}

export const fetchContent = (path: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

export const saveFile = (file: string, content: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(file, content, 'utf-8', (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}
