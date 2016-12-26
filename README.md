# intellify.us blog post about AD landscape

_ad_landcape_ is a javascript repo for the visualization of the _autonomous driving_ landscape using D3's Forced Directed Graph.

### Purpose
We created this visualization for a [blog post](http://www.intellify.us/2016/11/19/the-autonomous-driving-landscape/) within our blog about AI, robotics & entrepreneurship. We encode relations between entities (companies) as an undirected graph using different types of relations and hyperlinks on the relations for linking our information sources.


## Usage
* Define your graph relations in json-js-format and put them in /data. In our case these are the files companies.js and relations.js. We provided a Python script to convert a csv file into javascript jsons.
* Modify /assets/js/landscape.js to accommodate your graph sources. There are plenty of modifications commented out which you may want to use and play around with.
* If you would like your nodes with images inside put all the images into assets/images/icons and modify landscape.js.