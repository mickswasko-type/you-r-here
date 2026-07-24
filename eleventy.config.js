import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
	// Rewrites absolute URLs when deployed under /you-r-here/ on GitHub Pages
	eleventyConfig.addPlugin(HtmlBasePlugin);

	eleventyConfig.addPassthroughCopy("src/css");
	eleventyConfig.addPassthroughCopy("src/images");

	return {
		dir: {
			input: "src",
			includes: "_includes",
			output: "_site",
		},
		pathPrefix: "/you-r-here/",
	};
}
