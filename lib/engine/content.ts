import type { SkillId } from "./skills";
import type { Grade, Passage, Story } from "./types";

export const PASSAGES: Passage[] = [
  {
    id: "check-k",
    grade: "K",
    title: "Sam and the Cat",
    text: "Sam has a cat. The cat is big and red. Sam and the cat sit in the sun. The cat naps on a mat. Sam gets a dish of milk. The cat is glad! Then the cat runs to the pond.",
  },
  {
    id: "check-1",
    grade: "1",
    title: "Jake's Day",
    text: "Jake has a red bike. He rides to the lake with his dad. The sun is hot. Jake and Dad swim and splash. Then they ride home. Mom made a cake! Jake ate a big slice.",
  },
  {
    id: "check-2",
    grade: "2",
    title: "A Gray Day",
    text: "Kate and her dad went to the park on a gray day. Rain fell, but they did not mind. Kate rode her bike past a big oak tree. A bird sat on a thin branch. Dad said, \"Look at the storm!\" They ran home fast and jumped into bed.",
  },
  {
    id: "check-3",
    grade: "3",
    title: "Night at the Lake",
    text: "Last night, Mike and his sister went camping by the lake. They set up a tent and made a fire. Mike heard a sound in the dark. His sister said, \"It is just a bird.\" They roasted corn and told jokes. When the stars came out, they curled up and fell asleep, safe and warm.",
  },
];

export function passageForGrade(grade: Grade): Passage {
  return PASSAGES.find((p) => p.grade === grade) ?? PASSAGES[1];
}

export const STORIES: Story[] = [
  {
    id: "pam-big-bag",
    title: "Pam and the Big Bag",
    focus: "shortVowels",
    text: "Pam has a big bag. In the bag is a red hat, a cup and a pen. Pam set the bag on a mat. Then a pup ran up. The pup can tug at the bag! The hat and the cup fall out. Pam is not mad. She can pat the pup. The pup sat on the red hat. Pam and the pup nap in the sun.",
  },
  {
    id: "jakes-kite",
    title: "Jake's Kite",
    focus: "magicE",
    text: "Jake has a kite. It is red and white. Jake and Mom ride a bike to the lake. Jake can see a big pine. \"Let me fly my kite!\" Jake said. Up, up went the kite. It rode up to the sun. Mom gave Jake a cake. Jake ate the cake at the lake. \"It is a fine kite and a fine cake,\" said Mom. Jake had a fun time. Then they rode home.",
  },
  {
    id: "fish-shop",
    title: "The Fish Shop",
    focus: "digraphs",
    text: "Ben and his dad go to the fish shop. In a big tub, Ben can see a fish with a red fin. \"I wish I had that fish,\" said Ben. Dad got the fish and a bag. Ben and Dad rush home. Ben set the fish in a dish. The fish is Chip. Chip can zip and dip in the dish. \"Chip, you are the best fish!\" said Ben. Now Ben has a fish of his own.",
  },
  {
    id: "frog-plan",
    title: "The Frog Has a Plan",
    focus: "initialBlends",
    text: "A frog sat on a log. The frog had a plan. \"I will swim!\" The frog did a flip and a big splash. A crab came to the frog. \"Stop! The sun is hot. Let us sit on the log and snack.\" The frog and the crab ate a plum. The crab slid on the log. Then the frog slid back in. Splash!",
  },
  {
    id: "best-camp",
    title: "The Best Camp",
    focus: "finalBlends",
    text: "Max and his dad went to camp. They set up a tent. Max had a lamp and a blanket. Dad had a pot of hot milk. Max and Dad went to the pond. Max had a net. He did his best to catch a fish, but the fish was too fast. Max fell in the mud and sand! Dad held his hand. \"You did your best,\" Dad said. Max and Dad had lunch at the tent, and then a rest.",
  },
  {
    id: "mud-pigs",
    title: "Mud Pigs",
    focus: "endings",
    text: "Meg and Ted rushed out. The mud was wet. Meg jumped in the mud. Ted jumped in the mud. Splash! The mud landed on the hat. Meg and Ted kicked and hopped and splashed. \"We are mud pigs!\" Ted yelled. Mom smiled at them. \"Mud pigs get a bath,\" she said. Meg and Ted rested in the hot tub. Mud is the best!",
  },
  {
    id: "rain-train",
    title: "Rain on the Train",
    focus: "vowelTeams",
    text: "Kate and her dad sat on a train. Rain hit the glass. Kate could see green hills and a gray sheep. The train went up and up. Then the sun came out and the rain stopped. Kate and Dad got off at the beach. They ate a treat in the shade. \"This is the best day,\" said Kate. That night, Kate slept in a tent by the sea. She had a dream of the train.",
  },
  {
    id: "star-farm",
    title: "A Star on the Farm",
    focus: "rControlled",
    text: "Kim has a farm with a big red barn. In the barn, a pig eats corn. At dark, Kim sat in the yard. She saw a star. \"I wish for a bird,\" said Kim. The next day, a bird sang on the barn. It had a red spot and a short tail. Kim was glad. \"My star sent me a bird!\" she said. Kim gave the bird corn and a dish of seeds.",
  },
  {
    id: "ben-duck",
    title: "Ben and the Duck",
    focus: "bd",
    text: "Ben has a duck. The duck is big and black. It can dig in the mud and dip in the pond. Dad has a bed for the duck in a box. At dusk, the duck hid! Ben and Dad checked the bed, the box and the tub. Then Ben spotted the duck in the pond, bobbing and dabbing. \"Bad duck!\" said Dad. But Dad and Ben had to grin. The duck is the best.",
  },
  {
    id: "where-cat",
    title: "Where Is the Cat?",
    focus: "tricky",
    text: "\"Where is the cat?\" said Mom. Was the cat under the bed? No. Was the cat in the box? No. They went to find the cat. Is it out there? Is it in here? \"I know where it is!\" said Sam. \"Come and look.\" The cat was in a big box of socks, and it was warm. \"You are a funny cat,\" they said.",
  },
  {
    id: "lost-hat",
    title: "The Lost Hat",
    focus: "guessing",
    text: "Tim lost his hat. Was it on the bed? Was it in the bath? Tim had a hunch. He ran to the shed. A hen sat on a nest in the shed. The hen sat on his hat! \"That is my hat!\" said Tim. The hen did not get up. The hen had a nest, and Tim had a plan. Tim got a hat from his dad.",
  },
];

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}

export function storyForSkill(skill: SkillId): Story {
  return STORIES.find((s) => s.focus === skill) ?? STORIES[1];
}
