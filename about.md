---
title: About
meta_title: About CP Robotics
meta_description: At CP Robotics we believe in making robot solutions available for
  everyone through easy to use and intuitive robot software.
custom_js:
- timeline.js
layout: subpage
---

<div class="container">
  <h1 class="editable">About</h1>

  <div class="row">
    <div class="small-12 medium-6 column">
      <p>At CP Robotics we believe in making robot solutions available for everyone. We have developed a software technology that makes the handling of robots easy and flexible. Especially small and medium sized enterprises that use e.g. polishing, grinding or milling in their prodctuon will benefit greatly from our technology.</p>
      <p>Our technology is industry 4.0 ready. That means we deliver intelligent solutions where each part: robot, sensor and computer are connected in a cloud-based system that can both share and calculate tasks.</p>
    </div>
    <div class="small-12 medium-6 column">
      <p>In the time to come we hope that many repetitive, straining and hazardous tasks in small and medium sized enterprises will be handled by robots in collaboration with the shop floor personnel. This will not only increase productivity but also raise the overall well-being of the workers and boost morale.</p>
    </div>
  </div>


  {% assign timeline = site.timeline | reverse %}
  <section id="cd-timeline" class="cd-container">
    {% for timeline in timeline %}
        <div class="cd-timeline-block">
    			<div class="cd-timeline-img">
    				<div class="cd-timeline-icon">
              <i class="fa {{ timeline.timeline_type }}"></i>
            </div>
    			</div> <!-- cd-timeline-img -->

    			<div class="cd-timeline-content">
    				<h3>{{ timeline.title }}</h3>
    				<p>{{ timeline.description }}</p>
    				<!-- <a href="#0" class="cd-read-more">Read more</a> -->
    				<span class="cd-date">{{ timeline.date | date: '%B %Y' }}</span>
    			</div> <!-- cd-timeline-content -->
    		</div> <!-- cd-timeline-block -->

    {% endfor %}
  </section>

</div>
