---
title: News
meta_title: News | CP Robotics
meta_description: We welcome journalists and other media agencies to contact us to
  learn more about CP Robotics’ cutting edge robot technology.
layout: subpage
---

<div class="container">
  <h1 class="editable">All news</h1>

  <div class="row">
  {% assign news = site.news | sort: "date" | reverse %}
  {% for article in news %}
  <div class="small-12 medium-6 columns">
    <article class="article">
    <date class="article-date">{{ article.date | date: '%B %d, %Y' }}</date>
    <h5 class="article-title">{{ article.title }}</h5>
    <div class="article-excerpt">{{ article.excerpt }} {% if article.url != "" %}<a href="{{ article.url }}"><nobr>Read more »</nobr></a>{% endif %}</div>
    </article>
    </div>
  {% endfor %}
  </div>

</div>
