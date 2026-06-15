
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
- the least significant digit is spoken as the digit itself, so ㍛ would be said as simply "four"
- the second digit to the left (dozens column) will be said with the suffix "doz", so ㍛㍜ would be said as "three-doz four"
- the third digit to the left (gross column) is said as is but there should be a short pause between the 2nd and third digit. So for example ㍚㍛㍜ would be said as "two, three-doz four"
- the first digit in a group of 4 is suffixed by "vek". So ㍙㍚㍛㍜ would be said as "one-vek two, three-doz four"

### When to say "null"
TODO fill this in

only needed to join suffix?

㍙㍘ - one-doz or one-doz null

㍙㍘㍘㍘ - one-vek or one-vek null or one-vek null, null-doz null?


## Scale markers

TODO clean this up and fill in details about how scale markers are actually placed.


- period seperating integer part from fractional part is pronouced "point"
- each letter denoting scale marker uses the english word for the letter such as "aye", "bee", "sea" etc
- the first spoken scale marker (unless it is "point") must be prefixed by "big" or "lil" to denote whether it is uppercase or lowercase.


<!-- ## scale markers -->
<!-- - period seperating integer part from fractional part is pronouced "point" -->
<!-- - each letter denoting scale marker uses the english word for the letter such as "aye", "bee", "sea" etc -->
<!-- - the first spoken scale marker (unless it is "point") must be prefixed by "big" or "lil" to denote whether it is uppercase or lowercase. -->

<!-- ## groupings -->
<!-- These rules describe how to pronouce a group of 4 digits between explicit scale markers, the last group has omited trailing zeros omitted verbally. The first group logically has leading zeros which are omited but counted when referring to which digits are which, so for example ㍚㍞ would be the 3rd and 4th digit of the group and the first and second digit are omited / silent. -->
<!-- - the second and last number in a group of 4 digits between scale markers are said as is -->
<!-- - the first digit after a scale marker is suffixed by "vek",  -->
<!--   - so ㍘.㍛㍞ is said as "null point three-vek six" -->
<!-- - the third digit (dozens place relative to the next scale mark) is suffixed by "doz" -->
<!--   - so ㍙㍜ is "one-doz four" -->
<!-- - zeros are explicitly said as "null" -->
<!--   - ㍜㍘㍟ is "four null-doz sev" -->
