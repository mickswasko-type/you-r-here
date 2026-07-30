import fs from "node:fs";
import path from "node:path";
import { HtmlBasePlugin } from "@11ty/eleventy";

const LOCATIONS_DIR = "src/content/locations";

function knownLocationSlugs() {
	return fs
		.readdirSync(LOCATIONS_DIR)
		.filter((f) => f.endsWith(".md"))
		.map((f) => path.basename(f, ".md"));
}

export default function (eleventyConfig) {
	// Rewrites absolute URLs when deployed under /you-r-here/ on GitHub Pages
	eleventyConfig.addPlugin(HtmlBasePlugin);

	eleventyConfig.addPassthroughCopy("src/css");
	eleventyConfig.addPassthroughCopy("src/js");
	eleventyConfig.addPassthroughCopy("src/images");

	eleventyConfig.addCollection("entries", (api) => {
		const entries = api.getFilteredByGlob("src/content/entries/*.md");
		const known = knownLocationSlugs();
		const problems = [];
		for (const entry of entries) {
			for (const slug of entry.data.locations || []) {
				if (!known.includes(slug)) {
					problems.push(`${entry.inputPath} references unknown location "${slug}"`);
				}
			}
		}
		if (problems.length) {
			throw new Error(
				`Unknown location slugs (add a file in ${LOCATIONS_DIR}/ or fix the entry):\n` +
					problems.join("\n")
			);
		}
		return entries.sort((a, b) =>
			String(b.data.archived_date).localeCompare(String(a.data.archived_date))
		);
	});

	eleventyConfig.addCollection("locations", (api) =>
		api
			.getFilteredByGlob("src/content/locations/*.md")
			.sort((a, b) => a.data.title.localeCompare(b.data.title))
	);

	eleventyConfig.addFilter("entriesForLocation", (entries, slug) =>
		(entries || []).filter((e) => (e.data.locations || []).includes(slug))
	);

	return {
		dir: {
			input: "src",
			includes: "_includes",
			output: "_site",
		},
		pathPrefix: "/you-r-here/",
	};
}
