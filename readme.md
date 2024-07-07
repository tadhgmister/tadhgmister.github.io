---
title: Tadhg's Homepage
desc: CV and personal information about Tadhg McDonald-Jensen
---
<style>
    #pictures img {max-width:100%;height:auto;}
    span.date-range {all:initial; float:right;}
</style>
## Tadhg McDonald-Jensen {#intro}

It is pronounced _Teague_ and means ['bard' or 'poet' in gaelic][tadhgorigin]. 
<!-- (It is not Klingon) -->


## Contact and Online Profiles {#reachme}
- [my contact card](tadhg.vcard)
- Email: [tadhgmister@gmail.com](mailto:tadhgmister@gmail.com)
- Texts and voicemail: [(343) 655-2007](tel:+13436552007)
- [Stackoverflow]  top 2% overall by reputation
	    <!--[<picture id="SOflair">
	      <source srcset="https://stackoverflow.com/users/flair/5827215.png?theme=dark" media="(prefers-color-scheme: dark)"/>
	      <source srcset="https://stackoverflow.com/users/flair/5827215.png"           media="(prefers-color-scheme: light)"/>
	    <img   src="https://stackoverflow.com/users/flair/5827215.png?theme=hotdog"
          width="208" 
          height="58" 
          alt="profile for Tadhg McDonald-Jensen at Stack Overflow, Q&amp;A for professional and enthusiast programmers" 
          title="profile for Tadhg McDonald-Jensen at Stack Overflow, Q&amp;A for professional and enthusiast programmers"/>
	    </picture> ][Stackoverflow] -->
