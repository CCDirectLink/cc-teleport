document.body.addEventListener('modsLoaded', function () {
	console.log(cc);
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
	btn.style['background-color'] = 'rgba(0,0,0,0)';
	btn.style['background-repeat'] = 'no-repeat';
	btn.style['border'] = '1px solid rgba(1,1,1,0.5)';
	btn.style['cursor'] = 'pointer';
	btn.style['overflow'] = 'hidden';
	btn.style['outline'] = 'none';

	btn.onclick = () => {
		const config = {
			map: mapInput.value,
			marker: markerInput.value 
		}
		console.log('map:', mapInput.value);
		console.log('marker:', markerInput.value);
		cc.ig.gameMain.teleport(mapInput.value, markerInput.value);
	}

	div.appendChild(document.createTextNode('Map'));
	div.appendChild(mapInput);
	div.appendChild(document.createTextNode(' Marker'));
	div.appendChild(markerInput);
	div.appendChild(btn);

	document.body.appendChild(div);
});