import { app, shell, BrowserWindow, ipcMain, Menu, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/chat.png?asset'
import user from '../../resources/user.png?asset'
import exit from '../../resources/exit.png?asset'
import { onLoginOrRegister, onLoginSuccess, winTitleOp } from './ipc'

const NODE_ENV = process.env.NODE_ENV
const login_width = 300
const login_height = 370
const register_height = 490

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: icon,
    width: login_width,
    height: login_height,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden', // 隐藏标题栏
    resizable: false, // 不允许更改窗口大小
    frame: true, // 操作系统标准边框和标题栏
    transparent: true, // 背景透明化
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: false // 上下文隔离
    }
  })

  //打开控制台
  if (NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.setTitle('Chat')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 托盘操作
  const tray = new Tray(icon)
  const contextMenu = [
    {
      icon: exit,
      label: '退出Chat',
      click: function () {
        app.exit()
      },
      css: {
        fontSize: '405px' // 虽然这是示例，但需要自定义实现
      }
    }
  ]

  const menu = Menu.buildFromTemplate(contextMenu)
  tray.setToolTip('Chat')
  tray.setContextMenu(menu)
  tray.on('click', () => {
    mainWindow.setSkipTaskbar(false)
    mainWindow.show()
  })

  // 监听登录注册，通过回调函数改变isLogin
  onLoginOrRegister((isLogin) => {
    mainWindow.setResizable(true)
    if (isLogin) {
      mainWindow.setSize(login_width, login_height)
    } else {
      mainWindow.setSize(login_width, register_height)
    }
    mainWindow.setResizable(false)
  })

  onLoginSuccess((config) => {
    mainWindow.setResizable(true)
    mainWindow.setSize(850, 800)
    mainWindow.center()
    mainWindow.setOpacity(1) // 取消透明
    mainWindow.setMaximizable(true) // 可改变大小
    mainWindow.setMinimumSize(800, 600) // 最小

    // 管理员窗口，托盘操作
    if (config.admin) {
    }

    // 显示用户，界面
    contextMenu.unshift({
      icon: user,
      label: config.nickName,
      click: function () {}
    })
    tray.setContextMenu(Menu.buildFromTemplate(contextMenu))
  })

  winTitleOp((e, { action, data }) => {
    const webContents = e.sender
    const win = BrowserWindow.fromWebContents(webContents)
    switch (action) {
      case 'close': {
        if (data.closeType == 0) {
          win.close()
        } else {
          win.setSkipTaskbar(true) //
          win.hide()
        }
        break
      }
      case 'minimize': {
        win.minimize()
        break
      }
      case 'maximize': {
        win.maximize()
        break
      }
      case 'unmaximize': {
        win.unmaximize()
        break
      }
      case 'top': {
        win.setAlwaysOnTop(data.top)
      }
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
