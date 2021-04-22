---
layout: default
title: Homepage
permalink: /homepage/
weight: 1
---
I am currently a doctoral student in the Computer Science and Engineering department at the University of South Carolina. I am working as a research assistant in the [AISys lab](https://pooyanjamshidi.github.io/AISys/) led by [Dr.Jamshidi](https://pooyanjamshidi.github.io/){:target="_blank"}. My research interests lie in the machine learning system, self-supervised learning, transfer learning, and the application of machine learning in healthcare. 

Before joining the UofSC, I received my bachelor's degree in Statistics and Finance at the Southwestern University of Finance and Economics and a master's degree in Hospital Management at Tsinghua University. I am interested in technology, business, finance, and sports(never cooking); love kids and reading.

Here is my short [CV][cvpdf]{:target="_blank"}.

[cvpdf]: {{ "/resources/docs/Shuge LEI_CV_Apr21.pdf" | prepend: site.baseurl }}


## Below is a list of my current and inactive projects.

### Current Projects
{% assign current = site.data.projects | where_exp: "project", "project.end == nil" %}
{% include projects.html data=current %}

### Inactive Projects
{% assign inactive = site.data.projects | where_exp: "project", "project.end != nil" %}
{% include projects.html data=inactive %}
