
---
title: Dozonal symbols
desc: Describes the design for dozonal symbols
---

<style>
@font-face {
    font-family: 'Dozonal';
    src: url('./doz.ttf') format('truetype'); /* Chrome 4+, Firefox 3.5, Opera 10+, Safari 3—5 */
}
html {
	font-family: Dozonal;
}
table {
border-collapse: collapse;
}

th {
border-bottom-style: solid;
}
.row-head td:first-child, .row-head th:first-child {
	font-weight: bold;
	border-right-style: solid;
}
.big-table td, .big-table th {
	font-size: 2em;
	padding: 0.3em;
}
</style>


## Motivation / background

We start by using a 3x4 grid as the basis for our dozonal digits with the goal being for each number to correspond to that many boxes in the grid being filled in:

<svg xmlns="http://www.w3.org/2000/svg" style="background: transparent; background-color: transparent; color-scheme: light dark;"
     xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="304px" height="404px" viewBox="-2 -2 302 402">
  <defs/>
  <rect x="0" y="0" width="300" height="400" pointer-events="all" fill="none"
	style="stroke: light-dark(black, white);"/>
  <path d="M 100 0 l 0 400" stroke-dasharray="3 3" stroke-width="2"
	style="stroke: light-dark(black, white);"/>
  <path d="M 200 0 l 0 400" stroke-dasharray="3 3" stroke-width="2"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 100 l 300 0" stroke-dasharray="3 3" stroke-width="2"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 200 l 300 0" stroke-dasharray="3 3" stroke-width="2"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 300 l 300 0" stroke-dasharray="3 3" stroke-width="2"
	style="stroke: light-dark(black, white);"/>
</svg>

So the digit for zero will be an empty box (㍘), one will have one square filled (㍙), 5 will have 5 squares filled but there are many options for how we choose to fill them. The way we will propose is to partition the box into a region of 6 squares (red), 3 squares (blue), 2 squares (green) and one square (yellow) layed out like this:

<svg xmlns="http://www.w3.org/2000/svg" style="background: transparent; background-color: transparent; color-scheme: light dark;"
     xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="304px" height="404px" viewBox="-2 -2 304 404">
  <defs/>
  <rect x="0" y="0" width="200" height="100" fill="#004D40" stroke="none"/>
  <rect x="200" y="100" width="100" height="300" fill="#1E88E5" stroke="none"/>
  <rect x="0" y="100" width="200" height="300" fill="#D81B60" stroke="none"/>
  <rect x="200" y="0" width="100" height="100" fill="#FFC107" stroke="none"/>
  <rect x="0" y="0" width="300" height="400" pointer-events="all" fill="none" stroke-width="4"
	style="stroke: light-dark(black, white);"/>
  <path d="M 100 6 l 0 390" stroke-dasharray="13 12" stroke-width="2"
	style="stroke: light-dark(black, white);"/>
  <path d="M 200 0 l 0 400" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 100 l 300 0" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 6 200 l 290 0" stroke-dasharray="13 12" stroke-width="2"
	style="stroke: light-dark(black, white);"/>
  <path d="M 6 300 l 290 0" stroke-dasharray="13 12" stroke-width="2"
	style="stroke: light-dark(black, white);"/>
</svg>

If we impose the rule that we always fill the largest box first (and thus won't fill the yellow and green boxes at the same time) we have a unique way to fill these boxes to correspond to each digit from 0 to 11.

<div class="big-table">
|        |         |         |
|-------:|--------:|--------:|
| 0 = ㍘ | 1 = ㍙  | 2 = ㍚  |
| 3 = ㍛ | 4 = ㍜  | 5 = ㍝  |
| 6 = ㍞ | 7 = ㍟  | 8 = ㍠  |
| 9 = ㍡ | 10 = ㍢ | 11 = ㍣ |
</div>

In the same way in decimal we write ten as "one zero" (10) we write one dozen as ㍙㍘, although this format of symbol naturally leads to having a full box to represent dozen in one symbol ㍤. We won't use this to write numbers but in this document we may refer to dozen using any of these methods:

㍤ = ㍙㍘ = 12 = dozen

Cases where ㍤ is used in this document is for things like ㍝+㍟=㍤ as it is visually intuitive, while ㍝+㍟=㍙㍘ is not as clear.

In general, for numbers higher than 11 we use the same positional layout as in decimal, for example the number of days in a year in decimal is 365 which is interpreted as:

3 `*ten*ten` + 6 `*ten` + 5

In dozonal we similarly concatenate multiple digits to write numbers, each representing higher powers 12, so the number of days in a year is ㍚㍞㍝ which is interpreted as:

2 dozen dozens + 6 dozen + 5 = `㍚*㍤*㍤ + ㍞*㍤ + ㍝`

> Note: We will say this as "two six-doz five" and for other 2 digit numbers we will add "doz" suffix similar to how we use "ty" suffix in decimal like 60 is "sixty". The formal rules for speaking larger numbers will be described more in depth in the [oral](./oral.html) document

## drawable font

Using squares can lead to confusion, such as ㍛ and ㍜ being very nearly identical as well as symbols being inverse colour of each other can be misleading if you write them in both light and dark contexts (blackboard or whiteboard)

<span style="color:black; background-color:MintCream; padding:1em"> 5 = ㍝, 7 = ㍟ </span>

<span style="color:white; background-color:DarkSlateGrey; padding:1em"> 5 = ㍝, 7 = ㍟ </span>

As such we will use an alternative font where we have "dots" for the single and double section, and "sticks" for the 3 and 6 partitions. As such the ㍤ glyph with all parts visible at once would look like this:

<svg xmlns="http://www.w3.org/2000/svg" style="background: transparent; background-color: transparent; color-scheme: light dark;"
     xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="304px" height="404px" viewBox="-2 -2 302 402">
  <defs/>
  <rect x="0" y="0" width="300" height="400" pointer-events="all" fill="none"
	style="stroke: light-dark(black, white);"/>
  <circle cx="250" cy="50" r="35"
	style="fill: light-dark(black, white);"/>
  <circle cx="70" cy="50" r="35" 
	style="fill: light-dark(black, white);"/>
  <circle cx="130" cy="50" r="35" 
	style="fill: light-dark(black, white);"/>
  <path d="M 250 140 L 250 360" stroke-width="30"
	style="stroke: light-dark(black, white);"/>
  <path d="M 150 150 L 50 350" stroke-width="30"
	style="stroke: light-dark(black, white);"/>
  <path d="M 50 150 L 150 350" stroke-width="30"
	style="stroke: light-dark(black, white);"/>
</svg>

Other than the special ㍤ glyph we would never draw all three dots, any other digit only ever has 0, 1, or 2 dots. 

With this glyph design we can describe the rules for counting or writing numbers as follows:

- 3 _dots_ make a _stick_ (㍙+㍚=㍛)
- 4 sticks make a _box_ (㍛+㍛+㍛+㍛ = ㍤)
- a _box_ is equal to a dot in the next column (㍤ = ㍙㍘)

This also very naturally maps to how we can count by 12s using our hands, if you consider each finger (other than your thumb) as a "stick" and the segments between knuckles as a "dot" you can touch your thumb to each segment to count up to 12 naturally splitting a dozen into 4 sticks each of 3 dots.

