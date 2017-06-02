---
title: Contact
meta_title: Contact information | CP Robotics
meta_description: We would love to get in touch with you.
address: 'Forskerparken 10, 5230 Odense M, Denmark<br />CVR-number: 37031674'
layout: subpage
---

<div class="container">
  <h1 class="editable">Contact</h1>

  <address class="text-center"><h6>Address</h6>{{ page.address }}</address>
  <section class="section-default section-contact text-center">
    {% include contact.html %}
  </section>

  {% include members.html filter_type="spokesperson" %}<br /><br />
</div>
