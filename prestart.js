ig.module('game.feature.gui.teleport')
	.requires('dom.ready', 'impact.feature.gui.gui')
	.defines(() => {
		ig.Gui.inject({
			init(...args) {
				this.parent(...args);

				let div = document.createElement("div");
				div.style.position = 'absolute';
				div.style.bottom = '0';
				div.style.width = "100%";
				div.style.background = "rgba(0,0,0,0.3)";
				div.style.color = "white";

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
					console.log('map:', mapInput.value);
					console.log('marker:', markerInput.value);
					ig.gameMain.teleport(mapInput.value.trim(), markerInput.value.trim());
				}

				div.append('Map', mapInput, ' Marker', markerInput, btn);

				document.body.appendChild(div);
			}
		});
	});
