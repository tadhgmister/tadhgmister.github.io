
---
title: Multi digit Dozonal
desc: Describes how dozonal numbers should be spoken 
---
<style>
@font-face {
    font-family: 'Dozonal';
    src: url('./doz.ttf') format('truetype'); /* Chrome 4+, Firefox 3.5, Opera 10+, Safari 3—5 */
}
html {
	font-family: Dozonal;
}
.numgap {
	display: inline-block;
	width: 1ch;
	font-size: 0.8em;
}
</style>

# How decimal numbers are said


Before we discuss the rules for writing and speaking dozonal numbers, lets consider an example in decimal.

5<sub class="numgap" aria-label="trillion">
</sub>004<sub class="numgap" aria-label="billion">
</sub>003<sub class="numgap" aria-label="million">
</sub>002<sub class="numgap" aria-label="thousand">
</sub>001

To say this number we first have to count how many groups of 3 digits there to determine the 5 should be suffixed with "trillion" before we can start properly saying the number which is highly undesirable.

## First lets remove redundant words

Our words for "thousand", "million", "billion" etc actually serve the same purpose as metric prefixes, for example 

5000000 m = one million metres

5 Mm = one mega-metre

Are equivelent. As such we could logically write the above number of meters as:

5<span aria-label="tera-metres">Tm</span> +
4<span aria-label="giga-metres">Gm</span> +
3<span aria-label="mega-metres">Mm</span> +
2<span aria-label="kilo-metres">km</span> +
1<span aria-label="meter">m</span>

Since we the words we normally say when speaking numbers are equivelent to the metric prefixes, lets suppose we remove them from our vocabulary and simply use the words for the metric prefixes in their place, as such we could say this number as "five terra, four giga, three mega, two kilo, and one".

## Writing scale markers explicitly

If we did this, we could also write the metric prefix letters into the number so we have a visual indicator of the scale and as such would not need to scan for how many digits the number has before we can properly say the number:

5<sub class="numgap" aria-label="terra">T</sub>004<sub class="numgap" aria-label="giga">G</sub>003<sub class="numgap" aria-label="mega">M</sub>002<sub class="numgap" aria-label="kilo">k</sub>001

If we take this a step further, consider how we might write "two and a half giga bytes". Using the normal metric prefix notation we would write 

    2.5 Gb

With scientific notation we would write:

    2.5 * 10^9 bytes
	
Or we would just write "two and a half billion bytes" out in full by padding zeros:

    2 500 000 000 bytes
	
But with our new system to write the scale markers between groups of digits we would instead write this last version as:

2<sub class="numgap" aria-label="giga">G</sub>500<sub class="numgap" aria-label="mega">M</sub>000<sub class="numgap" aria-label="kilo">k</sub>000 bytes

At which point we can very naturally ask; are the trailing zeros still required? I would argue no, the subscript letters to note scale can effectively serve in place of a decimal place and thus we could write it as simply:

2<sub class="numgap" aria-label="giga">G</sub>5 bytes

To mean exactly the same thing as 2.5 Gb. 

## Spoken form within a group

So far we've discussed the scale marking words between groups of 3 digits, now lets analyse how those groups are spoken. The first observation is that groups are spoken the same regardless of where they are in the number, for example "735000735" is said as "seven hundred thirty five million, seven hundred thirty five".

The least significant digit is spoken just as the word for that digit such as 005 is said as simply "five".

The tens digit is mostly said as the word for the digit with a suffix "ty". for example 040 is said as "four-ty". Since "one-ty" sounds awkward we have alternative words for "teens" and some digits are altered slightly to make them sound better like "twenty" instead of "two-ty".

The most significant digit in a group is spoken as the word for that digit suffixed by the word "hundred", so 700 is "seven hundred".

So an example: 735 is said as "seven hundred thirty five"

