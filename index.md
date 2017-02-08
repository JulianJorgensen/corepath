---
title: Home Page
class: home
meta_title: Flexible robot software for processes | CP Robotics
meta_description: CP Robotics develops extremely easy to use robot-software that enables
  flexible automation of different processes in small and medium-sized enterprises.
layout: default
---

<div class="content-wrapper">

<div class="container">
<h1 class="editable">Flexible automation of milling, grinding and polishing</h1>
</div>

<div class="visibleNearby">
<div id="marquee-slider" class="royalSlider rsDefault">
<a class="rsImg" href="/_assets/images/slider/Industrial-Grinding.jpg"></a>
<a class="rsImg" href="/_assets/images/slider/Industrial-Polishing.jpg"></a>
<a class="rsImg" href="/_assets/images/slider/photofunia-1463956409.jpg"></a>
<a class="rsImg" href="/_assets/images/slider/photofunia-1463996971.jpg"></a>
<a class="rsImg" href="/_assets/images/slider/photofunia-1463997021.jpg"></a>
<a class="rsImg" href="/_assets/images/slider/PhotoFunia-1463997114.jpg"></a>
</div>
</div>

<section class="section-default the-problem">
<div class="row">
<div class="small-12 medium-5 columns">
<quote>"Changing or reconfiguring a robotics installation is expensive and time consuming"</quote>
</div>
<div class="small-12 medium-7 columns editable"><p>Industrial processes such as milling, grinding and polishing have successfully been automated in the last 20 years (think of the car industry). However, the success is limited to companies that benefit from many-of-a-kind production. </p><p>The reason is simple: Changing or reconfiguring a robotics installation is expensive and time consuming. Either you need on-site expertise in robotics, CAD/CAM and automation, or you need subcontractors with that expertise. Both limit the feasibility of current automation solutions for few-of-a-kind productions.</p></div>
</div>
</section>

<section class="section-default section-primary">
<div class="row">
<div class="small-12 medium-4 columns text-center figure-one editable"><h2>85 %</h2><p>of SME’s in the manufacturing industry in Europe do not use robots</p></div>
<div class="small-12 medium-4 columns text-center figure-two editable"><h2>95 %</h2><p>of the manufacturing companies in Europe are SME's</p></div>
<div class="small-12 medium-4 columns text-center figure-three editable"><h2>3/4 </h2><p>of a complicated process can be automated </p></div>
</div>
</section>

<section class="section-default">
<div class="row">
<div class="small-12 column">
<h1 class="editable">Our solution</h1>
</div>
</div>

    <div class="row">
      <div class="small-12 medium-7 columns">
        <p class="editable">CP Robotics combines both online and offline programming methods in order to create a teach-in of tasks that is quicker than if you would do them manually. By exploiting state of the art line scanners in combination with robot kinematics, we allow shop floor personnel to do fast and coarse programming of the task by simply sweeping the robot over the workspace. Our software then analyses the sensor data and generates precise robot paths.</p>
      </div>
      <div class="small-12 medium-5 columns">
        <ul class="solution-points">
          <li class="editable">Very fast online programming</li>
          <li class="editable">Tight tolerances </li>
          <li class="editable">High quality </li>
          <li class="editable">High uniformity in output</li>
          <li class="editable">Removes the need for expensive subcontractors or experts</li>
        </ul>
      </div>
    </div>

</section>

<section class="section-default">
<div class="row">
<div class="small-12 column">
<h1 class="editable">Applications</h1>
</div>
</div>

    <div class="row">
      <div class="small-12 medium-4 text-center column">
        <h4 class="editable">Milling</h4>
      <img src="/_assets/images/welding-art-2.jpg" class="editable" />
      <p class="editable">Most milling processes require post-processing in the form of deburring. This can often be programmed directly into the CAD/CAM systems however, due to the high cost of a milling machine, it is more cost-effective to perform manual deburring or simply let a cheap and flexible robot do it.</p>
      </div>
      <div class="small-12 medium-4 text-center column">
        <h4 class="editable">Grinding</h4>
      <img src="/_assets/images/milling-application-1.jpg" class="editable" />
      <p class="editable">Traditional machines for grinding are able to grind many-of-a-kind products. Few-of-a-kind production on the other hand requires the flexibility of manual labor or the flexibility of an easy-to-use robot with our software.&nbsp;</p>
      </div>
      <div class="small-12 medium-4 text-center column">
        <h4 class="editable">Polishing</h4>
      <img src="/_assets/images/cutting-application-1.jpg" class="editable" />
      <p class="editable">Manufacturing companies, especially SME&rsquo;s, have an increasing number of small batch sizes. Cost effective automation of polishing in these few-of-a-kind productions require fast re-programming and no dependency on external experts.</p>
      </div>
     </div>

</section>

<section class="section-default">

    <h1 class="editable">Our team<br /><small>(click to read more)</small></h1>
    
    {% include members.html filter_type="staff_member" %}
    
    <div class="row margin-top-xlarge">
      <div class="small-12 column">
        <h2 class="text-center editable">Board of Directors<br /><small>(click to read more)</small></h2>
      </div>
    </div>
    
    {% include members.html filter_type="board_member" %}

</section>

<section class="section-default section-primary">
<div class="row">
<div class="small-12 columns text-center">
<h1 class="margin-none editable">WORK WITH US</h1>
<p class="editable">Looking for engineers, designers and business professionals.<br />If you are Interested in a future at CP Robotics, send an email to:<br /><a data-email-protector="jobs|cprobotics.dk" href="mailto:jobs@cprobotics.dk">jobs@cprobotics.dk</a></p>
</div>
</div>
</section>

<section class="section-default">
<h1 class="editable">News</h1>

    <div class="row">
      <div class="small-12 medium-6 columns">
        {% assign news = site.news | sort_by: date | reverse %}
        {% for article in news %}
          <date class="article-date">{{ article.date | date: '%B %d, %Y' }}</date>
          <h3 class="editable">{{ article.title }}</h3>
          <p class="editable">{{ article.excerpt }} {% if article.url != "" %}<a href="{{ article.url }}">Read more »</a>{% endif %}</p>
        {% endfor %}
      </div>
      <div class="small-12 medium-6 columns">
        <a class="twitter-timeline" href="https://twitter.com/cprobots" data-widget-id="732719965493567489">Tweets by @cprobots</a>
        <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
      </div>
    </div>

</section>

<section class="section-default">
<h1 class="editable">Partners</h1>

    <div class="row small-up-2 medium-up-4 align-middle">
      <div class="column"><a href="http://www.sdti.dk/" target="_blank"><img class="editable" src="/_assets/images/sdti-logo.png" /></a></div>
      <div class="column"><a href="http://www.scienceventures.dk/en" target="_blank"><img class="editable" src="/_assets/images/scienceventures-logo.jpg" /></a></div>
      <div class="column"><a href="http://www.sdu.dk/en/" target="_blank"><img class="editable" src="/_assets/images/sdu.jpg" /></a></div>
      <div class="column"><a href="http://www.robocluster.dk/" target="_blank"><img class="editable" src="/_assets/images/Robocluster_2.jpg" /></a></div>
    </div>

</section>

<section class="section-default section-primary section-contact">
{% include contact.html %}
</section>

</div>

<div class="logo-exploded-wrapper show-for-large">
<div class="logo-exploded">
<div class="logo-half-left"><img src="/_assets/images/cp-logo-half-left.png" /></div>
<div class="logo-half-right"><img src="/_assets/images/cp-logo-half-right.png" /></div>
<div class="logo-text"><img src="/_assets/images/cp-logo-text.png" /></div>
</div>
</div>