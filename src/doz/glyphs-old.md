
---
title: Dozonal symbols
desc: Describes the design for dozonal symbols
---

<style>
<!-- table, th, td { -->
<!--   border-collapse: collapse; -->
<!-- } -->
<!-- th { -->
<!--   border-right: 1px solid; -->
<!--   border-left: 1px solid; -->
<!-- } -->
<!-- th, tr:nth-child(3), tr:nth-child(6), tr:nth-child(9) { -->
<!--   border-bottom: 1px solid; -->
<!--   } -->
<!-- td:nth-child(2), td:nth-child(4), td:nth-child(6) { -->
<!--   border-right: 1px solid; -->
<!--   } -->
<!-- td { -->
<!--  min-width: 4ch; -->
<!--  } -->
<!-- td:last-child { -->
<!--   padding-left: 1ch; -->
<!--   } -->

table {
border-collapse: collapse;
}
td,th {
padding-right: 0.4ch;
}
.big-table td {
	font-size: 2em;
	padding: 0.3em;
}
th {
border-bottom-style: solid;
}
.row-head td:first-child {
	font-weight: bold;
	border-right-style: solid;
}
@font-face {
    font-family: 'Dozonal';
    src: url('./doz.ttf') format('truetype'); /* Chrome 4+, Firefox 3.5, Opera 10+, Safari 3—5 */
}
html {

    font-family: Dozonal sans-serif;
	}
</style>
<!-- # Glyphs (symbols for digits) -->

## Motivation / background

We start by using a 3x4 grid as the basis for our dozonal digits with the goal being for each number to correspond to that many boxes in the grid being filled in:

<svg xmlns="http://www.w3.org/2000/svg" style="background: transparent; background-color: transparent; color-scheme: light dark;"
     xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="304px" height="404px" viewBox="-2 -2 302 402">
  <defs/>
  <rect x="0" y="0" width="300" height="400" pointer-events="all" fill="none"
	style="stroke: light-dark(black, white);"/>
  <path d="M 100 0 l 0 400" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 200 0 l 0 400" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 100 l 300 0" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 200 l 300 0" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 300 l 300 0" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
</svg>

We could simply fill them in concecutively but this doesn't clearly demonstrate the advantages of divisibility that 12 has. Instead we can imagine splitting the box in half, the remaining in half again and the remaining into thirds:

<svg xmlns="http://www.w3.org/2000/svg" style="background: transparent; background-color: transparent; color-scheme: light dark;"
     xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="304px" height="404px" viewBox="-2 -2 302 402">
  <defs/>
  <rect x="0" y="0" width="200" height="100" fill="darkgreen" stroke="none"/>
  <rect x="0" y="100" width="300" height="100" fill="blue" stroke="none"/>
  <rect x="0" y="200" width="300" height="200" fill="red" stroke="none"/>
  <rect x="0" y="0" width="300" height="400" pointer-events="all" fill="none"
	style="stroke: light-dark(black, white);"/>
  <path d="M 100 0 l 0 400" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 200 0 l 0 400" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 100 l 300 0" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 200 l 300 0" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 300 l 300 0" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
</svg>

(When we will write 12 as ㍙㍘ it is desirable for the single filled box to be right justified to be closer to the smaller digits to its right but the mirror image would be valid too)

if we rotate the bottom two blocks so their division lines up with the other we get a glyph defined by a box with a cross strategically placed at 1/3 and 1/4 of the width and height respectively:

<svg xmlns="http://www.w3.org/2000/svg" style="background: transparent; background-color: transparent; color-scheme: light dark;"
     xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="304px" height="404px" viewBox="-2 -2 302 402">
  <defs/>
  <rect x="0" y="0" width="200" height="100" fill="darkgreen" stroke="none"/>
  <rect x="200" y="100" width="100" height="300" fill="blue" stroke="none"/>
  <rect x="0" y="100" width="200" height="300" fill="red" stroke="none"/>
  <rect x="0" y="0" width="300" height="400" pointer-events="all" fill="none"
	style="stroke: light-dark(black, white);"/>
  <path d="M 100 0 l 0 400" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 200 0 l 0 400" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 100 l 300 0" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 200 l 300 0" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 300 l 300 0" stroke-dasharray="3 3" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
