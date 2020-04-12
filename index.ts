import * as noble  from "@abandonware/noble"
import { ITag, Event } from "./itag"

const tag = new ITag()

tag.on(Event.Connect, () => {
	console.log(`tag connected`)
})
tag.on(Event.Disconnect, () => {
	console.log(`tag disconnected`)
})
tag.on(Event.Click, () => {
	console.log(`tag clicked`)
})

console.log(`scanning for peripherals...`)
tag.scanAll()
