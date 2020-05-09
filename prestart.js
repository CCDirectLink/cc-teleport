
const fs = require('fs');

ig.module('game.feature.gui.teleport')
	.requires('dom.ready', 'impact.feature.gui.gui','game.feature.model.game-model','game.feature.combat.combat')
	.defines(() => {
		
		
		// ----------------- Local Variables --------------------------------------------------------------------

		let modInterface;
		let interfaceToggle;
		const markerValues = ['up', 'down', 'left', 'right', 'landmark'];
		let mapValues = [];


		// ---------------------- init map list Variable
		dir = './assets/data/maps/';

		/**
		 * @description get all teleportable maps recursively
		 * @param {string} d start directory
		 */
		function getJsonFileNamesRecursive(d){
			fs.readdir(d, (err, files) => {
				files.forEach(file => {
					if( file.search('.json') > 0 ){
						map = d + '/' + file.replace('.json','');
						mapValues.push( map.replace(dir,'').substr(1) );
					}
					else{
						getJsonFileNamesRecursive(d+'/'+file);
					}
				});
			});
		}

		getJsonFileNamesRecursive(dir);
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
					cc.ig.gameMain.teleport(map,setTeleportPosition(marker));
					document.activeElement.blur();	// Remove focus after submit
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
				// CLose the autocomplete
				let x = document.getElementsByClassName("autocomplete-items");		
				for (let i = 0; i < x.length; i++) {
					x[i].parentNode.removeChild(x[i]);
				}
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
					if(event == sc.GAME_MODEL_MSG.STATE_CHANGED && interfaceToggle != null && typeof div !== undefined ){
						if( sc.model.isTitle() ) interfaceToggle.style.display = 'none';
						if( sc.model.isGame()  ) interfaceToggle.style.display = 'block';
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
							right: 10px;
							top: 10px;
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
					</div>
				`);

				/* ------ Init Event Handlers ------ */
				modInterface = document.getElementById('ccTeleporter');
				let mapInput = document.getElementById('mapInput');
				let markerInput = document.getElementById('markerInput');
				let btn = document.getElementById('btnTeleport');

				btn.onclick = () => {
					teleportIfExists(mapInput.value.trim(),markerInput.value.trim());
				}

				interfaceToggle.onclick = () => {
					if(modInterface.style.display == 'none'){
						interfaceToggle.style.opacity = '1';
						modInterface.style.display = 'block';
					} else {
						modInterface.style.display = 'none';
						interfaceToggle.style.opacity = '0.4';
					}
				};

				mapInput.onkeypress = (e) => {
					handleEnterKey(e);
				}

				markerInput.onkeypress = (e) => {
					handleEnterKey(e);
				}


				autocomplete(mapInput,mapValues);
				autocomplete(markerInput,markerValues);
				

				// Initial state of the interface
				modInterface.style.display = 'none';
				interfaceToggle.style.display = 'none'; 
			}
		});
	});