</svg>

If we impose the rule that we never fill the "one" and "two" boxes (the two on the top row) at the same time we get a single unique way to fill in all the digits from 0 to 11. 

<div class="big-table">
|        |         |         |
|-------:|--------:|--------:|
| 0 = ㍘ | 1 = ㍙  | 2 = ㍚  |
| 3 = ㍛ | 4 = ㍜  | 5 = ㍝  |
| 6 = ㍞ | 7 = ㍟  | 8 = ㍠  |
| 9 = ㍡ | 10 = ㍢ | 11 = ㍣ |
</div>

In any base we always write the base itself as "one zero". In decimal this makes 10 = ten, in dozonal we have ㍙㍘ = dozen = 12.

Counting higher we get numbers like 

- 13 = ㍙㍙ (a dozen and one)
- 24 = ㍚㍘ (two dozen)
<!-- - 52 = ㍜㍜ (four dozen (48) and 4) -->
- 100 = 8*12 + 4 = ㍠㍜
- 12<sup>2</sup> = 144 = ㍙㍘㍘ (one gross (dozen dozens))

The conversion between base 10 and base 12 is not totally straight forward but once you can write a number as 

$a*1 + b*12^1 + c*12^2 + d*12^3 +...$ etc. 

it is relatively easy to write that number down using these symbols.

## Alternative font

The blocky font described above can be easy to mix up numbers at a glance, other than 3 and 9 each pair that add up to 12 look like the negative of each other which can easily lead to mixing them up when they are drawn as black on white background or the reverse.

<span style="color:black; background-color:white; padding:1em"> 5 = ㍝, 7 = ㍟ </span>

<span style="color:white; background-color:black; padding:1em"> 5 = ㍝, 7 = ㍟ </span>

As well ㍛ and ㍜ are easily confused as they don't differ by a substantial amount. 

So a font that is less blocky and easier to hand draw would be desirable. We will draw the top row as "dots" and a line of 3 as a "stick" with the 6 box being 2 crossed sticks:

<svg xmlns="http://www.w3.org/2000/svg" style="background: transparent; background-color: transparent; color-scheme: light dark;"
     xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="304px" height="404px" viewBox="-2 -2 302 402">
  <defs/>
  <rect x="0" y="0" width="300" height="400" pointer-events="all" fill="none"
	style="stroke: light-dark(black, white);"/>
  <circle cx="50" cy="50" r="35"
	style="fill: light-dark(black, white);"/>
  <circle cx="170" cy="50" r="35" 
	style="fill: light-dark(black, white);"/>
  <circle cx="230" cy="50" r="35" 
	style="fill: light-dark(black, white);"/>
  <path d="M 50 140 L 50 360" stroke-width="30"
	style="stroke: light-dark(black, white);"/>
  <path d="M 150 150 L 250 350" stroke-width="30"
	style="stroke: light-dark(black, white);"/>
  <path d="M 250 150 L 150 350" stroke-width="30"
	style="stroke: light-dark(black, white);"/>
</svg>

This is easier to draw by hand and easier to differentiate symbols. As well in the further section describing math we double down on this idea of each digit being made up of dots and sticks to help simplify memorization of arithmetic rules.

## Counting and addition