### Takeaways
It is likely you already know all this. The key takeaways are:
- digits that are zero are simply omitted when spoken
- suffix "ty" and "hundred" are used to break up digits within a group.
- digits have alternative wording to fit the "ty" suffix but adding a full word does not require any alteration

## We often break this rule for 4 digit numbers

An exception to the usual rules to speak numbers in groups of 3 digits is that when a number has exactly 4 digits it is often easier to say it is 2 groups of 2 digits. This is often used for years such as saying 2026 as "twenty twenty six" or 1954 as "nineteen fifty four"


## Digit grouping size
Before we discuss much else about speaking dozonal, lets first consider how many digits we should have in each group. Since the metric prefixes are for powers of 1000 they cannot be directly reused for dozonal so we will need new scale marking system anyway.

Lets first say we want to implement a spoken version of decimal that uses 4 digits per group and the scale marker for "ten thousand" uses the word "zee", then the number:

35<sub class="numgap" aria-label="zee"></sub>0023

would likely be spoken as "thirty five zee twenty three" since the group of zeros is omitted from spoken form

But the number:

35<sub class="numgap" aria-label="zee"></sub>7600

Would possibly be said as "thirty five zee seventy six hundred" but if the last two digits also have non zero we'd like to avoid saying "hundred" in every single digit group. 


# Dozonal

## Digits

We will adopt many of the same english words for digits with these exceptions:

- ㍘ (zero) will be spoken as "null"
- ㍟ (seven) will be spoken as "sev"
- ㍢ (ten) will be spoken as "dek"
- ㍣ (eleven) will be spoken as "el"


Choosing null and sev are to make each digit monosyllabic. The word "dek" and "el" are based on existing dozonal proposals, "dek" is based on the prefix typically used such as in "decathlon", and "el" is used as a monosyllabic version of eleven.


## within a scale group
For numbers with up to 4 digits (and groups of 4 digits for larger numbers) will be spoken with the following rules:

- the dozens column (second to last digit) is suffixed by "doz"
- the gross column (3rd to last digit) is suffixed by a short pause
- the first digit in a group of 4 is suffixed by "nod"

so for example ㍜㍛㍚㍙ is "four-nod three, two-doz one"


#### NEW RULES FOR ZEROS

<!-- idk why nested unordered lists inside ordered list breaks pandocs interprertation but to fix it I need to use manual html here. -->
<ol>
<li>leading zeros on first (or only) group and trailing zeros on last group (when there is an explicit scale marker) can be omitted
  <ul>
	<li>㍘㍘㍘㍙ = ㍘㍘㍙ = ㍘㍙ = ㍙ is "one"</li>
	<li>㍙.㍚㍛㍘㍘ = ㍙.㍚㍛ is "one point two-nod three"</li> 
</ul></li>
<li>zero in non suffixed position surrounded by non zero characters can be omitted
<ul>
  <li> ㍚㍘ can be shortened to "two-doz" instead of "one-doz _null_"</li>
  <li>㍙㍘㍚㍘ is "one-nod two-doz" without needing nulls</li>
</ul></li>
<li>zero in suffixed position surrounded by non zero digits must be said
<ul>
  <li>㍙㍘㍚ is "one, null-doz two"</li>
  <li>㍙.㍘㍚ is "one point null-nod two"</li>
</ul></li>
<li>if both dozens and units position have zeros, we say the word "gross" instead of "null-doz null". this is not necessary on the last group after an explicit scale marker
<ul>
  <li> ㍙㍘㍘ is "one gross"</li>
  <li> ㍚㍘㍘㍘ is "two-nod gross"</li>
  <li> ㍠㍚㍘㍘.㍚㍚ is "eight-nod two **gross** point two-nod two" (the trailing gross is omitted)</li>
</ul></li>
<li>if both the most significant digits are zero and the dozen position is non zero we just write "null" instead of "null-nod". 
</li>
<li>If there are 3 leading zeros we say "nod-null-doz" as a shortform of "null-nod null-doz"
<ul>
  <li>㍙.㍘㍘㍘㍚ is "one point **nod-null-doz** two"</li>
  <li>㍙.㍘㍘㍛㍚ is "one point **null** three-doz two" although "one point **null-nod** three-doz two" is also allowed.</li>
