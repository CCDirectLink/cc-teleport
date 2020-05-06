

ig.module('game.feature.gui.teleport')
	.requires('dom.ready', 'impact.feature.gui.gui','game.feature.model.game-model','game.feature.combat.combat')
	.defines(() => {
		
		// ----------------- Local Variables --------------------------------------------------------------------

		let modInterface;
		let interfaceToggle;


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
			markerValues = ['up', 'down', 'left', 'right', 'landmark'];
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
				document.activeElement.blur();	// Remove focus after submit
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



				// Initial state of the interface
				modInterface.style.display = 'none';
				interfaceToggle.style.display = 'none'; 
			}
		});
	});
