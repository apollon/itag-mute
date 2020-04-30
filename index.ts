import { app, Tray, Menu, nativeImage } from "electron"
import * as path from "path";
import * as AudioDevices from "macos-audio-devices"
import { ITag, Event } from "./src/itag"

let tray: Tray | null = null
let bluetoothTagConnected = false

async function updateTrayIcon() {
	const device = await AudioDevices.getDefaultInputDevice()
	const isMuted = await AudioDevices.getDeviceMute(device.id)
	
	let iconPath
	if (isMuted) {
		if (bluetoothTagConnected) {
			iconPath = path.join(__dirname, "../assets/muteMicLightBluetooth.png")
		} else {
			iconPath = path.join(__dirname, "../assets/muteMicLight.png")
		}
	} else {
		if (bluetoothTagConnected) {
			iconPath = path.join(__dirname, "../assets/micLightBluetooth.png")
		} else {
			iconPath = path.join(__dirname, "../assets/micLight.png")
		}
	}

	let icon = nativeImage.createFromPath(iconPath)
	icon = icon.resize({ width: 16, height: 16 })

	tray?.setImage(icon)
}

async function toggleMute() {
	const device = await AudioDevices.getDefaultInputDevice()
	await AudioDevices.toggleDeviceMute(device.id)

	updateTrayIcon()
}

app.dock.hide()

app.on('ready', async () => {
	console.log(`app ready`)

	app.dock.hide()

	let trayMenu = Menu.buildFromTemplate([
		{ label: 'Quit', click: () => { app.quit(); } },
	])

	tray = new Tray(nativeImage.createEmpty())
	tray.setToolTip('[Un]Mute microphone');
	tray.on("right-click", () => {
		console.log(`tray right-clicked`)
		tray?.popUpContextMenu(trayMenu)
	})	
	tray.on("click", async (event, bounds, position) => {
		console.log(`tray clicked`)

		toggleMute()
	})

	const tag = new ITag()

	tag.on(Event.Connect, () => {
		console.log(`tag connected`)
		bluetoothTagConnected = true

		updateTrayIcon()
	})
	tag.on(Event.Disconnect, () => {
		console.log(`tag disconnected`)
		bluetoothTagConnected = false

		updateTrayIcon()
	})
	tag.on(Event.Click, async () => {
		console.log(`tag clicked`)
		
		toggleMute()
	})

	console.log(`scanning for peripherals...`)
	tag.scanAdress("fc-58-fa-11-c6-f1")

	updateTrayIcon()
})
