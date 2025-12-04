/**
 * Lively Gradient Ribbons
 * Copyright (c) 2025 Berk Ege (brkee) All rights reserved.
 * Contact Information: brkee.jp@gmail.com
 */

const config = {
	backgroundColor: "#000000",
	ribbonsCount: 6,
	ribbonsDiversity: 1.2,

	showCenter: true,
	showClock: true,
	showWeather: true,
	showMedia: true,

	clockType: 1,
	animateSeconds: true,
	weatherIcon: true,
	mediaCover: true,
	mediaTextSlide: true,
	mediaTextSlideDuration: 12,

	weatherApiKey: ""
};


// Lively Property Listener
function livelyPropertyListener(name, val) {
	if (Object.hasOwn(config, name)) {
		config[name] = val;

		updateClock();
		updateWeather();
		updateMarquee();
		updateMedia();
		updateInformationCenter();
		updateRibbonCount();
	}
}

const langCode = navigator.languages[0].padStart(2) || "en";

function updateInformationCenter() {
	if (config.showCenter) {
		document.querySelector('#informationCenter').style.display = "flex";
	} else {
		document.querySelector('#informationCenter').style.display = "none";
	}
}
updateInformationCenter();

// Clock + Date
function updateClock() {
	if (config.showClock) {
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const seconds = now.getSeconds();
		const colon = config.animateSeconds ? (seconds % 2 ? ':' : ' ') : ':';

		switch (config.clockType) {
			case 0: // Date & Clock with seconds
				document.getElementById('time').textContent =
					`${String(hours).padStart(2, '0')}${colon}${String(minutes).padStart(2, '0')}${colon}${String(seconds).padStart(2, '0')}`;

				document.getElementById('date').textContent =
					now.toLocaleDateString(langCode, {
						weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
					});
				break;
			case 1: // Date & Clock
				document.getElementById('time').textContent =
					`${String(hours).padStart(2, '0')}${colon}${String(minutes).padStart(2, '0')}`;

				document.getElementById('date').textContent =
					now.toLocaleDateString(langCode, {
						weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
					});
				break;
			case 2: // Clock
				document.getElementById('time').textContent =
					`${String(hours).padStart(2, '0')}${colon}${String(minutes).padStart(2, '0')}`;

				document.getElementById('date').textContent = '';
				break;
		}
		document.querySelector('#clock').style.display = "flex";
	} else {
		document.querySelector('#clock').style.display = "none";
	}
}
setInterval(updateClock, 1000); updateClock();

// Weather
function updateWeather() {
	if (config.showCenter && config.showWeather) {
		if (!config.weatherApiKey || config.weatherApiKey === "") {
			return document.querySelector('#weatherText').textContent = 'No API Key';
		}

		if (!navigator.geolocation) {
			return document.querySelector('#weatherText').textContent = 'No geolocation support';
		}

		navigator.geolocation.getCurrentPosition(pos => {
			fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${config.weatherApiKey}&units=metric&lang=${langCode}`)
				.then(result => result.json())
				.then(data => {
					document.querySelector('#weatherIcon').src =
						`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

					document.querySelector('#weatherText').textContent =
						`${data.weather[0].description}, ${Math.round(data.main.temp)}°C`;

					let feels_like = translations[langCode]?.feels_like || translations["en"].feels_like;
					let humidity = translations[langCode]?.humidity || translations["en"].humidity;
					document.querySelector('#weatherDetails').textContent =
						`${feels_like} ${Math.round(data.main.feels_like)}°C • ${humidity} ${data.main.humidity}%`;

					document.querySelector('#weatherIcon').style.display = config.weatherIcon ? 'block' : 'none';
					document.querySelector('#weather').style.display = "flex";
				})
				.catch(() => {
					document.querySelector('#weatherText').textContent = 'Weather unavailable';
				});
		}, () => {
			document.querySelector('#weatherText').textContent = 'Location denied';
		});
	} else {
		return document.querySelector('#weather').style.display = "none";
	}
}
setInterval(updateWeather, 15 * 60 * 1000); updateWeather();

// Media
function livelyCurrentTrack(data) {
	data = JSON.parse(data);

	if (data && Object.keys(data).length > 0) {
		const artist = data.Artist || data.AlbumArtist || 'Unknown Artist';
		const title = data.Title || 'Unknown Title';

		document.querySelector('#mediaThumb').src = `data:image/png;base64,${data.Thumbnail}`;
		document.querySelector('#mediaTitle>p').textContent = title;
		document.querySelector('#mediaArtist>p').textContent = artist;

		updateMarquee();
		document.querySelector('#media').dataset.playing = true;
		document.querySelector('#media').style.display = "flex";
	} else {
		document.querySelector('#media').dataset.playing = false;
		document.querySelector('#media').style.display = 'none';
	}
}

function updateMedia() {
	if (document.querySelector('#media').dataset.playing === 'true' && config.showMedia) {
		document.querySelector('#media').style.display = "flex";
	} else {
		document.querySelector('#media').style.display = 'none';
	}
	if (config.mediaCover) {
		document.querySelector('#mediaThumb').style.display = "block";
	} else {
		document.querySelector('#mediaThumb').style.display = "none";
	}
}

function updateMarquee() {
	if (config.mediaTextSlide) {
		const boxes = document.querySelectorAll('.marquee');
		for (const box of boxes) {
			const text = box.querySelector('p');
			text.style.animationDuration = `${config.mediaTextSlideDuration}s`;

			if (text.scrollWidth > box.clientWidth) {
				text.classList.add('animate');
			} else {
				text.classList.remove('animate');
			}
		}
	} else {
		const boxes = document.querySelectorAll('.marquee');
		for (const box of boxes) {
			const text = box.querySelector('p');
			text.classList.remove('animate');
		}
	}
}