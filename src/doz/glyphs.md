
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
.row-head td:first-child {
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
  <rect x="0" y="0" width="200" height="100" fill="darkgreen" stroke="none"/>
  <rect x="200" y="100" width="100" height="300" fill="blue" stroke="none"/>
  <rect x="0" y="100" width="200" height="300" fill="red" stroke="none"/>
  <rect x="200" y="0" width="100" height="100" fill="gold" stroke="none"/>
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

If we impose the rule that we never fill the top row at the same time we get a single unique way to fill in all the digits from 0 to 11. 

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

Other than the special ㍤ glyph we would never draw all three dots, any other digit only ever has 0, 1, or 2 dots. As we will use when discussing math below:

- 3 _dots_ make a _stick_ (㍙+㍚=㍛)
- 4 sticks make a _box_ (㍛+㍛+㍛+㍛ = ㍤)
- a _box_ is equal to a dot in the next column (㍤ = ㍙㍘)

This also very naturally maps to how we can count by 12s using our hands, if you consider each finger (other than your thumb) as a "stick" and the segments between knuckles as a "dot" you can touch your thumb to each segment to count up to 12 naturally splitting a dozen into 4 sticks each of 3 dots.

## Addition
Adding numbers that are very small are easy enough to simply count up, for instance 5+3 can be done by starting at 5 and then counting up 3 times (6,7,8) to find that 5+3=8. Subtraction by small numbers is similarly easy if you can count down from 5.  Doing this for numbers bigger than 5 is doable but not as quick so there are techniques to speed up addition in those cases.

### example in decimal

In decimal it is often helpful to remember pairs of digits that add to 10:

- 1+9 = 10
- 2+8 = 10
- 3+7 = 10
- 4+6 = 10
- 5+5 = 10

If we - for example - wanted to add 5+8 It is helpful to think of this as "moving" 2 from the 5 to join the 8 thus completing a full 10 and there is 3 left over, so effectively:

5+8 = (3+2)+8 = 3+(2+8) = 3+10 = 13

But needing to split 5 into 3 and 2 depends on what it is being added to so this technique is not necessarily easy to formalize.

An equivelent fact is to think of the larger digit in addition as 10 minus a small number like:

6. = 10-4
7. = 10-3
8. = 10-2
9. = 10-1

so to calculate 5+8 we could replace 8 with (10-2) and so get to the same answer with a slightly different structure:

5+8 = 5+(10-2) = 10+(5-2) = 10+3 = 13

This still conveys the idea of taking 2 away from 5 to get a full 10 and there is 3 left over but is written in a way that is mathematically rigourous.

This way in order to add any pair of digits we just need to be able to recognize whether the result would be more than 10 and in that case convert the higher to `10-n` and do the subtraction with a much smaller digit.


### Addition in dozonal

Similar to decimal, dozonal addition can be done by counting up with small digits or recombined with larger ones, but the glyphs very specifically representing partially filled boxes makes performing addition visually easier to learn.

Adding digits that just consist of non overlapping sticks is trivial as you can just directly combine them:

- ㍙+㍞ = ㍟
- ㍛+㍟ = ㍢

If both digits have some dots then dots combine using these rules:

- ㍙+㍙ = ㍚ (dot + dot = double-dot)
- ㍙+㍚ = ㍛ (3 dots = stick)
- ㍚+㍚ = ㍜ (2 dots + 2 dots = 1 stick + 1 dot)

These are the only ways dots can combine as all digits can only contain up to 2 dots. With sticks we just obey the rule that 4 sticks makes up a "box" which carries over to the next column (㍤=㍙㍘) So for example:

- ㍛+㍛ = ㍞ (stick + stick = double-stick)
- ㍛+㍞ = ㍡ (stick + double-sticks = 3 sticks)
- ㍛+㍡ = ㍤ = ㍙㍘ (stick + 3 sticks = box)
- ㍞+㍞ = ㍤ = ㍙㍘ (2 sticks + 2 sticks = box)
- ㍞+㍡ = ㍣+㍛ = ㍙㍛ (5 sticks = 1 box + 1 stick)
- ㍡+㍡ = ㍤+㍞ = ㍙㍞ (6 sticks = 1 box + 2 sticks)

These are the only way sticks can combine. Together we end up effectively with 9 _rules_ we need to follow to perform addition in dozonal (3 rules for dots, 6 rules for sticks, ignoring dealing with 0 since adding 0 is trivial) compared to 45 ways to combine 2 decimal digits (assuming order doesn't matter). 

> Note: if a dozonal system with 12 unique symbols that could not be subdivided into dots and sticks would end up with 66 combinations of pairs of unordered digits. Designing our symbols to be able to effectively subdivide each digit into effectively a base 3 (dots) and base 4 (sticks) digit wrapped into one greatly simplifies the permutations.

#### visual example of adding digits

<svg xmlns="http://www.w3.org/2000/svg" style="background: transparent; background-color: transparent; color-scheme: light dark;"
     xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="152px" height="42px" viewBox="-1 -1 151 41">
  <defs/>
  <rect x="0" y="0" width="30" height="40" pointer-events="all" fill="none"
	style="stroke: light-dark(black, white);"/>
  <!-- <circle cx="25" cy="5" r="3.5" -->
  <!-- 	style="fill: light-dark(black, white);"/> -->
  <circle cx="7" cy="5" r="3.5" 
	style="fill: light-dark(black, white);"/>
  <circle cx="13" cy="5" r="3.5" 
	style="fill: light-dark(black, white);"/>
  <path d="M 25 14 L 25 36" stroke-width="3"
	style="stroke: light-dark(black, white);"/>
  <text x="32" y="25" style="stroke: light-dark(black, white);" >+</text>
  <rect x="50" y="0" width="30" height="40" pointer-events="all" fill="none"
	style="stroke: light-dark(black, white);"/>
  <circle cx="57" cy="5" r="3.5" 
	style="fill: light-dark(darkgreen, lightgreen);"/>
  <circle cx="63" cy="5" r="3.5" 
	style="fill: light-dark(darkgreen, lightgreen);"/>
  <path d="M 75 14 L 75 36" stroke-width="3"
	style="stroke: light-dark(darkgreen, lightgreen);"/>
  <text x="93" y="25" style="stroke: light-dark(black, white);" >=</text>
  <rect x="110" y="0" width="30" height="40" pointer-events="all" fill="none"
	style="stroke: light-dark(black, white);"/>
  <circle cx="135" cy="5" r="3.5" 
	style="fill: light-dark(darkgreen, lightgreen);"/>
  <path d="M 115 15 L 125 35" stroke-width="3"
	style="stroke: light-dark(darkgreen, lightgreen);"/>
  <path d="M 125 15 L 115 35" stroke-width="3"
	style="stroke: light-dark(black, white);"/>
  <path d="M 125 15 L 115 35" stroke-width="3"
	style="stroke: light-dark(black, white);"/>
  <path d="M 135 15 L 135 21.6" stroke-width="3"
	style="stroke: light-dark(black, white);"/>
  <path d="M 135 21.7 L 135 28.3" stroke-width="3"
	style="stroke: light-dark(darkgreen, lightgreen);"/>
  <path d="M 135 28.3 L 135 35" stroke-width="3"
	style="stroke: light-dark(black, white);"/>
</svg>

### negation example in dozonal

> Note: this technique is more useful in subtraction than addition

In dozonal the same techniques still work, but instead of needing to _remember_ pairs of digits that sum to 12, it emerges very naturally by the way we draw the glyphs. Other than multiples of 3, all other pairs simply fill in the opposite squares in our box:

- ㍙+㍣ = ㍤
- ㍚+㍢ = ㍤
- ㍛+㍡ = ㍤ (1 stick + 3 sticks = 4 sticks)
- ㍜+㍠ = ㍤
- ㍝+㍟ = ㍤
- ㍞+㍞ = ㍤ (2*2 sticks = 4 sticks)

So for instance if we wanted to calculate ㍢ + ㍡ we could substitute ㍢=㍤-㍚ and thus:

 ㍢+㍡ = (㍤-㍚) + ㍡ = (㍤)+(㍡-㍚) = (㍙㍘)+(㍟) = ㍙㍟ 

Where ㍡-㍚=㍟ (or equivelently 9-2=7) could be done by counting down or via another method. However the structure of our glyphs allow for other methods of simplifying addition operations into smaller chunks.

#### balanced or signed notation
An idea **that is unrelated to this dozonal system** is the notion of "Balanced" notation where unique symbols are only given up to half the number base and higher than that count backwards with some variant such as an overbar. For example to use this notation in base 10 we would replace the symbols for 6,7,8,9 with:

- 10 - 4 = <span style="text-decoration: overline">4</span>
- 10 - 3 = <span style="text-decoration: overline">3</span>
- 10 - 2 = <span style="text-decoration: overline">2</span>
- 10 - 1 = <span style="text-decoration: overline">1</span>

While 5 and 0 would typically be drawn with dashed overbar. A writeup about this in the context of a clock is [available here](https://clocks.dozenal.ca/pdf/about-signed.pdf). 

We do not intentially do this with our dozonal system, but ㍛+㍡ is the only pair that doesn't form a clear inversion pair so it gets very close.

### Addition of half dozens

Two digits that are different by 6 are plainly visible by adding the double stick section of the glyph:

- ㍙+㍞ = ㍟
- ㍚+㍞ = ㍠
- ㍛+㍞ = ㍡
- ㍜+㍞ = ㍢
- ㍝+㍞ = ㍣

As such if you can add digits up to 5 in decimal, you can ignore the crossed sticks partition and add the rest of the number in the same way you would in decimal. For instance ㍢ + ㍡ could be written as:

= ㍢ + ㍡ <br/>
= (㍞+4) + (㍞+3)<br/>
= (㍞+㍞) + (4+3)<br/>
= ㍙㍘ + 7<br/>
= ㍙㍟

This technique is a little annoying when one digit is over 6 and the other is under 6 but together add to more than 12. For instance ㍢+㍝ we logically get 6+(4+5) but then need to invert the crossed sticks of the 9 to get the final answer:

= ㍢+㍝<br/>
= ㍞+4+5 = ㍞+9 <br/>
= ㍞+㍡ = ㍞+(㍞+㍛)<br/>
= (㍞+㍞)+㍛ = ㍙㍛

However this would be easier if we just consider the partitions of the glyph, an alternative way by just splitting 5 into the seperate partitions:

= ㍢+(㍝)<br/>
= ㍢+(㍚+㍛)<br/>
= (㍢+㍚)+㍛<br/>
= ㍤+㍛<br/>
= ㍙㍛

This leads to a more natural approach - independent of prior experience with decimal - by learning how to add individual components of the glyph.

### Addition of sticks and dots

Thinking of our dozonal digit as sticks and dots we can define the rules to add them independently:

<div class="row-head big-table">


| +  | ㍙ | ㍚ |
|----|----|----|
| ㍙ | ㍚ | ㍛ |
| ㍚ | ㍛ | ㍜ |


| +  |   ㍛ |   ㍞ |   ㍡ |
|----|-----:|-----:|-----:|
| ㍛ |   ㍞ |   ㍡ | ㍙㍘ |
| ㍞ |   ㍡ | ㍙㍘ | ㍙㍛ |
| ㍡ | ㍙㍘ | ㍙㍛ | ㍙㍞ |

</div>

<!-- > This is logically equivelent to addition in base 3 and base 4 respectively. -->

So using these addition logic, doing ㍢ + ㍡ is one dot + 3 sticks + 3 sticks:

= ㍢ + ㍡<br/>
= (㍡+㍙) + ㍡<br/>
= (㍡+㍡) + ㍙<br/>
= ㍙㍞ + ㍙<br/>
= ㍙㍟

## WIP confusing Subtraction example using dots and sticks

Subtraction works very similarly to addition, First you subtract the dots borrowing 3 dots from a stick if needed, then subtract the sticks borrowing 4 sticks from a dot in next column. lets use ㍠㍙-㍜㍡ as an example. First lets write out the sticks and dots of both digits seperately:


$$ (㍠㍙) = ㍤(㍞+㍚) + (㍘+㍙) $$

$$ ㍜㍡ = (㍤(㍛+㍙) + (㍡+㍘)) $$

Then subtracting and joining the sticks and dots of each digit we get:

$$ ㍤(㍞-㍛) + ㍤(㍚-㍙) + (㍘-㍡) + (㍙-㍘) $$

We go from smallest digit to largest, so first ㍙-㍘=㍙ is simple, next ㍘-㍡ needs to borrow 4 sticks from the next column:


$$ ㍤(㍞-㍛) + ㍤(㍚-㍙)-㍤ + ㍤ +(㍘-㍡) + ㍙ $$

Thus we have ㍤-㍡ = ㍛ for the sticks of the first digit

$$ ㍤(㍞-㍛) + ㍤(㍚-㍙)-㍤ + ㍛ + ㍙ $$

We need to subtract an extra dot from the second column because of the borrowing so we get (㍚-㍙)-㍙ = ㍘ for the dots of the second column


$$ ㍤(㍞-㍛) + ㍤(㍘) + ㍜ $$

And the sticks for the second column we get ㍤(㍞-㍛)=㍤(㍛)

$$ ㍤(㍛) + ㍤(㍘) + ㍜ = ㍤(㍛) + ㍜ = ㍛㍜ $$


### Subtraction negation trick

Suppose we need to calculate 15 - 8 (in decimal) one way to do this is like this:

= 15 - 8 <br/>
= 10 + 5 - 8<br/>
= 5 + (10-8)<br/>
= 5 + 2<br/>
= 7

In general, duing a multi-digit subtraction we typically "borrow" 10 from the next column to get a result that fits within one digit. But one trick that works in general is that you can do the positive digit _plus_ 10 minus the negative digit. If you can quickly do `10-n` for some digit `n` and then the resulting addition this is a very viable trick.

In dozonal our font makes it very easy to remember how to do `12-n` since other than 3,6, or 9 all other cases look like the inverted partitions.

> TODO ask mom how to phrase this in a way that sounds useful
<!-- Suppose we need to calculate ㍙㍜ - ㍟. We can rearrange this as: -->

<!-- = ㍙㍜ - ㍟<br/> -->
<!-- = ㍙㍘ + ㍜ -㍟<br/> -->
<!-- = ㍜ + (㍙㍘-㍟)<br/> -->
<!-- = ㍜ + ㍝<br/> -->
<!-- = ㍡ -->

## Multiplication

### Multiplying by 2

Let us start by observing what happens when we multiple each partition of our glyph in isolation:

- ㍙*2 = ㍚ (single dot on right becomes double dot on left)
- ㍛*2 = ㍞ (signle stick on right becomes double stick on left)
- 
