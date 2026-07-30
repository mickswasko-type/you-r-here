// Homepage gallery: turn the server-rendered archive list into a random,
// clickable image grid. Progressive enhancement — with no JS, the plain list
// of links below still works and the content stays portable.
(function () {
	"use strict";

	var list = document.getElementById("archive-list");
	if (!list) return;

	var links = Array.prototype.slice.call(list.querySelectorAll("a[data-image]"));
	if (!links.length) return;

	var N = Math.min(6, links.length);

	function shuffle(arr) {
		var a = arr.slice();
		for (var i = a.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var t = a[i];
			a[i] = a[j];
			a[j] = t;
		}
		return a;
	}

	function card(a) {
		var li = document.createElement("li");
		li.className = "gallery-card";

		var link = document.createElement("a");
		link.href = a.getAttribute("href");

		var frame = document.createElement("span");
		frame.className = "gallery-frame";

		var img = document.createElement("img");
		// Use the lightweight committed thumbnail (built by scripts/build-thumbs.py),
		// falling back to the full image if a thumb is somehow missing.
		var thumb = a.dataset.image.replace("/images/entries/", "/images/thumbs/");
		img.src = thumb;
		img.onerror = function () {
			img.onerror = null;
			img.src = a.dataset.image;
		};
		img.alt = a.dataset.title + " — a community-drawn Mallworld map";
		img.loading = "lazy";
		img.decoding = "async";
		frame.appendChild(img);

		var meta = document.createElement("span");
		meta.className = "gallery-meta";

		var title = document.createElement("span");
		title.className = "gallery-title";
		title.textContent = a.dataset.title;
		meta.appendChild(title);

		if (a.dataset.creator) {
			var creator = document.createElement("span");
			creator.className = "gallery-creator";
			creator.textContent = a.dataset.creator;
			meta.appendChild(creator);
		}

		link.appendChild(frame);
		link.appendChild(meta);
		li.appendChild(link);
		return li;
	}

	var grid = document.createElement("ul");
	grid.className = "home-gallery";
	grid.setAttribute("aria-label", "Random selection from the archive");

	var controls = document.createElement("p");
	controls.className = "gallery-controls";

	var shuffleBtn = document.createElement("button");
	shuffleBtn.type = "button";
	shuffleBtn.className = "shuffle-btn";
	shuffleBtn.textContent = "Shuffle";

	var count = document.createElement("span");
	count.className = "gallery-count";

	controls.appendChild(shuffleBtn);
	controls.appendChild(count);

	function render() {
		grid.innerHTML = "";
		shuffle(links)
			.slice(0, N)
			.forEach(function (a) {
				grid.appendChild(card(a));
			});
		count.textContent = "Showing " + N + " of " + links.length + " archived maps.";
	}

	shuffleBtn.addEventListener("click", render);

	// Insert controls + grid where the list was, then tuck the full list into a
	// collapsed details element so it stays reachable but out of the way.
	list.insertAdjacentElement("beforebegin", controls);
	controls.insertAdjacentElement("afterend", grid);

	var details = document.createElement("details");
	details.className = "full-list";
	var summary = document.createElement("summary");
	summary.textContent = "Full list (" + links.length + " maps)";
	details.appendChild(summary);
	list.parentNode.insertBefore(details, list);
	details.appendChild(list);

	render();
})();
