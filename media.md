---
title: Media
meta_title: Information for journalists | CP Robotics
meta_description: We welcome journalists and other media agencies to contact us to
  learn more about CP Robotics’ cutting edge robot technology.
layout: subpage
---

<div class="container">
  <h1 class="editable">Media</h1>

  <div class="editable"><div class="row"><div class="small-12 medium-6 columns"><p>We welcome journalists and other media agencies to contact us to learn more about our cutting edge robot technology. Below you can find more information about CP Robotics, press photos as well as our newest press releases.</p></div><div class="small-12 medium-6 columns"><h3>Press material</h3><h5><a target="new" href="/_assets/images/Jimmy-ved-PC-optimeret.jpg">Photo of CEO&nbsp;</a><a href="https://drive.google.com/file/d/0B1W_WcBqzf9-R3RRZ1JodGJTbHc/view?usp=sharing">Sabina Kethelz</a></h5><h5 class="margin-top-medium"><a target="new" href="https://drive.google.com/file/d/0B1W_WcBqzf9-TUZSQkRzZWczbW8/view?usp=sharing">Company logo</a></h5><h5 class="margin-top-medium">

  <div class="row margin-top-medium">
    <div class="small-12 medium-6 columns">
      <h3>Highlighted stories</h3>
      {% assign stories = site.stories | sort: "date" | reverse %}
      {% for article in stories %}
        <article class="article">
          <date class="article-date">{{ article.date | date: '%B %d, %Y' }}</date>
          <h5 class="article-title"><a href="{{ article.url }}" target="new">{{ article.title }}</a></h5>
          <div class="article-excerpt">{{ article.excerpt }}</div>
        </article>
      {% endfor %}
    </div>
    <div class="small-12 medium-6 columns">
      <h3>Press releases</h3>
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


  <h3 class="margin-top-medium text-center">Spokespersons</h3>
  {% include members.html filter_type="spokesperson" %}
</div>
