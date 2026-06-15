
---
title: Dozonal math
desc: Describes math tricks with dozens
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


## Addition
Adding numbers that are very small are easy enough to simply count up, for instance 5+3 can be done by starting at 5 and then counting up 3 times (6,7,8) to find that 5+3=8. Subtraction by small numbers is similarly easy if you can count down from 5.  Doing this for numbers bigger than 5 is doable but not as quick so there are techniques to speed up addition in those cases.



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

### 'fill up the box' example in decimal

In decimal it is often helpful to remember pairs of digits that add to 10:

- 1+9 = 10
- 2+8 = 10
- 3+7 = 10
- 4+6 = 10
- 5+5 = 10

If we - for example - wanted to add 5+8 It is helpful to think of this as "moving" 2 from the 5 to join the 8 thus completing a full 10 and there is 3 left over, so effectively:

8+5 = 8+(2+3) = (8+2)+3 = 10+3 = 13

But needing to split 5 into 3 and 2 depends on what it is being added to so this technique is not necessarily easy to formalize.

An equivelent fact is to think of the larger digit in addition as 10 minus a small number like:

6. = 10-4
7. = 10-3
8. = 10-2
9. = 10-1

so to calculate 5+8 we could replace 8 with (10-2) and so get to the same answer with a slightly different structure:

8+5 = (10-2)+5 = 10+(5-2) = 10+3 = 13

This still conveys the idea of taking 2 away from 5 to get a full 10 and there is 3 left over but is written in a way that is mathematically rigourous.

This way in order to add any pair of digits we just need to be able to recognize whether the result would be more than 10 and in that case convert the higher to `10-n` and do the subtraction with a much smaller digit.

### 'fill up the box' example in Dozonal

The exact same idea works in dozonal but instead of memorizing which digits add up to ten we can visually see which parts are missing to make a full box:

- ㍙+㍣ = ㍤
- ㍚+㍢ = ㍤
- ㍛+㍡ = ㍤ (1 stick + 3 sticks = 4 sticks)
- ㍜+㍠ = ㍤
- ㍝+㍟ = ㍤
- ㍞+㍞ = ㍤ (2*2 sticks = 4 sticks)

So lets say we wanted to add ㍠+㍝, we can see that ㍠ is missing a dot and a stick to make a full box so we can take that out of the ㍝ to get:

㍠+㍝ = ㍠+(㍜+㍙) = (㍠+㍜)+㍙ = ㍤+㍙ = ㍙㍙<br/>
8+5 = 8+(4+1) = (8+4)+1 = 12 + 1 = one dozen and one



### Addition of half dozens

One trick to add large digits when you are already used to adding up small numbers in decimal is to think of digits of 6 and up as being a half dozen plus some extra:

- ㍞ = ㍞+㍘ = ㍞+0
- ㍟ = ㍞+㍙ = ㍞+1
- ㍠ = ㍞+㍚ = ㍞+2
- ㍡ = ㍞+㍛ = ㍞+3
- ㍢ = ㍞+㍜ = ㍞+4
- ㍣ = ㍞+㍝ = ㍞+5

As such adding two digits that are both at least ㍞ you can add the half dozens together to get a full dozen and add the remainder like you would in decimal. For instance ㍢+㍡ would be:

= ㍢ + ㍡ <br/>
= (㍞+4) + (㍞+3)<br/>
= (㍞+㍞) + (4+3)<br/>
= ㍙㍘ + 7<br/>
= ㍙㍟



<!-- ### Addition of sticks and dots -->

<!-- Thinking of our dozonal digit as sticks and dots we can define the rules to add them independently: -->

<!-- <div class="row-head big-table"> -->


<!-- | +  | ㍙ | ㍚ | -->
<!-- |----|----|----| -->
<!-- | ㍙ | ㍚ | ㍛ | -->
<!-- | ㍚ | ㍛ | ㍜ | -->


<!-- | +  |   ㍛ |   ㍞ |   ㍡ | -->
<!-- |----|-----:|-----:|-----:| -->
<!-- | ㍛ |   ㍞ |   ㍡ | ㍙㍘ | -->
<!-- | ㍞ |   ㍡ | ㍙㍘ | ㍙㍛ | -->
<!-- | ㍡ | ㍙㍘ | ㍙㍛ | ㍙㍞ | -->

<!-- </div> -->

<!-- So using these addition logic, doing ㍢ + ㍡ is one dot + 3 sticks + 3 sticks: -->

<!-- = ㍢ + ㍡<br/> -->
<!-- = (㍡+㍙) + ㍡<br/> -->
<!-- = (㍡+㍡) + ㍙<br/> -->
<!-- = ㍙㍞ + ㍙<br/> -->
<!-- = ㍙㍟ -->




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
- ㍚*2 = ㍜ (double dot fills dot and stick on right)
- ㍞*2 = ㍙㍘ (double stick becomes a dot of the next column)

The first 3 cases have absolutely no overlap or collisions so doubling digits can be done visually partition by partition:

2*㍙㍚㍛㍜㍝<br/>
= ㍚㍜㍞㍠㍢

Then as long as you can deal with combining the half box from the previous digit doubling to produce an extra dot doubling a number becomes very easy:

2*㍘㍟㍠㍡㍢㍣㍞<br/>
= ㍙㍛㍝㍟㍡㍣㍘

<!-- TODO: add partial colours to these so it is much clearer -->

### Multiplying by 4 or 8

Since 4*3=12 and we specifically write out multiples of 3 as sticks, multiplication by 4 (and similarly by 8) is fairly simple.

If we for a moment imagine 4 as being "one box per stick" like a unit (4 = 12/3 = ㍤/㍛), we can imagine multiplying some multiple of sticks by a multiple of "box per stick" to get some multiple of full boxes. (here decimal digits are used to convey multiplication and dozonal digits are treated like units)

<div class="row-head">
| *       | 1*㍛ | 2*㍛ | 3*㍛ |
|---------|-------:|-------:|-------:|
| 1*㍤/㍛ |   1*㍤ |   2*㍤ |   3*㍤ |
| 2*㍤/㍛ |   2*㍤ |   4*㍤ |   6*㍤ |

If we simply write out all the proper numbers in dozonal such as `2*㍤/㍛ = ㍠` and `6*㍤=㍞㍘` we get this multiplication table:

| *  |   ㍛ |   ㍞ |   ㍡ |
|----|-----:|-----:|-----:|
| ㍜ | ㍙㍘ | ㍚㍘ | ㍛㍘ |
| ㍠ | ㍚㍘ | ㍜㍘ | ㍞㍘ |
</div>

Since all digits are written as a combination of dots and sticks and the sticks multiplied by 4 are shown above to only affect the dozens column, we just need to consider what would happen multiplying dots by 4 or 8:

| *  | ㍙ |   ㍚ |
|----|---:|-----:|
| ㍜ | ㍜ |   ㍠ |
| ㍠ | ㍠ | ㍙㍜ |

And so any digit can be multipled by 4 or 8 by simply __consulting these tables__ 

<!-- TODO:I don't want to phrase this as consulting a table, they convey easy rules to remember -->


</div>
