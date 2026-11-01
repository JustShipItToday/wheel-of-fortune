/* samples.js — 100 built-in sample puzzles (Sample 1 to Sample 100), kept apart from the host's own puzzle list.
   Type S at Load Puzzle for a random one. Rows are worked out automatically by fitRows(), which tries every way
   of splitting the words into board rows and keeps the one that fits with the fewest, most even rows. */
(function (root) {
  'use strict';
  var LIST = [
    ['PHRASE', 'A PENNY FOR YOUR THOUGHTS'],
    ['PHRASE', 'BETTER LATE THAN NEVER'],
    ['PHRASE', 'THE BALL IS IN YOUR COURT'],
    ['PHRASE', 'BREAK A LEG'],
    ['PHRASE', 'PIECE OF CAKE'],
    ['PHRASE', 'HIT THE NAIL ON THE HEAD'],
    ['PHRASE', 'ONCE IN A BLUE MOON'],
    ['PHRASE', 'SLOW AND STEADY WINS THE RACE'],
    ['PHRASE', 'THE EARLY BIRD CATCHES THE WORM'],
    ['PHRASE', 'WHEN PIGS FLY'],
    ['PHRASE', 'TIME FLIES WHEN YOU ARE HAVING FUN'],
    ['PHRASE', 'GO THE EXTRA MILE'],
    ['THING', 'A FRESH CUP OF COFFEE'],
    ['THING', 'BIRTHDAY CANDLES'],
    ['THING', 'A ROLL OF DUCT TAPE'],
    ['THING', 'SUNGLASSES AND SUNSCREEN'],
    ['THING', 'ROLLER SKATES'],
    ['THING', 'A COMFY PAIR OF SLIPPERS'],
    ['THING', 'GRADUATION CAP AND GOWN'],
    ['THING', 'A TREASURE MAP'],
    ['THINGS', 'SALT AND PEPPER SHAKERS'],
    ['THINGS', 'FIREWORKS AND SPARKLERS'],
    ['PLACE', 'THE GRAND CANYON'],
    ['PLACE', 'A COZY COFFEE SHOP'],
    ['PLACE', 'THE PUBLIC LIBRARY'],
    ['PLACE', 'AN AMUSEMENT PARK'],
    ['PLACE', 'THE FARMERS MARKET'],
    ['PLACE', 'A CROWDED SUBWAY CAR'],
    ['ON THE MAP', 'NIAGARA FALLS'],
    ['ON THE MAP', 'THE ROCKY MOUNTAINS'],
    ['ON THE MAP', 'SAN FRANCISCO CALIFORNIA'],
    ['ON THE MAP', 'THE AMAZON RAINFOREST'],
    ['ON THE MAP', 'CAPE COD MASSACHUSETTS'],
    ['ON THE MAP', 'THE SAHARA DESERT'],
    ['LANDMARK', 'THE STATUE OF LIBERTY'],
    ['LANDMARK', 'THE GOLDEN GATE BRIDGE'],
    ['LANDMARK', 'MOUNT RUSHMORE'],
    ['LANDMARK', 'THE EIFFEL TOWER'],
    ['LANDMARK', 'THE GREAT WALL OF CHINA'],
    ['FOOD & DRINK', 'HOT COCOA WITH MARSHMALLOWS'],
    ['FOOD & DRINK', 'FRESHLY SQUEEZED LEMONADE'],
    ['FOOD & DRINK', 'PEANUT BUTTER AND JELLY'],
    ['FOOD & DRINK', 'SPAGHETTI AND MEATBALLS'],
    ['FOOD & DRINK', 'CHOCOLATE CHIP COOKIES'],
    ['FOOD & DRINK', 'A BOWL OF CHICKEN NOODLE SOUP'],
    ['FOOD & DRINK', 'BLUEBERRY MUFFINS'],
    ['FOOD & DRINK', 'STRAWBERRY SHORTCAKE'],
    ['FOOD & DRINK', 'BUTTERY MOVIE THEATER POPCORN'],
    ['BEFORE & AFTER', 'PEANUT BUTTER CUP OF COFFEE'],
    ['BEFORE & AFTER', 'APPLE PIE IN THE SKY'],
    ['BEFORE & AFTER', 'FIRE DRILL SERGEANT'],
    ['BEFORE & AFTER', 'HOT DOG HOUSE PARTY'],
    ['BEFORE & AFTER', 'ROCK AND ROLL CALL'],
    ['BEFORE & AFTER', 'BOOK CLUB SANDWICH'],
    ['BEFORE & AFTER', 'TEA PARTY ANIMAL'],
    ['BEFORE & AFTER', 'BIRTHDAY CAKE WALK'],
    ['SAME NAME', 'PAINT & TOOTH BRUSHES'],
    ['SAME NAME', 'BASKET & FOOT BALLS'],
    ['SAME NAME', 'POLAR & TEDDY BEARS'],
    ['SAME NAME', 'BIRTHDAY & WEDDING CAKES'],
    ['RHYME TIME', 'A FUNNY BUNNY'],
    ['RHYME TIME', 'FUN IN THE SUN'],
    ['RHYME TIME', 'SNAIL MAIL'],
    ['RHYME TIME', 'A COZY BOOK NOOK'],
    ['EVENT', 'A SURPRISE BIRTHDAY PARTY'],
    ['EVENT', 'THANKSGIVING DINNER'],
    ['EVENT', 'A FAMILY REUNION'],
    ['EVENT', 'THE FIRST DAY OF SCHOOL'],
    ['EVENT', 'A FOURTH OF JULY PARADE'],
    ['EVENT', 'A NEW YEARS EVE COUNTDOWN'],
    ['LIVING THING', 'A PLAYFUL GOLDEN RETRIEVER'],
    ['LIVING THING', 'A GIANT PANDA BEAR'],
    ['LIVING THING', 'A BALD EAGLE'],
    ['LIVING THINGS', 'SUNFLOWERS'],
    ['LIVING THING', 'A TINY HUMMINGBIRD'],
    ['LIVING THING', 'A CLEVER OCTOPUS'],
    ['WHAT ARE YOU DOING?', 'BAKING BANANA BREAD'],
    ['WHAT ARE YOU DOING?', 'BUILDING A SNOWMAN'],
    ['WHAT ARE YOU DOING?', 'STUDYING FOR FINALS'],
    ['WHAT ARE YOU DOING?', 'SINGING IN THE SHOWER'],
    ['WHAT ARE YOU DOING?', 'CATCHING FIREFLIES'],
    ['WHAT ARE YOU DOING?', 'PULLING AN ALL-NIGHTER'],
    ['FUN & GAMES', 'PLAYING HIDE-AND-SEEK'],
    ['FUN & GAMES', 'A GAME OF CHECKERS'],
    ['FUN & GAMES', 'FLYING A KITE'],
    ['FUN & GAMES', 'A THOUSAND PIECE JIGSAW PUZZLE'],
    ['FUN & GAMES', 'BOWLING A STRIKE'],
    ['AROUND THE HOUSE', 'THE KITCHEN SINK'],
    ['AROUND THE HOUSE', 'A FLUFFY THROW PILLOW'],
    ['AROUND THE HOUSE', 'THE TV REMOTE CONTROL'],
    ['AROUND THE HOUSE', 'A JUNK DRAWER'],
    ['OCCUPATION', 'ROCKET SCIENTIST'],
    ['OCCUPATION', 'KINDERGARTEN TEACHER'],
    ['OCCUPATION', 'AIRLINE PILOT'],
    ['SHOW BIZ', 'A STANDING OVATION'],
    ['SHOW BIZ', 'LIGHTS CAMERA ACTION'],
    ['COLLEGE LIFE', 'OFFICE HOURS'],
    ['COLLEGE LIFE', 'THE DINING HALL'],
    ['COLLEGE LIFE', 'SPRING BREAK'],
    ['WHAT ARE YOU WEARING?', 'RUBBER RAIN BOOTS']
  ];

  function core() { return root.WOFCore || (typeof require === 'function' ? require('./core.js') : null); }

  /* every way to split the words into 1-4 rows that the board accepts; keep the fewest rows, then the most even */
  function fitRows(text) {
    var C = core(), words = String(text).trim().split(/\s+/), n = words.length, best = null;
    var limit = Math.min(4, n);
    for (var mask = 0; mask < (1 << (n - 1)); mask++) {
      var rows = [], cur = [words[0]];
      for (var i = 1; i < n; i++) {
        if (mask & (1 << (i - 1))) { rows.push(cur.join(' ')); cur = [words[i]]; } else cur.push(words[i]);
      }
      rows.push(cur.join(' '));
      if (rows.length > limit) continue;
      var joined = rows.join(' \\ '), res = C.scribe(joined);
      if (res.error) continue;
      var lens = rows.map(function (r) { return r.length; });
      var score = rows.length * 100 + (Math.max.apply(null, lens) - Math.min.apply(null, lens));
      if (!best || score < best.score) best = { score: score, rows: joined, cells: res.cells };
    }
    return best;
  }

  var cache = {};
  /* puzzle k (1-100): {n, cat, text, rows, cells} or null */
  function get(k) {
    k = parseInt(k, 10);
    if (!(k >= 1 && k <= LIST.length)) return null;
    if (!cache[k]) {
      var fit = fitRows(LIST[k - 1][1]);
      if (!fit) return null;
      cache[k] = { n: k, cat: LIST[k - 1][0], text: LIST[k - 1][1], rows: fit.rows, cells: fit.cells };
    }
    return cache[k];
  }

  var Samples = { MAX: LIST.length, LIST: LIST, get: get, fitRows: fitRows };
  root.WOFSamples = Samples;
  if (typeof module !== 'undefined' && module.exports) module.exports = Samples;
})(typeof window !== 'undefined' ? window : globalThis);
