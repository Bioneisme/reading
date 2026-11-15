const w = (s: string) => s.trim().split(/\s+/);

const WORDBANK_GROUPS: Record<string, string[]> = {
  shortVowels: w(`
    cat bat hat mat sat rat pat fat cap map tap nap lap gap van can man pan fan ran tan
    bag tag rag wag bad dad had mad sad pad jam ham ram yam am an at as
    bed red fed led wed hen pen ten men den net pet wet jet get let set vet leg peg beg web yes
    big dig pig wig fig jig bin pin win tin fin kid lid hid bit sit hit fit kit pit lip hip sip dip tip zip rip mix six fix in it is if
    wax box fox hot pot dot got lot not rot dog log fog hog jog top hop mop pop cop job mob rob sob on off
    bus cup pup cut hut nut but bug hug mug rug dug jug tug sun run fun bun gun mud bud tub rub cub up us
    sunset picnic
  `),
  magicE: w(`
    cake bake lake make take rake wake tape cape game name same gate late date ate gave save wave made cane lane
    bike like hike kite bite ride hide side wide time dime lime fine line mine nine pine pile mile tile five hive dive
    home bone cone hole pole rope hope nose rose rode note vote joke poke
    cute mute tube cube tune mule rule
    plate skate shake snake grape slide smile white stone stove
  `),
  digraphs: w(`
    ship shop shed shell fish dish wish cash rash mash shut shot
    chip chop chin chat chick much such rich
    thin thick bath math path moth with this that then them
    when whip
    duck back sack pack rock sock lock kick lick sick neck deck luck
    sing ring king wing song long hang bang
  `),
  initialBlends: w(`
    stop step stem stick still stack spin spot spill skip skin sled slip slam snap snip snack swim swam
    flag flip flat clap clip club crab crib drum drip drop dress frog grab grin grass
    plan plug plum brag brick glad glass trap trip truck twin splash
  `),
  finalBlends: w(`
    jump bump lamp camp damp lump stamp hand sand band land bend send mend pond
    fist list mist nest best rest test vest fast last past must dust just
    gift soft lift left raft tent went hunt mint pink sink wink bank tank
    milk silk belt melt help held ask mask desk task
  `),
  endings: w(`
    cats dogs pigs hats beds cups jumps runs kicks sits naps wishes fixes boxes
    jumped helped kicked packed rested landed hunted
    jumping running sitting hopping fishing kicking resting singing
    rides bikes kites likes hopped
  `),
  vowelTeams: w(`
    rain tail mail pail sail wait paint train snail
    day play say may way stay gray tray
    see bee tree feet seed need green sleep sheep week jeep keep
    eat sea tea leaf seat team beach
    boat coat goat road soap toad loaf
    high light night right fight might bright
    snow slow grow show blow low
  `),
  rControlled: w(`
    car far jar star park dark farm barn yard art arm cart
    corn horn fork born short sport storm torn
    her fern herd bird girl dirt first shirt skirt stir fur hurt turn burn curl surf
  `),
};

export const STORY_NAMES = w(`Jake Sam Max Pam Ben Tim Kim Meg Ted Kate Pete Mike Jen Mia`);

export const DOLCH = w(`
  a and away big blue can come down find for funny go help here i in is it jump little look make me my not one play red run said see the three to two up we where yellow you
  all am are at ate be black brown but came did do eat four get good have he into like must new no now on our out please pretty ran ride saw say she so soon that there they this too under want was well went what white who will with yes
  after again an any as ask by could every fly from give going had has her him his how just know let live may of old once open over put round some stop take thank them then think walk were when
  always around because been before best both buy call cold does don't fast first five found gave goes green its made many off or pull read right sing sit sleep tell their these those upon us use very wash which why wish work would write your
  about better bring carry clean cut done draw drink eight fall far full got grow hold hot hurt if keep kind laugh light long much myself never only own pick seven shall show six small start ten today together try warm
`);

export const WORDBANK: string[] = [...new Set(Object.values(WORDBANK_GROUPS).flat())];
