type HomophoneEntry = {
  homophones: string[];
  sentence: string;
};

const HOMOPHONE_MAP: Record<string, HomophoneEntry> = {};

function register(groups: [string, string][][]): void {
  for (const group of groups) {
    const allWords = group.map(([word]) => word);
    for (const [word, sentence] of group) {
      HOMOPHONE_MAP[word.toLowerCase()] = {
        homophones: allWords.filter((w) => w.toLowerCase() !== word.toLowerCase()),
        sentence,
      };
    }
  }
}

register([
  [
    ["there", "Put the book over there on the table."],
    ["their", "Their car is parked outside."],
    ["they're", "They're going to the movies tonight."],
  ],
  [
    ["to", "She went to the store."],
    ["too", "He wanted to come too."],
    ["two", "I have two sisters."],
  ],
  [
    ["here", "Come sit over here with me."],
    ["hear", "I can hear the birds singing."],
  ],
  [
    ["see", "I can see the mountains from here."],
    ["sea", "The ship sailed across the sea."],
  ],
  [
    ["seen", "I have seen that movie before."],
    ["scene", "The opening scene was dramatic."],
  ],
  [
    ["know", "I know the answer to that question."],
    ["no", "There is no milk left."],
  ],
  [
    ["write", "Please write your name on the form."],
    ["right", "Turn right at the traffic light."],
    ["rite", "It was an ancient rite of passage."],
  ],
  [
    ["night", "The stars come out at night."],
    ["knight", "The knight rode into battle on his horse."],
  ],
  [
    ["bare", "The trees were bare in winter."],
    ["bear", "A large bear emerged from the forest."],
  ],
  [
    ["flower", "She picked a beautiful flower from the garden."],
    ["flour", "Add two cups of flour to the mixture."],
  ],
  [
    ["piece", "May I have a piece of cake?"],
    ["peace", "The country finally found peace after the war."],
  ],
  [
    ["break", "Be careful not to break the glass."],
    ["brake", "Press the brake to slow the car down."],
  ],
  [
    ["stare", "Don't stare at people, it's rude."],
    ["stair", "He tripped on the bottom stair."],
  ],
  [
    ["tail", "The dog wagged its tail happily."],
    ["tale", "She told a wonderful tale about a princess."],
  ],
  [
    ["wait", "Please wait here for a moment."],
    ["weight", "The weight of the package was ten pounds."],
  ],
  [
    ["wear", "What should I wear to the party?"],
    ["where", "Where did you put my keys?"],
    ["ware", "The merchant displayed his ware at the market."],
  ],
  [
    ["weather", "The weather is beautiful today."],
    ["whether", "I don't know whether to go or stay."],
  ],
  [
    ["whole", "She ate the whole pizza by herself."],
    ["hole", "The rabbit disappeared into the hole."],
  ],
  [
    ["which", "Which color do you prefer?"],
    ["witch", "The witch cast a spell on the prince."],
  ],
  [
    ["wood", "The cabin was built from wood."],
    ["would", "I would love to help you."],
  ],
  [
    ["sun", "The sun rises in the east."],
    ["son", "Their son just started school."],
  ],
  [
    ["one", "I only need one more chance."],
    ["won", "She won the race by three seconds."],
  ],
  [
    ["four", "There are four seasons in a year."],
    ["for", "This gift is for you."],
    ["fore", "The golfer shouted fore as a warning."],
  ],
  [
    ["ate", "She ate breakfast before leaving."],
    ["eight", "There are eight planets in our solar system."],
  ],
  [
    ["buy", "I need to buy some groceries."],
    ["by", "The book was written by a famous author."],
    ["bye", "She waved bye as the train departed."],
  ],
  [
    ["die", "Plants die without water."],
    ["dye", "She used dye to color her hair red."],
  ],
  [
    ["pair", "She bought a new pair of shoes."],
    ["pear", "The ripe pear was sweet and juicy."],
    ["pare", "Use a knife to pare the apple."],
  ],
  [
    ["sail", "The boat set sail at dawn."],
    ["sale", "The store is having a big sale this weekend."],
  ],
  [
    ["sweet", "The chocolate cake was very sweet."],
    ["suite", "They booked the presidential suite at the hotel."],
  ],
  [
    ["weak", "He felt weak after being ill."],
    ["week", "The project is due next week."],
  ],
  [
    ["blew", "The wind blew the leaves across the yard."],
    ["blue", "The sky is a brilliant blue today."],
  ],
  [
    ["new", "She drove her new car to work."],
    ["knew", "He knew the answer immediately."],
    ["gnu", "We saw a gnu at the wildlife park."],
  ],
  [
    ["sew", "She learned to sew her own clothes."],
    ["so", "I was tired, so I went to bed."],
    ["sow", "The farmer will sow seeds in the spring."],
  ],
  [
    ["through", "The train passed through the tunnel."],
    ["threw", "He threw the ball across the field."],
  ],
  [
    ["been", "I have been waiting for an hour."],
    ["bin", "Throw the trash in the bin."],
  ],
  [
    ["passed", "She passed the exam with flying colors."],
    ["past", "In the past, people traveled by horse."],
  ],
  [
    ["plain", "The dress was plain but elegant."],
    ["plane", "The plane landed safely on the runway."],
  ],
  [
    ["rain", "The rain fell steadily all afternoon."],
    ["reign", "The queen's reign lasted over sixty years."],
    ["rein", "She pulled the rein to stop the horse."],
  ],
  [
    ["road", "The road stretched for miles ahead."],
    ["rode", "She rode her bicycle to school."],
  ],
  [
    ["role", "He played the lead role in the play."],
    ["roll", "Please roll the dice to start the game."],
  ],
  [
    ["some", "Would you like some water?"],
    ["sum", "The sum of five and three is eight."],
  ],
  [
    ["steel", "The bridge was built with steel beams."],
    ["steal", "It is wrong to steal from others."],
  ],
  [
    ["toe", "She stubbed her toe on the table leg."],
    ["tow", "The truck will tow your broken car."],
  ],
  [
    ["waist", "She wore a belt around her waist."],
    ["waste", "Don't waste food, eat what you take."],
  ],
  [
    ["principal", "The principal welcomed the new students."],
    ["principle", "Honesty is an important principle to live by."],
  ],
  [
    ["complement", "The wine is a perfect complement to the meal."],
    ["compliment", "She received a nice compliment on her dress."],
  ],
  [
    ["affect", "The cold weather can affect your health."],
    ["effect", "The medicine had an immediate effect."],
  ],
  [
    ["desert", "The desert is hot and dry during the day."],
    ["dessert", "We had chocolate cake for dessert."],
  ],
  [
    ["flour", "You need flour to make bread."],
    ["flower", "The flower bloomed in the spring."],
  ],
  [
    ["male", "The male bird has brighter feathers."],
    ["mail", "Did you check the mail today?"],
  ],
  [
    ["meat", "We grilled meat for the barbecue."],
    ["meet", "I will meet you at the coffee shop."],
  ],
  [
    ["made", "She made a beautiful painting."],
    ["maid", "The maid cleaned the hotel room."],
  ],
  [
    ["not", "I am not going to the party."],
    ["knot", "He tied the rope in a tight knot."],
  ],
  [
    ["nose", "She has a freckle on her nose."],
    ["knows", "He knows all the answers."],
  ],
  [
    ["our", "This is our new house."],
    ["hour", "The meeting lasted an hour."],
  ],
  [
    ["red", "She wore a bright red dress."],
    ["read", "I read three books last month."],
  ],
  [
    ["rose", "He gave her a single red rose."],
    ["rows", "The students sat in neat rows."],
  ],
  [
    ["sent", "She sent a letter to her friend."],
    ["cent", "It costs one cent to use the machine."],
    ["scent", "The scent of fresh cookies filled the room."],
  ],
  [
    ["sight", "The sunset was a beautiful sight."],
    ["site", "They chose a site to build the house."],
    ["cite", "Please cite your sources in the paper."],
  ],
  [
    ["soul", "Music speaks to the soul."],
    ["sole", "The sole of his shoe had a hole in it."],
  ],
  [
    ["missed", "She missed the bus this morning."],
    ["mist", "The mist covered the valley at dawn."],
  ],
  [
    ["lead", "She will lead the team to victory."],
    ["led", "He led the group through the forest."],
  ],
  [
    ["dear", "She began the letter with Dear friend."],
    ["deer", "A deer stood at the edge of the woods."],
  ],
  [
    ["fare", "The bus fare is two dollars."],
    ["fair", "The county fair has rides and games."],
  ],
  [
    ["fir", "The fir tree was covered with snow."],
    ["fur", "The cat's fur was soft and warm."],
  ],
  [
    ["great", "She did a great job on the project."],
    ["grate", "Use the grate to shred the cheese."],
  ],
  [
    ["hair", "She brushed her long hair every morning."],
    ["hare", "The hare ran across the field."],
  ],
  [
    ["heal", "The wound will heal in a few days."],
    ["heel", "She broke the heel of her shoe."],
  ],
  [
    ["hire", "We need to hire a new employee."],
    ["higher", "The plane flew higher above the clouds."],
  ],
  [
    ["isle", "They spent the summer on a small isle."],
    ["aisle", "Walk down the aisle to find the cereal."],
  ],
  [
    ["loan", "She took out a loan to buy a car."],
    ["lone", "A lone wolf howled at the moon."],
  ],
  [
    ["tide", "The tide comes in every twelve hours."],
    ["tied", "He tied his shoes before the race."],
  ],
  [
    ["vain", "He was too vain to admit his mistakes."],
    ["vein", "Blood flows through every vein in the body."],
    ["vane", "The weather vane pointed north."],
  ],
  [
    ["board", "Write the answer on the board."],
    ["bored", "She was bored during the long lecture."],
  ],
  [
    ["bald", "The eagle is called a bald eagle."],
    ["bawled", "The baby bawled all night long."],
  ],
  [
    ["ceiling", "The ceiling in the old church was painted."],
    ["sealing", "He was sealing the envelope shut."],
  ],
  [
    ["course", "She signed up for a cooking course."],
    ["coarse", "The sandpaper felt coarse against her hand."],
  ],
  [
    ["creek", "We fished in the creek behind the house."],
    ["creak", "The old door began to creak as it opened."],
  ],
  [
    ["find", "I need to find my lost keys."],
    ["fined", "He was fined for parking illegally."],
  ],
  [
    ["guessed", "She guessed the correct answer."],
    ["guest", "The guest arrived early for the dinner party."],
  ],
  [
    ["him", "Give the book to him."],
    ["hymn", "The choir sang a beautiful hymn."],
  ],
  [
    ["lean", "He had to lean against the wall to rest."],
    ["lien", "The bank placed a lien on the property."],
  ],
  [
    ["lessen", "Exercise can lessen feelings of stress."],
    ["lesson", "The piano lesson lasted thirty minutes."],
  ],
  [
    ["manner", "She spoke in a polite manner."],
    ["manor", "The old manor stood on top of the hill."],
  ],
  [
    ["medal", "She won a gold medal at the Olympics."],
    ["meddle", "Don't meddle in other people's affairs."],
  ],
  [
    ["morning", "I exercise every morning before work."],
    ["mourning", "The family was mourning their loss."],
  ],
  [
    ["muscle", "He strained a muscle while lifting."],
    ["mussel", "The mussel was served with garlic butter."],
  ],
  [
    ["naval", "The naval fleet set out to sea."],
    ["navel", "An orange is named after a navel."],
  ],
  [
    ["patience", "Teaching children requires patience."],
    ["patients", "The doctor treated several patients today."],
  ],
  [
    ["peak", "They hiked to the peak of the mountain."],
    ["peek", "She took a quick peek through the window."],
  ],
  [
    ["poor", "The poor man had nothing to eat."],
    ["pour", "Pour the water into the glass."],
    ["pore", "He would pore over his books for hours."],
  ],
  [
    ["profit", "The company made a large profit this year."],
    ["prophet", "The prophet spoke of things to come."],
  ],
  [
    ["raise", "They plan to raise money for charity."],
    ["rays", "The sun's rays warmed the beach."],
    ["raze", "They will raze the old building."],
  ],
  [
    ["ring", "She wore a diamond ring on her finger."],
    ["wring", "Wring out the wet towel before hanging it."],
  ],
  [
    ["root", "The root of the tree grew deep underground."],
    ["route", "Take the scenic route to the coast."],
  ],
  [
    ["sauce", "The pasta sauce simmered on the stove."],
    ["source", "Cite the source of your information."],
  ],
  [
    ["seam", "The seam of her dress came apart."],
    ["seem", "Things are not always what they seem."],
  ],
  [
    ["sheer", "The cliff was a sheer drop to the ocean."],
    ["shear", "The farmer used shears to shear the sheep."],
  ],
  [
    ["soar", "Eagles soar high above the mountains."],
    ["sore", "His legs were sore after the long run."],
  ],
  [
    ["steak", "He ordered a steak for dinner."],
    ["stake", "She drove a stake into the ground."],
  ],
  [
    ["throne", "The king sat upon the golden throne."],
    ["thrown", "The ball was thrown across the field."],
  ],
  [
    ["vary", "Temperatures vary throughout the day."],
    ["very", "She was very happy with the results."],
  ],
  [
    ["wail", "We could hear the baby wail from next door."],
    ["whale", "The whale breached the surface of the ocean."],
  ],
  [
    ["warn", "I must warn you about the icy roads."],
    ["worn", "His shoes were old and worn."],
  ],
  [
    ["yore", "In days of yore, knights fought dragons."],
    ["your", "Is this your backpack?"],
    ["you're", "You're welcome to join us."],
  ],
  [
    ["aloud", "She read the poem aloud to the class."],
    ["allowed", "Dogs are not allowed in the store."],
  ],
  [
    ["altar", "The couple stood before the altar."],
    ["alter", "We need to alter the plans slightly."],
  ],
  [
    ["ant", "An ant can carry fifty times its own weight."],
    ["aunt", "My aunt is visiting from California."],
  ],
  [
    ["arc", "The rainbow formed a perfect arc in the sky."],
    ["ark", "Noah built an ark to survive the flood."],
  ],
  [
    ["band", "The band played jazz at the concert."],
    ["banned", "Smoking is banned in all public buildings."],
  ],
  [
    ["base", "The camp was set up at the base of the mountain."],
    ["bass", "The bass guitar gives the song its rhythm."],
  ],
  [
    ["berry", "She picked a fresh berry from the bush."],
    ["bury", "The dog tried to bury its bone in the yard."],
  ],
  [
    ["born", "She was born in a small town."],
    ["borne", "The ship was borne along by the current."],
  ],
  [
    ["bread", "Fresh bread smells wonderful."],
    ["bred", "The horses were bred for racing."],
  ],
  [
    ["cell", "The prisoner was kept in a small cell."],
    ["sell", "They plan to sell their house."],
  ],
  [
    ["chance", "There is a chance of rain tomorrow."],
    ["chants", "The crowd's chants echoed through the stadium."],
  ],
  [
    ["clause", "Read every clause in the contract carefully."],
    ["claws", "The cat sharpened its claws on the post."],
  ],
  [
    ["close", "Please close the door when you leave."],
    ["clothes", "She packed her clothes for the trip."],
  ],
  [
    ["colonel", "The colonel commanded the regiment."],
    ["kernel", "There is a kernel of truth in every story."],
  ],
  [
    ["crews", "The construction crews worked through the night."],
    ["cruise", "They went on a cruise to the Caribbean."],
  ],
  [
    ["days", "The project will take three more days."],
    ["daze", "The bright flash left him in a daze."],
  ],
  [
    ["dual", "The phone has a dual camera system."],
    ["duel", "The two rivals agreed to a duel at dawn."],
  ],
  [
    ["earn", "She works hard to earn a living."],
    ["urn", "The ancient urn was on display in the museum."],
  ],
  [
    ["feat", "Climbing that mountain was an amazing feat."],
    ["feet", "She stood on her feet for hours."],
  ],
  [
    ["flew", "The bird flew south for the winter."],
    ["flu", "He stayed home with the flu."],
    ["flue", "Santa comes down the chimney flue."],
  ],
  [
    ["forth", "Go forth and explore the world."],
    ["fourth", "She finished in fourth place."],
  ],
  [
    ["gene", "The gene determines eye color."],
    ["jean", "She wore her favorite pair of jeans."],
  ],
  [
    ["gorilla", "The gorilla beat its chest in the jungle."],
    ["guerrilla", "The guerrilla fighters hid in the mountains."],
  ],
  [
    ["hall", "The students walked through the hall."],
    ["haul", "They had to haul the equipment up the hill."],
  ],
  [
    ["idle", "The machine sat idle for most of the day."],
    ["idol", "The singer was a teen idol in the nineties."],
  ],
  [
    ["jam", "Spread some jam on the toast."],
    ["jamb", "He leaned against the door jamb."],
  ],
  [
    ["lain", "The book had lain untouched for years."],
    ["lane", "Stay in your lane while driving."],
  ],
  [
    ["main", "The main entrance is around the corner."],
    ["mane", "The lion's mane was thick and golden."],
  ],
  [
    ["might", "She might arrive late tonight."],
    ["mite", "The tiny mite was barely visible."],
  ],
  [
    ["miner", "The miner worked deep underground."],
    ["minor", "It was only a minor scratch."],
  ],
  [
    ["moose", "A moose stood in the middle of the road."],
    ["mousse", "The chocolate mousse was rich and creamy."],
  ],
  [
    ["none", "None of the students were absent."],
    ["nun", "The nun lived in a quiet convent."],
  ],
  [
    ["oar", "She used an oar to row the boat."],
    ["ore", "The mine produced tons of iron ore."],
    ["or", "Would you like tea or coffee?"],
  ],
  [
    ["pail", "Fill the pail with water from the well."],
    ["pale", "She looked pale after the long illness."],
  ],
  [
    ["presence", "Her presence brightened the whole room."],
    ["presents", "The children opened their presents on Christmas."],
  ],
  [
    ["real", "Is that painting real or a forgery?"],
    ["reel", "He wound the fishing line back on the reel."],
  ],
  [
    ["sighed", "She sighed with relief after the exam."],
    ["side", "Please move to the other side of the room."],
  ],
  [
    ["sign", "Follow the sign to the parking lot."],
    ["sine", "Calculate the sine of the angle."],
  ],
  [
    ["step", "Watch your step on the icy sidewalk."],
    ["steppe", "Horses galloped across the open steppe."],
  ],
  [
    ["symbol", "The dove is a symbol of peace."],
    ["cymbal", "The drummer crashed the cymbal at the end."],
  ],
  [
    ["team", "The team won the championship game."],
    ["teem", "The rivers teem with fish in the spring."],
  ],
  [
    ["war", "The war lasted for several years."],
    ["wore", "She wore a beautiful gown to the gala."],
  ],
  [
    ["way", "Which way should we go?"],
    ["weigh", "Please weigh the ingredients carefully."],
  ],
  [
    ["wrap", "Let me wrap the gift for you."],
    ["rap", "He gave a sharp rap on the door."],
  ],
]);

export interface SentenceInfo {
  sentence: string;
  homophones: string[] | null;
}

function spellOut(word: string): string {
  return word
    .split("")
    .map((ch) => ch.toUpperCase())
    .join(", ");
}

export function getSentenceInfo(word: string): SentenceInfo {
  const entry = HOMOPHONE_MAP[word.toLowerCase()];
  if (entry) {
    return { sentence: entry.sentence, homophones: entry.homophones };
  }
  return {
    sentence: `The word is: ${word}. ${spellOut(word)}. ${word}.`,
    homophones: null,
  };
}

export function getHomophoneInfo(word: string): { homophones: string[]; sentence: string } | null {
  return HOMOPHONE_MAP[word.toLowerCase()] ?? null;
}
