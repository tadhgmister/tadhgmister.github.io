
Glyph based on 3 by 4 grid:

<!-- svg showing 3x4 grid with dotted lines showing each square -->

By splitting the horizontal into 1 and 3 rows and the columns into 1 and 2, we can seperate the space into 4 regions of area 1,2,3,6.

<!-- svg making solid lines for the top row and right most column -->

Since we will use this layout to write digits of numbers and we typically position smaller digits to the right, we place the vertical seperator on the right side so smaller digits have less gap to the next smaller digit.

If we write numbers by filling these boxes to have a number of squares filled equal to the represented number and we impose the rule that the 'one' and 'two' boxes are never filled at the same time (as this would be the same as filling the 'three' box) we uniquely define a way to fill in each digit from 0 to 11:

㍘㍛㍞㍡
㍙㍜㍟㍢
㍚㍝㍠㍣

This method of drawing the glyphs as just boxes can lead to confusion, for instance 3 and 4 (㍛,㍜) look very similar, as with 5 and 7 (㍝,㍟) which are photo negatives except for difference in border.  Alternative rendering that follows the same scheme of turning on or off the regions is viable, for instance using dots and lines we could have a display like this:

<!-- svg showing dot as 1, joined dots (filled in infinity) as 2, line with squared edges as 3 and X (crossed lines) as 6 -->

While it would never be written in the middle of a normal number, a glyph for dozen ㍤ is fairly natural and could be used to signify overflows in calculations or in scientific notation. For example Avagadro's number is approximately:

<!-- 111E 0b95D 0684C 44b9B a290A 7854._12 -->
㍤^㍙㍢ * ㍙.㍙㍙㍙

## Scale markers

Two observations can be made about the way we write and say decimal numbers:
- metric prefixes ("kilo", "mega", "milli", etc) serve exactly the same purpose as the words "thousand", "million", "thousanths", etc.
- number with many digits do not give help with the scale, so to say a number like "5 000 000 00" you need to first count how many blocks of 3 digits there are to know this would be said as "five billion" (instead of "five million" for instance) and the written forms do not have any equivelent shorthand to the oral version other than many trailing zeros or writing it as scientific notation which does not directly match the words we have for scale.

A proposed notation to account for this is to use absolute scale markers throughout the number to split up a number with many significant digits into easier to parse chunks as well as denoting an absolute scale without needing full scientific notation.

- there cannot be more than 4 digits concecutively without scale markers to group them
- there must be exactly 4 digits between two explicitly written scale markers
- A period is used to seperate integer part of the number from fractional part (same as decimal)
- capital letters are used to denote 12^(4n) where "A" is n=1, "B" is n=2 etc
  - 12^4 = ㍙A = ㍙A㍘㍘㍘㍘.
  - 12^8 = ㍙B = ㍙B㍘㍘㍘㍘A㍘㍘㍘㍘.
  - 12^12= ㍙C
  - 12^104 = ㍙Z
- lower case letters are used for fractional groups in the same way:
  - 12^-4 = ㍙a = ㍘.㍘㍘㍘㍙a
  - 12^-8 = ㍙b = ㍘.㍘㍘㍘㍘a㍘㍘㍘㍙b
  - 12^-104 = ㍙z
- numbers as large as (㍙㍘㍘㍘Z*㍙㍘) or smaller than ㍘z㍘㍘㍘㍙ would require scientific notation or another method to properly write.
- the last block of digits can omit the scale marker, so ㍙.㍞ is valid, ㍙.㍞㍘㍘㍘a is also be valid and equivelent. Similarly ㍙A㍞ = ㍙A㍞㍘㍘㍘. are both valid.
- leading and trailing zeros are allowed but unnecessary
- a number without any scale markers (which must be 4 or fewer digits due to first rule) is assumed to be unit scale. I.E. equivelent to having a trailing period.

With this notation, avagadro's number could be written to 10 significant digits as this:

㍙㍙㍙E㍘㍣㍡㍝D㍘㍞㍠


### Addition shorthand

the number 25 000 000.007 can be said as "twenty five million and seven thousanths", note that the written version of the number needs many zeros as filler while the oral version only has to address digits with significance. With absolute scale markers intermediate zeros can be omitted by simply writing a number as two numbers added, such as:

㍚㍙B+㍟a

This is logically very similar to writing 25Mm+7mm for instance.

<!-- A convention is recommended to include a trailing and leading zero around the addition sign when a number should be logically interpreted as a single number with lots of padded zeros: -->

<!-- ㍚㍙B㍘+㍘㍟a -->

<!-- this is not strictly necessary and should largely not affect spoken version of the number but can help with readability when relevant. -->


## divisibility rules
rules to help determine the divisibility of a number

- A number is divisible by 2 if the last digit has the 'one' box in the same state as the '3' box.

- A number is divisible by 3 if the last digit is one of ㍘,㍛,㍞,㍡. I.E. the 'one' and 'two' box at the top are empty. 

- A number is divisible by 4 if the last digit is one of ㍘,㍜,㍠. I.E. it looks like a solid column.

- A number is divisible by 6 if the last digit is ㍘ or ㍞
