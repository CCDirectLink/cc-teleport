/**
 * @description - checks if is a valid map before teleporting
 * @param {string} map - Input string from textbox 
 */
function teleportIfExists(map,marker){
	// took from ig.Game.teleport -> ig.Game.preloadLevel 
	mapPath = map.toPath(ig.root + 'data/maps/', '.json');	//From 
	
	jQuery.ajax({
		dataType: 'json',
		url: mapPath,
		success: (a) => {
			console.log(`Teleported to ${map}`)
			cc.ig.gameMain.teleport(map,marker);
		},
		error: (b, c, e) => {
			console.warn(`Map ${map} does not exists`);
		}
	});

	return;
}

ig.module('game.feature.gui.teleport')
	.requires('dom.ready', 'impact.feature.gui.gui','game.feature.model.game-model','game.feature.combat.combat')
	.defines(() => {

		sc.Combat.inject({
			init(...args) {
				this.parent(...args);
				sc.Model.addObserver(sc.model, this);
			},
			modelChanged(model, event) {
				if( model instanceof sc.GameModel ){
					let div = document.querySelector('.cc-teleporter');
					if(event == sc.GAME_MODEL_MSG.STATE_CHANGED && div != null && typeof div !== undefined ){
						if( sc.model.isTitle() ) div.style.display = 'none';
						if( sc.model.isGame()  ) div.style.display = 'block';
					}
				}
			}
		});

		ig.Gui.inject({
			init(...args) {
				this.parent(...args);

				let div = document.createElement("div");
				div.style.position = 'absolute';
				div.style.bottom = '0';
				div.style.width = "100%";
				div.style.background = "rgba(0,0,0,0.3)";
				div.style.color = "white";
				div.classList.add('cc-teleporter');

				let mapInput = document.createElement('input');
				mapInput.style.background = 'rgba(0,0,0,0.3)';

				let markerInput = document.createElement('input');
				markerInput.style.background = 'rgba(0,0,0,0.3)';

				let btn = document.createElement('button');
				btn.innerText = 'Teleport';
				btn.style.color = 'white';
				btn.style.padding = '4px';
				btn.style.backgroundColor = 'rgba(0,0,0,0)';
				btn.style.backgroundRepeat = 'no-repeat';
				btn.style.border = '1px solid rgba(1,1,1,0.5)';
				btn.style.cursor = 'pointer';
				btn.style.overflow = 'hidden';
				btn.style.outline = 'none';

				btn.onclick = () => {
					teleportIfExists(mapInput.value.trim(),markerInput.value.trim());
				}


				mapInput.onkeypress = (event) => {
					// Teleport when press enter
					if(event.key == "Enter") {
						teleportIfExists(mapInput.value.trim(),markerInput.value.trim());
						// Remove focus after submit
						document.activeElement.blur();
					}
					// Autocomplete
					if(event.key == "Tab") {

					}
				}

				div.append('Map', mapInput, ' Marker', markerInput, btn);

				document.body.appendChild(div);
			}
		});
	});
