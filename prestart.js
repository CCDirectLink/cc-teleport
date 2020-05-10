
const fs = require('fs');
const path = require('path');	

ig.module('game.feature.gui.teleport')
	.requires('dom.ready', 'impact.feature.gui.gui','game.feature.model.game-model','game.feature.combat.combat')
	.defines(() => {
		
		
		// ----------------- Local Variables --------------------------------------------------------------------

		let modInterface;
		let interfaceToggle;
		
		let modState = 0;
		const MOD_STATE = {
			ALL_HIDDEN: 0, 
			TOGGLER_SHOWN: 1,
			MOD_SHOWN: 2
		}

		const markerValues = ['up', 'down', 'left', 'right', 'landmark'];
		let mapValues = [];


		// ---------------------- init map list Variable
		dir = './assets/data/maps';

		/**
		 * @description get all teleportable maps recursively
		 * @param {string} d start directory
		 */
		function getJsonFileNamesRecursive(d){
			fs.readdir(d, (err, files) => {
				if( err == null ) {
					for (const file of files) {
						if( file.endsWith('.json') ){
							map = path.join( d, file.replace('.json','') );
							mapValues.push(  map.replace(/\\/g,'/').replace(/^.*maps(\/|\\)/,'') );
						}
						else{
							getJsonFileNamesRecursive( path.join(d,file) );
						}	
					}
				} else {
					console.warn('autocomplete for maps unavailable');
					console.error(err.message);
				}
			});
		}
		getJsonFileNamesRecursive( dir );
		// ---------------- Local Functions --------------------------------------------------------------------

		/**
		 * @description checks if is a valid map before teleporting
		 * @param {string} map Input string from textbox 
		 * @param {string} marker Map position to start 
		 */
		function teleportIfExists(map,marker){
			mapPath = map.toPath(ig.root + 'data/maps/', '.json');	//From 
			jQuery.ajax({
				dataType: 'json',
				url: mapPath,
				success: (a) => {
					console.log(`Teleported to ${map}`)
					ig.game.teleport(map,setTeleportPosition(marker));
					document.activeElement.blur();	// Remove focus after submit
					setModState(MOD_STATE.MOD_SHOWN); // CLose the autocomplete
				},
				error: (b, c, e) => {
					console.warn(`Map ${map} does not exists`);
				}
			});
			return;
		}

		/**
		 * @description create TeleportPosition instante based only on marker value
		 * @param {string} marker value of the marker
		 * 		Possible values:
		 * 			- 'up', 'down', 'left', 'right', 'landmark'
		 */
		function setTeleportPosition(marker){
			return ig.TeleportPosition.createFromJson({
				marker: markerValues.find( m => m == marker),
				pos: 0,
				face: null,
				level: 0,
				baseZPos: 0,
				size: {x:0, y:0}
			});
		}

		/**
		 * @description Handle press enter key event
		 * @param {event} event trigger event
		 */
		function handleEnterKey(event){
			if(event.key == "Enter") {
				teleportIfExists(mapInput.value.trim(),markerInput.value.trim());
			}
		}


		/**
		 * @description Creates autocomplete functionality into element
		 * @param {HTML Element} inp element to append the autocomplete
		 * @param {Array} arr string options for the autocomplete
		 * Reference: https://codepen.io/urbanyoda/pen/zXpxJQ
		 */
		function autocomplete(inp, arr) {
			let currentFocus;
		
			/*execute a function when someone writes in the text field:*/
			inp.addEventListener("input", function (e) {
				let a, b, i, showCount = 6,
					val = this.value;
		
				closeAllLists();
				if (!val) {
					return false;
				}
				currentFocus = -1;
				a = document.createElement("DIV");
				a.setAttribute("id", this.id + "autocomplete-list");
				a.setAttribute("class", "autocomplete-items");
				a.style.position = 'fixed'
				a.style.bottom = '30px';
				a.style.left = '20px';
				this.parentNode.appendChild(a);
				for (i = 0; i < arr.length; i++) {		
					//Creating the matching elementes
					if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase() && showCount > 0) {		

						b = document.createElement("DIV");
						b.innerHTML = `
						<strong>${arr[i].substr(0, val.length)}</strong>${arr[i].substr(val.length)}\
						<input type='hidden' value="${arr[i]}">`;
						b.addEventListener("click", function (e) {
							inp.value = this.getElementsByTagName("input")[0].value;
							closeAllLists();
						});
						a.appendChild(b);
						showCount--;
					}
				}
			});
			// Keyboard functions
			inp.addEventListener("keydown", function (e) {
				let x = document.getElementById(this.id + "autocomplete-list");
				if (x) x = x.getElementsByTagName("div");
				if (e.keyCode == 40) { // DOWN
					currentFocus++;
					addActive(x);
				} else if (e.keyCode == 38) { //UP
					currentFocus--;
					addActive(x);
				} else if (e.keyCode == 13) { // ENTER
					if (currentFocus > -1) {
						if (x) x[currentFocus].click();
						teleportIfExists(mapInput.value.trim(),markerInput.value.trim());
					}
				}
			});
		
			function addActive(x) {
				/*a function to classify an item as "active":*/
				if (!x) return false;
				removeActive(x);
				if (currentFocus >= x.length) currentFocus = 0;
				if (currentFocus < 0) currentFocus = (x.length - 1);
				x[currentFocus].classList.add("autocomplete-active");
				x[currentFocus].style['color'] = '#000000';
				x[currentFocus].style['background-color'] = '#ffffff';
			}
		
			function removeActive(x) {
				/*a function to remove the "active" class from all autocomplete items:*/
				for (let i = 0; i < x.length; i++) {
					x[i].classList.remove("autocomplete-active");
					x[i].style['color'] = '#ffffff';
					x[i].style['background-color'] = '#00000000';
				}
			}
		
			function closeAllLists(elmnt) {
				/*close all autocomplete lists in the document,
				except the one passed as an argument:*/
				let x = document.getElementsByClassName("autocomplete-items");
						
				for (let i = 0; i < x.length; i++) {
					if (elmnt != x[i] && elmnt != inp) {
						x[i].parentNode.removeChild(x[i]);
					}
				}
			}
			// Close list by clicking outside
			document.addEventListener("click", function (e) {
				closeAllLists(e.target);
			});
		}


		/**
		 * @description State state of the mod interface
		 * @param {Modstate Constant} state 
		 */
		function setModState(state){

			modState = state;

			switch (state) {
				case MOD_STATE.ALL_HIDDEN:
					interfaceToggle.style.display = 'none';
					modInterface.style.display = 'none';
					break;
				case MOD_STATE.TOGGLER_SHOWN:
					interfaceToggle.style.display = 'block';
					modInterface.style.display = 'none';
					break;
				case MOD_STATE.MOD_SHOWN:
					interfaceToggle.style.display = 'none';
					modInterface.style.display = 'block';
					break;
				default:
					console.error('cc-teleport: Wrong mod state set');
					break;
			}

			let x = document.getElementsByClassName("autocomplete-items");		
			for (let i = 0; i < x.length; i++) {
				x[i].parentNode.removeChild(x[i]);
			}
		}

		// ----------------- Mod Injections --------------------------------------------------------------------

		/**
		 * @inject
		 * Handle game state transitions from main menu to the game 
		 */
		sc.Combat.inject({
			init(...args) {
				this.parent(...args);
				sc.Model.addObserver(sc.model, this);
			},
			modelChanged(model, event) {
				if( model instanceof sc.GameModel ){
					if(event == sc.GAME_MODEL_MSG.STATE_CHANGED || sc.GAME_MODEL_MSG.SUB_STATE_CHANGED ){
						if( sc.model.isTitle() || !sc.model.isRunning())
							setModState(MOD_STATE.ALL_HIDDEN);
						if( sc.model.isGame() && sc.model.isRunning() )
							setModState(MOD_STATE.TOGGLER_SHOWN);
					}
				}
			}
		});

		/**
		 * @inject
		 * Add the interface to the mod 
		 */
		ig.Gui.inject({
			init(...args) {
				this.parent(...args);
				
				document.body.insertAdjacentHTML('beforeend',`
					<img
						id="interfaceToggle"
						src="${'teleportIcon'.toPath(ig.root + 'mods/cc-teleport/', '.png')}" 
						height="38"
						width="38"
						style="
							position: absolute;
							left: 10px;
							bottom: 10px;
							background-color: white;
							opacity: 0.4;
							padding: 5px;
							border-radius: 10px;
						"
					> 
				`);
				interfaceToggle = document.getElementById('interfaceToggle');
				
				/* ------- Init teleporter interface ------- */
				document.body.insertAdjacentHTML('beforeend',`
					<div id="ccTeleporter"
						style="
							display: none;
							position: absolute;
							bottom: 0px;
							width: 100%;
							background: rgba(0, 0, 0, 0.3);
							color: white;
							display: block;">
						Map <input id="mapInput" style="background: rgba(0, 0, 0, 0.3);">
						Position <input id="markerInput" style="background: rgba(0, 0, 0, 0.3);">
						<button
							id="btnTeleport"
							style="color: white;
							padding: 4px;
							background-color: rgba(0, 0, 0, 0);
							background-repeat: no-repeat;
							border: 1px solid rgba(1, 1, 1, 0.5);
							cursor: pointer;
							overflow: hidden;
							outline: none;"
						> Teleport </button>
						<button
							id="hideTeleportMod"
							style="color: white;
							padding: 4px;
							background-color: rgba(0, 0, 0, 0);
							background-repeat: no-repeat;
							border: 1px solid rgba(1, 1, 1, 0.5);
							cursor: pointer;
							overflow: hidden;
							outline: none;"
						> Hide </button>
					</div>
				`);

				/* ------ Init Event Handlers ------ */
				modInterface = document.getElementById('ccTeleporter');
				let hideTeleportBtn = document.getElementById('hideTeleportMod');
				let mapInput = document.getElementById('mapInput');
				let markerInput = document.getElementById('markerInput');
				let btn = document.getElementById('btnTeleport');

				btn.onclick = () => {
					teleportIfExists(mapInput.value.trim(),markerInput.value.trim());
				}

				interfaceToggle.onclick = () => {
					if(modState = MOD_STATE.TOGGLER_SHOWN){
						setModState(MOD_STATE.MOD_SHOWN);
					} else {
						setModState(MOD_STATE.TOGGLER_SHOWN);
					}
				};

				hideTeleportBtn.onclick = () => {
					setModState(MOD_STATE.TOGGLER_SHOWN);
				}

				mapInput.onkeypress = (e) => {
					handleEnterKey(e);
				}

				markerInput.onkeypress = (e) => {
					handleEnterKey(e);
				}


				autocomplete(mapInput,mapValues);
				autocomplete(markerInput,markerValues);
				

				// Initial state of the interface
				setModState(MOD_STATE.ALL_HIDDEN);
			}
		});
	});