</ul></li>
<li>If an entire group of digits is zeros just the word "null" for that group
  <ul><li>㍙A㍘㍘㍘㍘.㍚㍛ is said "one cap-aye **null point** two-nod three"</li>
</ul></li>
<li>the trailing "nod" suffix on the last digit after an explicit scale marker _can_ be omitted
  <ul><li>㍙.㍚ can be "one point two" but can also be "one point two-nod" if differentiating from decimal 1.2 is important.</li>
</ul></li>
</ol>
If there is a long string of zeros the number can be split up with an addition, such as ㍙㍚C㍘㍘㍘㍘B㍘㍘㍘㍘A㍘㍘㍝㍜ would be said "one-doz two cap-see, null bee, null aye, null five-doz four" but we could choose to write it instead as ㍙㍚C㍘ + ㍝㍜ which would be said "one-doz two cap-see plus five-doz four" 
  
#### OLD Atempt at summary of zeros rules:

- zero in non-suffixed position surrounded by non zero characters can be omitted
  - ㍙㍘ is just "one-doz"
  - ㍙㍘㍚㍘ is "one-nod two-doz"
- zero in suffixed position surrounded by non zero digits must be said
  - ㍙㍘㍚ is "one, null-doz two"
  - ㍙.㍘㍚ is "one point null-nod two"
- zero in dozens and unit position is replaced with word "gross" (is not necessary on the last group after a scale marker)
  - ㍙㍘㍘ is "one gross"
  - ㍠㍚㍘㍘.㍚㍚ is "eight-nod two gross point two-nod two" (the trailing gross is omitted)
<!-- - any other sequence of 2 or more zeros only the last one must be spoken 
   - ㍙.㍘㍘㍘㍙ is "one point null-doz one"
   - ㍙.㍘㍘㍞ is "one point null six-doz" 
   - ㍙㍘㍘㍛ is "one-nod null-doz three" 
   - ㍚㍘㍘㍘ **should be "two-nod null" or "two-nod gross"?** -->
- leading zeros on first (or only) group are omitted
  - ㍙㍘ is "one doz" but ㍝.㍘㍘㍙㍘ is "five point **null** one-doz"
- trailing zeros on last group when there is an explicit scale marker can be omitted
- trailing "nod" suffix of only digit after last scale marker can be omitted
  - ㍙.㍚ can be "one point two" or "one point two-nod"


These rules make a potential mix up about this case:

- ㍙.㍘㍙ is "one point null-**nod** one"
- ㍙.㍘㍘㍘㍙ is "one point null-**doz** one"

Only differing by the suffix _on a null_ is undesirable, but using "one point null-nod null-doz one" feels like a poor alternative.

could "nod-null-doz" be used for 3 leading zeros?

## all combinations for middle of number: (between two other groups of digits:

- ㍣.㍘㍘㍘㍙a㍣ "el point null-doz one aye el"
- ㍣.㍘㍘㍚㍘a㍣ "el point null two-doz aye el"
- ㍣.㍘㍘㍚㍙a㍣ "el point null two-doz one aye el"
- ㍣.㍘㍜㍘㍘a㍣ "el point null-nod four gross aye el"
- ㍣.㍘㍜㍘㍙a㍣ "el point null-nod four null-doz one aye el"
- ㍣.㍘㍜㍚㍘a㍣ "el point null-nod four two-doz aye el"
- ㍣.㍘㍜㍚㍙a㍣ "el point null-nod four two-doz one aye el"
- ㍣.㍠㍘㍘㍘a㍣ "el point eight-nod null aye el"
  - when last three digits are null only one "null" is needed
