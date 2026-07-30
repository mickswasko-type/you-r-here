---
layout: base.njk
---

# You /r/ Here

<p class="site-subtitle">A Mallworld Directory</p>

*Compiling the geography of Mallworld — on Reddit and beyond.*

Site under construction. The archive is coming.

[Browse locations](/locations/)

<section class="home-archive">

## From the archive

A random handful from the collection. Hit **Shuffle** for a different set, or open any map to see it in full and follow it back to its source.

<ul id="archive-list" class="archive-list">
{%- for e in collections.entries %}
  <li><a href="{{ e.url }}" data-image="{{ e.data.image | prepend: '/images/entries/' | url }}" data-title="{{ e.data.title | escape }}" data-creator="{{ e.data.creator | default: '' | escape }}">{{ e.data.title }}</a>{% if e.data.creator %} — {{ e.data.creator }}{% endif %}</li>
{%- endfor %}
</ul>

</section>

<!-- HtmlBasePlugin rewrites src for the path prefix; no url filter here or it double-prefixes. -->
<script src="/js/home-gallery.js" defer></script>
