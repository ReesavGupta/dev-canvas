import { Server, Socket } from 'socket.io'
import { fetchContent, fetchDir, saveFile } from './fs'
import { saveToS3 } from './aws'
import { Server as HttpServer } from 'http'
import { TerminalManager } from './pty'

const terminalManager = new TerminalManager()

export const initWsConnection = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ['*'], // Only allow specific domain(s)
      methods: ['GET', 'POST'], // Limit to necessary HTTP methods
    },
  })

  io.on('connection', async (socket: Socket) => {
    const host = socket.handshake.headers.host

    console.log(`\nthis is the host: ${host}`)

    const canvasID = host?.split('.')[0]
    // canvasID.canvas.com
    if (!canvasID) {
      socket.disconnect()
      // need to clear the terminal manager here with the corresponding socketID
      return
    }

    socket.emit('loaded', {
      rootContent: await fetchDir('/workspace', ''),
    })

    initHandlers(socket, canvasID)
  })
}

function initHandlers(socket: Socket, canvasID: string) {
  socket.on('fetchDir', async (dir: string, callback) => {
    const dirPath = `/workspace/${dir}`
    const contents = await fetchDir(dirPath, dir)
    callback(contents)
  })

  socket.on(
    'fetchContent',
    async ({ path: filePath }: { path: string }, callback) => {
      const fullPath = `/workspace/${filePath}`
      const data = await fetchContent(fullPath)
      callback(data)
    }
  )

  socket.on(
    'updateContent',
    async ({ path: filePath, content }: { path: string; content: string }) => {
      const fullPath = `/workspace/${filePath}`
      await saveFile(fullPath, content)
      await saveToS3(`code/${canvasID}`, filePath, content)
    }
  )

  socket.on('requestTerminal', async () => {
    terminalManager.createPty(socket.id, canvasID, (data, id) => {
      socket.emit('terminal', {
        data: Buffer.from(data, 'utf-8'),
      })
    })
  })

  socket.on(
    'terminalData',
    async ({ data }: { data: string; terminalId: number }) => {
      terminalManager.write(socket.id, data)
    }
  )
}
