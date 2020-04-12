import * as noble  from "@abandonware/noble"

export enum Event {
	Connect = "connect",
	Disconnect = "disconnect",
	Click = "click"
}

const CLICK_CHARACTERISTIC_UUID = "ffe1"

type EventCallback = () => void

export class ITag {
	private peripheral: noble.Peripheral
	private listeners: [Event, EventCallback][] = []

	public scanAll() {
		noble.on("stateChange", state => {
			if (state != "poweredOn") {
				return
			}
			noble.on("discover", peripheral => {
				console.log(`discovered peripheral: ${peripheral}\n`);
			})
			noble.startScanning([], true);
		})
	}

	public scanAdress(mac: string) {
		noble.on("stateChange", state => {
			if (state != "poweredOn") {
				return
			}

			noble.on("discover", async peripheral => {
				const addrRegex = new RegExp(mac.replace(/[-:]/g, "[-:]"), "i")
				if (!addrRegex.test(peripheral.address)) {
					// skip
					return
				}

				if (!this.peripheral) {
					this.peripheral = peripheral

					peripheral.on("connect", async error => {
						if (error) {
							console.log(`${peripheral.id}: disconnection error: ${error}`)
							return
						}

						//console.log(`${peripheral.id}: connected`)

						this.onEvent(Event.Connect)

						let discover = await peripheral.discoverAllServicesAndCharacteristicsAsync()
						discover.characteristics.forEach(characteristic => {

							if (characteristic.uuid == CLICK_CHARACTERISTIC_UUID) {
								characteristic.on("read", (data, isNotif) => {
									this.onEvent(Event.Click)
								})
								characteristic.subscribe()	
							}
						})
					})
					peripheral.on("disconnect", error => {
						if (error) {
							console.log(`${peripheral.id}: disconnection error: ${error}`)
							return
						}

						this.onEvent(Event.Disconnect)
					})

					
				}

				// TODO: what about error?

				await peripheral.connectAsync()
			})

			noble.startScanning([], true);
		})
	}

	private onEvent(event: Event) {
		this.listeners.forEach(([loopEvent, loopCallback]) => {
			if (event != loopEvent) {
				return
			}

			loopCallback()
		})
	}

	public on(event: Event, callback: EventCallback) {
		this.listeners.push([event, callback])
	}
}
