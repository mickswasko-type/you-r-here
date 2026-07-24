---
layout: base.njk
---

# You /r/ Here

<p class="site-subtitle">A Mallworld Directory</p>

*Compiling the geography of Mallworld — on Reddit and beyond.*

Site under construction. The archive is coming.

[Browse locations](/locations/)

## Archived so far

<!-- Temporary list while the site is under construction; the real home page (recently added + random entry) is build-order step 6. -->
<ul>
{%- for e in collections.entries %}
  <li><a href="{{ e.url }}">{{ e.data.title }}</a></li>
{%- endfor %}
</ul>
