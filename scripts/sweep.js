#!/usr/bin/env node
/*
 * Cheap-layer discovery sweep (the "targeted query" engine, keyword tier).
 *
 * Searches the configured Mallworld communities via the OFFICIAL Reddit API
 * for candidate map posts, dedupes against entries already in the archive, and
 * writes a review queue to _inbox/ (gitignored, never published). It fetches
 * NO images, edits NO content, and publishes NOTHING. A human reviews the
 * queue and promotes entries by hand. This keeps the brief's line intact:
 * "ingestion assistance produces a draft for human review and never publishes."
 *
 * Setup (one time):
 *   1. Go to https://www.reddit.com/prefs/apps  (logged in as your Reddit user)
 *   2. "create another app..." → type: installed app → name: you-r-here-sweep
 *      redirect uri: http://localhost:8080  (required field, unused here)
 *   3. Copy the client id — the string shown UNDER the app name (looks like
 *      "AbC123..."). An installed app has no secret.
 *   4. Put it where the script can read it, either:
 *        export REDDIT_CLIENT_ID=xxxx        (env var), or
 *        echo '{"clientId":"xxxx"}' > .reddit.json   (gitignored file)
 *      A confidential "script"/"web app" also works — add "clientSecret" too.
 *
 * Run:
 *   node scripts/sweep.js
 *   node scripts/sweep.js "map" "floor plan"     # override the queries
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// ---- config ---------------------------------------------------------------
const COMMUNITIES = ["TheMallWorld", "mallworld"];
const DEFAULT_QUERIES = ["map", "map of mallworld", "hand drawn map", "floor plan", "floorplan", "layout"];
const SORTS = [{ sort: "top", t: "all" }, { sort: "new" }]; // historical + recent
const UA = "you-r-here-archive/0.1 (Mallworld directory; +https://mickswasko-type.github.io/you-r-here/)";
const ENTRIES = "src/content/entries";
const INBOX = "_inbox";

const queries = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_QUERIES;

// ---- credentials ----------------------------------------------------------
function loadCreds() {
	let clientId = process.env.REDDIT_CLIENT_ID;
	let clientSecret = process.env.REDDIT_CLIENT_SECRET || "";
	if (!clientId && fs.existsSync(".reddit.json")) {
		const j = JSON.parse(fs.readFileSync(".reddit.json", "utf8"));
		clientId = j.clientId;
		clientSecret = j.clientSecret || "";
	}
	if (!clientId) {
		console.error(
			"No Reddit client id found.\n" +
				"Set REDDIT_CLIENT_ID, or create .reddit.json ({\"clientId\":\"...\"}).\n" +
				"See the setup notes at the top of scripts/sweep.js."
		);
		process.exit(1);
	}
	return { clientId, clientSecret };
}

async function getToken({ clientId, clientSecret }) {
	const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
	// Confidential app → client_credentials; installed app → userless grant.
	const body = clientSecret
		? "grant_type=client_credentials"
		: `grant_type=https://oauth.reddit.com/grants/installed_client&device_id=${crypto.randomUUID()}`;
	const res = await fetch("https://www.reddit.com/api/v1/access_token", {
		method: "POST",
		headers: {
			Authorization: `Basic ${auth}`,
			"Content-Type": "application/x-www-form-urlencoded",
			"User-Agent": UA,
		},
		body,
	});
	if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
	const j = await res.json();
	if (!j.access_token) throw new Error(`Auth returned no token: ${JSON.stringify(j)}`);
	return j.access_token;
}

// ---- dedupe against what's already archived -------------------------------
function knownPostIds() {
	const ids = new Set();
	if (!fs.existsSync(ENTRIES)) return ids;
	for (const f of fs.readdirSync(ENTRIES)) {
		if (!f.endsWith(".md")) continue;
		const txt = fs.readFileSync(path.join(ENTRIES, f), "utf8");
		const m = txt.match(/comments\/([a-z0-9]+)/i);
		if (m) ids.add(m[1]);
	}
	return ids;
}

// ---- is this an image/map post? -------------------------------------------
function isImagePost(d) {
	if (d.is_self) return false;
	if (d.is_gallery) return true;
	if (d.post_hint === "image") return true;
	if (/\.(jpe?g|png|webp|gif)$/i.test(d.url || "")) return true;
	if (/^(i\.redd\.it|i\.imgur\.com)$/.test(d.domain || "")) return true;
	return false;
}

async function search(token, sub, q, sortObj) {
	const params = new URLSearchParams({
		q,
		restrict_sr: "1",
		limit: "100",
		sort: sortObj.sort,
		raw_json: "1",
	});
	if (sortObj.t) params.set("t", sortObj.t);
	const res = await fetch(`https://oauth.reddit.com/r/${sub}/search?${params}`, {
		headers: { Authorization: `bearer ${token}`, "User-Agent": UA },
	});
	if (!res.ok) throw new Error(`Search r/${sub} "${q}" [${sortObj.sort}]: ${res.status}`);
	const j = await res.json();
	return (j.data?.children || []).map((c) => c.data);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) =>
	s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "untitled";

function draftMarkdown(c) {
	// Facts filled from the post; every JUDGMENT field left blank for review.
	return `---
title: ${JSON.stringify(c.title)}
creator: ${JSON.stringify(c.author)}
creator_platform: "reddit"
source_url: ${JSON.stringify(c.source_url)}
source_community: ${JSON.stringify(c.community)}
posted_date: ${JSON.stringify(c.posted_date)}
archived_date: ${JSON.stringify(new Date().toISOString().slice(0, 10))}
wayback_url: null
source_status: "live"
image: ""                 # REVIEW: download from ${c.image_url} into src/images/entries/, put filename here
image_credit_note: null
medium_as_stated: ""      # REVIEW: creator's own words, or "Not stated" — never guess
locations: []             # REVIEW: confirm which recurring locations it depicts
tags: []                  # REVIEW
permission: "opt-out"
featured_ok: false
---
REVIEW: curator note. Descriptive only.

Matched query: ${c.matched.join(", ")} · score ${c.score} · ${c.num_comments} comments${c.is_gallery ? " · GALLERY (multiple images)" : ""}
`;
}

async function main() {
	const token = await getToken(loadCreds());
	const known = knownPostIds();
	const seen = new Map(); // id -> candidate

	for (const sub of COMMUNITIES) {
		for (const q of queries) {
			for (const sortObj of SORTS) {
				let posts;
				try {
					posts = await search(token, sub, q, sortObj);
				} catch (e) {
					console.error(`  ! ${e.message}`);
					continue;
				}
				for (const d of posts) {
					if (!isImagePost(d)) continue;
					if (known.has(d.id)) continue; // already in the archive
					if (seen.has(d.id)) {
						if (!seen.get(d.id).matched.includes(q)) seen.get(d.id).matched.push(q);
						continue;
					}
					seen.set(d.id, {
						id: d.id,
						title: d.title,
						author: `u/${d.author}`,
						community: `r/${d.subreddit}`,
						posted_date: new Date(d.created_utc * 1000).toISOString().slice(0, 10),
						source_url: `https://www.reddit.com${d.permalink}`,
						image_url: d.url_overridden_by_dest || d.url,
						is_gallery: !!d.is_gallery,
						score: d.score,
						num_comments: d.num_comments,
						matched: [q],
					});
				}
				await sleep(600); // be polite to the API
			}
		}
	}

	const candidates = [...seen.values()].sort((a, b) => b.score - a.score);

	// Write the queue + one draft stub per candidate into the gitignored inbox.
	fs.mkdirSync(path.join(INBOX, "drafts"), { recursive: true });
	fs.writeFileSync(
		path.join(INBOX, "queue.json"),
		JSON.stringify({ swept_at: new Date().toISOString(), queries, count: candidates.length, candidates }, null, 2)
	);
	for (const c of candidates) {
		fs.writeFileSync(path.join(INBOX, "drafts", `${slug(c.title)}.md`), draftMarkdown(c));
	}

	// Console summary.
	console.log(`\nSwept ${COMMUNITIES.map((s) => "r/" + s).join(", ")} for: ${queries.join(", ")}`);
	console.log(`Known already: ${known.size} · New candidates: ${candidates.length}\n`);
	for (const c of candidates) {
		console.log(
			`  [${c.score}↑ ${c.num_comments}c] ${c.community} ${c.posted_date}  ${c.title}` +
				`${c.is_gallery ? " (gallery)" : ""}\n      ${c.source_url}`
		);
	}
	console.log(`\nDrafts → ${INBOX}/drafts/  ·  queue → ${INBOX}/queue.json`);
	console.log("Nothing was published. Review, then promote by hand.\n");
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
