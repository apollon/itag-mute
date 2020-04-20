import * as AudioDevices from "macos-audio-devices"
import { ITag, Event } from "./itag"


const tag = new ITag()

tag.on(Event.Connect, () => {
	console.log(`tag connected`)
})
tag.on(Event.Disconnect, () => {
	console.log(`tag disconnected`)
})
tag.on(Event.Click, async () => {
	console.log(`tag clicked`)

	const device = await AudioDevices.getDefaultInputDevice()
	AudioDevices.toggleDeviceMute(device.id)
})

console.log(`scanning for peripherals...`)
tag.scanAll()