Further sections will assume you are comfortable with the positional notation to write down numbers, that is the number 365 written "three six five" is mathematically equal to $3*10^2 + 6*10^1 + 5*10^0$.
In dozonal the same idea applies but each digit carries a power of 12 instead of 10 so ㍚㍞㍝ = $2*12^2 + 6*12^1 + 5*12^0$. (365 = ㍚㍞㍝ but converting between bases won't matter for anything in this page)

### Tally chart
Typically the first math that is introduced to children is counting. We can draw a picture of one apple, then a picture of two apples and then three and give names to each of these numbers. However, typically to very young children we don't actually teach the symbols for 1,2,3 etc. Typically a "tally" system is used where numbers are written in groups of 5 like this:
<svg xmlns="http://www.w3.org/2000/svg" style="background: transparent; background-color: transparent; color-scheme: light dark;"
     xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="50px" height="30px" viewBox="0 0 50 30">
  <defs/>
  <path d="M 10 0 l 0 30" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 20 0 l 0 30" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 30 0 l 0 30" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 40 0 l 0 30" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
  <path d="M 0 5 L 50 25" stroke-width="5"
	style="stroke: light-dark(black, white);"/>
</svg>

This is usually related to counting things one per finger, counting 4 fingers then a thumb diagonally across the rest. 

This system is very useful when counting individual things and with each one it is best to just create a single mark. However ensuring exactly 4 vertical marks are made before the cross one can be prone to error and if counting large quantities counting the number of bundles of 5 is not trivial to get a final count.

For large numbers as well as fractional numbers this system is not very scalable. To represent the number of days in a year we would need 365 ticks or 73 groups of 5 where as the number "365" only needs 3 symbols to represent.

### Addition tables

In base 10 if we want to add two digits together we _could_ do it by memorizing and then consulting the following addition table:
<div class="row-head">
|    |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1  |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 | 10 |
| 2  |    |  4 |  5 |  6 |  7 |  8 |  9 | 10 | 11 |
| 3  |    |    |  6 |  7 |  8 |  9 | 10 | 11 | 12 |
| 4  |    |    |    |  8 |  9 | 10 | 11 | 12 | 13 |
| 5  |    |    |    |    | 10 | 11 | 12 | 13 | 14 |
| 6  |    |    |    |    |    | 12 | 13 | 14 | 15 |
| 7  |    |    |    |    |    |    | 14 | 15 | 16 |
| 8  |    |    |    |    |    |    |    | 16 | 17 |
| 9  |    |    |    |    |    |    |    |    | 18 |
</div>

In practice we don't necessarily need to memorize the whole table, for
instance the first row (n+1) is fairly easy to remember as long as you
learn the order of the numbers and thus which comes next. Similarly
for 2 or 3 as you can count up 2 or 3 times from any digit. But the
point stands that to quickly do addition we need to be able to quickly
figure out any element from this table and the table contains 45
different combinations.

If we created the same table in base 12 it would have 2 additional
rows and columns resulting in a total of 66 entries which would be
harder to remember than the base 10 version. However we don't need to
do it that way.

By writing our dozonal digits as dots and sticks we can simplify how addition can be memorized, since a digit will have up to 2 dots and 3 dots make a stick we get this table for adding dots:
<div class="row-head">
|   | ㍙ | ㍚ |
|---|---|----|
| ㍙ | ㍚ | ㍛ |
| ㍚ |   | ㍜ |
</div>

And similarly 4 sticks make up a "box" (㍤) which is equal to a dot in the next column (㍙㍘) so we get this table for sticks:
<div class="row-head">
|    | ㍛ |   ㍞ |   ㍡ |
|----|---:|-----:|-----:|
| ㍛ | ㍞ |   ㍡ | ㍙㍘ |
| ㍞ |    | ㍙㍘ | ㍙㍛ |
| ㍡ |    |      | ㍙㍞ |
</div>

Since addition is almost never presented in this way this still may
seem very foreign, but the core idea that instead of 45 cases we only
really have 9! When people first learn to do addition calculating
something like 7+8 often ends up starting at 8 and then counting up 7
times to reach 15 using your fingers to track how many times you've
counted up but with sticks and dots we never have more than 3 of them
in a single digit to deal with at a time.

## Multiplication


In the addition section I just threw a table that no one really uses in that form and used it to justify that dozonal is simpler. Multiplication however is a different story as working out single digit multiplications on the fly is much harder than just counting up from one number. So I will draw a multiplication table for both base 10 and base 12 using rules common to both that are relatively easy to remember and we will see how they both get filled in. 

For context this is the end goal:

|   | 1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 |
|---|--:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 |
| 2 | 2 |  4 |  6 |  8 | 10 | 12 | 14 | 16 | 18 |
| 3 | 3 |  6 |  9 | 12 | 15 | 18 | 21 | 24 | 27 |
| 4 | 4 |  8 | 12 | 16 | 20 | 24 | 28 | 32 | 36 |
| 5 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 |
| 6 | 6 | 12 | 18 | 24 | 30 | 36 | 42 | 48 | 54 |
| 7 | 7 | 14 | 21 | 28 | 35 | 42 | 49 | 56 | 63 |
| 8 | 8 | 16 | 24 | 32 | 40 | 48 | 56 | 64 | 72 |
| 9 | 9 | 18 | 27 | 36 | 45 | 54 | 63 | 72 | 81 |


and in dozonal

|    | ㍙ | ㍚ | ㍛ | ㍜ | ㍝ | ㍞ | ㍟ | ㍠ | ㍡ | ㍢ | ㍣ |
|----|---:|---:|---:|---:|---:|---:|---:|---:|---:|----|----|
| ㍙ | ㍙ | ㍚ | ㍛ | ㍜ | ㍝ | ㍞ | ㍟ | ㍠ | ㍡ | ㍢ | ㍣ |
| ㍚ |    |    |    |    |    |    |    |    |    |    |    |
| ㍛ |    |    |    |    |    |    |    |    |    |    |    |
| ㍜ |    |    |    |    |    |    |    |    |    |    |    |
| ㍝ |    |    |    |    |    |    |    |    |    |    |    |
| ㍞ |    |    |    |    |    |    |    |    |    |    |    |
| ㍟ |    |    |    |    |    |    |    |    |    |    |    |
| ㍠ |    |    |    |    |    |    |    |    |    |    |    |
| ㍡ |    |    |    |    |    |    |    |    |    |    |    |
| ㍢ |    |    |    |    |    |    |    |    |    |    |    |
| ㍣ |    |    |    |    |    |    |    |    |    |    |    |


First multiplying anything by 1 is just that other thing so that column/row is trivial.

The first set of things to memorize is the first four numbers doubled: `1*2=2`, `2*2=4`, `3*2=6`, `4*2=8`.

This gives us those entries of the table but also thinking of 5 as 10/2, we can multiply any even number by 5 by putting half of it in the tens column and 0 in the units column.

So we have these new entries:

- 1 times any digit is that other digit
- 2*2=4 and 4/2=2
- 2*3=6 and 6/2=3
- 2*4=8 and 8/2=4
- multiplying by 5 is like halving and multiplying by 10 (so an even number `*5` is half that digit followed by a zero)


|   | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 |
| 2 |  2 |  4 |  6 |  8 | 10 |    |    |    |    |
| 3 |  3 |  6 |    |    |    |    |    |    |    |
| 4 |  4 |  8 |    |    | 20 |    |    |    |    |
| 5 |  5 | 10 |    | 20 |    | 30 |    | 40 |    |
| 6 |  6 |    |    |    | 30 |    |    |    |    |
| 7 |  7 |    |    |    |    |    |    |    |    |
| 8 |  8 |    |    |    | 40 |    |    |    |    |
| 9 |  9 |    |    |    |    |    |    |    |    |


In base 12 we can do similar but based on the way we drew the glyphs, doubling 1,3, and 4 visually use the same rule. All those numbers only fill boxes in the right column, so when doubled we fill the boxes of double the width in the left column. If we also simply memorize `㍚*㍚=㍜` and `㍚*㍝=㍢` we still have an extra thing we can remember to be on-par with the base 10 case. Lets add in the fact that 12 can be factored to `3*4` as this is likely a useful rule for its own right.

So by adding these things to remember

- ㍙ times anything is that other thing
- double the right column gives the same boxes in the left column (which are twice as wide) so `㍚*㍙=㍚`, `㍚*㍛=㍞`, `㍚*㍜=㍠`
- `㍚*㍚=㍜`, I.E. 2 dots doubled fills both the right dot and stick
- multiplying by ㍞ is like halving and multiplying by 12
- any number doubled can treat each box seperately, so to summarize the above rules:
  - the right dot and stick are each moved to the left
  - the double dot becomes a stick and a dot on the right
  - the double stick becomes a box (dot of the next column)


|    | ㍙ |   ㍚ | ㍛ |   ㍜ | ㍝ |   ㍞ | ㍟ |   ㍠ | ㍡ |   ㍢ | ㍣ |
|----|---:|-----:|---:|-----:|---:|-----:|---:|-----:|---:|-----:|---:|
| ㍙ | ㍙ |   ㍚ | ㍛ |   ㍜ | ㍝ |   ㍞ | ㍟ |   ㍠ | ㍡ |   ㍢ | ㍣ |
| ㍚ | ㍚ |   ㍜ | ㍞ |   ㍠ | ㍢ | ㍙㍘ |    |      |    |      |    |
| ㍛ | ㍛ |   ㍞ |    |      |    |      |    |      |    |      |    |
| ㍜ | ㍜ |   ㍠ |    |      |    | ㍚㍘ |    |      |    |      |    |
| ㍝ | ㍝ |   ㍢ |    |      |    |      |    |      |    |      |    |
| ㍞ | ㍞ | ㍙㍘ |    | ㍚㍘ |    | ㍛㍘ |    | ㍜㍘ |    | ㍝㍘ |    |
| ㍟ | ㍟ |      |    |      |    |      |    |      |    |      |    |
| ㍠ | ㍠ |      |    |      |    | ㍜㍘ |    |      |    |      |    |
| ㍡ | ㍡ |      |    |      |    |      |    |      |    |      |    |
| ㍢ | ㍢ |      |    |      |    | ㍝㍘ |    |      |    |      |    |
| ㍣ | ㍣ |      |    |      |    |      |    |      |    |      |    |


The next rules we can add in is that odd numbers are one more than an even number, so $(2n+1)*5 = 2n*5 + 5 = n*10 + 5$ I.E. one less than the odd number halved goes in the tens column and a five in the ones column. Another variant of that rule is that an even number times 6 is that even number more than 5 times the number which lets you find each digit seperately with relative ease.


|   | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 |
| 2 |  2 |  4 |  6 |  8 | 10 | 12 |    |    |    |
| 3 |  3 |  6 |    |    | 15 |    |    |    |    |
| 4 |  4 |  8 |    |    | 20 | 24 |    |    |    |
| 5 |  5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 |
| 6 |  6 | 12 |    | 24 | 30 | 36 |    | 48 |    |
| 7 |  7 |    |    |    | 35 |    |    |    |    |
| 8 |  8 |    |    |    | 40 | 48 |    |    |    |
| 9 |  9 |    |    |    | 45 |    |    |    |    |


In dozonal we similarly have the rule that if `x*y = 12*z`, then `(x+1)*y = 12*z + y`. So in addition to odd numbers times ㍞ and even numbers times ㍟, but we are currently missing many other cases that take advantage of 3 or 9 times 4 or 8.

If we think of ㍠ as two thirds of a dozen, and a stick being 3 dots then `㍛*㍠=㍚㍘` should be natural. Similarly if we think of ㍜ as a third of a dozen and ㍡ as 3 sticks then `㍜*㍡=㍛㍘`. and thus we should also consider `㍠*㍡=㍞㍘` is 2/3 of 3 sticks times a dozen.


|    | ㍙ |   ㍚ |   ㍛ |   ㍜ | ㍝ |   ㍞ | ㍟ |   ㍠ |   ㍡ |   ㍢ | ㍣ |
|----|---:|-----:|-----:|-----:|---:|-----:|---:|-----:|-----:|-----:|---:|
| ㍙ | ㍙ |   ㍚ |   ㍛ |   ㍜ | ㍝ |   ㍞ | ㍟ |   ㍠ |   ㍡ |   ㍢ | ㍣ |
| ㍚ | ㍚ |   ㍜ |   ㍞ |   ㍠ | ㍢ | ㍙㍘ |    |      |      |      |    |
| ㍛ | ㍛ |   ㍞ |      | ㍙㍘ |    |      |    | ㍚㍘ |      |      |    |
| ㍜ | ㍜ |   ㍠ | ㍙㍘ |      |    | ㍚㍘ |    |      | ㍛㍘ |      |    |
| ㍝ | ㍝ |   ㍢ |      |      |    |      |    |      |      |      |    |
| ㍞ | ㍞ | ㍙㍘ |      | ㍚㍘ |    | ㍛㍘ |    | ㍜㍘ |      | ㍝㍘ |    |
| ㍟ | ㍟ |      |      |      |    |      |    |      |      |      |    |
| ㍠ | ㍠ |      | ㍚㍘ |      |    | ㍜㍘ |    |      | ㍞㍘ |      |    |
| ㍡ | ㍡ |      |      | ㍛㍘ |    |      |    | ㍞㍘ |      |      |    |
| ㍢ | ㍢ |      |      |      |    | ㍝㍘ |    |      |      |      |    |
| ㍣ | ㍣ |      |      |      |    |      |    |      |      |      |    |

Now if we apply the logic that taking a digit with only sticks (㍛, ㍞, or ㍡) times ㍝ or ㍡ can be rewritten to multiply by ㍜ or ㍠ with an extra stick after the dozens column is filled in, or taking a digit that is a multiple of 4 (㍜ or ㍠) by one more than a multiple of ㍛, ㍞, or ㍡ similarly can be simplified.

|    | ㍙ |   ㍚ |   ㍛ |   ㍜ |   ㍝ |   ㍞ |   ㍟ |   ㍠ |   ㍡ |   ㍢ |   ㍣ |
|----|---:|-----:|-----:|-----:|-----:|-----:|-----:|-----:|-----:|-----:|-----:|
| ㍙ | ㍙ |   ㍚ |   ㍛ |   ㍜ |   ㍝ |   ㍞ |   ㍟ |   ㍠ |   ㍡ |   ㍢ |   ㍣ |
| ㍚ | ㍚ |   ㍜ |   ㍞ |   ㍠ |   ㍢ | ㍙㍘ | ㍙㍚ |      |      |      |      |
| ㍛ | ㍛ |   ㍞ |      | ㍙㍘ | ㍙㍛ | ㍙㍞ |      | ㍚㍘ | ㍚㍛ |      |      |
| ㍜ | ㍜ |   ㍠ | ㍙㍘ | ㍙㍜ |      | ㍚㍘ | ㍚㍜ | ㍚㍠ | ㍛㍘ | ㍚㍜ |      |
| ㍝ | ㍝ |   ㍢ | ㍙㍛ |      |      | ㍚㍞ |      |      | ㍛㍝ |      |      |
| ㍞ | ㍞ | ㍙㍘ | ㍙㍞ | ㍚㍘ | ㍚㍞ | ㍛㍘ | ㍛㍞ | ㍜㍘ | ㍜㍞ | ㍝㍘ | ㍝㍞ |
| ㍟ | ㍟ | ㍙㍚ |      |   ㍚㍜   |   | ㍛㍞ |      | ㍜㍟ |      | ㍝㍢ |      |
| ㍠ | ㍠ |      | ㍚㍘ | ㍚㍠ |      | ㍜㍘ | ㍜㍠ |      | ㍞㍘ | ㍞㍠ |      |
| ㍡ | ㍡ |      | ㍚㍚ | ㍛㍘ | ㍛㍡ | ㍜㍞ |      | ㍞㍘ | ㍞㍡ |      |      |
| ㍢ | ㍢ |      |      | ㍛㍜ |      | ㍝㍘ | ㍝㍢ | ㍞㍠ |      |      |      |
| ㍣ | ㍣ |      |      |      |      | ㍝㍞ |      |      |      |      |      |

This is not necessarily easy to determine whether the box could be filled in based on the rules as they have been described so far, essentially we'd check if:
- either digit is ㍜ or ㍠
  - if the other digit is a multiple of 3 (only sticks) 
    - each stick in the multiple of 3 becomes a dot in the next digit, doubled if the other digit is ㍠ (converting 3 dots to a stick)
	- 
  - if the other digit is one more than a multiple of 3 (one dot)
    - each stick becomes a dot in the next digit and the ㍜ or ㍠ 