- ㍣.㍠㍘㍘㍙a㍣ "el point eight-nod **null-doz** one aye el"
  - when middle two digits are zero only null-doz is needed
- ㍣.㍠㍘㍚㍘a㍣ "el point eight-nod, two-doz aye el"
- ㍣.㍠㍘㍚㍙a㍣ "el point eight-nod,  two-doz one aye el"
- ㍣.㍠㍜㍘㍘a㍣ "el point eight-nod four gross aye el"
- ㍣.㍠㍜㍘㍙a㍣ "el point eight-nod four null-doz one aye el"
- ㍣.㍠㍜㍚㍘a㍣ "el point eight-nod four two-doz aye el"
- ㍣.㍠㍜㍚㍙a㍣ "el point eight-nod four two-doz one aye el"

<!-- all combos for leading zeros in last group: -->


<!-- - ㍙.㍚ "one point two" -->
<!--   - nod is omitted on the last digit of a number (only digit after last scale marker) -->
<!-- - ㍙.㍚㍛ "one point two-nod three" -->
<!-- - ㍙.㍘㍚ "one point **null-nod** two" -->
<!--   - null-nod necessary on non first group -->
<!-- - ㍙.㍘㍚㍛ "one point null-nod two, three-doz" -->
<!-- - ㍙.㍘㍘㍚ "one point **null** two-doz" -->
<!--   - leading two zeros just needs null to hold for both -->
<!-- - ㍙.㍘㍘㍚㍛ "one point null two-doz three" -->
<!--   - ㍙.㍚㍛ and ㍙.㍘㍘㍚㍛ only differ by doz vs nod which is undesirable, leading zero possibly needed? -->
<!-- - ㍙.㍘㍘㍘㍚ "one point null-doz two" -->

<!-- options for trailing zeros in non last group -->

<!-- - ㍙㍘.㍚ "one-doz point two" -->
<!-- - ㍙㍘㍘.㍚ "one gross point two" -->
<!-- - ㍙㍘㍘㍘.㍚ "one-nod null point two" -->


<!-- ## Scale markers -->

<!-- TODO clean this up and fill in details about how scale markers are actually placed. -->


<!-- - period seperating integer part from fractional part is pronouced "point" -->
<!-- - each letter denoting scale marker uses the english word for the letter such as "aye", "bee", "sea" etc -->
<!-- - the first spoken scale marker (unless it is "point") must be prefixed by "big" or "lil" to denote whether it is uppercase or lowercase. -->


<!-- <\!-- ## scale markers -\-> -->
<!-- <\!-- - period seperating integer part from fractional part is pronouced "point" -\-> -->
<!-- <\!-- - each letter denoting scale marker uses the english word for the letter such as "aye", "bee", "sea" etc -\-> -->
<!-- <\!-- - the first spoken scale marker (unless it is "point") must be prefixed by "big" or "lil" to denote whether it is uppercase or lowercase. -\-> -->

<!-- <\!-- ## groupings -\-> -->
<!-- <\!-- These rules describe how to pronouce a group of 4 digits between explicit scale markers, the last group has omited trailing zeros omitted verbally. The first group logically has leading zeros which are omited but counted when referring to which digits are which, so for example ㍚㍞ would be the 3rd and 4th digit of the group and the first and second digit are omited / silent. -\-> -->
<!-- <\!-- - the second and last number in a group of 4 digits between scale markers are said as is -\-> -->
<!-- <\!-- - the first digit after a scale marker is suffixed by "nod",  -\-> -->
<!-- <\!--   - so ㍘.㍛㍞ is said as "null point three-nod six" -\-> -->
<!-- <\!-- - the third digit (dozens place relative to the next scale mark) is suffixed by "doz" -\-> -->
<!-- <\!--   - so ㍙㍜ is "one-doz four" -\-> -->
<!-- <\!-- - zeros are explicitly said as "null" -\-> -->
<!-- <\!--   - ㍜㍘㍟ is "four null-doz sev" -\-> -->
