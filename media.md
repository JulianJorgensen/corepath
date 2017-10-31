---
title: Media
meta_title: Information for journalists | CP Robotics
meta_description: We welcome journalists and other media agencies to contact us to
  learn more about CP Robotics’ cutting edge robot technology.
intro_text: We welcome journalists and other media agencies to contact us to learn
  more about our cutting edge robot technology. Below you can find more information
  about CP Robotics, press photos as well as our newest press releases.
layout: subpage
---

<div class="container">
<h1 class="editable">Media</h1>
<div class="editable">
<div class="row">
<div class="small-12 medium-6 columns">
<p>{{ page.intro_text }}</p>
</div>
<div class="small-12 medium-6 columns">
<h5 class="margin-top-medium"></h5>
</div>
</div>
<div class="row margin-top-medium">
<div class="small-12 medium-6 columns"><h3>Highlighted stories</h3>
{% assign stories = site.stories | sort: "date" | reverse %}
{% for article in stories %}
<article class="article">
<date class="article-date">{{ article.date | date: '%B %d, %Y' }}</date>
<h5 class="article-title"><a href="{{ article.url }}" target="new">{{ article.title }}</a></h5>
<div class="article-excerpt">{{ article.excerpt }}</div>
</article>
{% endfor %}
</div>
<div class="small-12 medium-6 columns"><h3>Press releases</h3>
{% assign pressreleases = site.press-releases | sort: "date" | reverse %}
{% for article in pressreleases %}
<article class="article">
<date class="article-date">{{ article.date | date: '%B %d, %Y' }}</date>
<h5 class="article-title"><a href="{{ article.url }}" target="new">{{ article.title }}</a></h5>
<div class="article-excerpt">{{ article.excerpt }}</div>
</article>
{% endfor %}
</div>
</div>
<div class="row margin-top-medium margin-bottom-medium">
<div class="small-12 columns">
<h3 class="margin-top-medium text-center">Spokespersons</h3>
{% include members.html filter_type="spokesperson" %}
</div>
</div>
</div>