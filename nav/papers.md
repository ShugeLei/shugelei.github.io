---
layout: default
title: Reading Papers
permalink: /papers/
weight: 2
group: pubs
---
### Transformers
1.['Neural Machine Translation by Jointly Learning to Align and Translate'](https://arxiv.org/abs/1409.0473)\
Notes:\
2.['Pretrained Transformers As Universal Computation Engines'](https://arxiv.org/pdf/2103.05247.pdf)\
Notes:

### Transfer Learning
1. ['Self-taught Learning: Transfer Learning from Unlabeled Data'](https://dl.acm.org/doi/pdf/10.1145/1273496.1273592)
2. ['A Survey on Transfer Learning'](http://home.cse.ust.hk/~qyang/Docs/2009/tkde_transfer_learning.pdf)
3. ['A Survey of Transfer Learning'](https://journalofbigdata.springeropen.com/track/pdf/10.1186/s40537-016-0043-6.pdf)
4. ['A Study on CNN Transfer Learning for Image Classification'](https://cs.aston.ac.uk/~fariad/publications/MH-JB-DF@UKCI18.pdf)
5. ['A Survey on Deep Transfer Learning'](https://arxiv.org/abs/1808.01974)
6. ['DT-LET: Deep Transfer Learning By Exploring Where To Transfer'](https://arxiv.org/pdf/1809.08541.pdf)
7. ['Meta-Learning Acquisition Functions for Transfer Learning in Bayesian Optimisation'](https://arxiv.org/abs/1904.02642)
8. ['Adversarially Robust Transfer Learning'](https://arxiv.org/abs/1905.08232)
9. ['A Target-Agnostic Attack on Deep Models: Exploiting Security Vulnerabilities of Transfer Learning'](https://arxiv.org/abs/1904.04334)
10. ['Pay Attention to Features, Transfer Learn Faster CNNs'](https://openreview.net/pdf?id=ryxyCeHtPB)

### Time Series Data
1. ['An Experimental Review on Deep Learning Architectures for Time Series Forecasting'](https://arxiv.org/abs/2103.12057)
2. ['Long Horizon Forecasting With Temporal Point Processes'](https://arxiv.org/abs/2101.02815)
3. ['Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'](https://arxiv.org/abs/2012.07436)
4. ['CHALLENGES AND APPROACHES TO TIME-SERIES FORECASTING IN DATA CENTER TELEMETRY: A SURVEY; 2020'](https://arxiv.org/abs/2101.04224)
5. ['Multivariate Time-series Anomaly Detection via Graph Attention Network; 2020'](https://arxiv.org/abs/2009.02040)
6.  ['From Fourier to Koopman: Spectral Methods for Long-term Time Series Prediction'](https://arxiv.org/abs/2004.00574v1)


### Machine Learning Systems
Below are some resources to learn about machine leanring system, not limited in papers.
1. ['CSE 599W - Systems for ML'](http://dlsys.cs.washington.edu/) by Tianqi Chen, University of Washington.\
   Course notes(https://zhuanlan.zhihu.com/p/104649426)
2. ['CS 329S: Machine Learning Systems Design'](https://stanford-cs329s.github.io/syllabus.html)


### Causality Deep Learnig






{% assign papers_by_year = site.data.papers | group_by_exp:"paper", "paper.year | plus: 0" %}
{% for year in papers_by_year %}
  <h3>{{ year.name }}</h3>
  {% for paper in year.items %}
  <div class="publication" id="{{ paper.id }}">
    {% if paper.award %}
    <span class="icon">
      <svg><use xlink:href="#icon-award"/></svg>
      <b>{{ paper.award }}</b>
    </span> <br/>
    {% endif %}
    <div class="publication-title">
      {{ paper.authors }}. {{ paper.title }}. {{ paper.venue }}.
    </div>
    <div class="right">
      <a href="{{ "/resources/papers/" | append: paper.id | append: ".pdf" | prepend: site.baseurl }}" target="_blank">
        <span class="icon"><svg><use xlink:href="#icon-pdf"/></svg></span>
      </a>
      {% if paper.code %}
      <a href="{{ paper.code }}" target="_blank">
        <span class="icon"><svg><use xlink:href="#icon-github"/></svg></span>
      </a>
      {% endif %}
      {% if paper.video %}
      <a href="{{ paper.video }}" target="_blank">
        <span class="icon"><svg><use xlink:href="#icon-youtube"/></svg></span>
      </a>
      {% endif %}
    </div>
  </div>
  {% endfor %}
{% endfor %}
