const MAP_SIZE = 500
const NU_CENTER = ol.proj.fromLonLat([-87.6753, 42.056])
const AUTOMOVE_SPEED = 1
const UPDATE_RATE = 100

let landmarkCount = 0

let gameState = {
	points: 0,
	captured: [],
	negatives: [],
	messages: []
}

let map = new InteractiveMap({
	mapCenter: NU_CENTER,

	// Ranges
	ranges: [500, 200, 90, 1], // must be in reverse order

	initializeMap() {

		this.loadLandmarks("landmarks-coffee-shops-evanston", (landmark) => {
			// Keep this landmark?

			// Keep all landmarks in the set
			return true

		})

		// Create random landmarks
		const sub = ["MTH230","CS396","CS351","BIO201","PHY135", "CHEM151", "CS211", "HIS101", "CS111", "ECO201"]
		for (var i = 0; i < 10; i++) {

			let position = clonePolarOffset(NU_CENTER, 400*Math.random() + 300, 20*Math.random())
			this.createLandmark({
				pos: position,
				name: sub[i],
				bad: true,
			})
		}
	},

	update() {
		// Do something each frame
	},

	initializeLandmark: (landmark, isPlayer) => {
		// Add data to any landmark when it's created

		// Any openmap data?
		if (landmark.openMapData) {

			landmark.name = landmark.openMapData.name
			console.log(landmark.openMapData)

		}




		landmark.idNumber = landmarkCount++
		landmark.color = [Math.random(), 1, .5]

		// Give it a random number of points
		landmark.points = Math.floor(Math.random()*10 + 1)
		return landmark
	},

	onEnterRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user enters a range
		// -1 is not in any range

		console.log("enter", landmark.name, newLevel)
		console.log(gameState.messages)



			//if near a caffeine source
		if (newLevel == 2 && !gameState.captured.includes(landmark.name) && !landmark.bad) {
			gameState.captured.push(landmark.name)
			// Add a message
			gameState.messages.push(`You captured ${landmark.name} for ${landmark.points} energy`)
			gameState.points += landmark.points
		}
		//if near a decaf
		if (newLevel == 2 &&!gameState.negatives.includes(landmark.name) && landmark.bad ) {
			gameState.negatives.push(landmark.name)
			// Add a message
			gameState.messages.push(`You studied for ${landmark.name} and lost ${landmark.points} energy`)
			gameState.points -= landmark.points
		}

		}
	,

	onExitRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user EXITS a range around a landmark
		// e.g. (2->1, 0->-1)

		console.log("exit", landmark.name, newLevel)
	},


	featureToStyle: (landmark) => {
		// How should we draw this landmark?
		// Returns an object used to set up the drawing

		if (landmark.isPlayer) {
			return {
				icon: "person_pin_circle",
				noBG: true // skip the background
			}
		}

		// Pick out a hue, we can reuse it for foreground and background
		let hue = landmark.points*.1
		return {
			label: landmark.name + "\n" + landmark.distanceToPlayer +"m",
			fontSize: 8,

			// Icons (in icon folder)
			icon: "person_pin_circle",

			// Colors are in HSL (hue, saturation, lightness)
			iconColor: [hue, 1, .5],
			bgColor: [hue, 1, .2],
			noBG: false // skip the background
		}
	},


})



window.onload = (event) => {


	const app = new Vue({
		template: `
		<div id="app">
		<header></header>
			<div id="main-columns">

			<div class="main-column">
			<div class="game-info">
				<h1> You Need Energy To Study!</h1>
				<div class="points"> You have {{gameState.points}} energy </div>
				<div class="visited-cafes"> You have visited {{gameState.captured}} to gain energy </div>
				<div class="current-msg"> {{gameState.messages[gameState.messages.length - 1]}} </div>
			</div>
			</div>

			<div class="main-column" style="overflow:hidden;width:${MAP_SIZE}px;height:${MAP_SIZE}px">
				<location-widget :map="map" />

		</div>

			</div>
		<footer></footer>
		</div>`,

		data() {
			return {

				map: map,
				gameState: gameState
			}
		},

		// Get all of the intarsia components, plus various others
		components: Object.assign({
			// "user-widget": userWidget,
			// "room-widget": roomWidget,
			"location-widget": locationWidget,
		}),

		el: "#app"
	})

};