- [Github account](https://github.com/tadhgmister)
- [LinkedIn](https://www.linkedin.com/in/tadhg-mcdonald-jensen)
<!-- - [facebook](https://www.facebook.com/tadhg.mcdonaldjensen/) -->

## Skills
- Write clean, well documented code
- Knowledgeable in: Python, Java, MATLAB, C, HTML, CSS, Typescript, Guile Scheme, Bash, R, Latex, Applescript
<!-- - Building webapps with NodeJS and Typescript 
- HTML and CSS, have integrated Typescript, React, and Redux together and am familiar with nodeJS package management. -->
- Inquisitive: naturally asks well formulated clarifying questions, ensures correct details of task before starting task, seek out solutions and test theories
- Quick learner who once helped a friend write [Processing Java](https://processing.org/) code and had success editing and correcting their code for 2 hours before disclosing I had never used Processing before that session
- Use Linux as primary operating system and am comfortable using terminal for editing code, looking up documentation, compiling code, etc.
<!-- - Will put in the extra effort to reduce headaches down the road. Particularly in documenting work  -->

## Work Experience {#work-experience}

####  <span class="date-range">2018 to 2019</span> Developer for Ericsson Indoor Planner ([EIP][EIP])


- Improved efficiency of backend MATLAB radio deployment simulation, reducing the test suite execution time to 60%
- Coordinated 6 programmers in porting hardware cable routing simulations from existing iOS app to web application written in typescript, focusing on separating tasks to maximize parallel development
- Crafted Typescript wrapper functions for React and Redux to enable our team to add typesafety with minimal code writing overhead
<!-- - The above mentioned wrappers also improved error handling that simplified development by catching default cases and preventing uncaught errors to be shown in the development environment -->

#### Teaching Assistant at Carleton
- <span class="date-range">2022</span>[SYSC 3303][sysc3303]: Real-Time Concurrent Systems
    - Evaluated student projects written in Java, identified race conditions or other criteria that would break their code and provided suitable feedback for them to fix it
    -  [YouTube walkthrough][ytCoordBox] of multi-threaded data structure analysis to help students understand how to analyze their code for correctness 
- <span class="date-range">2023</span>[SYSC 4001][sysc4001]: Operating Systems
    - Explained core concepts for operating systems including asynchronous interrupts
- <span class="date-range">2024</span>[ECOR 4995][ecor4995]: Professional Practice
    - Provided extensive feedback on submitted essays
    - Regularly replied to student queries about grades and marking processes


## Education
- <span class="date-range">2021 to Now</span> Masters of Applied Science at Carleton University
- <span class="date-range">2016 to 2021</span> Bachelors of Computer Systems Engineering at Carleton University. Graduated with 10.68/12 CGPA<!-- 219 total/(max 6 each) / 41 courses -->
<!-- <li>2013 to 2016: Canterbury High school, grades 11 and 12-->
<!-- <li>2011 to 2013: Lockerby High school, grades 9 and 10-->
<!-- TODO: won Waterloo award from highschool for possibly highest score for grade 12 math contest -->


## Interesting things I've done {#things-ive-done}
- For the 4th year engineering project our team designed a wearable watch to collect biometrics, I wrote the [program to offload the data from the device and log / graph it for demonstration.][4thyearproject]
- Designed circuits in [Logisim] and [made edits to the Java source code][logisimfix] to better support using it on an iPad
- [Github issues for typescript][typescriptAuthored] that I've authored including a
	  [viable proposal][tsInheritProposal] to one of typescripts longest outstanding limitations
- [Contributions to eslint-typescript][eslintTSAuthored] including an interesting case where the solution was to [educate the users][eslintTSEducate] instead of 'fixing' their code
- [Solved an obscure python issue][pythonTBWith] where certain cases error messages would point to very misleading line numbers, the files linked [in this page][pythonTBWithCode] are the codes I wrote to fix the issue; other maintainers used this to fix the problem
- [Submitted a python bug report][pythonAsyncExitErrorMsg] about misleading error messages and had to argue that it was a legitimate issue before it was corrected
- [YouTube video][ytcache] of brief overview of different forms of caching (expects a lot of prior knowledge)
- A clock based on getting the current time as a real number of days between 0 and 1 and then representing it in:
    - [Dozonal with normal clock display + dozonal cheatsheet][clock]
    - [Dozonal (base 12) recursively nesting][clockDozRec] so each block's area directly represents how much time it represents.
    - [Decimal (base 10) similarly recursive][clockDecRec]
- ["Scoops" as a unit of volume using base 12](scoops.html) to simplify cooking
- [BookSUSAN](bookSUSAN/index.html): animated children's story written for grade 10 english
<!-- - [Scriptable calculator](https://github.com/tadhgmister/Calculator_Awesome) that was immensely helpful in university physics , unfortunately the version that supported unit conversions and error propagation and derivatives has been lost. -->
- Wrote the html for this website by hand
<!-- -  [YouTube walkthrough][ytCoordBox] of multi-threaded data structure analysis (made in the context of being a TA and wanting to help students understand how to analyze their code for correctness) -->

## Interests and hobbies {#hobbies}
- Paddler on the Carleton Dragonboat team
- Rubix cube variants like the [super skewb](https://www.puzzlemaster.ca/browse/cubepuzzle/7774-skewb-xtreme-10-color-edition), the [ghost cube](https://ruwix.com/twisty-puzzles/3x3x3-rubiks-cube-shape-mods-variations/ghost-cube/), and a lot of others. I take pride in having never looked up any algorithms for any of these and enjoy finding interesting colour patterns once I found a solution 
- Maintain a [GNU Guix configuration](https://github.com/tadhgmister/dotfiles) for my personal computer that is reproducible 
- Juggling and the associated [mathematics](https://www.youtube.com/watch?v=7dwgusHjA0Y)
- Casual but inventive puzzle video games like [Portal 2](https://www.thinkwithportals.com/about.php), [HyperRogue](https://zenorogue.itch.io/hyperrogue), [Toki Tori 2+](https://store.steampowered.com/app/201420/Toki_Tori_2/), and [Baba is You](https://store.steampowered.com/app/736260/Baba_Is_You/)
- Didn't make but love to play [3D minesweeper with double the number of mines compared to the "hard" difficulty](http://egraether.com/mine3d/beta/?mainAlpha=0.9&hoverAlpha=0.6&grid=10,10,10,200&backgroundColor=#330000)
- Board games like [Concept](https://boardgamegeek.com/boardgame/147151/concept). [Renegade](https://boardgamegeek.com/boardgame/170604/renegade), and [Resistance](https://boardgamegeek.com/boardgame/41114/resistance)
<!-- - Snuggling with anyone who wants to cuddle back ;) -->
- Regular at [Ottawa Swing Dance](https://www.swingottawa.ca/)  
<!-- not sure you need to include the word scene with Ottawa Swing Dance -->
- [Playlist of music I like](https://www.youtube.com/playlist?list=PLlbKEHjBs23Wha5AIzq34PapY_8PseQch)
- Member of the [Carleton Improv Association](https://www.facebook.com/CarletonImprov/)
- really want to be a DM for 5e dungeons and dragons but having anxiety issues so this is WIP
- Rock climbing and ultimate frisbee (and to lesser extent beach volleyball) 
<!-- - unicycling, backflips, swimming in wave pools-->

Web comics I read and recommend

 - [XKCD](https://xkcd.com/) ubiquitous web comic
 - [Strong Female Protagonist](https://strongfemaleprotagonist.com/issue-1/page-0/) touches a lot of social issues and philosophy
 - [Order Of the Stick](https://www.giantitp.com/comics/oots0001.html) D&D themed and very silly
 - [Questionable Content](https://questionablecontent.net/view.php?comic=1) funny and has very interesting relationship dynamics
 - [Akumei](https://akumeicomic.ca/comic/the-cat-page-1/) Dark and soulful. **Trigger warning:** shows self destructive intrusive thoughts. 

<!-- </section> -->
<!-- <section id="pictures"> -->
## Pictures of Me with my Pets {#pictures}

<img src="bazsnuggle.png"
alt="Dog lying curled up on my lap with my hand petting his belly and kissing his head"
title="My dog Baz after he was scratched by our cat and needed to know he was still loved"/>
<img src="catcuddles.jpg"
alt="Two cats curled into my arms one with their belly exposed the other with their face nuzzled into my face"
title="Cats Callie (white feet) and Crackers (face against mine) at one of their cuddliest moments"/>

<!-- </section> -->

[tadhgorigin]: https://en.wikipedia.org/wiki/Tadhg
[Stackoverflow]: https://stackoverflow.com/users/5827215/tadhg-mcdonald-jensen
[ytCoordBox]: https://www.youtube.com/watch?v=PaiF3YGl-oI
[ytcache]: https://www.youtube.com/watch?v=uJAeoA81gjs
[4thyearproject]: https://github.com/MorganJamesSmith/BioSenseWearable/tree/master/companion_app#readme
[clock]: clockAndCheatsheet.html
[clockDozRec]: clockDozRecursive.html
[clockDecRec]: clockDecRecursive.html
[Logisim]: https://sourceforge.net/projects/circuit/
[logisimfix]: https://github.com/lawrancej/logisim/compare/master...tadhgmister:logisim:master
[typescriptAuthored]: ttps://github.com/microsoft/TypeScript/issues?q=is%3Aissue+author%3Atadhgmister+
[tsInheritProposal]: https://github.com/microsoft/TypeScript/issues/36165
[eslintTSAuthored]: https://github.com/typescript-eslint/typescript-eslint/pulls?q=is%3Apr+author%3Atadhgmister+
[eslintTSEducate]: https://github.com/typescript-eslint/typescript-eslint/pull/2437#issuecomment-683434856
[pythonTBWith]: https://github.com/python/cpython/issues/69724#issuecomment-1093697337
[pythonTBWithCode]: https://bugs.python.org/issue25538
[pythonAsyncExitErrorMsg]: https://github.com/python/cpython/issues/74108
[sysc3303]: https://calendar.carleton.ca/search/?P=SYSC%203303
[sysc4001]: https://calendar.carleton.ca/search/?P=SYSC%204001
[ecor4995]: https://calendar.carleton.ca/search/?P=ECOR%204995
[EIP]: https://www.ericsson.com/en/portfolio/networks/ericsson-radio-system/radio/small-cells/indoor/ericsson-indoor-planner